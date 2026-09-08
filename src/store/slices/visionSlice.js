import { createSlice } from '@reduxjs/toolkit'

const DETECTIONS = [
  { id:'DET-001', time:'10:38:44', detection:'Belt Surface Wear',        location:'Zone 4 / J-04 ±0.3m', confidence:88.3, severity:'WARNING',  status:'ACTIVE',  bbox:[0.42,0.38,0.58,0.62], cls:'belt_surface_wear' },
  { id:'DET-002', time:'10:26:18', detection:'Edge Fraying',             location:'Zone 3 / J-03 −0.8m', confidence:72.1, severity:'WARNING',  status:'ACTIVE',  bbox:[0.10,0.30,0.22,0.70], cls:'edge_fraying' },
  { id:'DET-003', time:'10:09:52', detection:'Splice Delamination',      location:'Zone 4 / J-04 +0.1m', confidence:94.0, severity:'CRITICAL', status:'ACTIVE',  bbox:[0.33,0.20,0.67,0.80], cls:'splice_delamination' },
  { id:'DET-004', time:'09:55:10', detection:'Seam Bar Micro-Crack',     location:'Zone 5 / J-05 0.0m',  confidence:81.6, severity:'WARNING',  status:'ACTIVE',  bbox:[0.44,0.42,0.56,0.58], cls:'seam_crack' },
  { id:'DET-005', time:'09:22:00', detection:'No Defect',                location:'Zone 1 / J-01 0.0m',  confidence:99.1, severity:'NORMAL',   status:'RESOLVED',bbox:[],                    cls:'no_defect' },
  { id:'DET-006', time:'08:44:33', detection:'Belt Misalignment (Minor)',  location:'Zone 2 — General',   confidence:78.4, severity:'WARNING',  status:'RESOLVED',bbox:[],                    cls:'misalignment' },
]

export const visionSlice = createSlice({
  name: 'vision',
  initialState: {
    selectedId: 'DET-003',
    detections: DETECTIONS,
    cameraStatus: 'ONLINE',
    modelVersion: 'YOLOv8n-belt-v2.1.3',
    // PLACEHOLDER: Real-time YOLOv8 output will be ingested here once model endpoint is wired
    liveMode: false,
    lastFrame: '10:38:44',
  },
  reducers: {
    selectDetection: (s, a) => { s.selectedId = a.payload },
    setLiveMode: (s, a) => { s.liveMode = a.payload },
    pushDetection: (s, a) => { s.detections.unshift({ id:`DET-${Date.now()}`, ...a.payload }) },
  },
})

export const { selectDetection, setLiveMode, pushDetection } = visionSlice.actions
export default visionSlice.reducer
