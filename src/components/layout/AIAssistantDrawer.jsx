import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setAIOpen } from '../../store/slices/uiSlice'
import { Bot, X, Send, User, Sparkles, Terminal } from 'lucide-react'
import { cn } from '../../lib/utils'

const INITIAL = [
  {
    role: 'assistant',
    text: 'SmartConveyor AI Diagnostics Online. Connected to LangChain RAG & Pinecone vector knowledge base. Ask about splice joint health, anomaly scores, or preventative maintenance procedures.',
  },
]

async function getAIResponse(msg, context) {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
  const lower = msg.toLowerCase()
  if (lower.includes('joint') || lower.includes('j-04'))
    return 'CRITICAL DIAGNOSIS: Joint J-04 shows active top-cover delamination spanning 180mm at the leading edge. RUL is 3 days 8 hours. Immediate engineering recommendation: throttle belt speed to ≤1.8 m/s and execute cold-bond step splice repair during next scheduled downtime.'
  if (lower.includes('vibrat'))
    return 'TELEMETRY ANALYSIS: Bearing B-02 shows elevated vibration at 4.62 mm/s. Fast Fourier Transform (FFT) harmonics indicate early-stage roller bearing race fatigue. Recommend dynamic laser alignment and greasing.'
  if (lower.includes('rul') || lower.includes('remaining'))
    return 'PREDICTIVE FUSION: Current overall RUL is 147 hours (91% confidence). Derived from Isolation Forest anomaly score (0.04), YOLOv8 optical damage severity (0.12), and dynamic load telemetry.'
  if (lower.includes('temp') || lower.includes('gearbox'))
    return 'THERMAL REPORT: Gearbox sump temperature is 48.2°C, rising at +0.4°C per 15 min. Max continuous limit is 55°C. Check lubrication viscosity and cooling fan shroud.'
  return `Analyzing query "${msg}" against ISO 15236 belting standards and historical failure telemetry. Monitoring: 1 CRITICAL delamination on J-04, 2 WARNING vibration excursions. Would you like a repair procedure checklist?`
}

const QUICK_PROMPTS = [
  'What is the status of Joint J-04?',
  'Explain bearing vibration anomaly',
  'How was RUL 147 hours calculated?',
]

export function AIAssistantDrawer() {
  const dispatch = useDispatch()
  const open = useSelector(s => s.ui.aiOpen)
  const conveyor = useSelector(s => s.telemetry.conveyor)
  const [messages, setMessages] = useState(INITIAL)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(textToSend) {
    const txt = (textToSend || input).trim()
    if (!txt) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: txt }])
    setLoading(true)
    try {
      const reply = await getAIResponse(txt, { conveyor })
      setMessages(m => [...m, { role: 'assistant', text: reply }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed top-0 right-0 h-screen w-96 max-w-full z-50 flex flex-col bg-[#101820] border-l border-border shadow-overlay"
      role="complementary"
      aria-label="AI Diagnostics Assistant"
    >
      {/* ── Drawer Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[#0B1117] shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-sm bg-accent/15 text-accent border border-accent/30">
            <Sparkles size={14} />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground font-mono tracking-wider block">
              AI DIAGNOSTIC COPILOT
            </span>
            <span className="text-[9px] font-mono text-text-muted">
              RAG • PINECONE • LANGCHAIN
            </span>
          </div>
        </div>

        <button
          onClick={() => dispatch(setAIOpen(false))}
          aria-label="Close assistant"
          className="text-text-muted hover:text-foreground p-1 rounded-sm hover:bg-surface transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Quick Diagnostic Queries ───────────────────────────────── */}
      <div className="px-3 py-2 border-b border-border bg-surface-elevated/40 flex flex-wrap gap-1.5 shrink-0">
        <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider w-full mb-0.5">
          QUICK QUERIES:
        </span>
        {QUICK_PROMPTS.map(qp => (
          <button
            key={qp}
            onClick={() => handleSend(qp)}
            className="text-[10px] font-mono text-text-secondary bg-surface border border-border px-2 py-1 rounded-sm hover:border-accent/40 hover:text-accent transition-colors text-left truncate max-w-full"
          >
            ✦ {qp}
          </button>
        ))}
      </div>

      {/* ── Chat Messages Stream ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}
          >
            <div
              className={cn(
                'shrink-0 w-6 h-6 rounded-sm flex items-center justify-center text-[10px] font-mono font-bold',
                m.role === 'user'
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'bg-surface-elevated text-text-secondary border border-border'
              )}
            >
              {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
            </div>

            <div
              className={cn(
                'max-w-[85%] px-3.5 py-2.5 rounded-sm text-xs leading-relaxed font-sans',
                m.role === 'user'
                  ? 'bg-accent/15 border border-accent/30 text-foreground font-medium'
                  : 'bg-surface border border-border text-foreground'
              )}
            >
              <div className="text-[9px] font-mono text-text-muted mb-1 uppercase tracking-wider">
                {m.role === 'user' ? 'OPERATOR DISPATCH' : 'AI REASONING ENGINE'}
              </div>
              <p className="whitespace-pre-wrap">{m.text}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-6 h-6 rounded-sm bg-surface-elevated border border-border flex items-center justify-center">
              <Bot size={12} className="text-accent animate-pulse" />
            </div>
            <div className="bg-surface border border-border rounded-sm px-3 py-2 text-[11px] font-mono text-accent flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              Synthesizing failure mechanics from Pinecone...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Chat Input ────────────────────────────────────────────── */}
      <div className="p-3 border-t border-border bg-[#0B1117] shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={2}
            placeholder="Ask AI Copilot about belt sensors, splice J-04, vibration..."
            className="flex-1 bg-surface border border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-text-muted/70 resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Send query"
            className="p-2.5 rounded-sm bg-accent text-[#0B1117] font-bold hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-text-muted">
          <span>PRESS ENTER TO SUBMIT</span>
          <span>LANGCHAIN v0.2</span>
        </div>
      </div>
    </div>
  )
}
