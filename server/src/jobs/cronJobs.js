/**
 * cronJobs.js — Background scheduled tasks
 *
 * prd.md §FR-2:
 *   "MongoDB stores the last 20 minutes of readings; the model retrains on this
 *    window every 20 minutes, then the window is cleared to keep the DB lean."
 */

const cron = require('node-cron')
const logger = require('../config/logger')
const { retrainOnRollingWindow } = require('../services/isolationForestService')
const { syncFirestoreToMongo } = require('../services/firebaseSyncService')

function initCronJobs() {
  const intervalMin = parseInt(process.env.IF_RETRAIN_INTERVAL_MIN || '20', 10)
  const cronExpr = `*/${intervalMin} * * * *`

  logger.info(`Scheduling Isolation Forest retrain job: ${cronExpr} (every ${intervalMin} minutes)`)

  // 1. Isolation Forest retrain cron job (prd.md §FR-2)
  cron.schedule(cronExpr, async () => {
    logger.info('[Cron] Triggering scheduled Isolation Forest retrain cycle...')
    try {
      const result = await retrainOnRollingWindow()
      logger.info('[Cron] IF Retrain result:', result)
    } catch (err) {
      logger.error('[Cron] IF Retrain job failed:', err)
    }
  })

  // 2. Continuous telemetry ingest / sync (every 10 seconds)
  // Keeps the rolling window populated and tests network resilience
  setInterval(async () => {
    try {
      await syncFirestoreToMongo()
    } catch (err) {
      // Quiet fail so logs stay tidy
    }
  }, 10000)

  logger.info('✓ All background cron jobs initialized')
}

module.exports = {
  initCronJobs,
}
