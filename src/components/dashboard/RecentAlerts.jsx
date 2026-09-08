import React from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { ExternalLink, AlertTriangle, ChevronRight } from 'lucide-react'

const SEV_COLOR = {
  CRITICAL: 'text-critical',
  WARNING: 'text-warning',
  NORMAL: 'text-healthy',
}

const SEV_BADGE = {
  CRITICAL: 'bg-critical/15 border-critical/30 text-critical',
  WARNING: 'bg-warning/15 border-warning/30 text-warning',
  NORMAL: 'bg-healthy/15 border-healthy/30 text-healthy',
}

export function RecentAlerts({ alerts, className }) {
  const navigate = useNavigate()
  const displayed = alerts.slice(0, 4)

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-sm p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-warning" />
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
            Live Anomaly & Fault Feed
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/alerts')}
          className="text-accent text-[10px] font-mono uppercase tracking-wider gap-1 h-6 px-2 hover:bg-surface-elevated"
        >
          View All Logs <ExternalLink size={10} />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {displayed.map(a => (
          <div
            key={a.id}
            onClick={() => navigate('/alerts')}
            className={cn(
              'flex items-center justify-between gap-3 px-3 py-2 rounded-sm border cursor-pointer transition-colors',
              'bg-surface-elevated/40 border-border hover:border-accent/40 hover:bg-surface-elevated',
              a.severity === 'CRITICAL' && 'border-l-2 border-l-critical bg-critical/5'
            )}
          >
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    'text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border uppercase tracking-wider',
                    SEV_BADGE[a.severity] ?? 'bg-border text-text-muted'
                  )}
                >
                  {a.severity}
                </span>
                <span className="text-[10px] font-mono text-text-muted">
                  {a.time}
                </span>
                {a.source && (
                  <span className="text-[10px] font-mono text-text-muted truncate">
                    • {a.source}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  'text-[9px] font-bold font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border',
                  a.status === 'ACTIVE'
                    ? 'text-warning border-warning/30 bg-warning/10'
                    : 'text-healthy border-healthy/30 bg-healthy/10'
                )}
              >
                {a.status}
              </span>
              <ChevronRight size={13} className="text-text-muted" />
            </div>
          </div>
        ))}

        {displayed.length === 0 && (
          <p className="text-xs font-mono text-text-muted text-center py-4">
            NO ACTIVE ANOMALIES RECORDED
          </p>
        )}
      </div>
    </div>
  )
}
