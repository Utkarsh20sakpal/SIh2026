import React from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { cn } from '../../lib/utils'

function ChartTooltip({ active, payload, label, unit, thresholdWarn, thresholdCrit }) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  const color =
    val >= thresholdCrit
      ? '#EF4444'
      : val >= thresholdWarn
      ? '#F59E0B'
      : '#22D3EE'

  return (
    <div className="bg-surface-elevated border border-border rounded-sm px-3 py-2 shadow-overlay text-xs font-mono">
      <p className="text-[10px] text-text-muted mb-0.5">{label}</p>
      <p className="font-bold text-sm" style={{ color }}>
        {val} <span className="text-[10px] text-text-muted font-normal">{unit}</span>
      </p>
    </div>
  )
}

export function SensorChart({
  title,
  data,
  dataKey,
  unit,
  color = '#22D3EE',
  thresholdWarn,
  thresholdCrit,
  currentValue,
  className,
}) {
  const currentColor =
    currentValue >= thresholdCrit
      ? '#EF4444'
      : currentValue >= thresholdWarn
      ? '#F59E0B'
      : '#22D3EE'

  return (
    <div
      className={cn(
        'bg-surface border border-border rounded-sm p-4 flex flex-col gap-3',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">
            {title}
          </h4>
          <p className="text-[10px] text-text-muted font-mono">ROLLING 30-MIN WINDOW</p>
        </div>
        <div className="text-right">
          <span
            className="text-lg font-bold font-mono-nums leading-none"
            style={{ color: currentColor }}
          >
            {currentValue !== undefined ? Number(currentValue).toFixed(2) : '--'}
          </span>
          <span className="text-[10px] font-mono text-text-muted ml-1 uppercase">{unit}</span>
        </div>
      </div>

      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="#202C36" strokeDasharray="2 2" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6F7D89', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
              tickLine={false}
              axisLine={{ stroke: '#273542' }}
            />
            <YAxis
              tick={{ fill: '#6F7D89', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={
                <ChartTooltip
                  unit={unit}
                  thresholdWarn={thresholdWarn}
                  thresholdCrit={thresholdCrit}
                />
              }
            />
            {thresholdWarn && (
              <ReferenceLine
                y={thresholdWarn}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `WARN ${thresholdWarn}`,
                  fill: '#F59E0B',
                  fontSize: 8,
                  position: 'right',
                  fontFamily: 'JetBrains Mono',
                }}
              />
            )}
            {thresholdCrit && (
              <ReferenceLine
                y={thresholdCrit}
                stroke="#EF4444"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: `CRIT ${thresholdCrit}`,
                  fill: '#EF4444',
                  fontSize: 8,
                  position: 'right',
                  fontFamily: 'JetBrains Mono',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, fill: color, stroke: '#151E27', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
