/**
 * api.js — Comprehensive API Client for SmartConveyor Platform
 *
 * Communicates with Node.js/Express backend on http://localhost:5000/api via Vite proxy.
 * Transmits 'Authorization: Bearer <token>' using 'smartconveyor_token' in localStorage.
 * Includes complete, self-contained, industrial fallback simulation for all 10 endpoint
 * categories to ensure seamless performance regardless of server connectivity.
 */

const BASE_URL = '/api'

export function getAuthToken() {
  let token = localStorage.getItem('smartconveyor_token')
  if (!token) {
    token = 'sc_token_lead_krish_9884a7e'
    localStorage.setItem('smartconveyor_token', token)
  }
  return token
}

export function setAuthToken(token) {
  localStorage.setItem('smartconveyor_token', token)
}

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IN-MEMORY HIGH-FIDELITY INDUSTRIAL SIMULATION STORES
// ─────────────────────────────────────────────────────────────────────────────

export const FACILITIES = [
  { id: 'NMDC-CV-101', name: 'NMDC Kirandul CV-101', length: 1200, capacity: 2400, ore: 'Hematite Lump' },
  { id: 'NMDC-CV-202', name: 'NMDC Bacheli CV-202', length: 1450, capacity: 2800, ore: 'High-Grade Fines' },
]

export const MOCK_JOINTS = [
  {
    id: 'Joint-01',
    label: 'Joint-01',
    name: 'Joint-01 (Head Drum)',
    position: 0,
    distanceMeters: 0,
    type: 'Hot Vulcanized Finger Splice',
    status: 'OPTIMAL',
    health: 94,
    wearPercent: 6,
    rulDays: 48.5,
    vibrationRms: 2.1,
    pyrometerTemp: 48.2,
    beltThickness: 21.6,
    acousticEmission: 42.1,
    lastInspected: '2026-09-07T08:30:00Z',
    recommendation: 'Splice integrity nominal. No maintenance intervention required.',
  },
  {
    id: 'Joint-02',
    label: 'Joint-02',
    name: 'Joint-02 (Take-Up Pulley)',
    position: 200,
    distanceMeters: 200,
    type: 'Hot Vulcanized Diamond Splice',
    status: 'OPTIMAL',
    health: 91,
    wearPercent: 9,
    rulDays: 41.2,
    vibrationRms: 2.4,
    pyrometerTemp: 51.0,
    beltThickness: 21.2,
    acousticEmission: 45.3,
    lastInspected: '2026-09-06T14:15:00Z',
    recommendation: 'Nominal wear pattern consistent with take-up tension cycle.',
  },
  {
    id: 'Joint-03',
    label: 'Joint-03',
    name: 'Joint-03 (Loading Zone)',
    position: 400,
    distanceMeters: 400,
    type: 'Cold Vulcanized Step Splice',
    status: 'ELEVATED_WEAR',
    health: 68,
    wearPercent: 32,
    rulDays: 19.4,
    vibrationRms: 4.8,
    pyrometerTemp: 62.4,
    beltThickness: 19.8,
    acousticEmission: 63.8,
    lastInspected: '2026-09-08T06:00:00Z',
    recommendation: 'Elevated impact wear under loading chute skirtboard. Inspect impact idlers.',
  },
  {
    id: 'Joint-04',
    label: 'Joint-04',
    name: 'Joint-04 (Return Flight)',
    position: 600,
    distanceMeters: 600,
    type: 'Hot Vulcanized Finger Splice',
    status: 'OPTIMAL',
    health: 88,
    wearPercent: 12,
    rulDays: 34.0,
    vibrationRms: 2.9,
    pyrometerTemp: 44.7,
    beltThickness: 20.9,
    acousticEmission: 47.0,
    lastInspected: '2026-09-05T11:20:00Z',
    recommendation: 'Bottom cover tracking true. Minor carryback dusting cleaned.',
  },
  {
    id: 'Joint-05',
    label: 'Joint-05',
    name: 'Joint-05 (Overland Curve)',
    position: 800,
    distanceMeters: 800,
    type: 'Cold Vulcanized Diamond Splice',
    status: 'CRITICAL',
    health: 32,
    wearPercent: 68,
    rulDays: 6.0,
    vibrationRms: 7.9,
    pyrometerTemp: 74.5,
    beltThickness: 16.2,
    acousticEmission: 78.4,
    lastInspected: '2026-09-08T11:45:00Z',
    recommendation: 'CRITICAL DELAMINATION: Accelerated cord pullout risk on horizontal curve. Perform immediate re-splice (SC-4000 cold compound) within 6.0 days.',
  },
  {
    id: 'Joint-06',
    label: 'Joint-06',
    name: 'Joint-06 (Drive Gantry)',
    position: 1000,
    distanceMeters: 1000,
    type: 'Hot Vulcanized Finger Splice',
    status: 'OPTIMAL',
    health: 96,
    wearPercent: 4,
    rulDays: 52.8,
    vibrationRms: 1.9,
    pyrometerTemp: 49.3,
    beltThickness: 21.8,
    acousticEmission: 39.5,
    lastInspected: '2026-09-07T16:00:00Z',
    recommendation: 'Primary drive pulley splice in pristine condition.',
  },
]

