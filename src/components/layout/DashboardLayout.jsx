import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { EmergencyStopBanner } from './EmergencyStopBanner'
import { FloatingAICopilot } from './FloatingAICopilot'
import { telemetryStream } from '../../lib/telemetryStream'
import { updateLiveTelemetry } from '../../store/slices/telemetrySlice'
import { updateLiveJointTelemetry } from '../../store/slices/twinSlice'

export function DashboardLayout() {
  const dispatch = useDispatch()
  const facilityId = useSelector(s => s.telemetry.facilityId)

  useEffect(() => {
    telemetryStream.setFacility(facilityId)
    const unsubscribe = telemetryStream.subscribe((payload) => {
      dispatch(updateLiveTelemetry(payload))
      dispatch(updateLiveJointTelemetry(payload))
    })

    return () => {
      unsubscribe()
    }
  }, [dispatch, facilityId])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <EmergencyStopBanner />
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 bg-gradient-to-b from-[#090d16] to-[#0d131f]">
          <Outlet />
        </main>
      </div>
      <FloatingAICopilot />
    </div>
  )
}
