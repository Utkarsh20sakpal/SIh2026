/**
 * SensorReading.js — MongoDB model for the rolling sensor window
 *
 * prd.md §FR-2:
 *   "MongoDB stores the last 20 minutes of readings; the model retrains on this
 *    window every 20 minutes, then the window is cleared to keep the DB lean."
 *
 * Schema stores one document per sensor reading batch (per Firestore snapshot).
 * A TTL index auto-expires documents older than IF_ROLLING_WINDOW_MIN minutes
 * as a safety net — the scheduled retrain job also purges explicitly after use.
 */
const mongoose = require('mongoose')

const SensorReadingSchema = new mongoose.Schema({
  conveyorId: { type: String, required: true, default: 'CONVEYOR-C01' },
  timestamp:  { type: Date,   required: true, default: Date.now },

  // Core sensor channels from Firestore (prd.md §FR-1)
  temperature:  { type: Number, required: true },   // °C  — head pulley bearing
  vibration:    { type: Number, required: true },   // mm/s — bearing housing
  current:      { type: Number, required: true },   // A   — drive motor
  load:         { type: Number, default: null },     // %   — belt load
  beltSpeed:    { type: Number, default: null },     // m/s — measured speed
  gearboxTemp:  { type: Number, default: null },     // °C  — gearbox sump
  beltThickness:{ type: Number, default: null },     // mm  — ultrasonic

  // Isolation Forest output (filled in by IF service after scoring)
  anomalyScore: { type: Number, default: null },    // raw IF anomaly score
  isAnomaly:    { type: Boolean, default: false },  // threshold decision

  source: {
    type: String,
    enum: ['firestore', 'mqtt', 'mock'],
    default: 'mock',
  },
})

// TTL: auto-delete documents older than rolling window + safety margin
// prd.md §FR-2: window is 20 min; set TTL to 25 min as safety net
const TTL_SECONDS = parseInt(process.env.IF_ROLLING_WINDOW_MIN || '20', 10) * 60 + 5 * 60
SensorReadingSchema.index({ timestamp: 1 }, { expireAfterSeconds: TTL_SECONDS })

module.exports = mongoose.model('SensorReading', SensorReadingSchema)
