import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setEmergencyStop } from '../store/slices/telemetrySlice'
import {
  fetchSettings,
  updateSettingsApi,
  triggerEmergencyStopApi,
  clearEmergencyStopApi,
} from '../lib/api'
import {
  Sliders,
  AlertOctagon,
  Lock,
  Unlock,
  ShieldCheck,
  ShieldAlert,
  Save,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Activity,
  Flame,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react'

export default function SettingsPage() {
  const dispatch = useDispatch()
  const { emergencyStopped, emergencyDetails, facilityName, facilityId } = useSelector(s => s.telemetry)

  const [settings, setSettings] = useState({
    isoVibrationThreshold: 7.1,
    maxOperatingTemp: 80.0,
    minBeltThicknessLimit: 18.5,
    rulEmergencyThreshold: 7.0,
    telemetryStreamHz: 20,
    yoloMinConfidence: 0.80,
    nominalBeltSpeed: 4.2,
  })

  const [savedToast, setSavedToast] = useState(false)
  const [triggerModalOpen, setTriggerModalOpen] = useState(false)
  const [triggerReason, setTriggerReason] = useState('Safety inspection test lockdown triggered from Facility Settings')
  const [clearModalOpen, setClearModalOpen] = useState(false)
  const [clearRemark, setClearRemark] = useState('')
  const [operatorSig, setOperatorSig] = useState('Krish Sharma')

  useEffect(() => {
    async function load() {
      const data = await fetchSettings(facilityId)
      if (data) setSettings(prev => ({ ...prev, ...data }))
    }
    load()
  }, [facilityId])

  const handleSliderChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: parseFloat(val) }))
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    await updateSettingsApi(settings)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  const handleTriggerEStop = async (e) => {
    e.preventDefault()
    await triggerEmergencyStopApi(triggerReason, 'Krish Sharma', facilityId)
    dispatch(setEmergencyStop(true))
    setTriggerModalOpen(false)
  }

  const handleClearEStop = async (e) => {
    e.preventDefault()
    await clearEmergencyStopApi(clearRemark || 'Belt verified clear. Safe for re-energization.', operatorSig, facilityId)
    dispatch(setEmergencyStop(false))
    setClearModalOpen(false)
    setClearRemark('')
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
              Facility Configuration & Safety Interlock Setpoints
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {facilityName}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time adjustable threshold envelopes, ISO 10816 vibration classification setpoints, and physical safety emergency lockout controls.
          </p>
        </div>

        {savedToast && (
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
            <CheckCircle2 size={15} /> Setpoints Synced to PLC
          </div>
        )}
      </div>

      {/* ── Physical Safety E-Stop Lockout Box (Industrial Hazard) ─────── */}
      <div
        className={`p-5 rounded-xl border-2 transition-all duration-200 shadow-2xl backdrop-blur-md ${
          emergencyStopped
            ? 'bg-red-950/40 border-red-500 shadow-red-900/50'
            : 'bg-slate-900/70 border-slate-700/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl border flex items-center justify-center ${
                emergencyStopped
                  ? 'bg-red-600 text-white border-red-400 animate-spin'
                  : 'bg-red-950/60 text-red-400 border-red-800/80'
              }`}
              style={{ animationDuration: '4s' }}
            >
              <AlertOctagon size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-black uppercase tracking-widest text-white">
                  Physical Safety E-Stop Interlock Relay
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    emergencyStopped
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {emergencyStopped ? 'LOCKDOWN ENGAGED' : 'ARMED & MONITORING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Hardwired interlock relay drops conveyor belt speed to 0.0 m/s and isolates drive motor power.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {emergencyStopped ? (
              <button
                onClick={() => setClearModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono font-bold text-xs rounded-lg shadow-xl uppercase tracking-wider flex items-center gap-2"
              >
                <Unlock size={15} /> Authorize Clearance
              </button>
            ) : (
              <button
                onClick={() => setTriggerModalOpen(true)}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-mono font-bold text-xs rounded-lg shadow-xl uppercase tracking-wider flex items-center gap-2 animate-pulse"
              >
                <Lock size={15} /> Trigger E-Stop Lockdown
              </button>
            )}
          </div>
        </div>

        {emergencyStopped && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700/60 rounded-lg text-xs font-mono text-red-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <b>TRIPPED REASON:</b> {emergencyDetails.reason || 'Safety interlock tripped'}
            </div>
            <div>
              <b>TIME:</b> {emergencyDetails.triggeredAt ? new Date(emergencyDetails.triggeredAt).toLocaleTimeString('en-US') : '11:45:00'}
            </div>
          </div>
        )}
      </div>

      {/* ── Operational Envelopes & Sliders ───────────────────────────── */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-5 backdrop-blur-md shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-cyan-400" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Real-Time Alarm Threshold Sliders & Safety Limits
              </h3>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md active:scale-95 uppercase tracking-wider transition-all"
            >
              <Save size={14} /> Save Threshold Envelopes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
            {/* 1. ISO 10816 Vibration Alert Threshold */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase">
                  <Activity size={15} className="text-cyan-400" />
                  ISO 10816 Vibration Alert Threshold
                </div>
                <span className="text-sm font-black text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded border border-cyan-800">
                  {settings.isoVibrationThreshold.toFixed(1)} mm/s
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Vibration exceeding this limit triggers ISO Zone D Critical Trip dispatch.
              </p>
              <input
                type="range"
                min="3.0"
                max="10.0"
                step="0.1"
                value={settings.isoVibrationThreshold}
                onChange={e => handleSliderChange('isoVibrationThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>3.0 mm/s (Tight)</span>
                <span>7.1 mm/s (Standard Zone D)</span>
                <span>10.0 mm/s (Loose)</span>
              </div>
            </div>

            {/* 2. Maximum Belt Operating Temperature Limit */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase">
                  <Flame size={15} className="text-amber-400" />
                  Maximum Belt Temperature Limit
                </div>
                <span className="text-sm font-black text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-800">
                  {settings.maxOperatingTemp.toFixed(1)} °C
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Pyrometer temperature threshold where thermal breakdown warning fires.
              </p>
              <input
                type="range"
                min="50.0"
                max="100.0"
                step="1.0"
                value={settings.maxOperatingTemp}
                onChange={e => handleSliderChange('maxOperatingTemp', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50°C</span>
                <span>80°C (Standard Limit)</span>
                <span>100°C</span>
              </div>
            </div>

            {/* 3. Minimum Belt Thickness Warning */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase">
                  <Layers size={15} className="text-emerald-400" />
                  Minimum Belt Thickness Warning
                </div>
                <span className="text-sm font-black text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
                  {settings.minBeltThicknessLimit.toFixed(1)} mm
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Original carcass thickness is 22.0mm. Triggers warning when wear breaches limit.
              </p>
              <input
                type="range"
                min="14.0"
                max="21.0"
                step="0.1"
                value={settings.minBeltThicknessLimit}
                onChange={e => handleSliderChange('minBeltThicknessLimit', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>14.0 mm</span>
                <span>18.5 mm (Safety Cutoff)</span>
                <span>21.0 mm</span>
              </div>
            </div>

            {/* 4. RUL Emergency Threshold */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase">
                  <Clock size={15} className="text-red-400" />
                  RUL Emergency Threshold
                </div>
                <span className="text-sm font-black text-red-400 bg-red-950 px-2.5 py-0.5 rounded border border-red-800">
                  {settings.rulEmergencyThreshold.toFixed(1)} Days
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Splice health projection falling below this window triggers urgent maintenance dispatch.
              </p>
              <input
                type="range"
                min="2.0"
                max="14.0"
                step="0.5"
                value={settings.rulEmergencyThreshold}
                onChange={e => handleSliderChange('rulEmergencyThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>2.0 Days</span>
                <span>7.0 Days (Emergency Line)</span>
                <span>14.0 Days</span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ── Modal: Trigger E-Stop Confirmation ────────────────────────── */}
      {triggerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border-2 border-red-600 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertOctagon size={28} className="animate-pulse" />
              <h3 className="text-sm font-mono font-black uppercase tracking-widest text-white">
                Trip Physical Safety Interlock
              </h3>
            </div>

            <form onSubmit={handleTriggerEStop} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 uppercase text-[10px] mb-1">Lockdown Justification / Reason</label>
                <textarea
                  value={triggerReason}
                  onChange={e => setTriggerReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTriggerModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-lg uppercase"
                >
                  Execute Lockdown Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Authorize Clearance & Clear E-Stop ─────────────────── */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-emerald-500/60 rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <ShieldCheck size={24} />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Authorize Conveyor Restart Clearance
              </h3>
            </div>

            <form onSubmit={handleClearEStop} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-300 uppercase text-[10px] mb-1">Operator Signature</label>
                <input
                  type="text"
                  value={operatorSig}
                  onChange={e => setOperatorSig(e.target.value)}
                  required
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 uppercase text-[10px] mb-1">Clearance Verification Note</label>
                <textarea
                  value={clearRemark}
                  onChange={e => setClearRemark(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. 1,200m trackway walkdown completed. No personnel in danger zone."
                  className="w-full bg-[#1e293b] border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setClearModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-lg uppercase flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Authorize Restart
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
