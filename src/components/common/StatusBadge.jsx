import React from 'react'
import { cn } from '../../lib/utils'
import { statusToVariant } from '../../lib/utils'

const dotColor = {
  healthy: '#22C55E', warning: '#F59E0B', critical: '#EF4444',
  neutral: '#64748B', accent: '#22D3EE', acknowledged: '#38BDF8',
}

export function StatusBadge({ status, label, showDot=true, className }) {
  const v = statusToVariant(status)
  const color = dotColor[v] ?? dotColor.neutral
  const text = label ?? status
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase font-mono-nums',
      className
    )}>
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', v === 'critical' && 'pulse')}
              style={{ background: color }} aria-hidden />
      )}
      <span style={{ color }}>{text}</span>
    </span>
  )
}
