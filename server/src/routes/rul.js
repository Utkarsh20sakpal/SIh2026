/**
 * rul.js — Remaining Useful Life (RUL) estimation endpoints
 *
 * prd.md §FR-4:
 *   "Calculate Remaining Useful Life (RUL) using: Isolation Forest output,
 *    YOLOv8 output, and raw sensor readings.
 *    (Open — see Risks below: the fusion formula for combining these three
 *    inputs into a single RUL estimate is still being defined.)"
 */

const express = require('express')
const router = express.Router()
const { calculateRUL, getJointRULBreakdown } = require('../services/rulService')
const { getRecentReadings } = require('../services/firebaseSyncService')
const { score } = require('../services/isolationForestService')
const { detectDefects } = require('../services/visionService')
const logger = require('../config/logger')

/**
 * GET /api/rul
 * Get unified conveyor system RUL based on latest fused inputs
 */
router.get('/', async (req, res, next) => {
  try {
    const conveyorId = req.query.conveyorId || 'CONVEYOR-C01'
    const jointId = req.query.jointId || 'J-06'

    // 1. Fetch latest sensor reading
    const recent = await getRecentReadings(1, conveyorId)
    const latestReading = recent.length > 0 ? recent[recent.length - 1] : { temperature: 56.4, vibration: 3.1, current: 132 }

    // 2. Compute Isolation Forest score
    const ifResult = score(latestReading)

    // 3. Compute Vision defect severity
    const visionResult = await detectDefects({ jointId, conveyorId })
    const primaryDetection = visionResult.detections && visionResult.detections[0] ? visionResult.detections[0] : {}

    // 4. Calculate fused RUL
    const rul = calculateRUL({
      sensorReadings: latestReading,
      isolationForest: {
        anomalyScore: ifResult.score,
        isAnomaly: ifResult.isAnomaly,
      },
      vision: {
        defectClass: primaryDetection.defectName || 'None',
        severityScore: visionResult.overallSeverityScore,
        confidence: primaryDetection.confidence || 0.9,
      },
      jointContext: {
        jointId,
        conveyorId,
      },
    })

    res.json({
      success: true,
      conveyorId,
      jointId,
      timestamp: new Date().toISOString(),
      rul,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/rul/joints
 * Breakdown of RUL and wear rates across all conveyor belt joints
 */
router.get('/joints', (req, res) => {
  try {
    const breakdown = getJointRULBreakdown()
    res.json({
      success: true,
      count: breakdown.length,
      joints: breakdown,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

/**
 * POST /api/rul/calculate
 * Calculate RUL with user-provided parameters (useful for scenario simulation)
 */
router.post('/calculate', (req, res) => {
  try {
    const { sensorReadings, isolationForest, vision, jointContext } = req.body
    const rul = calculateRUL({ sensorReadings, isolationForest, vision, jointContext })
    res.json({
      success: true,
      rul,
    })
  } catch (err) {
    res.status(400).json({ success: false, error: err.message })
  }
})

module.exports = router
