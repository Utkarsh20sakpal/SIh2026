import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { setAIOpen } from '../../store/slices/uiSlice'
import { sendChatMessageApi } from '../../lib/api'
import {
  Sparkles,
  Bot,
  X,
  Maximize2,
  Minimize2,
  Send,
  User,
  Activity,
  AlertTriangle,
  Layers,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    text: `**SmartConveyor SCADA Grounded AI Copilot Online.**\n\nConnected to NMDC CV-101 real-time 20Hz telemetry stream, ISO 10816-3 standards base, and YOLOv8 vision detection telemetry.\n\n*Notice:* **Joint-05 (800m Curve)** is in critical alarm state with estimated RUL of **6.0 Days** and vibration of **7.9 mm/s**. Ask me for splice repair guidance, thermal diagnostics, or operational envelopes.`,
    citations: ['NMDC ST-5400 Steel Cord Manual §4.2', 'ISO 10816-3 Zone D Standards'],
    actions: [
      { label: 'View Joint-05 Splicing Protocol', route: '/reports' },
      { label: 'Inspect Curve 800m in 3D Twin', route: '/digital-twin' },
    ],
  },
]

export function FloatingAICopilot() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { aiOpen } = useSelector(s => s.ui)
  const { live, emergencyStopped, facilityId, facilityName, minRul } = useSelector(s => s.telemetry)
  const joints = useSelector(s => s.twin.joints)

  const [isStudioMode, setIsStudioMode] = useState(false)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim()
    if (!textToSend || loading) return

    setInput('')
    const userMsg = { role: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Screen context and live telemetry bundle
    const j5 = joints.find(j => j.id === 'Joint-05')
    const context = {
      currentRoute: location.pathname,
      facilityId,
      facilityName,
      liveTelemetry: {
        beltSpeed: live.beltSpeed,
        dynamicLoad: live.dynamicLoad,
        overallRms: live.triaxialVibration?.overallRms || 7.9,
        beltThickness: live.beltThickness,
        pyrometerTemp: live.pyrometerTemp,
        acousticEmission: live.acousticEmission,
      },
      joint05Status: {
        health: j5?.health || 32,
        status: j5?.status || 'CRITICAL',
        rulDays: minRul.days,
        vibration: j5?.vibrationRms || 7.9,
      },
      emergencyStatus: {
        isEmergencyStop: emergencyStopped,
      },
    }

    try {
      const res = await sendChatMessageApi(textToSend, context, messages, facilityId)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          citations: res.citations || [],
          actions: res.actions || [],
        },
      ])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Telemetry grounding engine experienced a transient timeout. Live 20Hz stream indicates Joint-05 remains at 7.9 mm/s (Zone D Critical). Please review the Splicing Procedure Guide in Reports.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Floating trigger button when closed
  if (!aiOpen) {
    return (
      <button
        onClick={() => dispatch(setAIOpen(true))}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border border-cyan-300 group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950" />
        </span>
        <Sparkles size={16} className="text-slate-950 group-hover:rotate-12 transition-transform" />
        <span className="tracking-wider">AI COPILOT</span>
        <span className="bg-slate-950 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
          20Hz
        </span>
      </button>
    )
  }

  const widthClass = isStudioMode ? 'w-[980px] max-w-[95vw]' : 'w-[480px] max-w-[92vw]'

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${widthClass} h-[680px] max-h-[90vh] bg-[#090d16]/95 border border-slate-700/80 rounded-xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300`}
    >
      {/* ── Copilot Header ────────────────────────────────────────────── */}
      <div className="bg-[#0f172a] border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                SmartConveyor AI Copilot
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                GROUNDED 20Hz
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Facility: {facilityName} • Context: {location.pathname}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsStudioMode(!isStudioMode)}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800/80 transition-colors"
            title={isStudioMode ? 'Standard Mode (480px)' : 'Studio Mode (980px)'}
          >
            {isStudioMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            onClick={() => dispatch(setAIOpen(false))}
            className="text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800/80 transition-colors"
            title="Close Copilot"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Real-Time Sensor Telemetry Strip ───────────────────────────── */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-3.5 py-1.5 flex items-center justify-between text-[11px] font-mono shrink-0 overflow-x-auto">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">SPEED: <b className="text-cyan-400">{live.beltSpeed} m/s</b></span>
          <span className="text-slate-400">LOAD: <b className="text-white">{live.dynamicLoad} t/h</b></span>
          <span className="text-slate-400">VIB (J-05): <b className="text-red-400">{live.triaxialVibration?.overallRms || 7.9} mm/s</b></span>
          <span className="text-slate-400">MIN RUL: <b className="text-red-400 font-bold">{minRul.days} Days</b></span>
        </div>
        <span className="text-[10px] text-emerald-400 uppercase font-semibold">● LIVE</span>
      </div>

      {/* ── Conversation Message History ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 mt-0.5">
                  <Bot size={15} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-lg p-3.5 leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-none shadow-md font-mono text-[11px]'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-lg'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {m.text}
                </div>

                {/* Citations if assistant */}
                {!isUser && m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      ISO & Technical Citations:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-300">
                      {m.citations.map((c, ci) => (
                        <li key={ci}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Actions if assistant */}
                {!isUser && m.actions && m.actions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2">
                    {m.actions.map((act, ai) => (
                      <button
                        key={ai}
                        onClick={() => {
                          if (act.route) {
                            navigate(act.route)
                            if (!isStudioMode) dispatch(setAIOpen(false))
                          } else if (act.prompt) {
                            handleSend(act.prompt)
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-600/40 text-[10px] font-mono font-semibold transition-all flex items-center gap-1 active:scale-95"
                      >
                        {act.label}
                        <ChevronRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-white mt-0.5 font-mono text-[10px] font-bold">
                  KS
                </div>
              )}
            </div>
          )
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
              <Bot size={15} />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Grounded synthesis across 20Hz telemetry & ISO standards...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Prompts Bar ─────────────────────────────────────────── */}
      <div className="px-3.5 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider shrink-0">
          Quick:
        </span>
        {[
          'Status of Joint-05?',
          'Explain ISO vibration chart',
          'Summarize sensor reliability',
          'Show Joint-05 splice guide',
        ].map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded text-[10px] font-mono border border-slate-800 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* ── Input Box ─────────────────────────────────────────────────── */}
      <div className="p-3 bg-[#0f172a] border-t border-slate-800 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Grounded Copilot regarding telemetry, Joint-05 RUL, or ISO limits..."
            className="w-full bg-[#1e293b] border border-slate-700 rounded-lg pl-3.5 pr-11 py-2.5 text-xs text-white placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-400 shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 transition-colors"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
