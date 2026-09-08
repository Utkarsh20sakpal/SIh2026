import React from 'react'
import { cn } from '../../lib/utils'

export function Table({ className, children }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full text-xs border-collapse', className)}>{children}</table>
    </div>
  )
}

export function TableHeader({ className, children }) {
  return (
    <thead className={cn('bg-surface-elevated/70 border-b border-border sticky top-0 z-10', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children }) {
  return <tbody className={cn('divide-y divide-border/40', className)}>{children}</tbody>
}

export function TableRow({ className, onClick, children }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-100',
        onClick && 'cursor-pointer hover:bg-surface-elevated/60',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children, ...props }) {
  return (
    <th
      className={cn(
        'px-3.5 py-2.5 text-left text-[10px] font-semibold text-text-muted tracking-wider uppercase font-mono select-none',
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td className={cn('px-3.5 py-2.5 text-text align-middle', className)} {...props}>
      {children}
    </td>
  )
}