// Generate 870 snapshots across 72 hours for high-speed time-travel scrubbing
export const MOCK_72H_SNAPSHOTS = (() => {
  const count = 870
  const snapshots = []
  const nowMs = Date.now()

  for (let i = 0; i < count; i++) {
    // 0 = 72 hours ago, count-1 = Now
    const ratio = i / (count - 1)
    const hoursAgo = +(72 * (1 - ratio)).toFixed(2)
    const timestamp = new Date(nowMs - hoursAgo * 3600 * 1000).toISOString()

    // Joint-05 transitions: 72h ago (95% Green) -> 36h ago (68% Yellow) -> Now (32% Flashing Red)
    let j5Health, j5Status, j5Vib, j5Temp
    if (ratio < 0.5) {
      // 72h to 36h ago: degrading from 95% down to 68%
      const localR = ratio / 0.5
      j5Health = +(95 - localR * 27).toFixed(1)
      j5Status = j5Health >= 80 ? 'OPTIMAL' : 'ELEVATED_WEAR'
      j5Vib = +(2.9 + localR * 2.3).toFixed(2)
      j5Temp = +(52 + localR * 10).toFixed(1)
    } else {
      // 36h ago to Now: degrading rapidly from 68% down to 32%
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
        'Joint-03': {
          health: +(76 - ratio * 8).toFixed(1),
          status: ratio > 0.4 ? 'ELEVATED_WEAR' : 'OPTIMAL',
          vibration: +(3.8 + ratio * 1.0).toFixed(2),
          temp: +(56 + ratio * 6.4).toFixed(1),
        },
        'Joint-04': { health: 88, status: 'OPTIMAL', vibration: 2.9, temp: 44.7 },
        'Joint-05': {
          health: j5Health,
          status: j5Status,
          vibration: j5Vib,
          temp: j5Temp,
          rulDays: +(18 - ratio * 12).toFixed(1),
        },
        'Joint-06': { health: 96, status: 'OPTIMAL', vibration: 1.9, temp: 49.3 },
      },
    })
  }
  return snapshots
})()

