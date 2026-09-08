const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {
  const { email, role } = req.body
  res.json({
    success: true,
    token: 'sc_token_lead_krish_9884a7e',
    user: {
      id: 'USR-101',
      name: 'Krish Sharma',
      email: email || 'krish.ops@nmdc.co.in',
      role: role || 'Principal Plant Operations Lead',
      avatar: 'KS',
      department: 'Heavy Material Transport & Predictive SCADA',
    },
  })
})

router.post('/register', (req, res) => {
  const { name, email, role, department } = req.body
  res.json({
    success: true,
    token: 'sc_token_registered_' + Date.now(),
    user: {
      id: 'USR-' + Math.floor(100 + Math.random() * 900),
      name,
      email,
      role: role || 'Plant Engineer',
      avatar: (name || 'PE').slice(0, 2).toUpperCase(),
      department: department || 'NMDC Conveyor Maintenance',
    },
  })
})

router.get('/me', (req, res) => {
  res.json({
    success: true,
    user: {
      id: 'USR-101',
      name: 'Krish Sharma',
      email: 'krish.ops@nmdc.co.in',
      role: 'Principal Plant Operations Lead',
      avatar: 'KS',
      facilityId: 'NMDC-CV-101',
    },
  })
})

router.get('/users', (req, res) => {
  res.json({
    success: true,
    users: [
      { id: 'USR-101', name: 'Krish Sharma', role: 'Principal Plant Operations Lead', avatar: 'KS' },
      { id: 'USR-102', name: 'Dr. Ramesh Rao', role: 'Reliability Engineering Lead', avatar: 'RR' },
      { id: 'USR-103', name: 'Ananya Deshmukh', role: '3D Twin & AI Systems Specialist', avatar: 'AD' },
    ],
  })
})

module.exports = router
