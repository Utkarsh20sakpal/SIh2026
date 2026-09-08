import { createSlice } from '@reduxjs/toolkit'

const initAlerts = [
  { id:'ALT-001', time:'10:39:05', title:'Elevated Vibration — Bearing B-02', source:'Sensor VIB-BH-02', severity:'CRITICAL', status:'ACTIVE',       description:'Vibration on bearing housing B-02 exceeded 4.5 mm/s threshold. Possible misalignment or fatigue developing.', relatedJoint:'J-04' },
  { id:'ALT-002', time:'10:33:21', title:'Belt Surface Wear Detected — Zone 4', source:'YOLOv8 Vision',   severity:'WARNING',  status:'ACTIVE',       description:'YOLOv8 model detected belt surface wear class in Zone 4 (confidence 88.3%). Monitor progression.', relatedJoint:'J-04' },
  { id:'ALT-003', time:'10:18:44', title:'Gearbox Temperature Rising',          source:'Sensor TEMP-GB-02',severity:'WARNING',  status:'ACTIVE',       description:'Gearbox sump temperature trending upward at +0.4 °C per 15 min. Check lubrication level.', relatedJoint:null },
  { id:'ALT-004', time:'09:51:00', title:'Isolation Forest Anomaly — Cycle 14', source:'Isolation Forest', severity:'WARNING',  status:'ACKNOWLEDGED', description:'Sensor anomaly cluster detected in 10-minute window. Pattern consistent with early belt splice tension shift.', relatedJoint:'J-02' },
  { id:'ALT-005', time:'08:22:10', title:'Routine Vibration Spike — Startup',   source:'Sensor VIB-TRX-01',severity:'NORMAL',   status:'RESOLVED',     description:'Transient vibration spike on belt startup. Values returned to nominal within 45 seconds.', relatedJoint:null },
  { id:'ALT-006', time:'07:04:45', title:'Belt Alignment Offset Detected',       source:'Optical Gantry',  severity:'WARNING',  status:'RESOLVED',     description:'Optical line-scan detected minor belt tracking offset (12 mm). Corrected by auto-alignment system.', relatedJoint:null },
]

export const alertsSlice = createSlice({
  name: 'alerts',
  initialState: {
    list: initAlerts,
    stats: { total:6, critical:1, warning:3, acknowledged:1, resolved:2 },
    filter: { severity:'ALL', status:'ALL', search:'' },
  },
  reducers: {
    acknowledgeAlert: (s, a) => {
      const al = s.list.find(a2 => a2.id === a.payload)
      if (al && al.status === 'ACTIVE') {
        al.status = 'ACKNOWLEDGED'
        s.stats.acknowledged++
        if (al.severity === 'CRITICAL') s.stats.critical--
        else if (al.severity === 'WARNING') s.stats.warning--
      }
    },
    resolveAlert: (s, a) => {
      const al = s.list.find(a2 => a2.id === a.payload)
      if (al) { al.status = 'RESOLVED'; s.stats.resolved++ }
    },
    setFilter: (s, a) => { s.filter = { ...s.filter, ...a.payload } },
    pushAlert: (s, a) => { s.list.unshift({ id:`ALT-${Date.now()}`, ...a.payload }); s.stats.total++ },
  },
})

export const { acknowledgeAlert, resolveAlert, setFilter, pushAlert } = alertsSlice.actions
export default alertsSlice.reducer
