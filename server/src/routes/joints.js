const express = require('express')
const router = express.Router()

const JOINTS = [
  { id: 'Joint-01', label: 'Joint-01', name: 'Joint-01 (Head Drum)', position: 0, distanceMeters: 0, status: 'OPTIMAL', health: 94, wearPercent: 6, rulDays: 48.5, vibrationRms: 2.1, pyrometerTemp: 48.2, beltThickness: 21.6, acousticEmission: 42.1 },
  { id: 'Joint-02', label: 'Joint-02', name: 'Joint-02 (Take-Up Pulley)', position: 200, distanceMeters: 200, status: 'OPTIMAL', health: 91, wearPercent: 9, rulDays: 41.2, vibrationRms: 2.4, pyrometerTemp: 51.0, beltThickness: 21.2, acousticEmission: 45.3 },
  { id: 'Joint-03', label: 'Joint-03', name: 'Joint-03 (Loading Zone)', position: 400, distanceMeters: 400, status: 'ELEVATED_WEAR', health: 68, wearPercent: 32, rulDays: 19.4, vibrationRms: 4.8, pyrometerTemp: 62.4, beltThickness: 19.8, acousticEmission: 63.8 },
  { id: 'Joint-04', label: 'Joint-04', name: 'Joint-04 (Return Flight)', position: 600, distanceMeters: 600, status: 'OPTIMAL', health: 88, wearPercent: 12, rulDays: 34.0, vibrationRms: 2.9, pyrometerTemp: 44.7, beltThickness: 20.9, acousticEmission: 47.0 },
  { id: 'Joint-05', label: 'Joint-05', name: 'Joint-05 (Overland Curve)', position: 800, distanceMeters: 800, status: 'CRITICAL', health: 32, wearPercent: 68, rulDays: 6.0, vibrationRms: 7.9, pyrometerTemp: 74.5, beltThickness: 16.2, acousticEmission: 78.4 },
  { id: 'Joint-06', label: 'Joint-06', name: 'Joint-06 (Drive Gantry)', position: 1000, distanceMeters: 1000, status: 'OPTIMAL', health: 96, wearPercent: 4, rulDays: 52.8, vibrationRms: 1.9, pyrometerTemp: 49.3, beltThickness: 21.8, acousticEmission: 39.5 },
]

// 870 snapshots across 72 hours
function generate870Snapshots() {
  const count = 870
  const snapshots = []
  const nowMs = Date.now()
  for (let i = 0; i < count; i++) {
    const ratio = i / (count - 1)
    const hoursAgo = +(72 * (1 - ratio)).toFixed(2)
    const timestamp = new Date(nowMs - hoursAgo * 3600 * 1000).toISOString()
    let j5Health, j5Status, j5Vib, j5Temp
    if (ratio < 0.5) {
      const localR = ratio / 0.5
      j5Health = +(95 - localR * 27).toFixed(1)
      j5Status = j5Health >= 80 ? 'OPTIMAL' : 'ELEVATED_WEAR'
      j5Vib = +(2.9 + localR * 2.3).toFixed(2)
      j5Temp = +(52 + localR * 10).toFixed(1)
    } else {
      const localR = (ratio - 0.5) / 0.5
      j5Health = +(68 - localR * 36).toFixed(1)
      j5Status = j5Health <= 45 ? 'CRITICAL' : 'ELEVATED_WEAR'
      j5Vib = +(5.2 + localR * 2.7).toFixed(2)
      j5Temp = +(62 + localR * 12.5).toFixed(1)
    }
    snapshots.push({
      index: i,
      hoursAgo,
      timestamp,
      joints: {
        'Joint-01': { health: 94, status: 'OPTIMAL', vibration: 2.1, temp: 48.2 },
        'Joint-02': { health: 91, status: 'OPTIMAL', vibration: 2.4, temp: 51.0 },
        'Joint-03': { health: +(76 - ratio * 8).toFixed(1), status: ratio > 0.4 ? 'ELEVATED_WEAR' : 'OPTIMAL', vibration: +(3.8 + ratio * 1.0).toFixed(2), temp: +(56 + ratio * 6.4).toFixed(1) },
        'Joint-04': { health: 88, status: 'OPTIMAL', vibration: 2.9, temp: 44.7 },
        'Joint-05': { health: j5Health, status: j5Status, vibration: j5Vib, temp: j5Temp, rulDays: +(18 - ratio * 12).toFixed(1) },
        'Joint-06': { health: 96, status: 'OPTIMAL', vibration: 1.9, temp: 49.3 },
      },
    })
  }
  return snapshots
}

const cachedSnapshots = generate870Snapshots()

router.get('/', (req, res) => {
  res.json({ success: true, joints: JOINTS })
})

router.get('/history/all', (req, res) => {
  const limit = parseInt(req.query.limit || '1500', 10)
  res.json({
    success: true,
    count: cachedSnapshots.slice(0, limit).length,
    snapshots: cachedSnapshots.slice(0, limit),
  })
})

router.get('/:jointId/history', (req, res) => {
  const { jointId } = req.params
  const history = cachedSnapshots.map(s => ({
    timestamp: s.timestamp,
    hoursAgo: s.hoursAgo,
    ...s.joints[jointId],
  }))
  res.json({ success: true, jointId, history })
})

router.get('/:jointId', (req, res) => {
  const { jointId } = req.params
  const found = JOINTS.find(j => j.id.toLowerCase() === jointId.toLowerCase()) || JOINTS[4]
  res.json({ success: true, joint: found })
})

router.patch('/:jointId', (req, res) => {
  const { jointId } = req.params
  const { updates } = req.body
  const found = JOINTS.find(j => j.id.toLowerCase() === jointId.toLowerCase())
  if (found && updates) {
    Object.assign(found, updates)
  }
  res.json({ success: true, joint: found })
})

module.exports = router
