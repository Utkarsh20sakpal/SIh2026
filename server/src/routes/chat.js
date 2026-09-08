const express = require('express')
const router = express.Router()

router.post('/', (req, res) => {
  const { message, context = {}, facilityId = 'NMDC-CV-101', user = 'Krish' } = req.body
  const lower = (message || '').toLowerCase()

  let reply = ''
  let citations = [
    'ISO 10816-3 Mechanical Vibration Standard (Zone D Criteria: >7.1 mm/s)',
    'NMDC CV-101 Overland Belting Specification ST-5400',
    'YOLOv8 Edge Station Vision Log (CAM-01 Ref #VIS-901)',
  ]
  let actions = []

  if (lower.includes('joint-05') || lower.includes('joint 5') || lower.includes('j-05') || lower.includes('rul')) {
    reply = `**URGENT ENGINEERING ASSESSMENT FOR JOINT-05:**\n\n` +
      `- **Current RUL:** **6.0 Days** (Confidence: 94.2%)\n` +
      `- **Vibration Profile:** Current RMS is **7.9 mm/s**, placed firmly inside **ISO Zone D (Unacceptable / Severe Structural Damage)**.\n` +
      `- **Thermal Signature:** Infrared Pyrometer indicates **74.5°C** (Normal: <60°C, Warning: >65°C).\n` +
      `- **Visual Detection:** High-speed line-scan camera flagged **168mm steel cord pullout** with top-cover delamination.\n\n` +
      `**Immediate Action Plan:**\n` +
      `1. Throttle belt speed to **≤2.8 m/s** to limit dynamic cord shear.\n` +
      `2. Prepare **SC-4000 Cold Vulcanizing compound** and diamond-bias splice jig.\n` +
      `3. Execute cold vulcanization repair within 6 days during planned shift window.`
    actions = [
      { label: 'View Splicing Procedure Guide', route: '/reports' },
      { label: 'Inspect Joint-05 in 3D Twin', route: '/digital-twin' },
      { label: 'Acknowledge Joint-05 Critical Alert', action: 'ACK_J05' },
    ]
  } else if (lower.includes('vibration') || lower.includes('iso')) {
    reply = `**ISO 10816-3 VIBRATION HEALTH ANALYSIS:**\n\n` +
      `- **Zone A (<2.8 mm/s):** Joints 01, 02, 06 are newly conditioned and fully nominal.\n` +
      `- **Zone B (2.8 - 4.5 mm/s):** Joint 04 at 2.9 mm/s (unrestricted continuous operation).\n` +
      `- **Zone C (4.5 - 7.1 mm/s):** Joint 03 at 4.8 mm/s (restricted continuous operation / elevated skirtboard wear).\n` +
      `- **Zone D (>7.1 mm/s):** **Joint 05 at 7.9 mm/s (CRITICAL ANOMALY)**. High-frequency FFT harmonics indicate internal cord tension fatigue on horizontal curve transition.`
    actions = [
      { label: 'View Sensor Health Matrix', route: '/sensor-health' },
      { label: 'Open 3D Waveform Chart', route: '/dashboard' },
    ]
  } else if (lower.includes('emergency') || lower.includes('stop') || lower.includes('halt')) {
    reply = `**SAFETY INTERLOCK SYSTEM:**\n\n` +
      `Site-wide conveyor shutdown can be initiated instantaneously via the red **Safety E-Stop Lockout** widget or top navigation bar. Clearing the lockdown requires authorized operator sign-off and physical belt clearance verification.`
    actions = [
      { label: 'Configure Safety Interlock', route: '/settings' },
    ]
  } else {
    reply = `**SmartConveyor AI Industrial Diagnostic Core:**\n\n` +
      `Monitoring **NMDC CV-101 (1,200m Overland Belt Loop)** at continuous 20Hz telemetry.\n` +
      `- **Belt Speed:** ${context.liveTelemetry?.beltSpeed || 4.2} m/s\n` +
      `- **Current Throughput:** ${context.liveTelemetry?.dynamicLoad || 1850} t/h (Rated: 2,400 t/h)\n` +
      `- **Active Alarms:** 1 CRITICAL (Joint-05), 1 WARNING (Joint-03).\n\n` +
      `How can I assist with predictive diagnostics, splice maintenance protocols, or sensor calibration?`
    actions = [
      { label: 'Status of Joint-05', prompt: 'What is the exact status of Joint-05 and recommended repair?' },
      { label: 'Explain ISO Vibration Chart', prompt: 'Explain the ISO 10816-3 vibration severity zones' },
      { label: 'Check Sensor Transducer Health', prompt: 'Summarize Kalman filter reliability for all transducers' },
    ]
  }

  res.json({ success: true, reply, citations, actions })
})

router.get('/history', (req, res) => {
  res.json({ success: true, history: [] })
})

module.exports = router