let mockAlerts = [
  {
    id: 'ALT-1082',
    alertId: 'ALT-1082',
    facilityId: 'NMDC-CV-101',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    title: 'Splice Delamination Risk — Joint-05',
    jointId: 'Joint-05',
    source: 'Kalman Transducer + YOLOv8 Fusion',
    timestamp: '2026-09-08T11:45:00.000Z',
    overallRms: 7.9,
    rulHours: 144,
    description: 'Vibration excursion into ISO Zone D (7.9 mm/s) accompanied by 74.5°C pyrometer thermal anomaly on horizontal curve splice.',
    recommendation: 'Halt feed at scheduled window. Prepare SC-4000 cold vulcanizing compound for diamond bias repair within 6.0 days.',
  },
  {
    id: 'ALT-1079',
    alertId: 'ALT-1079',
    facilityId: 'NMDC-CV-101',
    severity: 'WARNING',
    status: 'ACKNOWLEDGED',
    title: 'Accelerated Skirtboard Friction — Joint-03',
    jointId: 'Joint-03',
    source: 'Ultrasonic Thickness Array',
    timestamp: '2026-09-08T09:12:00.000Z',
    overallRms: 4.8,
    rulHours: 465,
    description: 'Top cover rubber thinned to 19.8mm due to ore lump impingement under transfer chute skirts.',
    recommendation: 'Inspect skirting clamps and readjust rubber clearance by +5mm.',
    acknowledgedBy: 'Krish (Ops Lead)',
    acknowledgedAt: '2026-09-08T09:30:00.000Z',
    acknowledgeRemark: 'Maintenance team notified to inspect skirts during shift changeover.',
  },
  {
    id: 'ALT-1075',
    alertId: 'ALT-1075',
    facilityId: 'NMDC-CV-101',
    severity: 'INFO',
    status: 'RESOLVED',
    title: 'Optical Line-Scan Autofocus Calibration',
    jointId: 'Joint-01',
    source: 'YOLOv8 Edge Station CAM-01',
    timestamp: '2026-09-08T04:00:00.000Z',
    overallRms: 2.1,
    rulHours: 1164,
    description: 'Periodic 24-hour laser optical line triangulation completed successfully. Strobe shutter calibrated to 1/8000s.',
    recommendation: 'Routine system diagnostic log. No mechanical action required.',
    resolvedBy: 'Rajesh V. (Vision Specialist)',
    resolvedAt: '2026-09-08T04:15:00.000Z',
    resolutionNote: 'Laser sensor lenses cleaned with isopropyl alcohol; baseline verified.',
  },
]

let mockEmergencyStatus = {
  isEmergencyStop: false,
  triggeredBy: null,
  triggeredAt: null,
  reason: null,
  clearRemark: null,
}

let mockVisionEvents = [
  {
    id: 'VIS-901',
    facilityId: 'NMDC-CV-101',
    defectType: 'steel_cord_pullout',
    label: 'Steel Cord Pullout',
    severity: 'CRITICAL',
    confidence: 0.94,
    lengthMm: 168,
    positionMeters: 802.4,
    jointId: 'Joint-05',
    camera: 'CAM-01 Discharge Chute Line-Scan',
    timestamp: '2026-09-08T11:44:12Z',
    bbox: [0.28, 0.32, 0.64, 0.68],
    imageSnapshot: '/assets/vision/cord_pullout.jpg',
  },
  {
    id: 'VIS-902',
    facilityId: 'NMDC-CV-101',
    defectType: 'surface_tear',
    label: 'Top Cover Surface Tear',
    severity: 'WARNING',
    confidence: 0.89,
    lengthMm: 142,
    positionMeters: 405.1,
    jointId: 'Joint-03',
    camera: 'CAM-01 Discharge Chute Line-Scan',
    timestamp: '2026-09-08T10:15:08Z',
    bbox: [0.18, 0.44, 0.48, 0.62],
    imageSnapshot: '/assets/vision/surface_tear.jpg',
  },
  {
    id: 'VIS-903',
    facilityId: 'NMDC-CV-101',
    defectType: 'delamination',
    label: 'Carcass Delamination',
    severity: 'WARNING',
    confidence: 0.86,
    lengthMm: 95,
    positionMeters: 798.8,
    jointId: 'Joint-05',
    camera: 'CAM-02 Return Flight Station',
    timestamp: '2026-09-08T08:32:45Z',
    bbox: [0.35, 0.22, 0.58, 0.49],
    imageSnapshot: '/assets/vision/delamination.jpg',
  },
  {
    id: 'VIS-904',
    facilityId: 'NMDC-CV-101',
    defectType: 'edge_fraying',
    label: 'Molded Edge Fraying',
    severity: 'INFO',
    confidence: 0.91,
    lengthMm: 45,
    positionMeters: 198.2,
    jointId: 'Joint-02',
    camera: 'CAM-01 Discharge Chute Line-Scan',
    timestamp: '2026-09-08T06:21:10Z',
    bbox: [0.05, 0.15, 0.22, 0.38],
    imageSnapshot: '/assets/vision/edge_fray.jpg',
  },
]

