import React from 'react'
import { cn } from '../../lib/utils'

export function Card({ className, children, ...p }) {
  return (
    <div
      className={cn(
        'rounded-sm bg-surface border border-border',
        className
      )}
      {...p}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...p }) {
  return (
    <div className={cn('px-4 pt-4 pb-3 border-b border-border/60', className)} {...p}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...p }) {
  return (
    <h3
      className={cn(
        'text-xs font-bold text-foreground uppercase tracking-wider font-mono',
        className
      )}
      {...p}
    >
      {children}
    </h3>
  )
}

export function CardContent({ className, children, ...p }) {
  return (
    <div className={cn('px-4 py-4', className)} {...p}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...p }) {
  return (
    <div
      className={cn('px-4 pb-3 border-t border-border/60 pt-3', className)}
      {...p}
    >
      {children}
    </div>
  )
}
