import React from 'react'
import { cn } from '../../lib/utils'

const variants = {
  healthy:      'bg-healthy/10 text-healthy border-healthy/30',
  warning:      'bg-warning/10 text-warning border-warning/30',
  critical:     'bg-critical/10 text-critical border-critical/30',
  neutral:      'bg-surface-elevated text-text-muted border-border',
  accent:       'bg-accent/10 text-accent border-accent/30',
  info:         'bg-info/10 text-info border-info/30',
  acknowledged: 'bg-accent/10 text-accent border-accent/25',
}

export function Badge({ variant = 'neutral', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-semibold tracking-wider uppercase border font-mono-nums leading-normal select-none',
        variants[variant] ?? variants.neutral,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
