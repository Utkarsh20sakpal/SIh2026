import React from 'react'
import { cn } from '../../lib/utils'

export function Input({ className, label, id, error, ...p }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs text-muted font-medium">{label}</label>}
      <input
        id={id}
        className={cn(
          'bg-surface border border-border rounded px-3 py-1.5 text-sm text-text placeholder:text-muted/60',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors',
          error && 'border-critical focus:ring-critical',
          className
        )}
        {...p}
      />
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}

export function Select({ className, label, id, children, ...p }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label htmlFor={id} className="text-xs text-muted font-medium">{label}</label>}
      <select
        id={id}
        className={cn(
          'bg-surface border border-border rounded px-3 py-1.5 text-sm text-text',
          'focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors appearance-none',
          className
        )}
        {...p}
      >
        {children}
      </select>
    </div>
  )
}

export function Switch({ checked, onChange, id, label, description }) {
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        role="switch" aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 h-5 w-9 rounded-full border-2 transition-colors mt-0.5',
          checked ? 'bg-accent border-accent' : 'bg-border border-border'
        )}
      >
        <span className={cn(
          'absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5'
        )} />
      </button>
      {label && (
        <div>
          <label htmlFor={id} className="text-sm text-text cursor-pointer">{label}</label>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      )}
    </div>
  )
}

export function Slider({ value, min=0, max=100, step=1, onChange, className }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className={cn('w-full accent-accent h-1.5 cursor-pointer', className)}
    />
  )
}
