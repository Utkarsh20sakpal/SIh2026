/**
 * health.js — System health check & connectivity diagnostics
 *
 * prd.md §NFR-3, §NFR-4:
 *   Reports API status, MongoDB connection state, Firestore connection mode,
 *   and system uptime for operational monitoring.
 */

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { db } = require('../config/firebase')

router.get('/', (req, res) => {
  const mongoStatus = {
    0: 'DISCONNECTED',
    1: 'CONNECTED',
    2: 'CONNECTING',
    3: 'DISCONNECTING',
  }[mongoose.connection.readyState] || 'UNKNOWN'

  res.json({
    status: 'HEALTHY',
    service: 'SmartConveyor Shield Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      mongo: mongoStatus,
      firestore: db ? 'CONNECTED' : 'MOCK_OFFLINE_RESILIENCE_MODE',
    },
    specs: {
      isolationForestIntervalMin: parseInt(process.env.IF_RETRAIN_INTERVAL_MIN || '20', 10),
      rollingWindowMin: parseInt(process.env.IF_ROLLING_WINDOW_MIN || '20', 10),
      yoloEndpoint: process.env.YOLO_ENDPOINT || 'http://localhost:8000/detect',
    },
  })
})

module.exports = router
