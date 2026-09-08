/**
 * alerts.js — Alert management, GenAI RAG generation, and Excel export
 *
 * prd.md §Scope §3:
 *   "Alert page — GenAI-generated alerts (via RAG) explaining what failure may
 *    occur, why, and how to prevent it. Includes a rolling log of the last 5
 *    minutes of readings, exportable to Excel with normal readings in green and
 *    problem readings in red, timestamped."
 *
 * prd.md §FR-6:
 *   "Run a RAG pipeline that feeds a GenAI layer to generate alerts in plain language."
 */

const express = require('express')
const router = express.Router()
const { v4: uuidv4 } = require('uuid')
const Alert = require('../models/Alert')
const { generateAlertExplanation } = require('../services/ragService')
const { getRecentReadings } = require('../services/firebaseSyncService')
const { generateReadingsExcelBuffer } = require('../services/excelService')
const logger = require('../config/logger')

// In-memory fallback if MongoDB is not running locally
let inMemoryAlerts = [
  {
    alertId: 'ALT-1082',
    conveyorId: 'CONVEYOR-C01',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    title: 'Splice Delamination Risk — Joint J-06',
    source: 'YOLOv8 + Isolation Forest Fusion',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    relatedJoint: 'J-06',
    aiExplanation: {
      what: 'High probability of vulcanized joint rupture and complete conveyor belt parting under 80% ore loading.',
      why: 'YOLOv8 vision model detected progressive finger splice delamination across 240mm of Joint J-06 width. Concurrently, Isolation Forest flagged persistent high-frequency vibration anomalies (RMS 5.8 mm/s).',
      prevent: 'Target Joint: J-06. Halt conveyor feed at next scheduled shift break. Perform non-destructive ultrasonic splice thickness inspection. Apply emergency cold-bond repair or schedule hot vulcanizing re-splice.',
    },
    readingSnapshot: {
      temperature: 68.4,
      vibration: 5.82,
      current: 156.2,
      load: 84,
      anomalyScore: 0.812,
      yoloClass: 'Splice Delamination',
      yoloConfidence: 0.94,
    },
  },
  {
    alertId: 'ALT-1079',
    conveyorId: 'CONVEYOR-C01',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    title: 'Drive Motor Thermal Load Warning',
    source: 'Isolation Forest Anomaly',
    severity: 'WARNING',
    status: 'ACKNOWLEDGED',
    relatedJoint: 'J-02',
    aiExplanation: {
      what: 'Drive motor winding overheating and impending breaker thermal trip.',
      why: 'Motor current sustained at 162 Amps for >15 minutes alongside 64°C drive pulley temperature, likely caused by localized chute ore buildup.',
      prevent: 'Target Joint: J-02. Check transfer chute discharge for iron ore lump jamming. Clean chute deflector plates to restore free material flow.',
    },
    readingSnapshot: {
      temperature: 64.1,
      vibration: 3.12,
      current: 162.0,
      load: 88,
      anomalyScore: 0.694,
      yoloClass: 'None',
      yoloConfidence: 0,
    },
  },
]

/**
 * GET /api/alerts
 * List alerts with filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, severity, jointId, limit = 50 } = req.query
    let query = {}
    if (status) query.status = status
    if (severity) query.severity = severity
    if (jointId) query.relatedJoint = jointId

    try {
      const alerts = await Alert.find(query).sort({ timestamp: -1 }).limit(parseInt(limit, 10)).lean()
      if (alerts && alerts.length > 0) {
        return res.json({ success: true, count: alerts.length, alerts })
      }
    } catch (dbErr) {
      logger.warn('Alert DB query failed, using in-memory alert cache:', dbErr.message)
    }

    // Return in-memory fallback alerts
    let filtered = inMemoryAlerts
    if (status) filtered = filtered.filter(a => a.status === status)
    if (severity) filtered = filtered.filter(a => a.severity === severity)
    if (jointId) filtered = filtered.filter(a => a.relatedJoint === jointId)

    res.json({ success: true, count: filtered.length, alerts: filtered })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/alerts/generate
 * Trigger GenAI RAG alert generation (prd.md §FR-6, §Scope §3)
 */
