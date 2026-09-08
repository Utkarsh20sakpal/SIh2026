/**
 * Alert.js — MongoDB model for AI-generated alerts
 *
 * prd.md §FR-6: RAG + LangChain generates alerts explaining what failure may
 * occur, why, and how to prevent it.
 * prd.md §Scope §3: rolling log of last 5 minutes of readings, exportable to
 * Excel with normal readings in green, problem readings in red, timestamped.
 */
const mongoose = require('mongoose')

const AlertSchema = new mongoose.Schema({
  alertId:    { type: String, required: true, unique: true },
  conveyorId: { type: String, default: 'CONVEYOR-C01' },
  timestamp:  { type: Date, default: Date.now, index: true },

  title:      { type: String, required: true },
  source:     { type: String, required: true },   // e.g. 'Isolation Forest', 'YOLOv8', 'RAG'
  severity:   { type: String, enum: ['CRITICAL','WARNING','NORMAL'], required: true },
  status:     { type: String, enum: ['ACTIVE','ACKNOWLEDGED','RESOLVED'], default: 'ACTIVE' },

  // AI-generated explanation (prd.md §FR-6: explain what, why, how to prevent)
  aiExplanation: {
    what:    { type: String },   // What failure may occur
    why:     { type: String },   // Root-cause reasoning
    prevent: { type: String },   // Recommended preventive action
  },

  description: { type: String },

  // Supporting data snapshot (for Excel export — prd.md §Scope §3)
  readingSnapshot: {
    temperature:  Number,
    vibration:    Number,
    current:      Number,
    load:         Number,
    anomalyScore: Number,
    yoloClass:    String,
    yoloConfidence: Number,
  },

  // For joint-specific alerts
  relatedJoint: { type: String, default: null },

  acknowledgedAt: Date,
  resolvedAt:     Date,
}, { timestamps: true })

// prd.md §Scope §3: log of last 5 minutes of readings
AlertSchema.index({ timestamp: -1 })

module.exports = mongoose.model('Alert', AlertSchema)
