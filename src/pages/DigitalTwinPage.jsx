import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectJoint,
  setCamera,
  setPlaybackMode,
  setPlaybackHAgo,
  setPlaybackPlaying,
  setPlaybackRate,
  snapToLive,
} from '../store/slices/twinSlice'
import { DigitalTwinCanvas } from '../components/digitalTwin/DigitalTwinCanvas'
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Activity,
  Layers,
  Sparkles,
  AlertTriangle,
  Clock,
  Radio,
  ChevronRight,
  Maximize2,
  X,
  Sliders,
  CheckCircle2,
  Camera,
  Eye,
} from 'lucide-react'

const CAMERAS = [
  { id: 'ORBIT', label: '3D Orbit' },
  { id: 'HEAD', label: 'Head (Discharge)' },
  { id: 'TAIL', label: 'Tail (Loading)' },
  { id: 'CURVE_J05', label: 'Curve (Joint-05)' },
  { id: 'TOP_DOWN', label: 'Top-Down Plan' },
]
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function DigitalTwinPage() {
  const dispatch = useDispatch()
  const {
    joints,
    selectedJointId,
    playback,
    snapshots,
    currentSnapshotIndex,
    camera,
  } = useSelector(s => s.twin)
  const { live, facilityName } = useSelector(s => s.telemetry)

  const [drawerOpen, setDrawerOpen] = useState(true)
  const playbackTimerRef = useRef(null)

  const selectedJoint = joints.find(j => j.id === selectedJointId) || joints[4] // default Joint-05

  // 72-hour playback animation loop
  useEffect(() => {
    if (playback.playing) {
      playbackTimerRef.current = setInterval(() => {
        dispatch((dispatch, getState) => {
          const currentHAgo = getState().twin.playback.hAgo
          const rate = getState().twin.playback.rate
          // step forward towards 0h (present) or loop back to 72h
          let nextHAgo = currentHAgo - 0.25 * rate
          if (nextHAgo < 0) {
            nextHAgo = 72 // loop around
          }
          dispatch(setPlaybackHAgo(nextHAgo))
        })
      }, 100)
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
        playbackTimerRef.current = null
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
      }
    }
  }, [playback.playing, dispatch])

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value)
    dispatch(setPlaybackHAgo(val))
  }

  const handleStep = (direction) => {
    const delta = direction === 'forward' ? -1 : 1
    const nextVal = Math.max(0, Math.min(72, playback.hAgo + delta))
    dispatch(setPlaybackHAgo(nextVal))
  }

  // Generate 24-point projection data for RUL trend chart in drawer
  const rulTrendData = Array.from({ length: 12 }, (_, i) => ({
    hour: `+${i * 12}h`,
    health: Math.max(10, +(selectedJoint.health - i * 1.8).toFixed(1)),
    vibration: +(selectedJoint.vibrationRms + i * 0.25).toFixed(2),
  }))

  const isLive = playback.mode === 'LIVE'
  const currentSnapshot = snapshots[currentSnapshotIndex]

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] gap-3 relative">
      {/* ── Top Bar: Quick Joint Switcher & Mode Pill ─────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider shrink-0">
            SPLICE JOINTS:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {joints.map(j => {
              const isSelected = j.id === selectedJointId
              const isCrit = j.status === 'CRITICAL'
              const isWarn = j.status === 'ELEVATED_WEAR'

              return (
                <button
                  key={j.id}
                  onClick={() => dispatch(selectJoint(j.id))}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCrit
                        ? 'bg-red-500 animate-ping'
                        : isWarn
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{j.label}</span>
                  <span className="text-[10px] opacity-80">{j.health}%</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Pill */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
              isLive
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/80 border-amber-500/40 text-amber-300 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLive ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span>{isLive ? 'LIVE 20Hz STREAMING' : `72H REPLAY (-${playback.hAgo.toFixed(1)}h)`}</span>
          </div>

          {!isLive && (
            <button
              onClick={() => dispatch(snapToLive())}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1 uppercase"
            >
              <RotateCcw size={12} />
              Snap to Live
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            title="Toggle Telemetry Drawer"
          >
            <Sliders size={15} />
          </button>
        </div>
      </div>

      {/* ── Main 3D Canvas Viewport ──────────────────────────────────── */}
      <div className="flex-1 w-full bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-2xl">
        <DigitalTwinCanvas />

        {/* Camera Preset Quick Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-1.5 bg-slate-900/85 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-xl">
          <Camera size={13} className="text-cyan-400 mr-0.5" />
          {CAMERAS.map(cam => (
            <button
              key={cam.id}
              onClick={() => dispatch(setCamera(cam.id))}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                camera === cam.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cam.label}
            </button>
          ))}
        </div>

        {/* 3D Scene Controls Watermark */}
        <div className="absolute top-4 left-4 pointer-events-none text-slate-400 font-mono text-[11px] bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-800/80 space-y-0.5">
          <div className="text-white font-bold text-xs uppercase flex items-center gap-1.5">
            <Layers size={13} className="text-cyan-400" />
            1,200m Procedural Beltline
          </div>
          <div>Left Click + Drag: Orbit Camera</div>
          <div>Scroll Wheel: Zoom in / out</div>
          <div>Click any Splice Marker: Focus Joint</div>
        </div>

        {/* Selected Joint HUD Tag on Canvas */}
        {selectedJoint && (
          <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md px-3.5 py-2.5 rounded-lg shadow-xl font-mono text-xs max-w-xs">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-white text-sm">{selectedJoint.name || selectedJoint.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  selectedJoint.status === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : selectedJoint.status === 'ELEVATED_WEAR'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {selectedJoint.status}
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Health: <b className="text-white">{selectedJoint.health}%</b> • RUL: <b className="text-red-400">{selectedJoint.rulDays || 6.0}d</b>
            </div>
            <div className="text-slate-400 text-[11px] mt-0.5">
              Vibration: <b className="text-red-400">{selectedJoint.vibrationRms} mm/s</b>
            </div>
          </div>
        )}

        {/* ── ⏪ 72-Hour Time-Travel Scrubber Bar (Floating HUD) ─────────── */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl rounded-xl p-3.5 shadow-2xl space-y-2.5 select-none">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-cyan-400" />
              <span className="font-bold text-white uppercase tracking-wider">
                72-Hour Historical Time-Travel Playback
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">
                [870 Snapshots • Joint-05 Transitions Green &rarr; Yellow &rarr; Flashing Red]
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">SCRUBBER:</span>
              <span className="font-black text-cyan-400 bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                {playback.hAgo === 0 ? 'NOW (LIVE)' : `-${playback.hAgo.toFixed(1)} HOURS AGO`}
              </span>
            </div>
          </div>

          {/* Slider with visual degrade indicators */}
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="72"
              step="0.1"
              value={playback.hAgo}
              onChange={handleSliderChange}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
          </div>

          {/* Scrubber Timeline Markers */}
          <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> -72h (Optimal: 95%)
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> -36h (Elevated Wear: 68%)
            </span>
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" /> 0h (Current Critical: 32%)
            </span>
          </div>

          {/* Playback Controls & Speed Toggles */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStep('backward')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Step Back 1h"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => dispatch(setPlaybackPlaying(!playback.playing))}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  playback.playing
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                }`}
              >
                {playback.playing ? <Pause size={13} /> : <Play size={13} />}
                <span>{playback.playing ? 'PAUSE' : 'PLAY REPLAY'}</span>
              </button>

              <button
                onClick={() => handleStep('forward')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Step Forward 1h"
              >
                <SkipForward size={14} />
              </button>
            </div>

            {/* Speed Buttons */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase">Speed:</span>
              {[1, 5, 20].map(rate => (
                <button
                  key={rate}
                  onClick={() => dispatch(setPlaybackRate(rate))}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    playback.rate === rate
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Telemetry Overlay Drawer (Collapsible Right Panel) ────────── */}
        {drawerOpen && selectedJoint && (
          <div className="absolute top-4 right-4 bottom-32 w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto z-20 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-cyan-400" />
                  <h4 className="text-xs font-mono font-bold uppercase text-white">
                    Splice Telemetry Drawer
                  </h4>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Joint Title & Health Metric */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 mb-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-mono font-bold text-white">{selectedJoint.name || selectedJoint.label}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      selectedJoint.status === 'CRITICAL'
                        ? 'bg-red-600 text-white animate-pulse'
                        : selectedJoint.status === 'ELEVATED_WEAR'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {selectedJoint.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">HEALTH SCORE</div>
                    <div className={`text-lg font-black mt-0.5 ${selectedJoint.health <= 45 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {selectedJoint.health}%
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">RUL PROJECTION</div>
                    <div className={`text-lg font-black mt-0.5 ${selectedJoint.health <= 45 ? 'text-red-400' : 'text-white'}`}>
                      {selectedJoint.rulDays || 6.0} Days
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Multi-Transducer Grid */}
              <div className="space-y-2 text-xs font-mono mb-3">
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Vibration Overall RMS:</span>
                  <span className={`font-bold ${selectedJoint.vibrationRms > 7.1 ? 'text-red-400' : 'text-white'}`}>
                    {selectedJoint.vibrationRms} mm/s
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Infrared Pyrometer:</span>
                  <span className="font-bold text-amber-300">{selectedJoint.pyrometerTemp || 74.5} °C</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Ultrasonic Belt Thickness:</span>
                  <span className="font-bold text-white">{selectedJoint.beltThickness || 16.2} mm</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400">Acoustic Emission:</span>
                  <span className="font-bold text-white">{selectedJoint.acousticEmission || 78.4} dB</span>
                </div>
              </div>

              {/* Projected Degradation Curve */}
              <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">
                  Degradation Projection Trend
                </div>
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={rulTrendData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 8 }} />
                      <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 8 }} />
                      <Area
                        type="monotone"
                        dataKey="health"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span>Kalman Sync: 20Hz</span>
              <span className="text-cyan-400 font-bold">ACCURACY 94.2%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
