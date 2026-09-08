import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setDetailsSheet, selectJoint } from '../../store/slices/twinSlice'
import { Sheet } from '../ui/dialog'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { statusToVariant } from '../../lib/utils'

const STATUS_LABELS = {
  OPTIMAL:               { label:'Optimal',              variant:'healthy' },
  ELEVATED_WEAR:         { label:'Elevated Wear',         variant:'warning' },
  CRITICAL_DELAMINATION: { label:'Critical Delamination', variant:'critical' },
}

export function JointDetailsSheet() {
  const dispatch = useDispatch()
  const { detailsSheetOpen, selectedJointId, joints } = useSelector(s => s.twin)
  const joint = joints.find(j => j.id === selectedJointId)

  function close() {
    dispatch(setDetailsSheet(false))
    dispatch(selectJoint(null))
  }

  if (!joint) return null
  const { label, variant } = STATUS_LABELS[joint.status] ?? { label: joint.status, variant:'neutral' }
  const hv = joint.health >= 85 ? 'healthy' : joint.health >= 60 ? 'warning' : 'critical'

  return (
    <Sheet open={detailsSheetOpen} onClose={close} title={`${joint.id} — Joint Inspector`}>
      <div className="flex flex-col gap-4 text-xs">
        {/* ID + status */}
        <div className="flex items-center justify-between bg-surface border border-border rounded px-3 py-2">
          <div>
            <p className="text-[10px] text-muted uppercase tracking-wider">Joint ID</p>
            <p className="text-base font-bold font-mono-nums text-text">{joint.id}</p>
            <p className="text-[10px] text-muted">{joint.label}</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>

        {/* Health */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Joint Health</span>
            <span className="font-mono-nums text-text">{joint.health}%</span>
          </div>
          <Progress value={joint.health} max={100} variant={hv} />
        </div>

        {/* Rupture risk */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Rupture Risk Index</span>
            <span className={`font-mono-nums ${joint.rupRisk >= 70 ? 'text-critical' : joint.rupRisk >= 35 ? 'text-warning' : 'text-healthy'}`}>{joint.rupRisk}%</span>
          </div>
          <Progress value={joint.rupRisk} max={100}
            variant={joint.rupRisk >= 70 ? 'critical' : joint.rupRisk >= 35 ? 'warning' : 'healthy'} />
        </div>

        {/* RUL */}
        <div className="bg-surface border border-border rounded px-3 py-2">
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Remaining Useful Life</p>
          <p className="text-xl font-bold font-mono-nums text-text">{joint.rul}</p>
        </div>

        {/* Live transducer readings */}
        <div>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-2 font-semibold">Live Transducer Readings</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label:'Ultrasonic Thickness', value: joint.thickness },
              { label:'Thermal Core',         value: joint.thermal },
              { label:'Vibration',            value: joint.vibration },
              { label:'Acoustic',             value: joint.acoustic },
            ].map(r => (
              <div key={r.label} className="bg-surface border border-border rounded px-2 py-1.5">
                <p className="text-[10px] text-muted">{r.label}</p>
                <p className="text-sm font-bold font-mono-nums text-text">{r.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence + Issues */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Detection Confidence</span>
            <span className="font-mono-nums text-text">{joint.confidence}%</span>
          </div>
          <div className="bg-surface border border-border rounded px-3 py-2">
            <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Detected Issues</p>
            <p className="text-[11px] text-text leading-relaxed">{joint.issues}</p>
          </div>
        </div>

        {/* Last inspection */}
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Last Inspection</span>
          <span className="font-mono-nums text-text">{joint.lastInspection}</span>
        </div>

        {/* AI Recommendation */}
        <div className={`rounded border px-3 py-2.5 ${
          variant === 'critical' ? 'bg-critical/10 border-critical/25' :
          variant === 'warning' ? 'bg-warning/10 border-warning/25' :
          'bg-healthy/10 border-healthy/25'}`}>
          <p className="text-[10px] text-muted uppercase tracking-wider mb-1 font-semibold">Recommended Action</p>
          <p className="text-[11px] leading-relaxed" style={{
            color: variant==='critical' ? '#EF4444' : variant==='warning' ? '#F59E0B' : '#22C55E'
          }}>{joint.recommendation}</p>
        </div>
      </div>
    </Sheet>
  )
}
