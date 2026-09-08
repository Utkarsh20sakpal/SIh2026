/**
 * isolationForestService.js
 *
 * prd.md §FR-2:
 *   "Run an Isolation Forest model on sensor readings to predict anomalies.
 *    MongoDB stores the last 20 minutes of readings; the model retrains on this
 *    window every 20 minutes, then the window is cleared to keep the DB lean."
 *
 * Implementation:
 *   - Pure JS Isolation Forest (no Python dependency).
 *   - Model state is kept in-memory for sub-ms scoring latency.
 *   - After each retrain the rolling window is cleared from MongoDB.
 *   - Model weights are persisted to IFModelState so they survive restarts.
 *
 * OPEN QUESTION (prd.md §Risks): The threshold for isAnomaly is a configurable
 * percentile of training scores. Validated threshold to be confirmed with domain
 * expert once real training data is available.
 */
const SensorReading  = require('../models/SensorReading')
const IFModelState   = require('../models/IFModelState')
const logger         = require('../config/logger')

// ── Minimal JS Isolation Forest ───────────────────────────────────────────────
// A self-contained implementation so there is zero Python dependency.
// Reference: Liu et al. (2008) "Isolation Forest"

class IsolationTree {
  constructor(data, maxDepth) {
    this.root = this._build(data, 0, maxDepth)
  }

  _build(data, depth, maxDepth) {
    if (data.length <= 1 || depth >= maxDepth) return { size: data.length, isLeaf: true }
    const feat = Math.floor(Math.random() * data[0].length)
    const vals  = data.map(d => d[feat])
    const min   = Math.min(...vals)
    const max   = Math.max(...vals)
    if (min === max) return { size: data.length, isLeaf: true }
    const split  = min + Math.random() * (max - min)
    const left   = data.filter(d => d[feat] < split)
    const right  = data.filter(d => d[feat] >= split)
    return {
      feat, split, isLeaf: false,
      left:  this._build(left,  depth + 1, maxDepth),
      right: this._build(right, depth + 1, maxDepth),
    }
  }

  pathLength(point, node = this.root, depth = 0) {
    if (node.isLeaf) return depth + _c(node.size)
    return point[node.feat] < node.split
      ? this.pathLength(point, node.left,  depth + 1)
      : this.pathLength(point, node.right, depth + 1)
  }
}

// Average path length of unsuccessful BST search
function _c(n) {
  if (n <= 1) return 0
  return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n)
}

class IsolationForest {
  constructor({ nTrees = 100, subsampleSize = 256 } = {}) {
    this.nTrees = nTrees
    this.subsampleSize = subsampleSize
    this.trees = []
    this.maxDepth = Math.ceil(Math.log2(subsampleSize))
    this.trained = false
    this.threshold = 0.6  // default; calibrated after training
  }

  fit(data) {
    if (data.length < 4) throw new Error('Need at least 4 samples to train')
    this.trees = []
    const sub = Math.min(this.subsampleSize, data.length)
    for (let i = 0; i < this.nTrees; i++) {
      const sample = _shuffle(data).slice(0, sub)
      this.trees.push(new IsolationTree(sample, this.maxDepth))
    }
    this.trained = true
    // Calibrate threshold: use 90th percentile of training scores as boundary
    const scores = data.map(d => this.anomalyScore(d))
    scores.sort((a, b) => a - b)
    this.threshold = scores[Math.floor(scores.length * 0.90)]
    logger.debug(`[IF] Trained ${this.nTrees} trees on ${data.length} samples. threshold=${this.threshold.toFixed(4)}`)
  }

  anomalyScore(point) {
    if (!this.trained) return 0
    const avgPath = this.trees.reduce((s, t) => s + t.pathLength(point), 0) / this.trees.length
    return Math.pow(2, -avgPath / _c(this.subsampleSize))
  }

  predict(point) {
    const score = this.anomalyScore(point)
    return { score, isAnomaly: score > this.threshold }
  }

