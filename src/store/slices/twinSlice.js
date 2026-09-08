import { createSlice } from '@reduxjs/toolkit'
import { MOCK_JOINTS, MOCK_72H_SNAPSHOTS } from '../../lib/api'

export const twinSlice = createSlice({
  name: 'twin',
  initialState: {
    joints: MOCK_JOINTS,
    snapshots: MOCK_72H_SNAPSHOTS,
    currentSnapshotIndex: MOCK_72H_SNAPSHOTS.length - 1,
    selectedJointId: 'Joint-05',
    detailsSheetOpen: false,
    camera: 'ORBIT',
    beltSpeed: 4.2,
    showParticles: true,
    showLaserSheets: true,
    playback: {
      mode: 'LIVE', // 'LIVE' | 'HISTORICAL'
      hAgo: 0,      // 0 to 72
      playing: false,
      rate: 1,      // 1, 5, 20
    },
  },
  reducers: {
    selectJoint: (s, a) => {
      s.selectedJointId = a.payload
      s.detailsSheetOpen = !!a.payload
    },
    setDetailsSheet: (s, a) => {
      s.detailsSheetOpen = a.payload
    },
    setCamera: (s, a) => {
      s.camera = a.payload
    },
    setBeltSpeed: (s, a) => {
      s.beltSpeed = a.payload
    },
    toggleParticles: s => {
      s.showParticles = !s.showParticles
    },
    toggleLasers: s => {
      s.showLaserSheets = !s.showLaserSheets
    },
    setPlaybackMode: (s, a) => {
      s.playback.mode = a.payload
      if (a.payload === 'LIVE') {
        s.playback.hAgo = 0
        s.playback.playing = false
        s.joints = MOCK_JOINTS
        s.currentSnapshotIndex = s.snapshots.length - 1
      }
    },
    setPlaybackHAgo: (s, a) => {
      const hAgo = Math.max(0, Math.min(72, a.payload))
      s.playback.hAgo = hAgo
      s.playback.mode = hAgo === 0 ? 'LIVE' : 'HISTORICAL'

      // Map hAgo (0 to 72) to snapshot index (869 to 0)
      const ratio = 1 - (hAgo / 72)
      const idx = Math.max(0, Math.min(s.snapshots.length - 1, Math.round(ratio * (s.snapshots.length - 1))))
      s.currentSnapshotIndex = idx
      const frame = s.snapshots[idx]

      if (frame) {
        s.joints = s.joints.map(j => {
          const snapJoint = frame.joints[j.id]
          if (!snapJoint) return j
          return {
            ...j,
            health: snapJoint.health,
            status: snapJoint.status,
            vibrationRms: snapJoint.vibration || j.vibrationRms,
            pyrometerTemp: snapJoint.temp || j.pyrometerTemp,
            rulDays: snapJoint.rulDays ? snapJoint.rulDays : j.rulDays,
          }
        })
      }
    },
    setPlaybackPlaying: (s, a) => {
      s.playback.playing = a.payload
      if (a.payload && s.playback.mode === 'LIVE') {
        s.playback.mode = 'HISTORICAL'
      }
    },
    setPlaybackRate: (s, a) => {
      s.playback.rate = a.payload
    },
    snapToLive: s => {
      s.playback.mode = 'LIVE'
      s.playback.hAgo = 0
      s.playback.playing = false
      s.joints = MOCK_JOINTS
      s.currentSnapshotIndex = s.snapshots.length - 1
    },
    updateLiveJointTelemetry: (s, a) => {
      if (s.playback.mode === 'LIVE') {
        const live = a.payload
        const j5 = s.joints.find(j => j.id === 'Joint-05')
        if (j5 && live.triaxialVibration) {
          j5.vibrationRms = live.triaxialVibration.overallRms
          j5.pyrometerTemp = live.pyrometerTemp
          j5.beltThickness = live.beltThickness
          j5.acousticEmission = live.acousticEmission
        }
      }
    },
  },
})

export const {
  selectJoint,
  setDetailsSheet,
  setCamera,
  setBeltSpeed,
  toggleParticles,
  toggleLasers,
  setPlaybackMode,
  setPlaybackHAgo,
  setPlaybackPlaying,
  setPlaybackRate,
  snapToLive,
  updateLiveJointTelemetry,
} = twinSlice.actions

export default twinSlice.reducer
