import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAlerts, acknowledgeAlertApi, resolveAlertApi, createAlert } from '../lib/api'
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  ShieldAlert,
  Search,
  Check,
  X,
  FileCheck,
  Sparkles,
  Plus,
  RefreshCw,
} from 'lucide-react'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, ACKNOWLEDGED, RESOLVED
  const [severityFilter, setSeverityFilter] = useState('ALL') // ALL, CRITICAL, WARNING, INFO
  const [searchQuery, setSearchQuery] = useState('')

  // Modal dialog states
  const [ackModalAlert, setAckModalAlert] = useState(null)
  const [operatorInitials, setOperatorInitials] = useState('KS')
  const [ackRemark, setAckRemark] = useState('')

  const [resolveModalAlert, setResolveModalAlert] = useState(null)
  const [rootCause, setRootCause] = useState('Accelerated Mechanical Friction')
  const [partId, setPartId] = useState('PART-SPLICE-SC4000-JIG')
  const [signOffNote, setSignOffNote] = useState('')

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSeverity, setNewSeverity] = useState('WARNING')
  const [newJointId, setNewJointId] = useState('Joint-05')
  const [newDesc, setNewDesc] = useState('')

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await fetchAlerts()
      setAlerts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const handleAcknowledge = async (e) => {
    e.preventDefault()
    if (!ackModalAlert) return
    const id = ackModalAlert.id || ackModalAlert.alertId
    await acknowledgeAlertApi(id, ackRemark, `Operator (${operatorInitials})`)
    setAckModalAlert(null)
    setAckRemark('')
    loadAlerts()
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!resolveModalAlert) return
    const id = resolveModalAlert.id || resolveModalAlert.alertId
    await resolveAlertApi(id, `${signOffNote} (Replaced Part: ${partId})`, rootCause, 'Krish Sharma')
    setResolveModalAlert(null)
    setSignOffNote('')
    loadAlerts()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await createAlert({
      title: newTitle,
      severity: newSeverity,
      jointId: newJointId,
      description: newDesc || 'Manually logged incident alert from SCADA control terminal',
      overallRms: newSeverity === 'CRITICAL' ? 7.9 : 4.5,
      source: 'Operator Incident Dispatch',
    })
    setCreateModalOpen(false)
    setNewTitle('')
    setNewDesc('')
    loadAlerts()
  }

  // Filter alerts
  const filtered = alerts.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return (
        a.title.toLowerCase().includes(q) ||
        (a.id && a.id.toLowerCase().includes(q)) ||
        (a.alertId && a.alertId.toLowerCase().includes(q)) ||
        (a.jointId && a.jointId.toLowerCase().includes(q))
      )
    }
    return true
  })

  const activeCount = alerts.filter(a => a.status === 'ACTIVE').length
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length

  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
              Incident Alarms & Resolution Logger
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              {activeCount} ACTIVE ({criticalCount} CRITICAL)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alarm dispatch, operator acknowledgement audit trail, and engineering root-cause resolution logger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 transition-all uppercase tracking-wider"
          >
            <Plus size={14} /> Log Manual Incident
          </button>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ──────────────────────────────────── */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Severity:</span>
          {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                severityFilter === sev
                  ? sev === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : sev === 'WARNING'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search incident, splice, ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* ── Alerts Table / Cards ──────────────────────────────────────── */}
      <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Alert ID</th>
                <th className="py-2.5 px-3">Target Splice</th>
                <th className="py-2.5 px-3">Incident Title & Telemetry</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(a => {
                const isCrit = a.severity === 'CRITICAL'
                const isWarn = a.severity === 'WARNING'
                const isActive = a.status === 'ACTIVE'
                const isAck = a.status === 'ACKNOWLEDGED'
                const isRes = a.status === 'RESOLVED'

                return (
                  <tr key={a.id || a.alertId} className="hover:bg-slate-800/40 transition-colors">
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
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{a.alertId || a.id}</td>
                    <td className="py-3 px-3 text-cyan-300 font-bold">{a.jointId || a.relatedJoint || 'Joint-05'}</td>
                    <td className="py-3 px-3 max-w-md">
                      <div className="font-semibold text-white">{a.title}</div>
                      <div className="text-slate-400 text-[11px] truncate mt-0.5">
                        {a.description || a.aiExplanation?.what || 'Anomalous transducer excursion recorded.'}
                      </div>
                      {a.acknowledgedBy && (
                        <div className="text-[10px] text-cyan-400 mt-0.5">
                          ✓ Acknowledged by {a.acknowledgedBy}: "{a.acknowledgeRemark}"
                        </div>
                      )}
                      {a.resolvedBy && (
                        <div className="text-[10px] text-emerald-400 mt-0.5">
                          ✓ Resolved by {a.resolvedBy}: "{a.resolutionNote}"
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(a.timestamp).toLocaleTimeString('en-US')}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold ${
                          isActive
                            ? 'text-red-400 animate-pulse'
                            : isAck
                            ? 'text-cyan-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isActive && (
                          <button
                            onClick={() => setAckModalAlert(a)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded text-[10px] font-mono border border-slate-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                        )}
                        {!isRes && (
                          <button
                            onClick={() => setResolveModalAlert(a)}
                            className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded text-[10px] font-mono border border-emerald-800 transition-colors flex items-center gap-1"
                          >
                            <Check size={12} /> Resolve
                          </button>
                        )}
                        {isRes && (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-400" /> Closed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Acknowledge Alert ──────────────────────────────────── */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-mono font-bold text-white uppercase">
                Acknowledge Alert ({ackModalAlert.alertId || ackModalAlert.id})
              </h3>
              <button onClick={() => setAckModalAlert(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAcknowledge} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Operator Initials</label>
                <input
                  type="text"
                  value={operatorInitials}
                  onChange={e => setOperatorInitials(e.target.value)}
                  required
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Triage Remark / Action Note</label>
                <textarea
                  value={ackRemark}
                  onChange={e => setAckRemark(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Verified vibration spike on curve segment. Splicing crew alerted."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAckModalAlert(null)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs uppercase"
                >
                  Save Acknowledgment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Resolve Incident ───────────────────────────────────── */}
      {resolveModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-400" />
                Resolve Incident & Close Alert
              </h3>
              <button onClick={() => setResolveModalAlert(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Root Cause Classification</label>
                <select
                  value={rootCause}
                  onChange={e => setRootCause(e.target.value)}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option>Accelerated Mechanical Friction</option>
                  <option>Splice Cover Delamination</option>
                  <option>Steel Cord Fatigue / Rupture</option>
                  <option>Loading Chute Ore Jamming</option>
                  <option>Optical Sensor Lens Smudge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Replacement Part / Kit ID</label>
                <input
                  type="text"
                  value={partId}
                  onChange={e => setPartId(e.target.value)}
                  required
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Engineering Sign-Off Note</label>
                <textarea
                  value={signOffNote}
                  onChange={e => setSignOffNote(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Cold vulcanized diamond step repair executed using SC-4000. Cured 45 min under 7 bar."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalAlert(null)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs uppercase flex items-center gap-1"
                >
                  <CheckCircle2 size={13} /> Close Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Create Manual Incident ─────────────────────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-sm font-mono font-bold text-white uppercase">
                Dispatch New Manual Incident
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Incident Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Idler Bearing Overheat near Take-Up"
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 uppercase text-[10px] mb-1">Target Splice</label>
                  <select
                    value={newJointId}
                    onChange={e => setNewJointId(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option>Joint-01</option>
                    <option>Joint-02</option>
                    <option>Joint-03</option>
                    <option>Joint-04</option>
                    <option>Joint-05</option>
                    <option>Joint-06</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={3}
                  placeholder="Details regarding visual inspection observations..."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs uppercase"
                >
                  Dispatch Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
