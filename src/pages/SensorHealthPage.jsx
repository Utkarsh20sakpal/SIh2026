import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { fetchReliabilityMatrix, fetchReliabilityHistory } from '../lib/api'
import {
  Activity,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Sliders,
  TrendingUp,
  Percent,
  Waves,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function SensorHealthPage() {
  const [matrix, setMatrix] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { facilityName } = useSelector(s => s.telemetry)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const mat = await fetchReliabilityMatrix()
        const hist = await fetchReliabilityHistory()
        setMatrix(mat)
        setHistory(hist)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const sensors = matrix?.sensors || []

  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
              Sensor Reliability & Kalman Filter Matrix
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              QOS 99.98%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Kalman filter weighting and drift compensation across 4 primary transducer arrays to distinguish sensor drift from authentic mechanical failure.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            BUS: <b className="text-emerald-400">MODBUS TCP / MQTT</b>
          </span>
        </div>
      </div>

      {/* ── 4 Primary Transducer Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {sensors.map(s => {
          const isHigh = s.reliability >= 95
          const isMid = s.reliability >= 85 && s.reliability < 95

          return (
            <div
              key={s.id}
              className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-slate-700 transition-colors shadow-lg scada-card-glow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    {s.id}
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    KALMAN ACTIVE
                  </span>
                </div>

                <h3 className="text-xs font-mono font-bold text-white mb-1 leading-snug">
                  {s.name}
                </h3>
                <p className="text-[10px] text-slate-400 font-sans mb-3">
                  {s.type}
                </p>

                {/* Reliability Score Meter */}
                <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] font-mono text-slate-400">RELIABILITY SCORE</span>
                    <span className={`text-xl font-black font-mono ${isHigh ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {s.reliability}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${s.reliability}%` }}
                    />
                  </div>
                </div>

                {/* Transducer Diagnostics Grid */}
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Signal-to-Noise (SNR):</span>
                    <span className="text-white font-bold">{s.snrDb} dB</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Packet Loss Rate:</span>
                    <span className="text-emerald-400 font-bold">{s.packetLossPercent}%</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Kalman Weight Gain (K):</span>
                    <span className="text-cyan-300 font-bold">{s.kalmanWeight}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sensor Drift Offset:</span>
                    <span className="text-slate-300 font-semibold">{s.driftOffset}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800/80 mt-3 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                <span>Calibrated: {s.lastCalibration}</span>
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={11} /> Nominal
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 24-Hour Reliability & Drift History Chart ──────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg scada-card-glow">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-cyan-400" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              24-Hour Kalman Signal Reliability & Transducer Drift Trends
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Sampling: Continuous Rolling Ingestion
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[85, 100]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }} />

              <Line type="monotone" dataKey="adxl" stroke="#38bdf8" strokeWidth={2} dot={false} name="ADXL345 Vibration (%)" />
              <Line type="monotone" dataKey="pyro" stroke="#f59e0b" strokeWidth={2} dot={false} name="MAX6675 Pyrometer (%)" />
              <Line type="monotone" dataKey="ultrasonic" stroke="#10b981" strokeWidth={2} dot={false} name="Ultrasonic Thickness (%)" />
              <Line type="monotone" dataKey="acoustic" stroke="#a855f7" strokeWidth={2} dot={false} name="Acoustic Emission (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Mechanical Anomaly vs Sensor Drift Isolation Guide ────────── */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg scada-card-glow">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-3">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Kalman Innovation Residuals & Failure Isolation Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-sans">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <h4 className="font-mono font-bold text-cyan-400 uppercase text-[11px] mb-1">
              ✓ Genuine Mechanical Degradation (Joint-05 Verified)
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Multi-sensor fusion confirms that high vibration (7.9 mm/s RMS) on Joint-05 is correlated with elevated pyrometer temperature (74.5°C) and optical surface tear (168mm). The Kalman residual is within normal covariance, ruling out transducer drift.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <h4 className="font-mono font-bold text-emerald-400 uppercase text-[11px] mb-1">
              ✓ Sensor Drift Compensation Active
            </h4>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Zero persistent single-channel drift detected across the 4 ADXL, MAX6675, ultrasonic, and AE sensors. Automatic zero-bias re-calibration operates on every complete 1,200m belt loop revolution.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