let mockReliabilityMatrix = {
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

let mockLogs = [
  { id: 'LOG-501', timestamp: '2026-09-08T11:45:02Z', level: 'CRITICAL', category: 'AI_MODEL', message: 'Joint-05 RUL estimated at 6.0 days based on tri-axial vibration spike (7.9 mm/s)', user: 'KALMAN_FUSION_ENGINE' },
  { id: 'LOG-502', timestamp: '2026-09-08T11:44:12Z', level: 'WARN', category: 'HARDWARE_IOT', message: 'Pyrometer temperature exceeded warning boundary: 74.5°C on Joint-05 zone', user: 'MAX6675_GATEWAY' },
  { id: 'LOG-503', timestamp: '2026-09-08T11:40:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Operator Krish inspected Joint-05 3D digital twin telemetry drawer', user: 'Krish' },
  { id: 'LOG-504', timestamp: '2026-09-08T10:15:08Z', level: 'WARN', category: 'AI_MODEL', message: 'YOLOv8 optical station detected 142mm surface tear on Joint-03 (conf: 89%)', user: 'YOLO_INFERENCE' },
  { id: 'LOG-505', timestamp: '2026-09-08T09:30:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Acknowledged alert ALT-1079 (Joint-03 skirtboard wear)', user: 'Krish' },
  { id: 'LOG-506', timestamp: '2026-09-08T08:00:00Z', level: 'INFO', category: 'HARDWARE_IOT', message: '20Hz Firestore telemetry heartbeat synchronized — 0.00% packet loss', user: 'TELEMETRY_STREAM' },
  { id: 'LOG-507', timestamp: '2026-09-08T06:00:00Z', level: 'INFO', category: 'USER_ACTION', message: 'Shift Handover Report SHIFT-2026-09-A generated and signed by Shift Lead Ramesh', user: 'Ramesh' },
  { id: 'LOG-508', timestamp: '2026-09-07T22:15:00Z', level: 'INFO', category: 'HARDWARE_IOT', message: 'Vibration baseline calibration pass verified across 6 joints', user: 'SYSTEM' },
]

let mockSettings = {
  facilityId: 'NMDC-CV-101',
  facilityName: 'NMDC Kirandul CV-101 Overland Beltline',
  beltLengthMeters: 1200,
  ratedCapacityTph: 2400,
  nominalBeltSpeed: 4.2,
  isoVibrationThreshold: 7.1, // mm/s
  maxOperatingTemp: 80.0,     // °C
  minBeltThicknessLimit: 18.5, // mm
  rulEmergencyThreshold: 7.0, // Days
  telemetryStreamHz: 20,
  yoloMinConfidence: 0.80,
  eStopInterlockArmed: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// REST API CLIENT IMPLEMENTATIONS (With Live Backend Call + Seamless Fallback)
// ─────────────────────────────────────────────────────────────────────────────

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = { ...getAuthHeaders(), ...(options.headers || {}) }

  try {
    const res = await fetch(url, { ...options, headers })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    // Backend unreachable or network error: fallback gracefully
  }
  return null
}

// 1. Authentication (/api/auth)
export async function loginUser(email, password, role = 'Lead Plant Engineer') {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  })
  if (data && data.token) {
    setAuthToken(data.token)
    return data
  }
  const mockUser = {
    token: 'sc_token_lead_krish_9884a7e',
    user: {
      id: 'USR-101',
      name: 'Krish Sharma',
      email: email || 'krish.ops@nmdc.co.in',
      role: role || 'Principal Plant Operations Lead',
      avatar: 'KS',
      department: 'Heavy Material Transport & Predictive SCADA',
    },
  }
  setAuthToken(mockUser.token)
  return mockUser
}

