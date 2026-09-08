const express = require('express')
const router = express.Router()

const RELIABILITY_DATA = {
  facilityId: 'NMDC-CV-101',
  timestamp: new Date().toISOString(),
  sensors: [
    {
      id: 'ADXL345-TRX-01',
      name: 'ADXL345 Tri-Axial Vibration Transducer',
      type: 'Vibration Accelerometer (Piezoelectric)',
      reliability: 96,
      snrDb: 28.4,
      packetLossPercent: 0.01,
      kalmanWeight: 0.88,
      status: 'OPTIMAL',
      driftDetected: false,
      driftOffset: '+0.04 mm/s',
      lastCalibration: '2026-08-15',
    },
    {
      id: 'MAX6675-IR-01',
      name: 'MAX6675 / Infrared Pyrometer Sensor',
      type: 'Non-Contact Optical Pyrometer',
      reliability: 94,
      snrDb: 26.1,
      packetLossPercent: 0.02,
      kalmanWeight: 0.84,
      status: 'OPTIMAL',
      driftDetected: false,
      driftOffset: '-0.3 °C',
      lastCalibration: '2026-08-20',
    },
    {
      id: 'US-THICK-01',
      name: 'Ultrasonic Non-Contact Belt Thickness Gauge',
      type: 'Multi-Beam Echo Sounder Array',
      reliability: 98,
      snrDb: 32.0,
      packetLossPercent: 0.00,
      kalmanWeight: 0.92,
      status: 'OPTIMAL',
      driftDetected: false,
      driftOffset: '+0.01 mm',
      lastCalibration: '2026-09-01',
    },
    {
      id: 'AE-RES-01',
      name: 'Acoustic Emission Resonant Transducer',
      type: 'High-Frequency Ultrasonic Waveguide (150kHz)',
      reliability: 91,
      snrDb: 24.2,
      packetLossPercent: 0.05,
      kalmanWeight: 0.79,
      status: 'OPTIMAL',
      driftDetected: false,
      driftOffset: '+0.8 dB',
      lastCalibration: '2026-08-10',
    },
  ],
}

router.get('/', (req, res) => {
  res.json({ success: true, ...RELIABILITY_DATA })
})

router.get('/history', (req, res) => {
  const history = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    adxl: 96 + (Math.sin(i * 0.4) * 1.5),
    pyro: 94 + (Math.cos(i * 0.3) * 1.8),
    ultrasonic: 98 + (Math.sin(i * 0.2) * 0.8),
    acoustic: 91 + (Math.sin(i * 0.5) * 2.5),
  }))
  res.json({ success: true, history })
})

module.exports = router