router.post('/generate', async (req, res, next) => {
  try {
    const { title, source = 'RAG Multi-modal Pipeline', severity = 'WARNING', relatedJoint = 'J-06', readings = {}, vision = {} } = req.body

    // Generate explainable what/why/prevent via RAG
    const aiExplanation = await generateAlertExplanation({
      alertTitle: title || `Abnormal condition detected on ${relatedJoint}`,
      source,
      readings,
      vision,
      jointId: relatedJoint,
    })

    const alertData = {
      alertId: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      conveyorId: req.body.conveyorId || 'CONVEYOR-C01',
      timestamp: new Date(),
      title: title || `${severity} Alert: ${aiExplanation.knowledgeSource || 'Splice Risk'}`,
      source,
      severity,
      status: 'ACTIVE',
      relatedJoint,
      aiExplanation: {
        what: aiExplanation.what,
        why: aiExplanation.why,
        prevent: aiExplanation.prevent,
      },
      readingSnapshot: {
        temperature: readings.temperature || 62.5,
        vibration: readings.vibration || 4.2,
        current: readings.current || 145,
        load: readings.load || 80,
        anomalyScore: readings.anomalyScore || 0.74,
        yoloClass: vision.defectName || 'Splice Delamination',
        yoloConfidence: vision.confidence || 0.91,
      },
    }

    try {
      const doc = new Alert(alertData)
      await doc.save()
    } catch (saveErr) {
      logger.warn('Could not persist alert to MongoDB, stored in-memory:', saveErr.message)
    }

    inMemoryAlerts.unshift(alertData)

    res.status(201).json({
      success: true,
      alert: alertData,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/alerts/:id/acknowledge
 */
router.patch('/:id/acknowledge', async (req, res, next) => {
  try {
    const { id } = req.params
    try {
      const doc = await Alert.findOneAndUpdate(
        { alertId: id },
        { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
        { new: true }
      )
      if (doc) return res.json({ success: true, alert: doc })
    } catch (err) {}

    const mem = inMemoryAlerts.find(a => a.alertId === id)
    if (mem) {
      mem.status = 'ACKNOWLEDGED'
      mem.acknowledgedAt = new Date()
      return res.json({ success: true, alert: mem })
    }

    res.status(404).json({ success: false, error: 'Alert not found' })
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/alerts/:id/resolve
 */
router.patch('/:id/resolve', async (req, res, next) => {
  try {
    const { id } = req.params
    try {
      const doc = await Alert.findOneAndUpdate(
        { alertId: id },
        { status: 'RESOLVED', resolvedAt: new Date() },
        { new: true }
      )
      if (doc) return res.json({ success: true, alert: doc })
    } catch (err) {}

    const mem = inMemoryAlerts.find(a => a.alertId === id)
    if (mem) {
      mem.status = 'RESOLVED'
      mem.resolvedAt = new Date()
      return res.json({ success: true, alert: mem })
    }

    res.status(404).json({ success: false, error: 'Alert not found' })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/alerts/export/excel
 * Export rolling 5-minute sensor log with green (normal) and red (problem) rows
 * prd.md §Scope §3
 */
router.get('/export/excel', async (req, res, next) => {
  try {
    const conveyorId = req.query.conveyorId || 'CONVEYOR-C01'
    const minutes = 5

    const readings = await getRecentReadings(minutes, conveyorId)
    const excelBuffer = await generateReadingsExcelBuffer(readings, { conveyorId })

    const filename = `SmartConveyor_5Min_Log_${conveyorId}_${Date.now()}.xlsx`

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(excelBuffer)
  } catch (err) {
    logger.error('Failed to export Excel log:', err)
    next(err)
  }
})

module.exports = router