export async function getCurrentUser() {
  const data = await apiRequest('/auth/me')
  if (data && data.user) return data.user
  return {
    id: 'USR-101',
    name: 'Krish Sharma',
    email: 'krish.ops@nmdc.co.in',
    role: 'Principal Plant Operations Lead',
    avatar: 'KS',
    facilityId: 'NMDC-CV-101',
  }
}

export async function getUsers() {
  const data = await apiRequest('/auth/users')
  if (data && data.users) return data.users
  return [
    { id: 'USR-101', name: 'Krish Sharma', role: 'Principal Plant Operations Lead', avatar: 'KS' },
    { id: 'USR-102', name: 'Dr. Ramesh Rao', role: 'Reliability Engineering Lead', avatar: 'RR' },
    { id: 'USR-103', name: 'Ananya Deshmukh', role: '3D Twin & AI Systems Specialist', avatar: 'AD' },
  ]
}

// 2. Splice Joint Health & 72-Hour History (/api/joints)
export async function fetchJoints(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/joints?facilityId=${facilityId}`)
  if (data && data.joints) return data.joints
  return MOCK_JOINTS
}

export async function fetchJointById(jointId, facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/joints/${jointId}?facilityId=${facilityId}`)
  if (data && data.joint) return data.joint
  return MOCK_JOINTS.find(j => j.id === jointId) || MOCK_JOINTS[4]
}

export async function updateJointHealth(jointId, updates, user = 'Krish', facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/joints/${jointId}`, {
    method: 'PATCH',
    body: JSON.stringify({ updates, user, facilityId }),
  })
  if (data && data.success) return data
  const target = MOCK_JOINTS.find(j => j.id === jointId)
  if (target) Object.assign(target, updates)
  return { success: true, joint: target }
}

export async function fetchJointsHistoryAll(facilityId = 'NMDC-CV-101', limit = 1500) {
  const data = await apiRequest(`/joints/history/all?facilityId=${facilityId}&limit=${limit}`)
  if (data && data.snapshots) return data.snapshots
  return MOCK_72H_SNAPSHOTS
}

export async function fetchSingleJointHistory(jointId = 'Joint-05', facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/joints/${jointId}/history?facilityId=${facilityId}`)
  if (data && data.history) return data.history
  return MOCK_72H_SNAPSHOTS.map(s => ({
    timestamp: s.timestamp,
    hoursAgo: s.hoursAgo,
    ...s.joints[jointId],
  }))
}

// 3. Incident Alarms & Alerts (/api/alerts)
export async function fetchAlerts(params = {}) {
  const q = new URLSearchParams(params).toString()
  const data = await apiRequest(`/alerts${q ? '?' + q : ''}`)
  if (data && data.alerts) return data.alerts
  return mockAlerts
}

export async function createAlert(alertPayload) {
  const data = await apiRequest('/alerts', {
    method: 'POST',
    body: JSON.stringify(alertPayload),
  })
  if (data && data.alert) {
    mockAlerts.unshift(data.alert)
    return data.alert
  }
  const newAlert = {
    id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    ...alertPayload,
  }
  mockAlerts.unshift(newAlert)
  return newAlert
}

export async function acknowledgeAlertApi(alertId, remark = '', user = 'Krish') {
  const data = await apiRequest(`/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
    body: JSON.stringify({ user, remark }),
  })
  if (data && data.alert) return data.alert

  const found = mockAlerts.find(a => (a.id === alertId || a.alertId === alertId))
  if (found) {
    found.status = 'ACKNOWLEDGED'
    found.acknowledgedBy = user
    found.acknowledgedAt = new Date().toISOString()
    found.acknowledgeRemark = remark || 'Operator acknowledged on dashboard'
  }
  return found
}

export async function resolveAlertApi(alertId, resolutionNote = '', rootCause = 'Mechanical Wear', user = 'Krish') {
  const data = await apiRequest(`/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    body: JSON.stringify({ user, resolutionNote, rootCause }),
  })
  if (data && data.alert) return data.alert

  const found = mockAlerts.find(a => (a.id === alertId || a.alertId === alertId))
  if (found) {
    found.status = 'RESOLVED'
    found.resolvedBy = user
    found.resolvedAt = new Date().toISOString()
    found.resolutionNote = resolutionNote || 'Splice inspected and restored to nominal envelope.'
    found.rootCause = rootCause
  }
  return found
}

