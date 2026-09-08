import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'

const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const DigitalTwinPage    = lazy(() => import('./pages/DigitalTwinPage'))
const VisionPage         = lazy(() => import('./pages/VisionPage'))
const SensorHealthPage   = lazy(() => import('./pages/SensorHealthPage'))
const AlertsPage         = lazy(() => import('./pages/AlertsPage'))
const ReportsPage        = lazy(() => import('./pages/ReportsPage'))
const LogsPage           = lazy(() => import('./pages/LogsPage'))
const SettingsPage       = lazy(() => import('./pages/SettingsPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-slate-400 text-xs font-mono uppercase tracking-wider">
        Loading SmartConveyor Telemetry Module…
      </span>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard"         element={<DashboardPage />} />
          <Route path="/digital-twin"      element={<DigitalTwinPage />} />
          <Route path="/vision"            element={<VisionPage />} />
          <Route path="/vision-monitoring" element={<VisionPage />} />
          <Route path="/sensor-health"     element={<SensorHealthPage />} />
          <Route path="/alerts"            element={<AlertsPage />} />
          <Route path="/reports"           element={<ReportsPage />} />
          <Route path="/logs"              element={<LogsPage />} />
          <Route path="/settings"          element={<SettingsPage />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
