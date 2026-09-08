import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toggleSidebar, setSidebarMobile } from '../../store/slices/uiSlice'
import {
  LayoutDashboard,
  Layers,
  Camera,
  Activity,
  Bell,
  FileText,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/dashboard',         label: 'Dashboard',             icon: LayoutDashboard },
  { to: '/digital-twin',      label: '3D Digital Twin',       icon: Layers, badge: '72H' },
  { to: '/vision',            label: 'Vision Inspection',     icon: Camera },
  { to: '/sensor-health',     label: 'Sensor Reliability',    icon: Activity },
  { to: '/alerts',            label: 'Incident Alerts',       icon: Bell, badgeKey: 'alerts' },
  { to: '/reports',           label: 'Maintenance Reports',   icon: FileText },
  { to: '/logs',              label: 'System Logs',           icon: ScrollText },
  { to: '/settings',          label: 'Facility Settings',     icon: Settings },
]

export function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarCollapsed, sidebarMobileOpen } = useSelector(s => s.ui)
  const { connectionStatus, emergencyStopped, facilityId } = useSelector(s => s.telemetry)
  const activeAlertsCount = useSelector(s =>
    s.alerts?.list ? s.alerts.list.filter(a => a.status === 'ACTIVE').length : 0
  )
  const { pathname } = useLocation()

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebarMobile(false))}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-[#090d16] border-r border-slate-800/90 flex flex-col transition-all duration-200 select-none ${
          sidebarCollapsed ? 'w-16' : 'w-[250px]'
        } lg:relative lg:flex shrink-0 ${
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* ── Brand / Header ────────────────────────────────────────── */}
        <div
          className={`flex items-center gap-3 px-4 h-14 border-b border-slate-800 shrink-0 ${
            sidebarCollapsed && 'justify-center px-0'
          }`}
        >
          {/* Animated Conveyor Mark */}
          <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center relative group shadow-md">
            <svg
              className="w-4 h-4 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="12" r="3" />
              <path d="M6 9h12" />
              <path d="M6 15h12" />
              <path d="M12 9v6" strokeDasharray="2 2" />
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </div>

          {!sidebarCollapsed && (
            <div className="min-w-0 flex flex-col">
              <span className="text-xs font-bold tracking-wider text-white font-mono leading-tight">
                SMARTCONVEYOR
              </span>
              <span className="text-[9px] font-semibold text-cyan-400 tracking-widest uppercase leading-tight mt-0.5 font-mono">
                3D DIGITAL TWIN
              </span>
            </div>
          )}
        </div>

        {/* ── Navigation Links ──────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1" aria-label="Main Navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badge, badgeKey }) => {
            const isActive = pathname === to || (to === '/dashboard' && pathname === '/') || (to === '/vision' && pathname === '/vision-monitoring')
            const alertCount = badgeKey === 'alerts' ? activeAlertsCount : 0

            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => dispatch(setSidebarMobile(false))}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />

                {!sidebarCollapsed && (
                  <span className="truncate flex-1 tracking-wider uppercase text-[11px]">
                    {label}
                  </span>
                )}

                {!sidebarCollapsed && badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {badge}
                  </span>
                )}

                {!sidebarCollapsed && alertCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600 text-white animate-pulse">
                    {alertCount}
                  </span>
                )}

                {sidebarCollapsed && alertCount > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ── Active Conveyor Loop Footnote ─────────────────────────── */}
        {!sidebarCollapsed && (
          <div className="p-3 mx-2 mb-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>LOOP LENGTH:</span>
              <span className="text-white font-bold">1,200m</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>JOINTS COUNT:</span>
              <span className="text-cyan-400 font-bold">6 SPLICES</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>CRITICAL DEFECT:</span>
              <span className="text-red-400 font-bold">JOINT-05</span>
            </div>
          </div>
        )}

        {/* ── Sidebar Collapse Footer ───────────────────────────────── */}
        <div className="p-2 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex items-center justify-center w-full py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors text-xs font-mono"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <div className="flex items-center gap-2"><ChevronLeft size={14} /><span>COLLAPSE</span></div>}
          </button>
        </div>
      </aside>
    </>
  )
}