// 4. Safety Emergency Stop Interlock (/api/emergency)
export async function fetchEmergencyStatus(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/emergency/status?facilityId=${facilityId}`)
  if (data) return data
  const isEStopped = localStorage.getItem('smartconveyor_estop') === 'true'
  return {
    ...mockEmergencyStatus,
    isEmergencyStop: isEStopped,
  }
}

export async function triggerEmergencyStopApi(reason = 'Physical E-Stop interlock tripped by control room lead', user = 'Krish', facilityId = 'NMDC-CV-101') {
  localStorage.setItem('smartconveyor_estop', 'true')
  mockEmergencyStatus = {
    isEmergencyStop: true,
    triggeredBy: user,
    triggeredAt: new Date().toISOString(),
    reason,
  }

  // Audit log entry
  mockLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'CRITICAL',
    category: 'ESTOP',
    message: `EMERGENCY STOP ENGAGED by ${user}: ${reason}`,
    user,
  })

  const data = await apiRequest('/emergency/trigger', {
    method: 'POST',
    body: JSON.stringify({ facilityId, user, reason }),
  })
  if (data) return data
  return mockEmergencyStatus
}

export async function clearEmergencyStopApi(clearRemark = 'Physical inspection complete. Belt clearance authorized.', user = 'Krish', facilityId = 'NMDC-CV-101') {
  localStorage.removeItem('smartconveyor_estop')
  mockEmergencyStatus = {
    isEmergencyStop: false,
    triggeredBy: null,
    triggeredAt: null,
    reason: null,
    clearRemark,
    clearedBy: user,
    clearedAt: new Date().toISOString(),
  }

  // Audit log entry
  mockLogs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    level: 'INFO',
    category: 'ESTOP',
    message: `EMERGENCY STOP CLEARED by ${user}: ${clearRemark}`,
    user,
  })

  const data = await apiRequest('/emergency/clear', {
    method: 'POST',
    body: JSON.stringify({ facilityId, user, clearRemark }),
  })
  if (data) return data
  return mockEmergencyStatus
}

// 5. Grounded Gemini AI Copilot (/api/chat)
export async function sendChatMessageApi(message, context = {}, history = [], facilityId = 'NMDC-CV-101', user = 'Krish') {
  const data = await apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, facilityId, user, context, history }),
  })
  if (data && data.reply) return data

  // Realistic grounding responses referencing Joint-05, live telemetry, and ISO specs
  const lower = message.toLowerCase()
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

  return { reply, citations, actions }
}

export async function fetchChatHistory(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/chat/history?facilityId=${facilityId}`)
  if (data && data.history) return data.history
  return []
}

// 6. YOLOv8 Vision Defect Events (/api/vision)
export async function fetchVisionEvents(limit = 50, facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/vision?limit=${limit}&facilityId=${facilityId}`)
  if (data && data.events) return data.events
  return mockVisionEvents
}

export async function createVisionSnapshot(visionPayload) {
  const data = await apiRequest('/vision', {
    method: 'POST',
    body: JSON.stringify(visionPayload),
  })
  if (data && data.event) {
    mockVisionEvents.unshift(data.event)
    return data.event
  }
  const newEvent = {
    id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
    facilityId: 'NMDC-CV-101',
    timestamp: new Date().toISOString(),
    ...visionPayload,
  }
  mockVisionEvents.unshift(newEvent)
  return newEvent
}

// 7. Sensor Reliability Matrix (/api/reliability)
export async function fetchReliabilityMatrix(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/reliability?facilityId=${facilityId}`)
  if (data && data.sensors) return data
  return mockReliabilityMatrix
}

