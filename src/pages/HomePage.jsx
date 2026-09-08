import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  LayoutDashboard,
  Layers,
  Eye,
  Radio,
  Bell,
  FileText,
  Settings,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  ArrowRight,
  BookOpen,
} from 'lucide-react'

const FEATURES = [
  {
    icon: LayoutDashboard,
    to: '/dashboard',
    title: 'Command Dashboard',
    desc: 'Live conveyor synoptic schematic, real-time telemetry matrix, composite health gauge, and RUL prediction.',
    badge: 'LIVE',
    bv: 'accent',
  },
  {
    icon: Layers,
    to: '/digital-twin',
    title: '3D Digital Twin',
    desc: 'WebGL Three.js physics simulation with real-time splice telemetry, 72-hour historical replay, and camera presets.',
    badge: '3D GL',
    bv: 'accent',
  },
  {
    icon: Eye,
    to: '/vision-monitoring',
    title: 'Vision Monitoring',
    desc: 'YOLOv8 belt surface defect detection with bounding-box overlay, optical telemetry, and defect ledger.',
    badge: 'YOLOv8',
    bv: 'neutral',
  },
  {
    icon: Radio,
    to: '/sensor-health',
    title: 'Sensor Health',
    desc: 'Multi-channel instrumentation matrix, signal quality diagnostics, and 4-channel oscilloscope waveforms.',
    badge: '18 CH',
    bv: 'healthy',
  },
  {
    icon: Bell,
    to: '/alerts',
    title: 'Alerts & AI Diagnostics',
    desc: 'GenAI RAG failure reasoning (What, Why, Prevention), rolling 5-min MongoDB ledger, and Excel export.',
    badge: 'RAG AI',
    bv: 'warning',
  },
  {
    icon: FileText,
    to: '/reports',
    title: 'Shift Audits & Reports',
    desc: 'Automated ISO maintenance audits, conveyor performance reports, and multi-format telemetry downloads.',
    badge: 'ISO AUDIT',
    bv: 'neutral',
  },
]

const ARCH = [
  { icon: Cpu, label: 'Sensor Telemetry', sub: 'Firestore 1-sec streaming' },
  { icon: Eye, label: 'Vision AI', sub: 'YOLOv8 defect bounding' },
  { icon: Activity, label: 'Anomaly Isolation', sub: 'Isolation Forest engine' },
  { icon: ShieldCheck, label: 'Predictive RUL', sub: 'Multi-factor fusion' },
  { icon: Zap, label: 'RAG Reasoning', sub: 'LangChain + Pinecone' },
]

export default function HomePage() {
  const nav = useNavigate()

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Hero */}
      <div className="bg-surface border border-border rounded-sm p-6 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-surface-elevated border border-border flex items-center justify-center text-accent">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground tracking-wider font-mono uppercase">
                SmartConveyor / Shield
              </h1>
              <Badge variant="accent">v1.0-COMMERCIAL</Badge>
            </div>
            <p className="text-[11px] font-mono text-text-muted">
              INTELLIGENT CONVEYOR BELT INTEGRITY &amp; PREDICTIVE MAINTENANCE SUITE
            </p>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed max-w-2xl font-sans mt-1">
          Designed for control room operators and predictive maintenance engineers in iron ore mining.
          Synthesizes continuous strain, tri-axial vibration, infrared thermal imagery, optical line-scan computer vision,
          and LangChain GenAI root cause analysis into a unified industrial command center.
        </p>

        <div className="flex gap-2.5 flex-wrap mt-2">
          <Button onClick={() => nav('/dashboard')} className="gap-1.5 font-mono text-xs">
            <LayoutDashboard size={13} /> Open Command Dashboard <ArrowRight size={12} />
          </Button>
          <Button
            variant="secondary"
            onClick={() => nav('/digital-twin')}
            className="gap-1.5 font-mono text-xs"
          >
            <Layers size={13} /> Launch 3D Digital Twin
          </Button>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
            OPERATIONAL SUBSYSTEMS &amp; MODULES
          </span>
          <span className="text-[9px] font-mono text-text-muted">6 ACTIVE CONSOLES</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map(f => (
            <button
              key={f.to}
              onClick={() => nav(f.to)}
              className="text-left bg-surface border border-border hover:border-accent/50 rounded-sm p-4 flex flex-col gap-2 transition-all group hover:bg-surface-elevated/40"
            >
              <div className="flex items-center justify-between">
                <f.icon size={15} className="text-accent" />
                <Badge variant={f.bv}>{f.badge}</Badge>
              </div>
              <p className="text-xs font-bold text-foreground font-mono group-hover:text-accent transition-colors uppercase tracking-wider">
                {f.title}
              </p>
              <p className="text-[11px] text-text-muted leading-relaxed font-sans">{f.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Architecture Pipeline */}
      <div className="bg-surface border border-border rounded-sm p-4">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono block mb-3">
          DATA FLOW &amp; ML INFERENCE PIPELINE
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {ARCH.map((a, i) => (
            <React.Fragment key={a.label}>
              <div className="flex flex-col items-center gap-1 bg-surface-elevated border border-border rounded-sm px-3 py-2 min-w-[120px]">
                <a.icon size={14} className="text-accent" />
                <p className="text-[11px] text-foreground font-mono font-bold text-center">
                  {a.label}
                </p>
                <p className="text-[10px] text-text-muted font-sans text-center">{a.sub}</p>
              </div>
              {i < ARCH.length - 1 && (
                <div className="self-center text-text-muted/60 font-mono text-xs px-1">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
