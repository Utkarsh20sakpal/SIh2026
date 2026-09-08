import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleAI, setSidebarMobile } from '../../store/slices/uiSlice'
import { setFacility, setEmergencyStop } from '../../store/slices/telemetrySlice'
import { triggerEmergencyStopApi, FACILITIES } from '../../lib/api'
import {
  Menu,
  Bell,
  Sparkles,
  AlertOctagon,
  ChevronDown,
  Building2,
  Radio,
  User,
  ShieldAlert,
  LogOut,
  Sliders,
} from 'lucide-react'

const ROUTE_META = {
  '/':                  { title: 'Live Dashboard',            breadcrumb: 'SCADA Condition Overview' },
  '/dashboard':         { title: 'Live Dashboard',            breadcrumb: 'SCADA Condition Overview' },
  '/digital-twin':      { title: '3D Digital Twin',           breadcrumb: '1,200m Procedural Beltline & 72h Scrubber' },
  '/vision':            { title: 'YOLOv8 Vision Inspection',  breadcrumb: 'Discharge Chute Optical Line-Scan Station' },
  '/vision-monitoring': { title: 'YOLOv8 Vision Inspection',  breadcrumb: 'Discharge Chute Optical Line-Scan Station' },
  '/sensor-health':     { title: 'Sensor Reliability',        breadcrumb: 'Kalman Filter Diagnostics & Transducers' },
  '/alerts':            { title: 'Incident Alerts',           breadcrumb: 'Industrial Alarm Triage & Resolution' },
  '/reports':           { title: 'Maintenance Reports',       breadcrumb: 'Shift Handover & Joint-05 Splicing Guide' },
  '/logs':              { title: 'Compliance & Audit Logs',   breadcrumb: '20Hz Telemetry & Operation Logs' },
  '/settings':          { title: 'Facility Configuration',    breadcrumb: 'ISO Thresholds & E-Stop Interlock' },
}

export function Topbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const { facilityId, facilityName, connectionStatus, emergencyStopped } = useSelector(s => s.telemetry)
  const { aiOpen } = useSelector(s => s.ui)
  const activeAlerts = useSelector(s =>
    s.alerts?.list ? s.alerts.list.filter(a => a.status === 'ACTIVE') : []
  )
  const criticalCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length

  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [eStopConfirmOpen, setEStopConfirmOpen] = useState(false)

  const meta = ROUTE_META[pathname] ?? { title: 'SmartConveyor', breadcrumb: 'Industrial Operations' }

  const handleFacilityChange = (fac) => {
    dispatch(setFacility({ id: fac.id, name: fac.name }))
    setFacilityDropdownOpen(false)
  }

  const handleEmergencyStop = async () => {
    await triggerEmergencyStopApi('Physical E-Stop interlock tripped from Topbar quick action', 'Krish Sharma', facilityId)
    dispatch(setEmergencyStop(true))
    setEStopConfirmOpen(false)
  }

  return (
    <>
      <header className="h-14 shrink-0 bg-[#090d16] border-b border-slate-800 flex items-center justify-between px-4 z-30 select-none">
        {/* ── Left: Mobile Sidebar Toggle + Page Title ──────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => dispatch(setSidebarMobile(true))}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded"
            aria-label="Open navigation sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-baseline gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white font-mono truncate">
              {meta.title}
            </h1>
            {meta.breadcrumb && (
              <>
                <span className="text-slate-700 text-xs hidden sm:inline">/</span>
                <span className="text-[11px] text-slate-400 truncate hidden md:inline font-sans">
                  {meta.breadcrumb}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Right: Facility Switcher, 20Hz Heartbeat, Alerts, E-Stop, AI, User ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Facility Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setFacilityDropdownOpen(!facilityDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-200 transition-colors"
            >
              <Building2 size={13} className="text-cyan-400" />
              <span className="hidden sm:inline font-semibold">{facilityName}</span>
              <span className="sm:hidden font-semibold">{facilityId}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {facilityDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Overland Conveyor Loop
                </div>
                {FACILITIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => handleFacilityChange(f)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center justify-between hover:bg-slate-800/70 transition-colors ${
                      facilityId === f.id ? 'text-cyan-400 bg-cyan-950/30' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{f.name}</div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {f.length}m • {f.capacity} t/h • {f.ore}
                      </div>
                    </div>
                    {facilityId === f.id && <span className="text-[10px] font-bold">ACTIVE</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live 20Hz Heartbeat Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-bold tracking-wider text-emerald-400 uppercase">
              LIVE 20Hz - OK
            </span>
          </div>

          {/* Quick Emergency E-Stop Button */}
          <button
            onClick={() => setEStopConfirmOpen(true)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all uppercase tracking-wider border shadow-md active:scale-95 ${
              emergencyStopped
                ? 'bg-red-600 text-white border-red-400 animate-pulse'
                : 'bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 border-red-800/80'
            }`}
            title="Emergency Conveyor Lockdown"
          >
            <AlertOctagon size={14} className={emergencyStopped ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">E-STOP</span>
          </button>

          {/* Active Alerts Bell with Counter Badge */}
          <button
            onClick={() => navigate('/alerts')}
            className="relative p-2 rounded text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
            aria-label="Active alarms"
            title={`${activeAlerts.length} Active Alarms (${criticalCount} Critical)`}
          >
            <Bell size={16} />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-red-600 text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#090d16] animate-pulse">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Grounded AI Copilot Trigger */}
          <button
            onClick={() => dispatch(toggleAI())}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
              aiOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                : 'bg-slate-900 text-cyan-400 border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <Sparkles size={13} className={aiOpen ? 'text-slate-950' : 'text-cyan-400'} />
            <span className="hidden md:inline text-[11px] tracking-wider">COPILOT</span>
          </button>

          {/* User Avatar & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded bg-gradient-to-tr from-cyan-600 to-sky-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center shadow-md">
                KS
              </div>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-[#0f172a] border border-slate-700 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-slate-800">
                  <div className="text-xs font-mono font-bold text-white">Krish Sharma</div>
                  <div className="text-[10px] text-cyan-400 font-mono">Principal Plant Operations Lead</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">NMDC Kirandul Mining Complex</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { navigate('/settings'); setUserDropdownOpen(false) }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 font-mono"
                  >
                    <Sliders size={13} /> Facility Setpoints
                  </button>
                  <button
                    onClick={() => { navigate('/logs'); setUserDropdownOpen(false) }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 font-mono"
                  >
                    <User size={13} /> Operator Audit Trail
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Confirmation Modal for E-Stop */}
      {eStopConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border-2 border-red-600 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertOctagon size={28} className="animate-pulse" />
              <h3 className="text-sm font-mono font-black uppercase tracking-widest text-white">
                Emergency Stop Confirmation
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Are you sure you want to trigger an immediate site-wide emergency lockdown for <b className="text-white">{facilityName}</b>?
              This will drop belt speed to 0 m/s and trip drive motor breakers.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEStopConfirmOpen(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded shadow-lg uppercase tracking-wider"
              >
                TRIGGER EMERGENCY HALT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