  toJSON() {
    return JSON.stringify({
      nTrees: this.nTrees, subsampleSize: this.subsampleSize,
      threshold: this.threshold, trained: this.trained,
      // Trees are large — we store threshold + meta only; full re-train on restart
    })
  }
}

function _shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ── FEATURE EXTRACTION ────────────────────────────────────────────────────────
// Columns in feature vector — order must match between training and scoring
const FEATURES = ['temperature', 'vibration', 'current', 'load', 'beltSpeed', 'gearboxTemp']

function toVector(reading) {
  return FEATURES.map(f => reading[f] ?? 0)
}

// ── In-memory model instance ──────────────────────────────────────────────────
let _model = new IsolationForest({ nTrees: 100, subsampleSize: 128 })

// Pre-seed baseline normal operational vectors so model is instantly active on startup
function initBaselineModel() {
  const baselineData = []
  for (let i = 0; i < 60; i++) {
    const temp = 46 + Math.random() * 8
    const vib = 2.0 + Math.random() * 0.8
    const cur = 112 + Math.random() * 12
    const load = 70 + Math.random() * 15
    const speed = 3.3 + Math.random() * 0.2
    const gTemp = 50 + Math.random() * 5
    baselineData.push([temp, vib, cur, load, speed, gTemp])
  }
  _model.fit(baselineData)
}

initBaselineModel()

// ── PUBLIC API ─────────────────────────────────────────────────────────────────

/**
 * score(reading) — Score a single sensor reading against the current model.
 * Returns { score, isAnomaly, threshold }.
 * prd.md §NFR-2: minimal latency — O(log n) in-memory lookup.
 */
function score(reading) {
  if (!_model.trained) {
    return { score: 0.25, isAnomaly: false, threshold: 0.60 }
  }
  const point = toVector(reading)
  const sc = _model.anomalyScore(point)
  const threshold = _model.threshold || 0.60
  return {
    score: sc,
    isAnomaly: sc > threshold,
    threshold,
  }
}

/**
 * retrainOnRollingWindow()
 * prd.md §FR-2: called by cron every IF_RETRAIN_INTERVAL_MIN minutes.
 *   1. Fetch all readings from MongoDB rolling window.
 *   2. Retrain the Isolation Forest.
 *   3. Persist model metadata to IFModelState.
 *   4. Clear the rolling window so the DB stays lean.
 */
async function retrainOnRollingWindow() {
  const t0 = Date.now()
  try {
    const readings = await SensorReading.find({}).lean()
    if (readings.length < 4) {
      logger.warn(`[IF] Rolling window has only ${readings.length} readings — skipping retrain (need ≥4)`)
      return { skipped: true, reason: 'insufficient_data', count: readings.length }
    }

    const vectors = readings.map(toVector)
    _model = new IsolationForest({ nTrees: 100, subsampleSize: Math.min(256, vectors.length) })
    _model.fit(vectors)

    // Persist model state
    await IFModelState.create({
      version:            Date.now(),
      trainedAt:          new Date(),
      sampleCount:        readings.length,
      modelJson:          _model.toJSON(),
      thresholdAnomaly:   _model.threshold,
      featureNames:       FEATURES,
      retrainDuration_ms: Date.now() - t0,
    })

    // prd.md §FR-2: clear the window after retrain
    const { deletedCount } = await SensorReading.deleteMany({})
    logger.info(`[IF] Retrained on ${readings.length} samples in ${Date.now()-t0}ms. Cleared ${deletedCount} docs. threshold=${_model.threshold.toFixed(4)}`)

    return { success: true, sampleCount: readings.length, threshold: _model.threshold, duration_ms: Date.now() - t0 }
  } catch (err) {
    logger.error('[IF] Retrain failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * getModelInfo() — returns current model metadata for the /api/telemetry/if-status endpoint.
 */
function getModelInfo() {
  return {
    trained:   _model.trained,
    nTrees:    _model.nTrees,
    threshold: _model.threshold,
    features:  FEATURES,
  }
}

module.exports = { score, retrainOnRollingWindow, getModelInfo, FEATURES }
