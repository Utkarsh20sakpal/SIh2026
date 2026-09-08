/**
 * telemetry.js — Sensor ingestion, live telemetry, and Isolation Forest endpoints
 *
 * prd.md §FR-1: Fetch real-time sensor readings from Firestore
 * prd.md §FR-2: Isolation Forest model on sensor readings; MongoDB 20 min rolling window
 */

const express = require('express')
const router = express.Router()
const SensorReading = require('../models/SensorReading')
const { getRecentReadings, ingestReading, generateSimulatedPoint } = require('../services/firebaseSyncService')
const { score, retrainOnRollingWindow, getModelInfo } = require('../services/isolationForestService')
const logger = require('../config/logger')

/**
 * GET /api/telemetry/live
 * Latest sensor readings, drive parameters, and instantaneous anomaly score
 */
router.get('/live', async (req, res, next) => {
  try {
    const conveyorId = req.query.conveyorId || 'CONVEYOR-C01'
    const recent = await getRecentReadings(1, conveyorId)
    const latest = recent.length > 0 ? recent[recent.length - 1] : generateSimulatedPoint(conveyorId)

    // Run IF scoring
    const ifResult = score(latest)

    res.json({
      success: true,
      conveyorId,
      timestamp: latest.timestamp || new Date().toISOString(),
      readings: {
        temperature: latest.temperature,
        vibration: latest.vibration,
        current: latest.current,
        load: latest.load || 78,
        beltSpeed: latest.beltSpeed || 3.42,
        gearboxTemp: latest.gearboxTemp || 52.4,
        beltThickness: latest.beltThickness || 18.2,
      },
      anomaly: {
        isAnomaly: Boolean(ifResult.isAnomaly),
        score: typeof ifResult.score === 'number' ? +ifResult.score.toFixed(4) : 0.25,
        threshold: typeof ifResult.threshold === 'number' ? +ifResult.threshold.toFixed(4) : 0.60,
      },
      status: ifResult.isAnomaly ? 'WARNING' : 'NORMAL',
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/telemetry/rolling?minutes=5
 * Rolling log of readings (default 5 min for Alert page, 20 min for IF review)
 */
router.get('/rolling', async (req, res, next) => {
  try {
    const minutes = parseInt(req.query.minutes || '5', 10)
    const conveyorId = req.query.conveyorId || 'CONVEYOR-C01'

    const readings = await getRecentReadings(minutes, conveyorId)

    // Score any readings that lack anomaly data
    const scored = readings.map(r => {
      const s = score(r)
      return {
        ...r,
        anomalyScore: r.anomalyScore != null ? r.anomalyScore : +s.score.toFixed(4),
        isAnomaly: r.isAnomaly != null ? r.isAnomaly : s.isAnomaly,
      }
    })

    res.json({
      success: true,
      conveyorId,
      windowMinutes: minutes,
      count: scored.length,
      readings: scored,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/telemetry/ingest
 * Ingest readings from IoT edge gateways / simulation agents
 */
router.post('/ingest', async (req, res, next) => {
  try {
    const data = req.body
    if (!data.temperature || !data.vibration || !data.current) {
      return res.status(400).json({ success: false, error: 'Missing required sensor metrics: temperature, vibration, current' })
    }

    // Run IF scoring
    const ifResult = score(data)
    data.anomalyScore = ifResult.score
    data.isAnomaly = ifResult.isAnomaly

    const saved = await ingestReading(data)

    res.status(201).json({
      success: true,
      data: saved || data,
      anomaly: ifResult,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/telemetry/if-status
 * Current Isolation Forest model state & metadata
 */
router.get('/if-status', (req, res) => {
  res.json({
    success: true,
    model: getModelInfo(),
    retrainIntervalMinutes: parseInt(process.env.IF_RETRAIN_INTERVAL_MIN || '20', 10),
    rollingWindowMinutes: parseInt(process.env.IF_ROLLING_WINDOW_MIN || '20', 10),
  })
})

/**
 * POST /api/telemetry/retrain-if
 * Trigger immediate manual retrain on rolling window
 */
router.post('/retrain-if', async (req, res, next) => {
  try {
    const result = await retrainOnRollingWindow()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

module.exports = router
