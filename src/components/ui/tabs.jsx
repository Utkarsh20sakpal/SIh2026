import React, { useState, Children } from 'react'
import { cn } from '../../lib/utils'

export function Tabs({ defaultValue, children, className }) {
  const [active, setActive] = useState(defaultValue)
  const triggers = [], panels = []
  Children.forEach(children, c => {
    if (c?.type === TabsList) triggers.push(React.cloneElement(c, { active, onSelect: setActive }))
    else if (c?.type === TabsContent) panels.push(c)
  })
  return (
    <div className={cn('', className)}>
      {triggers}
      {panels.find(p => p.props.value === active)}
    </div>
  )
}

export function TabsList({ children, active, onSelect, className }) {
  return (
    <div className={cn('flex gap-1 p-1 bg-surface rounded border border-border w-fit', className)}>
      {Children.map(children, c =>
        c?.type === TabsTrigger ? React.cloneElement(c, { active, onSelect }) : c
      )}
    </div>
  )
}

export function TabsTrigger({ value, children, active, onSelect, className }) {
  const isActive = active === value
  return (
    <button
      role="tab" aria-selected={isActive}
      onClick={() => onSelect(value)}
      className={cn('px-4 py-1.5 text-xs font-medium rounded transition-colors',
        isActive ? 'bg-elevated text-text shadow-sm' : 'text-muted hover:text-text', className)}>
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className }) {
  return <div className={cn('mt-4', className)} role="tabpanel">{children}</div>
}
