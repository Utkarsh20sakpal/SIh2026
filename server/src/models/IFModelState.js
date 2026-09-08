/**
 * IFModelState.js — persists the trained Isolation Forest model weights
 * so the retrain cycle survives server restarts.
 *
 * prd.md §FR-2: retrain every 20 min on rolling window, then clear window.
 */
const mongoose = require('mongoose')

const IFModelStateSchema = new mongoose.Schema({
  version:      { type: Number, default: 1 },
  trainedAt:    { type: Date,   default: Date.now },
  sampleCount:  { type: Number },

  // Serialised model parameters — stored as JSON string so any
  // JS Isolation Forest library can serialise/deserialise it
  modelJson:    { type: String, required: true },

  // Thresholds derived from training
  thresholdAnomaly: { type: Number },
  featureNames: [String],

  // Metadata
  retrainDuration_ms: Number,
}, { timestamps: true })

// Keep only the latest N versions to avoid unbounded growth
IFModelStateSchema.index({ trainedAt: -1 })

module.exports = mongoose.model('IFModelState', IFModelStateSchema)
