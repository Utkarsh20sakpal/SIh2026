import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setEmergencyStop } from '../../store/slices/telemetrySlice'
import { clearEmergencyStopApi } from '../../lib/api'
import { AlertOctagon, ShieldAlert, CheckCircle2, Lock, X } from 'lucide-react'

export function EmergencyStopBanner() {
  const dispatch = useDispatch()
  const { emergencyStopped, emergencyDetails } = useSelector(s => s.telemetry)
  const [modalOpen, setModalOpen] = useState(false)
  const [clearRemark, setClearRemark] = useState('')
  const [operatorSignature, setOperatorSignature] = useState('Krish Sharma')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!emergencyStopped) return null

  const handleClear = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await clearEmergencyStopApi(clearRemark || 'Beltline physical inspection signed off by plant lead', operatorSignature)
      dispatch(setEmergencyStop(false))
      setModalOpen(false)
      setClearRemark('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="w-full bg-red-600 border-b-2 border-red-400 text-white px-4 py-2.5 flex items-center justify-between shadow-2xl relative z-40 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-red-800/80 rounded-full border border-red-300">
            <AlertOctagon size={20} className="text-white animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs sm:text-sm tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded border border-red-300">
                ⚠️ SAFETY LOCKDOWN ENGAGED
              </span>
              <span className="text-xs font-mono font-bold hidden sm:inline text-red-100">
                BELT DRIVE TRIPPED
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-red-50 font-sans">
              <span className="font-semibold text-white">Reason:</span> {emergencyDetails.reason || 'Physical E-Stop interlock tripped on Overland Curve Segment (Joint-05)'}
              {emergencyDetails.triggeredAt && (
                <span className="ml-2 font-mono text-[10px] text-red-200 opacity-90">
                  [{new Date(emergencyDetails.triggeredAt).toLocaleTimeString('en-US')}]
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 active:scale-95 transition-all text-xs font-mono font-bold rounded shadow-md border border-white flex items-center gap-1.5 uppercase tracking-wider"
        >
          <ShieldAlert size={14} className="text-red-700" />
          Authorize System Clearance
        </button>
      </div>

      {/* Clearance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-red-500/50 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-red-950/80 border-b border-red-900/80 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="text-red-400" size={18} />
                <h3 className="text-sm font-mono font-bold tracking-wider text-red-100 uppercase">
                  Safety E-Stop Clearance Protocol
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-red-300 hover:text-white p-1 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleClear} className="p-5 space-y-4">
              <div className="bg-red-900/20 border border-red-800/40 rounded p-3 text-xs text-red-200">
                <p className="font-semibold text-white mb-1">Mandatory Compliance Check (DGMS / OSHA):</p>
                Prior to clearing the conveyor interlocking relay, the lead operator must verify all maintenance personnel are clear of the 1,200m overland trackway and take-up counterweights are locked.
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Authorized Sign-Off Operator:
                </label>
                <input
                  type="text"
                  value={operatorSignature}
                  onChange={e => setOperatorSignature(e.target.value)}
                  required
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 uppercase tracking-wider mb-1.5">
                  Clearance Audit Remark / Verification Note:
                </label>
                <textarea
                  value={clearRemark}
                  onChange={e => setClearRemark(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Visual walkdown complete. Joint-05 isolated, chute cleared, no personnel in trackway."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-mono font-bold rounded shadow-lg transition-all flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <CheckCircle2 size={15} />
                  {isSubmitting ? 'Verifying...' : 'Authorize Restart & Clear Interlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
