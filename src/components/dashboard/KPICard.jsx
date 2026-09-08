import React from 'react'
import { cn, statusToVariant } from '../../lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import * as Icons from 'lucide-react'

const VARIANT_BORDER = {
  healthy: 'border-l-healthy',
  warning: 'border-l-warning',
  critical: 'border-l-critical',
  neutral: 'border-l-border',
}

const STATUS_COLOR = {
  healthy: 'text-healthy',
  warning: 'text-warning',
  critical: 'text-critical',
  neutral: 'text-text-muted',
}

const DOT_COLOR = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  neutral: '#6F7D89',
}

function TrendIcon({ trend }) {
  if (!trend) return null
  const lower = String(trend).toLowerCase()
  if (lower.startsWith('+') || lower === 'rising' || lower === 'elevating')
    return <TrendingUp size={11} className="text-warning" />
  if (lower.startsWith('-') || lower === 'falling')
    return <TrendingDown size={11} className="text-healthy" />
  return <Minus size={11} className="text-text-muted" />
}

export function KPICard({
  icon,
  title,
  value,
  unit,
  status,
  statusLabel,
  trend,
  sub,
  confidence,
  className,
}) {
  const v = statusToVariant(status)
  const LucideIcon = Icons[icon] ?? Icons.Activity
  const dotColor = DOT_COLOR[v] ?? DOT_COLOR.neutral
  const statusTextColor = STATUS_COLOR[v] ?? 'text-text-muted'

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-sm p-3.5 flex flex-col justify-between transition-colors border-l-[3px] hover:border-r-border/80',
        VARIANT_BORDER[v] ?? VARIANT_BORDER.neutral,
        v === 'critical' && 'bg-critical/5',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <LucideIcon size={13} className="text-text-muted shrink-0" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono truncate">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              v === 'critical' && 'pulse'
            )}
            style={{ backgroundColor: dotColor }}
            aria-hidden
          />
          <span
            className={cn(
              'text-[9px] font-bold tracking-widest uppercase font-mono',
              statusTextColor
            )}
          >
            {statusLabel ?? status}
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 my-1">
        <span className="text-2xl font-bold text-foreground font-mono-nums tracking-tight leading-none">
          {value}
        </span>
        {unit && (
          <span className="text-[11px] font-mono text-text-muted font-medium uppercase">
            {unit}
          </span>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-1 text-[10px]">
        <span className="text-text-muted truncate font-sans">{sub ?? ''}</span>
        {trend && (
          <div className="flex items-center gap-1 text-text-secondary font-mono shrink-0 ml-2">
            <TrendIcon trend={trend} />
            <span>{trend}</span>
          </div>
        )}
      </div>

      {confidence !== undefined && (
        <div className="text-[9px] text-text-muted font-mono mt-0.5">
          CONFIDENCE: <span className="text-text-secondary">{confidence}%</span>
        </div>
      )}
    </div>
  )
}
