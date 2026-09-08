import { createSlice } from '@reduxjs/toolkit'

const INITIAL_TELEMETRY = {
  beltSpeed: 4.2,             // m/s (Target: 4.2 m/s)
  beltTension: 142.5,         // kN
  dynamicLoad: 1850,          // tons/hour (rated 2,400)
  driveMotorPower: 480,       // kW
  ambientTemp: 32.4,          // °C
  triaxialVibration: {
    x: 1.2,
    y: 2.4,
    z: 7.9,
    overallRms: 7.9,          // mm/s (Zone D Critical)
  },
  beltThickness: 16.2,        // mm (Original: 22mm, Safety cutoff: <18.5mm)
  pyrometerTemp: 74.5,        // °C (Warning >65°C, Critical >80°C)
  acousticEmission: 78.4,     // dB
  timestamp: new Date().toISOString(),
  facilityId: 'NMDC-CV-101',
}

// 30-point waveform history for ISO 10816-3 chart
const INITIAL_WAVEFORM = Array.from({ length: 30 }, (_, i) => {
  const t = new Date(Date.now() - (30 - i) * 1000)
  const base = 7.7 + Math.sin(i * 0.4) * 0.35 + (Math.random() - 0.5) * 0.15
  return {
    time: t.toLocaleTimeString('en-US', { hour12: false }),
    overallRms: +base.toFixed(2),
    zoneA: 2.8,
    zoneB: 4.5,
    zoneC: 7.1,
    zoneD: 10.0,
    temperature: +(73 + Math.sin(i * 0.2) * 1.5).toFixed(1),
    thickness: +(16.2 + Math.cos(i * 0.2) * 0.2).toFixed(1),
  }
})

export const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState: {
    facilityId: 'NMDC-CV-101',
    facilityName: 'NMDC Kirandul CV-101',
    connectionStatus: 'LIVE 20Hz - OK',
    lastSync: new Date().toLocaleTimeString('en-US', { hour12: false }),
    emergencyStopped: localStorage.getItem('smartconveyor_estop') === 'true',
    emergencyDetails: {
      isEmergencyStop: localStorage.getItem('smartconveyor_estop') === 'true',
      triggeredBy: localStorage.getItem('smartconveyor_estop') === 'true' ? 'Safety Interlock Relay' : null,
      triggeredAt: localStorage.getItem('smartconveyor_estop') === 'true' ? '2026-09-08T11:45:00Z' : null,
      reason: 'Physical E-Stop interlock tripped on Overland Curve Segment (Joint-05)',
    },
    live: INITIAL_TELEMETRY,
    minRul: {
      days: 6.0,
      hours: 144,
      targetJoint: 'Joint-05',
      confidence: 94.2,
      criticalWarning: true,
      curveRiskIndex: 89.2, // Risk on curve section
    },
    vibrationWaveform: INITIAL_WAVEFORM,
    kpis: {
      beltSpeed: { value: 4.2, target: 4.2, unit: 'm/s', status: 'HEALTHY', nominalZone: '3.8 - 4.5' },
      dynamicLoad: { value: 1850, rated: 2400, unit: 't/h', percent: 77.1, status: 'HEALTHY' },
      minRul: { value: 6.0, unit: 'DAYS', status: 'CRITICAL', joint: 'Joint-05' },
      riskIndex: { value: 89.2, unit: '%', status: 'CRITICAL', section: 'Overland Curve (800m)' },
    },
    sensors: [
      { id: 'ADXL-345', name: 'ADXL345 Tri-Axial Vibration', location: 'Overland Curve Gantry', reading: 7.9, unit: 'mm/s', status: 'CRITICAL', health: 32 },
      { id: 'MAX-6675', name: 'MAX6675 IR Pyrometer', location: 'Horizontal Turn Pulley', reading: 74.5, unit: '°C', status: 'WARNING', health: 65 },
      { id: 'US-THICK', name: 'Ultrasonic Thickness Gauge', location: 'Loading Zone Chute', reading: 16.2, unit: 'mm', status: 'CRITICAL', health: 40 },
      { id: 'AE-RESON', name: 'Acoustic Emission Sensor', location: 'Drive Drum Snub Roll', reading: 78.4, unit: 'dB', status: 'WARNING', health: 58 },
    ],
  },
  reducers: {
    setFacility: (s, a) => {
      s.facilityId = a.payload.id
      s.facilityName = a.payload.name
    },
    setConnectionStatus: (s, a) => {
      s.connectionStatus = a.payload
    },
    updateLiveTelemetry: (s, a) => {
      s.live = { ...s.live, ...a.payload }
      s.lastSync = new Date().toLocaleTimeString('en-US', { hour12: false })

      // Update KPI mirrors
      if (a.payload.beltSpeed !== undefined) s.kpis.beltSpeed.value = a.payload.beltSpeed
      if (a.payload.dynamicLoad !== undefined) s.kpis.dynamicLoad.value = a.payload.dynamicLoad

      // Append to waveform
      if (a.payload.triaxialVibration?.overallRms !== undefined) {
        const rms = a.payload.triaxialVibration.overallRms
        if (s.vibrationWaveform.length >= 35) s.vibrationWaveform.shift()
        s.vibrationWaveform.push({
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
          overallRms: rms,
          zoneA: 2.8,
          zoneB: 4.5,
          zoneC: 7.1,
          zoneD: 10.0,
          temperature: a.payload.pyrometerTemp || 74.5,
          thickness: a.payload.beltThickness || 16.2,
        })
      }
    },
    setEmergencyStop: (s, a) => {
      const isStop = typeof a.payload === 'boolean' ? a.payload : Boolean(a.payload?.isEmergencyStop)
      s.emergencyStopped = isStop
      s.emergencyDetails = {
        isEmergencyStop: isStop,
        triggeredBy: a.payload?.triggeredBy || (isStop ? 'Control Room Operator' : null),
        triggeredAt: a.payload?.triggeredAt || (isStop ? new Date().toISOString() : null),
        reason: a.payload?.reason || 'Safety Interlock Lockdown',
      }
      if (isStop) {
        s.live.beltSpeed = 0
        s.live.dynamicLoad = 0
        s.kpis.beltSpeed.value = 0
        s.kpis.dynamicLoad.value = 0
      } else {
        s.live.beltSpeed = 4.2
        s.live.dynamicLoad = 1850
        s.kpis.beltSpeed.value = 4.2
        s.kpis.dynamicLoad.value = 1850
      }
    },
  },
})

export const {
  setFacility,
  setConnectionStatus,
  updateLiveTelemetry,
  setEmergencyStop,
} = telemetrySlice.actions

export default telemetrySlice.reducer
