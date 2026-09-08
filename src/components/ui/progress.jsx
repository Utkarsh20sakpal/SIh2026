import React from 'react'
import { cn } from '../../lib/utils'

export function Progress({ value=0, max=100, variant='accent', className, showLabel=false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = variant==='healthy' ? 'bg-healthy' : variant==='warning' ? 'bg-warning' : variant==='critical' ? 'bg-critical' : 'bg-accent'
  return (
    <div className={cn('relative w-full h-2 bg-border rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width:`${pct}%` }} />
      {showLabel && <span className="absolute right-0 -top-5 text-[10px] text-muted font-mono-nums">{pct.toFixed(0)}%</span>}
    </div>
  )
}

export function Separator({ className, orientation='horizontal', ...p }) {
  return <div className={cn('bg-border', orientation==='horizontal' ? 'h-px w-full' : 'w-px h-full', className)} {...p} />
}
