import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { fetchLogs, fetchLogStats, clearOldLogsApi } from '../lib/api'
import {
  ScrollText,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Terminal,
  RefreshCw,
  X,
} from 'lucide-react'

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ totalLogs: 0, errorCount: 0, warnCount: 0, ingestion24h: '43,200 events' })
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const { facilityName } = useSelector(s => s.telemetry)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchLogs(1, 100, search, level, category)
      const st = await fetchLogStats()
      setLogs(data.logs || [])
      setStats(st)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [search, level, category])

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `smartconveyor_audit_logs_${new Date().toISOString().split('T')[0]}.json`)
    dlAnchor.click()
  }

  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Level', 'Category', 'Message', 'User']
    const rows = logs.map(l => [
      l.id,
      l.timestamp,
      l.level,
      l.category,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.user || 'SYSTEM',
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `smartconveyor_audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
    link.click()
  }

  const handleClearLogs = async () => {
    await clearOldLogsApi()
    setClearDialogOpen(false)
    loadData()
  }

  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
              System Audit & Compliance Telemetry Logs
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              DGMS & OSHA COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable time-series audit trail recording 20Hz telemetry events, AI inference classifications, safety interlock activations, and operator interventions.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} className="text-cyan-400" /> Export CSV
          </button>
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} className="text-emerald-400" /> Export JSON
          </button>
          <button
            onClick={() => setClearDialogOpen(true)}
            className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-lg border border-red-800/70 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} /> Purge Old
          </button>
        </div>
      </div>

      {/* ── 3 Summary Stat Counters ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Total Audit Records
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {stats.totalLogs} Events
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Indexed in local buffer
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            Critical / Error Count
          </div>
          <div className="text-2xl font-black font-mono text-red-400 mt-1">
            {stats.errorCount} Incidents
          </div>
          <div className="text-[10px] font-mono text-amber-400 mt-0.5">
            {stats.warnCount} Warning flags recorded
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            24-Hour Telemetry Ingestion
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
            {stats.ingestion24h}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
            Continuous 20Hz (~50ms) stream
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ───────────────────────────────────────────── */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Level:</span>
            {['', 'CRITICAL', 'WARN', 'INFO'].map(l => (
              <button
                key={l || 'ALL'}
                onClick={() => setLevel(l)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                  level === l
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {l || 'ALL'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Category:</span>
            {['', 'HARDWARE_IOT', 'AI_MODEL', 'USER_ACTION', 'ESTOP'].map(c => (
              <button
                key={c || 'ALL'}
                onClick={() => setCategory(c)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  category === c
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {c || 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search keywords, logs, IDs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* ── Industrial Logs Data Table ─────────────────────────────────── */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Level</th>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Telemetry / Action Message</th>
                <th className="py-2.5 px-3">Origin / User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map(log => {
                const isCrit = log.level === 'CRITICAL'
                const isWarn = log.level === 'WARN'

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          isCrit
                            ? 'bg-red-600 text-white animate-pulse'
                            : isWarn
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{log.id}</td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-US', { hour12: false })}
                    </td>
                    <td className="py-3 px-3 text-cyan-300 font-semibold">{log.category}</td>
                    <td className="py-3 px-3 text-slate-200 max-w-lg leading-relaxed">
                      {log.message}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-bold">{log.user || 'SYSTEM'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Clear Logs Safety Confirmation Modal ──────────────────────── */}
      {clearDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-red-500/60 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert size={24} />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Purge System Logs Confirmation
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Are you sure you want to purge historical telemetry and incident logs for <b className="text-white">{facilityName}</b>?
              Audit regulations require retention of critical failure logs.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setClearDialogOpen(false)}
                className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs font-mono rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleClearLogs}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded uppercase tracking-wider shadow-lg"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
