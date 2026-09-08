import { createSlice } from '@reduxjs/toolkit'

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    general: { appName:'SmartConveyor Shield', timezone:'Asia/Kolkata', language:'en-IN', dateFormat:'DD MMM YYYY' },
    conveyor: { id:'CONVEYOR C-01', model:'NMDC 1200m ST-5400', maxSpeed:3.5, minSpeed:0.5, operatingSpeed:2.4,
                beltWidth:1600, troughAngle:35, splicedJoints:6, maxLoad:100 },
    sensors: {
      tempWarning:30, tempCritical:45,
      vibWarning:4.0, vibCritical:6.0,
      currWarning:0.038, currCritical:0.045,
      scanInterval:30, rollingWindow:20, retrainInterval:20,
    },
    notifications: { criticalAlerts:true, warningAlerts:true, sensorOffline:true, rulBelow24h:true, reportReady:true },
    system: {
      version:'1.0.0-beta',
      buildDate:'08 Sep 2026',
      firestoreStatus:'CONNECTED',
      mongoStatus:'CONNECTED',
      pineconeStatus:'CONNECTED',
      yoloVersion:'YOLOv8n-belt-v2.1.3',
      isolationForestVersion:'IF-v1.4.0',
      langchainVersion:'0.1.x',
    },
  },
  reducers: {
    updateGeneral:   (s, a) => { s.general = { ...s.general, ...a.payload } },
    updateConveyor:  (s, a) => { s.conveyor = { ...s.conveyor, ...a.payload } },
    updateSensors:   (s, a) => { s.sensors = { ...s.sensors, ...a.payload } },
    updateNotifs:    (s, a) => { s.notifications = { ...s.notifications, ...a.payload } },
  },
})

export const { updateGeneral, updateConveyor, updateSensors, updateNotifs } = settingsSlice.actions
export default settingsSlice.reducer
