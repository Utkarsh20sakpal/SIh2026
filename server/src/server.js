/**
 * server.js — SmartConveyor Shield API entrypoint
 *
 * Boots Express, connects MongoDB, registers all routes, mounts the
 * Isolation Forest retrain cron job (prd.md §FR-2), and starts listening.
 */
require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const morgan     = require('morgan')
const mongoose   = require('mongoose')
const { initCronJobs } = require('./jobs/cronJobs')
const logger     = require('./config/logger')

// ── Routes ───────────────────────────────────────────────────────────────────
const authRoutes       = require('./routes/auth')
const jointsRoutes     = require('./routes/joints')
const emergencyRoutes  = require('./routes/emergency')
const chatRoutes       = require('./routes/chat')
const reliabilityRoutes= require('./routes/reliability')
const logsRoutes       = require('./routes/logs')
const telemetryRoutes  = require('./routes/telemetry')
const alertsRoutes     = require('./routes/alerts')
const visionRoutes     = require('./routes/vision')
const rulRoutes        = require('./routes/rul')
const reportsRoutes    = require('./routes/reports')
const settingsRoutes   = require('./routes/settings')
const healthRoutes     = require('./routes/health')

// ── App setup ────────────────────────────────────────────────────────────────
const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }))
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// ── Mount routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes)
app.use('/api/joints',      jointsRoutes)
app.use('/api/emergency',   emergencyRoutes)
app.use('/api/chat',        chatRoutes)
app.use('/api/reliability', reliabilityRoutes)
app.use('/api/logs',        logsRoutes)
app.use('/api/health',      healthRoutes)
app.use('/api/telemetry',   telemetryRoutes)
app.use('/api/alerts',      alertsRoutes)
app.use('/api/vision',      visionRoutes)
app.use('/api/rul',         rulRoutes)
app.use('/api/reports',     reportsRoutes)
app.use('/api/settings',    settingsRoutes)

// ── Global error handler ─────────────────────────────────────────────────────
// prd.md §NFR-3: robust error handling throughout
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, { stack: err.stack })
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  })
})

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` })
})

// ── MongoDB + start ──────────────────────────────────────────────────────────
async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartconveyor_shield'
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2500 })
    logger.info('✓ MongoDB connected')
  } catch (mongoErr) {
    logger.warn(`⚠ MongoDB connection failed (${mongoErr.message}). Entering in-memory resilient fallback mode (prd.md §NFR-4).`)
  }

  // prd.md §FR-2: Isolation Forest retrain every IF_RETRAIN_INTERVAL_MIN minutes
  try {
    initCronJobs()
    logger.info('✓ Background jobs initialised')
  } catch (cronErr) {
    logger.warn('Failed to initialise cron jobs:', cronErr.message)
  }

  app.listen(PORT, () => {
    logger.info(`✓ SmartConveyor Shield API running on http://localhost:${PORT}`)
  })
}

start()

module.exports = app
