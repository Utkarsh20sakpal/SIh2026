import React from 'react'
import { cn } from '../../lib/utils'

const base = 'inline-flex items-center justify-center rounded-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer'

const variants = {
  default:     'bg-accent text-[#0B1117] font-semibold hover:bg-accent/90 active:scale-[0.98]',
  secondary:   'bg-surface-elevated text-text border border-border hover:bg-border/60 hover:text-white active:scale-[0.98]',
  ghost:       'text-text-secondary hover:text-text hover:bg-surface-elevated active:scale-[0.98]',
  destructive: 'bg-critical text-white font-semibold hover:bg-critical/90 active:scale-[0.98]',
  outline:     'border border-border text-text hover:bg-surface-elevated hover:border-accent/40 active:scale-[0.98]',
  link:        'text-accent underline-offset-4 hover:underline p-0 h-auto',
}

const sizes = {
  xs:   'px-2 py-1 text-[10px] h-6',
  sm:   'px-2.5 py-1 text-xs h-7',
  md:   'px-3.5 py-1.5 text-xs h-8',
  lg:   'px-4 py-2 text-sm h-9',
  icon: 'h-8 w-8 p-0',
  iconSm: 'h-7 w-7 p-0',
}

export function Button({ variant = 'default', size = 'md', className, children, ...props }) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
