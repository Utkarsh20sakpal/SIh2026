const express = require('express')
const router = express.Router()

let emergencyState = {
  isEmergencyStop: false,
  triggeredBy: null,
  triggeredAt: null,
  reason: null,
  clearRemark: null,
  clearedBy: null,
  clearedAt: null,
}

router.get('/status', (req, res) => {
  res.json({ success: true, ...emergencyState })
})

router.post('/trigger', (req, res) => {
  const { user, reason, facilityId } = req.body
  emergencyState = {
    isEmergencyStop: true,
    triggeredBy: user || 'Operator',
    triggeredAt: new Date().toISOString(),
    reason: reason || 'Control room emergency interlock engaged',
    clearRemark: null,
    clearedBy: null,
    clearedAt: null,
  }
  res.json({ success: true, message: 'EMERGENCY STOP TRIGGERED', ...emergencyState })
})

router.post('/clear', (req, res) => {
  const { user, clearRemark, facilityId } = req.body
  emergencyState = {
    isEmergencyStop: false,
    triggeredBy: null,
    triggeredAt: null,
    reason: null,
    clearRemark: clearRemark || 'Physical beltline inspection signed off',
    clearedBy: user || 'Lead Engineer',
    clearedAt: new Date().toISOString(),
  }
  res.json({ success: true, message: 'EMERGENCY STOP CLEARED', ...emergencyState })
})

module.exports = router
