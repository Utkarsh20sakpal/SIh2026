const express = require('express')
const router = express.Router()

let inMemoryLogs = [
  { id: 'LOG-501', timestamp: '2026-09-08T11:45:02Z', level: 'CRITICAL', category: 'AI_MODEL', message: 'Joint-05 RUL estimated at 6.0 days based on tri-axial vibration spike (7.9 mm/s)', user: 'KALMAN_FUSION_ENGINE' },
  { id: 'LOG-502', timestamp: '2026-09-08T11:44:12Z', level: 'WARN', category: 'HARDWARE_IOT', message: 'Pyrometer temperature exceeded warning boundary: 74.5°C on Joint-05 zone', user: 'MAX6675_GATEWAY' },
  { id: 'LOG-503', timestamp: '2026-09-08T11:40:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Operator Krish inspected Joint-05 3D digital twin telemetry drawer', user: 'Krish' },
  { id: 'LOG-504', timestamp: '2026-09-08T10:15:08Z', level: 'WARN', category: 'AI_MODEL', message: 'YOLOv8 optical station detected 142mm surface tear on Joint-03 (conf: 89%)', user: 'YOLO_INFERENCE' },
  { id: 'LOG-505', timestamp: '2026-09-08T09:30:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Acknowledged alert ALT-1079 (Joint-03 skirtboard wear)', user: 'Krish' },
  { id: 'LOG-506', timestamp: '2026-09-08T08:00:00Z', level: 'INFO', category: 'HARDWARE_IOT', message: '20Hz Firestore telemetry heartbeat synchronized — 0.00% packet loss', user: 'TELEMETRY_STREAM' },
  { id: 'LOG-507', timestamp: '2026-09-08T06:00:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Shift Handover Report SHIFT-2026-09-A generated and signed by Shift Lead Ramesh', user: 'Ramesh' },
  { id: 'LOG-508', timestamp: '2026-09-07T22:15:00Z', level: 'INFO', category: 'HARDWARE_IOT', message: 'Vibration baseline calibration pass verified across 6 joints', user: 'SYSTEM' },
]

router.get('/', (req, res) => {
  const { page = 1, limit = 25, search = '', level = '', category = '' } = req.query
  let filtered = [...inMemoryLogs]
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(l => l.message.toLowerCase().includes(s) || l.id.toLowerCase().includes(s))
  }
  if (level) {
    filtered = filtered.filter(l => l.level === level)
  }
  if (category) {
    filtered = filtered.filter(l => l.category === category)
  }

  res.json({
    success: true,
    logs: filtered,
    total: filtered.length,
    page: parseInt(page, 10),
    totalPages: Math.ceil(filtered.length / parseInt(limit, 10)) || 1,
  })
})

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    totalLogs: inMemoryLogs.length,
    errorCount: inMemoryLogs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR').length,
    warnCount: inMemoryLogs.filter(l => l.level === 'WARN').length,
    ingestion24h: '43,200 events (20Hz)',
  })
})

router.post('/clear', (req, res) => {
  inMemoryLogs = inMemoryLogs.slice(0, 4)
  res.json({ success: true, count: inMemoryLogs.length })
})

module.exports = router
