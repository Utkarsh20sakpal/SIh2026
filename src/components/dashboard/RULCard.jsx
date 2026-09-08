import React from 'react'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Clock, TrendingDown, Info } from 'lucide-react'
import { cn } from '../../lib/utils'

export function RULCard({ hours, pct, confidence, wearRate, factors, className }) {
  const variant = pct > 60 ? 'healthy' : pct > 30 ? 'warning' : 'critical'
  const color =
    variant === 'healthy'
      ? 'text-healthy'
      : variant === 'warning'
      ? 'text-warning'
      : 'text-critical'

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-sm p-4 flex flex-col justify-between',
        className
      )}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-accent" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
              Remaining Useful Life (RUL)
            </h4>
          </div>
          <Badge variant={variant}>ESTIMATED {variant.toUpperCase()}</Badge>
        </div>

        {/* Primary RUL Metric */}
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className={cn('text-4xl font-bold font-mono-nums leading-none', color)}>
              {hours}
            </span>
            <span className="text-xs text-text-muted font-mono uppercase font-semibold">
              HOURS
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-text-secondary font-bold">
              {pct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-text-muted block font-mono">DESIGN LIFE</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <Progress value={pct} max={100} variant={variant} />
        </div>

        {/* Confidence & Wear Rate */}
        <div className="flex items-center justify-between text-[11px] text-text-muted font-mono border-t border-border/40 pt-2.5 mb-3">
          <span>
            MODEL CONFIDENCE:{' '}
            <span className="text-foreground font-bold">{confidence}%</span>
          </span>
          <span className="flex items-center gap-1 text-text-secondary">
            <TrendingDown size={11} className="text-warning" />
            WEAR RATE: <span className="text-foreground">{wearRate}</span>
          </span>
        </div>
      </div>

      {/* RUL Fusion Breakdown */}
      {factors && factors.length > 0 && (
        <div className="border-t border-border/60 pt-3 bg-surface-elevated/40 -mx-4 -mb-4 p-4 rounded-b-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
              PREDICTIVE FUSION FACTORS (prd.md §9)
            </span>
            <span className="text-[9px] font-mono text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
              <Info size={10} /> HEURISTIC WEIGHTED
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {factors.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[11px] font-mono bg-surface/70 px-2 py-1 rounded-sm border border-border/40"
              >
                <span className="text-text-secondary text-[10px]">{f.name}</span>
                <span className="text-foreground font-semibold text-[10px]">{f.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
