import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'

export function LoadingState({ rows = 3, label = 'Loading telemetry data…' }) {
  return (
    <div className="flex flex-col gap-3 p-5" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-7 bg-border/40 rounded-sm animate-pulse"
          style={{ width: `${88 - i * 10}%`, animationDelay: `${i * 0.1}s` }}
        />
      ))}
      <p className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  )
}

export function EmptyState({ icon, title = 'No Data Available', description, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-14 text-center', className)}>
      {icon && (
        <div className="text-text-muted/30 mb-2">{icon}</div>
      )}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest font-mono mb-1">
          {title}
        </p>
        {description && (
          <p className="text-[11px] text-text-muted/70 max-w-xs leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

export function ErrorState({ message = 'Data retrieval failed.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <div className="w-10 h-10 rounded-sm bg-critical/10 border border-critical/25 flex items-center justify-center">
        <AlertTriangle size={18} className="text-critical" />
      </div>
      <div>
        <p className="text-xs font-bold text-foreground uppercase tracking-wider font-mono mb-1">
          DATA UNAVAILABLE
        </p>
        <p className="text-[11px] text-text-muted">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11px] text-accent border border-accent/30 px-3 py-1.5 rounded-sm hover:bg-accent/10 transition-colors font-mono uppercase tracking-wider"
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4 border-b border-border shrink-0">
      <div className="min-w-0">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-widest font-mono truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-text-muted mt-0.5 leading-normal truncate">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}

export function SectionLabel({ children, className }) {
  return (
    <p className={cn('text-[10px] font-bold text-text-muted uppercase tracking-widest font-mono', className)}>
      {children}
    </p>
  )
}
