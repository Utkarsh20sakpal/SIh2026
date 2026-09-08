import React from 'react'
import { cn, statusToVariant, fmt } from '../../lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ResponsiveContainer, LineChart, Line } from 'recharts'

const DOT_COLOR = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  neutral: '#6F7D89',
}

const STATUS_TEXT = {
  healthy: 'text-healthy',
  warning: 'text-warning',
  critical: 'text-critical',
  neutral: 'text-text-muted',
}

export function SensorCard({
  id,
  name,
  location,
  reading,
  unit,
  status,
  trend,
  lastUpdated,
  spark,
  health,
  className,
}) {
  const v = statusToVariant(status)
  const dotColor = DOT_COLOR[v] ?? DOT_COLOR.neutral
  const sparkData = spark?.map((v, i) => ({ i, v })) ?? []
  
  const TrendIcon =
    trend === 'rising' || trend === 'elevating' ? (
      <TrendingUp size={11} className="text-warning" />
    ) : trend === 'falling' ? (
      <TrendingDown size={11} className="text-healthy" />
    ) : (
      <Minus size={11} className="text-text-muted" />
    )

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-sm p-3 flex flex-col justify-between transition-colors hover:border-border/90',
        v === 'critical' && 'border-critical/40 bg-critical/5',
        v === 'warning' && 'border-warning/30',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{name}</p>
          <p className="text-[10px] text-text-muted truncate font-sans">{location}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={cn('w-1.5 h-1.5 rounded-full', v === 'critical' && 'pulse')}
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
          <span
            className={cn(
              'text-[9px] font-mono font-bold tracking-wider uppercase',
              STATUS_TEXT[v] ?? 'text-text-muted'
            )}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Reading & Unit */}
      <div className="flex items-baseline justify-between my-1">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-mono-nums text-foreground leading-none">
            {fmt.num(reading, 2)}
          </span>
          <span className="text-[10px] font-mono text-text-muted uppercase">
            {unit}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-mono">
          {TrendIcon}
          <span className="capitalize text-text-secondary text-[9px]">{trend}</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparkData.length > 0 && (
        <div className="h-7 my-1 w-full opacity-90">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                dot={false}
                strokeWidth={1.5}
                stroke={v === 'critical' ? '#EF4444' : v === 'warning' ? '#F59E0B' : '#22D3EE'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Meta info footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-1 text-[9px] font-mono text-text-muted">
        <span>{id}</span>
        <span className="text-text-secondary">HLTH {health}%</span>
      </div>
    </div>
  )
}
