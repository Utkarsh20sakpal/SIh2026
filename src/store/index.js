import { configureStore } from '@reduxjs/toolkit'
import uiReducer         from './slices/uiSlice'
import telemetryReducer  from './slices/telemetrySlice'
import alertsReducer     from './slices/alertsSlice'
import visionReducer     from './slices/visionSlice'
import twinReducer       from './slices/twinSlice'
import reportsReducer    from './slices/reportsSlice'
import settingsReducer   from './slices/settingsSlice'

export const store = configureStore({
  reducer: {
    ui:        uiReducer,
    telemetry: telemetryReducer,
    alerts:    alertsReducer,
    vision:    visionReducer,
    twin:      twinReducer,
    reports:   reportsReducer,
    settings:  settingsReducer,
  },
})
