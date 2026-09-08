/**
 * reports.js — Daily report generation and maintenance trend logs
 *
 * prd.md §FR-6:
 *   "Run a RAG pipeline that feeds a GenAI layer to generate daily reports in plain language."
 *
 * prd.md §Scope §4:
 *   "Trends & Maintenance page — historical trends and maintenance-related views."
 */

const express = require('express')
const router = express.Router()
const Report = require('../models/Report')
const { generateDailyReportSummary } = require('../services/ragService')
const logger = require('../config/logger')

// In-memory reports fallback
let inMemoryReports = [
  {
    reportId: 'REP-20260908-01',
    conveyorId: 'CONVEYOR-C01',
    type: 'Conveyor Performance',
    title: 'Daily Conveyor Health & Joint Risk Report — 08/09/2026',
    generatedAt: new Date().toISOString(),
    aiSummary: `24-Hour Operational Summary for CONVEYOR-C01:
Overall conveyor belt joint health is operating at 82.4%. During the past operating cycle, the multi-modal anomaly pipeline recorded 2 actionable alerts.
Primary focus is required on Joint J-06 (Loading Zone Joint B), where YOLOv8 computer vision detected early-stage splice delamination with an estimated remaining useful life (RUL) of 14.8 days.
Drive pulley vibration remains within ISO 10816-3 normal limits (2.1 mm/s RMS), and motor thermal load is stable at 54°C.
Recommended technician action: Schedule visual and ultrasonic inspection on Joint J-06 during the upcoming scheduled 4-hour maintenance shift. Ensure chute deflectors are centered to mitigate edge abrasion.`,
    status: 'READY',
    payload: {
      healthIndex: 82.4,
      tonnage24h: 38450,
      activeAlerts: 2,
      criticalJoints: ['J-06'],
    },
  },
  {
    reportId: 'REP-20260907-01',
    conveyorId: 'CONVEYOR-C01',
    type: 'Damage Detection',
    title: 'Weekly Computer Vision Defect Summary',
    generatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    aiSummary: `Automated visual scan across 8 joints identified minor top cover abrasion on J-01 and J-03. Delamination risk on J-06 was first flagged 36 hours ago; severity increased from 45% to 78% following high tonnage lump loading.`,
    status: 'READY',
    payload: {
      scansProcessed: 144,
      defectsFound: 4,
    },
  },
]

/**
 * GET /api/reports
 * List all generated reports
 */
router.get('/', async (req, res, next) => {
  try {
    const { type, limit = 20 } = req.query
    let query = {}
    if (type) query.type = type

    try {
      const docs = await Report.find(query).sort({ generatedAt: -1 }).limit(parseInt(limit, 10)).lean()
      if (docs && docs.length > 0) {
        return res.json({ success: true, count: docs.length, reports: docs })
      }
    } catch (dbErr) {
      logger.warn('Report DB query failed, using in-memory report cache:', dbErr.message)
    }

    let filtered = inMemoryReports
    if (type) filtered = filtered.filter(r => r.type === type)

    res.json({ success: true, count: filtered.length, reports: filtered })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/reports/generate
 * Trigger GenAI daily report generation
 */
router.post('/generate', async (req, res, next) => {
  try {
    const conveyorId = req.body.conveyorId || 'CONVEYOR-C01'
    const reportData = await generateDailyReportSummary({ conveyorId })

    const newReport = {
      reportId: `REP-${Date.now().toString(36).toUpperCase()}`,
      conveyorId,
      type: req.body.type || 'Conveyor Performance',
      title: reportData.title,
      generatedAt: new Date(),
      aiSummary: reportData.aiSummary,
      payload: reportData.metrics,
      status: 'READY',
    }

    try {
      const doc = new Report(newReport)
      await doc.save()
    } catch (saveErr) {
      logger.warn('Could not persist report to MongoDB, stored in-memory:', saveErr.message)
    }

    inMemoryReports.unshift(newReport)

    res.status(201).json({
      success: true,
      report: newReport,
    })
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/reports/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    try {
      const doc = await Report.findOne({ reportId: id }).lean()
      if (doc) return res.json({ success: true, report: doc })
    } catch (err) {}

    const mem = inMemoryReports.find(r => r.reportId === id)
    if (mem) return res.json({ success: true, report: mem })

    res.status(404).json({ success: false, error: 'Report not found' })
  } catch (err) {
    next(err)
  }
})

module.exports = router
