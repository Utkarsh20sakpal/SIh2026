/**
 * vision.js — YOLOv8 conveyor belt defect detection & visual severity endpoints
 *
 * prd.md §FR-3:
 *   "Run a custom YOLOv8 model on conveyor belt photos to detect defects,
 *    producing: (1) the raw YOLOv8 detection output (what the defect is),
 *    and (2) a severity score (how much it's likely to affect the system)."
 */

const express = require('express')
const router = express.Router()
const { detectDefects, DEFECT_CLASSES } = require('../services/visionService')
const logger = require('../config/logger')

/**
 * POST /api/vision/inspect
 * Process belt inspection photo with YOLOv8
 */
router.post('/inspect', async (req, res, next) => {
  try {
    const { imageUrl, imageBase64, jointId = 'J-06', conveyorId = 'CONVEYOR-C01' } = req.body

    const result = await detectDefects({
      imageUrl,
      imageBase64,
      jointId,
      conveyorId,
    })

    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/vision/latest
 * Get recent vision defect status for a given joint or all joints
 */
router.get('/latest', async (req, res, next) => {
  try {
    const jointId = req.query.jointId || 'J-06'
    const result = await detectDefects({ jointId })
    res.json(result)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/vision/defects-catalog
 * Returns the supported YOLOv8 defect classes and severity thresholds
 */
router.get('/defects-catalog', (req, res) => {
  res.json({
    success: true,
    modelName: 'YOLOv8-iron-ore-conveyor-v1.4',
    classes: DEFECT_CLASSES,
  })
})

module.exports = router