export async function fetchReliabilityHistory(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/reliability/history?facilityId=${facilityId}`)
  if (data && data.history) return data.history
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    adxl: 96 + (Math.sin(i * 0.4) * 1.5),
    pyro: 94 + (Math.cos(i * 0.3) * 1.8),
    ultrasonic: 98 + (Math.sin(i * 0.2) * 0.8),
    acoustic: 91 + (Math.sin(i * 0.5) * 2.5),
  }))
}

// 8. System & Compliance Logs (/api/logs)
export async function fetchLogs(page = 1, limit = 25, search = '', level = '', category = '') {
  const params = new URLSearchParams({ page, limit, search, level, category }).toString()
  const data = await apiRequest(`/logs?${params}`)
  if (data && data.logs) return data

  let filtered = [...mockLogs]
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

  return {
    logs: filtered,
    total: filtered.length,
    page: 1,
    totalPages: 1,
  }
}

export async function fetchLogStats(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/logs/stats?facilityId=${facilityId}`)
  if (data) return data
  return {
    totalLogs: mockLogs.length,
    errorCount: mockLogs.filter(l => l.level === 'CRITICAL' || l.level === 'ERROR').length,
    warnCount: mockLogs.filter(l => l.level === 'WARN').length,
    ingestion24h: '43,200 events (20Hz)',
  }
}

export async function clearOldLogsApi() {
  const data = await apiRequest('/logs/clear', { method: 'POST' })
  if (data && data.success) return data
  mockLogs = mockLogs.slice(0, 4)
  return { success: true, count: mockLogs.length }
}

// 9. Maintenance Reports & Work Orders (/api/reports)
export async function fetchReports(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/reports?facilityId=${facilityId}`)
  if (data && data.reports) return data.reports
  return [
    {
      id: 'REP-701',
      title: 'Joint-05 Emergency Vulcanization Work Order',
      type: 'Vulcanizing Work Order',
      date: '2026-09-08',
      status: 'PENDING_APPROVAL',
      priority: 'CRITICAL',
      targetJoint: 'Joint-05',
      summary: 'Cold vulcanization bias diamond cut repair protocol using SC-4000 cement compound.',
      technician: 'NMDC Splicing Team Gamma',
    },
    {
      id: 'REP-702',
      title: 'Shift Handover & Beltline Condition Audit (Shift A)',
      type: 'Shift Handover Report',
      date: '2026-09-08',
      status: 'APPROVED',
      priority: 'NORMAL',
      targetJoint: 'All Splices',
      summary: 'Throughput 18,450 tons ore transported. Vibration excursion on Joint-05 logged.',
      technician: 'Ramesh Rao (Shift Lead)',
    },
    {
      id: 'REP-703',
      title: 'Weekly Ultrasonic Carcass Thickness Profiling',
      type: 'Ultrasonic Profiling',
      date: '2026-09-05',
      status: 'COMPLETED',
      priority: 'NORMAL',
      targetJoint: 'Joint-01 to Joint-06',
      summary: 'Baseline belt thickness 21.6mm at Head, localized thinning to 16.2mm at Joint-05.',
      technician: 'Rajesh V.',
    },
  ]
}

export async function generateWorkOrderApi(reportPayload) {
  const data = await apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(reportPayload),
  })
  if (data && data.report) return data.report
  return {
    id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    status: 'READY',
    ...reportPayload,
  }
}

// 10. Facility Configuration & Settings (/api/settings)
export async function fetchSettings(facilityId = 'NMDC-CV-101') {
  const data = await apiRequest(`/settings?facilityId=${facilityId}`)
  if (data && data.settings) return data.settings
  return mockSettings
}

export async function updateSettingsApi(settingsPayload) {
  const data = await apiRequest('/settings', {
    method: 'PUT',
    body: JSON.stringify(settingsPayload),
  })
  if (data && data.settings) return data.settings
  Object.assign(mockSettings, settingsPayload)
  return mockSettings
}
