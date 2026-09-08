import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectJoint } from '../store/slices/twinSlice'
import {
  Activity,
  Gauge,
  Layers,
  AlertTriangle,
  Clock,
  Radio,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Zap,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from 'recharts'

/* ── Tachometer Gauge Component ────────────────────────────────────────── */
function TachometerGauge({ speed = 4.2 }) {
  const maxSpeed = 6.0
  const angle = -120 + (Math.min(speed, maxSpeed) / maxSpeed) * 240

  return (
    <div className="flex flex-col items-center justify-center relative py-1">
      <svg className="w-44 h-24 overflow-visible" viewBox="0 0 200 120">
        <path
          d="M 30 110 A 80 80 0 0 1 170 110"
          fill="none"
          stroke="#1e293b"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 30 110 A 80 80 0 0 1 75 42"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="14"
          strokeOpacity="0.3"
        />
        <path
          d="M 90 32 A 80 80 0 0 1 145 55"
          fill="none"
          stroke="#10b981"
          strokeWidth="14"
        />
        <path
          d="M 155 68 A 80 80 0 0 1 170 110"
          fill="none"
          stroke="#ef4444"
          strokeWidth="14"
        />

        <g transform={`rotate(${angle} 100 110)`} className="transition-transform duration-100 ease-out">
          <polygon points="98,110 102,110 100.5,35" fill="#38bdf8" />
          <circle cx="100" cy="110" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
        </g>
      </svg>

      <div className="text-center mt-[-8px]">
        <div className="text-2xl font-black font-mono tracking-tight text-white flex items-baseline justify-center gap-1">
          {speed.toFixed(2)}
          <span className="text-xs font-semibold text-slate-400">m/s</span>
        </div>
        <div className="text-[10px] font-mono text-emerald-400 font-bold tracking-wider uppercase">
          NOMINAL SPEED (3.8 - 4.5 m/s)
        </div>
      </div>
    </div>
  )
}

/* ── Custom Tooltip for ISO Vibration Chart ────────────────────────────── */
function IsoVibrationTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const rms = data.overallRms
    let zone = 'A (Good)'
    let zoneColor = 'text-emerald-400'
    if (rms > 7.1) {
      zone = 'D (Unacceptable / Severe Damage)'
      zoneColor = 'text-red-400'
    } else if (rms > 4.5) {
      zone = 'C (Restricted Continuous)'
      zoneColor = 'text-amber-400'
    } else if (rms > 2.8) {
      zone = 'B (Unrestricted Continuous)'
      zoneColor = 'text-sky-400'
    }

    return (
      <div className="bg-[#0f172a]/95 border border-slate-700 p-2.5 rounded-lg shadow-xl font-mono text-xs">
        <div className="text-slate-400 text-[10px] mb-1">TIME: {data.time}</div>
        <div className="text-white font-bold">
          OVERALL RMS: <span className={zoneColor}>{rms.toFixed(2)} mm/s</span>
        </div>
        <div className="text-slate-300 text-[11px] mt-0.5">
          ISO Zone: <span className={zoneColor}>{zone}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const telemetry = useSelector(state => state.telemetry)
  const { joints } = useSelector(state => state.twin)

  const [vibrationWaveform, setVibrationWaveform] = useState([])

  const live = telemetry.live || {
    beltSpeed: 4.2,
    dynamicLoad: 1850,
    beltTension: 340,
    driveMotorPower: 485,
    pyrometerTemp: 74.5,
    triaxialVibration: { xRms: 4.2, yRms: 5.1, zRms: 7.9, overallRms: 7.9 },
  }

  const minRul = telemetry.minRul || {
    jointId: 'Joint-05',
    days: 6.0,
    hours: 144,
    confidence: 94,
    curveRiskIndex: 89.2,
    governingFactor: 'Steel Cord Pullout 168mm + Zone D Vibration (7.9 mm/s)',
  }

  // Generate ISO Vibration Waveform Points
  useEffect(() => {
    const points = []
    const baseRms = 7.9
    for (let i = 20; i >= 0; i--) {
      const t = new Date(Date.now() - i * 1500)
      const noise = (Math.random() - 0.5) * 0.4
      points.push({
        time: t.toLocaleTimeString('en-US', { hour12: false }),
        overallRms: Math.max(0.5, +(baseRms + noise).toFixed(2)),
      })
    }
    setVibrationWaveform(points)
  }, [])

  // 20Hz Waveform Update
  useEffect(() => {
    if (!live?.triaxialVibration?.overallRms) return
    const now = new Date().toLocaleTimeString('en-US', { hour12: false })
    setVibrationWaveform(prev => {
      const next = [...prev.slice(1), {
        time: now,
        overallRms: +(live.triaxialVibration.overallRms + (Math.random() - 0.5) * 0.15).toFixed(2),
      }]
      return next
    })
  }, [live.triaxialVibration?.overallRms])

  const handleJointClick = (joint) => {
    dispatch(selectJoint(joint.id))
    navigate('/digital-twin')
  }

  return (
    <div className="space-y-4">
      {/* ── 🌟 Top 4 Critical SCADA Telemetry Cards ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Tachometer Belt Speed Card */}
        <div className="card-clean p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Gauge size={15} className="text-sky-400" />
              Overland Belt Speed
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950 text-sky-400 border border-sky-800">
              TARGET 4.2
            </span>
          </div>

          <TachometerGauge speed={live.beltSpeed} />

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 mt-1">
            <span>Tension: <b className="text-white">{live.beltTension} kN</b></span>
            <span>Power: <b className="text-white">{live.driveMotorPower} kW</b></span>
          </div>
        </div>

        {/* 2. Dynamic Feed Load Card */}
        <div className="card-clean p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
              <TrendingUp size={15} className="text-emerald-400" />
              Dynamic Throughput
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              RATED 2,400 t/h
            </span>
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {live.dynamicLoad}
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">tons/hour</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (live.dynamicLoad / 2400) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>Throughput: {((live.dynamicLoad / 2400) * 100).toFixed(1)}%</span>
              <span>Available: {2400 - live.dynamicLoad} t/h</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Transfer Skirt: <b className="text-emerald-400">UNRESTRICTED</b></span>
            <span>Ore: <b className="text-slate-200">Hematite</b></span>
          </div>
        </div>

        {/* 3. Min Remaining Useful Life (RUL) Countdown Card */}
        <div className="bg-gradient-to-b from-red-950/30 to-slate-900/80 border border-red-500/40 rounded-xl p-4 flex flex-col justify-between backdrop-blur-md shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Clock size={15} />
              Min RUL Countdown
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold bg-red-600 text-white animate-pulse">
              JOINT-05 CRITICAL
            </span>
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-red-400">
                {minRul.days.toFixed(1)}
              </span>
              <span className="text-sm font-mono text-red-300 font-bold">DAYS</span>
              <span className="text-xs font-mono text-slate-400">({minRul.hours} hrs)</span>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 leading-tight">
              Governing fault: Steel Cord Pullout 168mm + Zone D Vibration (7.9 mm/s).
            </p>
          </div>

          <div className="border-t border-red-900/60 pt-2 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">
              Confidence: <b className="text-white">{minRul.confidence}%</b>
            </span>
            <button
              onClick={() => {
                dispatch(selectJoint('Joint-05'))
                navigate('/digital-twin')
              }}
              className="text-[10px] font-mono font-bold text-red-400 hover:text-red-300 flex items-center gap-1 uppercase"
            >
              Track in 3D <ArrowUpRight size={12} />
            </button>
          </div>
        </div>

        {/* 4. Fleet Health / Risk Index Card */}
        <div className="card-clean p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
              <ShieldAlert size={15} className="text-amber-400" />
              Curve Failure Risk
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
              800m CURVE
            </span>
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono tracking-tight text-amber-400">
                {minRul.curveRiskIndex}%
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">Risk Index</span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-300"
                style={{ width: `${minRul.curveRiskIndex}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>Straight Flight: 8.4%</span>
              <span className="text-amber-300 font-bold">Curve: 89.2% Elevated</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
            <span>Vibration RMS: <b className="text-red-400">{live.triaxialVibration?.overallRms || 7.9} mm/s</b></span>
            <span>Pyrometer: <b className="text-amber-300">{live.pyrometerTemp}°C</b></span>
          </div>
        </div>
      </div>

      {/* ── ISO 10816-3 Vibration Severity Waveform Chart ─────────────── */}
      <div className="card-clean p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-sky-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                ISO 10816-3 Vibration Severity Waveform
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                LIVE RMS: {(live.triaxialVibration?.overallRms || 7.9).toFixed(2)} mm/s (ZONE D CRITICAL)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuously calibrated tri-axial vibration spectrum plotted against standardized industrial vibration severity zones.
            </p>
          </div>

          {/* Color Zone Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70 inline-block" />
              <span className="text-slate-300">Zone A (&lt;2.8)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/70 inline-block" />
              <span className="text-slate-300">Zone B (2.8-4.5)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/70 inline-block" />
              <span className="text-slate-300">Zone C (4.5-7.1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/70 inline-block" />
              <span className="text-red-400 font-bold">Zone D (&gt;7.1)</span>
            </div>
          </div>
        </div>

        {/* Recharts Area + Waveform */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={vibrationWaveform} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} unit=" mm/s" />
              <Tooltip content={<IsoVibrationTooltip />} />

              <ReferenceArea y1={0} y2={2.8} fill="#10b981" fillOpacity={0.06} />
              <ReferenceArea y1={2.8} y2={4.5} fill="#0ea5e9" fillOpacity={0.06} />
              <ReferenceArea y1={4.5} y2={7.1} fill="#f59e0b" fillOpacity={0.08} />
              <ReferenceArea y1={7.1} y2={10} fill="#ef4444" fillOpacity={0.12} />

              <Line
                type="monotone"
                dataKey="overallRms"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 2, fill: '#ef4444' }}
                activeDot={{ r: 5, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2 }}
                name="Live RMS (mm/s)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Interactive 6-Joint Status Track (1,200m Belt Loop) ───────── */}
      <div className="card-clean p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-sky-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              1,200m Overland Belt Loop — Splice Joint Inspection Synoptic
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 4 Healthy
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 1 Wear (J-03)
            </span>
            <span className="flex items-center gap-1.5 text-red-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> 1 Critical (J-05)
            </span>
          </div>
        </div>

        {/* 6 Joint Cards along the 1,200m loop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {joints.map((joint) => {
            const isCritical = joint.status === 'CRITICAL'
            const isWarning = joint.status === 'ELEVATED_WEAR'

            const borderColor = isCritical
              ? 'border-red-500/60 bg-red-950/20 hover:border-red-400 shadow-lg'
              : isWarning
              ? 'border-amber-500/50 bg-amber-950/20 hover:border-amber-400'
              : 'border-slate-800 bg-slate-950/50 hover:border-sky-500/50'

            const statusBadgeColor = isCritical
              ? 'bg-red-600 text-white animate-pulse'
              : isWarning
              ? 'bg-amber-950 text-amber-300 border border-amber-700'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'

            return (
              <button
                key={joint.id}
                onClick={() => handleJointClick(joint)}
                className={`text-left p-3 rounded-lg border transition-all duration-150 flex flex-col justify-between group active:scale-98 ${borderColor}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      {joint.label}
                    </span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${statusBadgeColor}`}>
                      {joint.health}%
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Position: <b className="text-slate-200">{joint.distanceMeters || joint.position}m</b>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {joint.name?.split('(')[1]?.replace(')', '') || 'Section'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[10px] font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Vibration:</span>
                    <span className={isCritical ? 'text-red-400 font-bold' : isWarning ? 'text-amber-400' : 'text-slate-200'}>
                      {joint.vibrationRms} mm/s
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>RUL:</span>
                    <span className={isCritical ? 'text-red-400 font-bold' : 'text-slate-200'}>
                      {joint.rulDays} Days
                    </span>
                  </div>
                  <div className="flex items-center justify-end text-[9px] text-sky-400 font-bold group-hover:underline pt-1">
                    3D Twin <ChevronRight size={10} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
