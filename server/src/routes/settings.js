/**
 * settings.js — System configuration & threshold settings
 *
 * Allows configuring anomaly thresholds, retrain window periods,
 * and sensor operational baselines.
 */

const express = require('express')
const router = express.Router()

let currentSettings = {
  conveyorId: 'CONVEYOR-C01',
  beltType: 'ST-4500 Steel Cord Belt',
  beltLengthMeters: 1250,
  speedNominal: 3.5,
  totalJoints: 8,
  thresholds: {
    tempMax: 85,
    tempWarning: 65,
    vibMax: 7.5,
    vibWarning: 4.5,
    currentMax: 180,
    currentWarning: 150,
  },
  isolationForest: {
    retrainIntervalMinutes: parseInt(process.env.IF_RETRAIN_INTERVAL_MIN || '20', 10),
    rollingWindowMinutes: parseInt(process.env.IF_ROLLING_WINDOW_MIN || '20', 10),
    nTrees: 100,
  },
  connectivity: {
    resilienceMode: 'ENABLED',
    offlineBufferSize: 1000,
    edgeBuffering: true,
  },
}

/**
 * GET /api/settings
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    settings: currentSettings,
  })
})

/**
 * PUT /api/settings
 */
router.put('/', (req, res) => {
  const updates = req.body
  currentSettings = {
    ...currentSettings,
    ...updates,
    thresholds: {
      ...currentSettings.thresholds,
      ...(updates.thresholds || {}),
    },
  }

  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: currentSettings,
  })
})

module.exports = router
