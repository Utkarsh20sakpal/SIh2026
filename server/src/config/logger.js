/**
 * logger.js — Winston logger
 * prd.md §NFR-3: robust error handling / observability throughout
 */
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ''
  return `${timestamp} [${level}]: ${message}${metaStr}`
})

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFormat),
    }),
    new transports.File({ filename: 'logs/error.log',  level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

module.exports = logger
