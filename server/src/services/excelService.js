/**
 * excelService.js — Generates styled Excel exports for sensor readings log
 *
 * prd.md §Scope §3:
 *   "Includes a rolling log of the last 5 minutes of readings, exportable to
 *    Excel with normal readings in green and problem readings in red, timestamped."
 */

const ExcelJS = require('exceljs')
const logger = require('../config/logger')

/**
 * Generate an Excel workbook buffer from an array of readings
 * @param {Array} readings - array of reading objects from the last 5 minutes
 * @param {Object} options - { conveyorId, generatedAt }
 * @returns {Promise<Buffer>}
 */
async function generateReadingsExcelBuffer(readings = [], options = {}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SmartConveyor Shield Predictive Maintenance'
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet('5-Minute Rolling Sensor Log', {
    views: [{ showGridLines: true }],
  })

  // Title block
  worksheet.mergeCells('A1:H1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = `SmartConveyor Shield — 5-Minute Sensor Telemetry Log (${options.conveyorId || 'CONVEYOR-C01'})`
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A202C' }, // Dark slate header
  }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(1).height = 30

  // Subtitle / metadata
  worksheet.mergeCells('A2:H2')
  const subCell = worksheet.getCell('A2')
  subCell.value = `Generated: ${new Date().toISOString()} | Export Window: Rolling Last 5 Minutes | Total Readings: ${readings.length}`
  subCell.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF4A5568' } }
  subCell.alignment = { vertical: 'middle', horizontal: 'left' }
  worksheet.getRow(2).height = 20

  // Column definitions
  worksheet.getRow(4).values = [
    'Timestamp (ISO)',
    'Conveyor ID',
    'Joint ID',
    'Temp (°C)',
    'Vibration (mm/s)',
    'Motor Current (A)',
    'Anomaly Score',
    'Status',
  ]
  worksheet.getRow(4).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }
  worksheet.getRow(4).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2D3748' },
  }
  worksheet.getRow(4).alignment = { vertical: 'middle', horizontal: 'center' }
  worksheet.getRow(4).height = 24

  worksheet.columns = [
    { key: 'timestamp', width: 25 },
    { key: 'conveyorId', width: 16 },
    { key: 'jointId', width: 14 },
    { key: 'temperature', width: 14 },
    { key: 'vibration', width: 18 },
    { key: 'current', width: 18 },
    { key: 'anomalyScore', width: 16 },
    { key: 'status', width: 16 },
  ]

  // Color styles per prd.md §Scope §3:
  // "with normal readings in green and problem readings in red, timestamped"
  const greenFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD1E7DD' }, // Soft green
  }
  const greenFont = { name: 'Segoe UI', size: 10, color: { argb: 'FF0F5132' } }

  const redFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF8D7DA' }, // Soft red
  }
  const redFont = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF842029' } }

  let rowIdx = 5
  for (const r of readings) {
    const isProblem = Boolean(r.isAnomaly || (r.anomalyScore && r.anomalyScore > 0.6) || r.temperature > 70 || r.vibration > 4.5)
    const statusText = isProblem ? 'PROBLEM' : 'NORMAL'

    const row = worksheet.getRow(rowIdx)
    row.values = [
      new Date(r.timestamp || Date.now()).toISOString(),
      r.conveyorId || 'CONVEYOR-C01',
      r.jointId || 'J-06',
      typeof r.temperature === 'number' ? +r.temperature.toFixed(1) : r.temperature,
      typeof r.vibration === 'number' ? +r.vibration.toFixed(2) : r.vibration,
      typeof r.current === 'number' ? +r.current.toFixed(1) : r.current,
      typeof r.anomalyScore === 'number' ? +r.anomalyScore.toFixed(3) : (isProblem ? 0.72 : 0.28),
      statusText,
    ]

    const targetFill = isProblem ? redFill : greenFill
    const targetFont = isProblem ? redFont : greenFont

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c)
      cell.fill = targetFill
      cell.font = targetFont
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      }
      cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' }
    }

    row.height = 20
    rowIdx++
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

module.exports = {
  generateReadingsExcelBuffer,
}
