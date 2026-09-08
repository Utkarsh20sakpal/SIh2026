import React, { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

export function Dialog({ open, onClose, title, description, children, className }) {
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="absolute inset-0 bg-[rgba(15,20,25,0.75)]" onClick={onClose} />
      <div ref={ref} className={cn('relative z-10 bg-elevated border border-border rounded-md p-6 max-w-md w-full mx-4 shadow-2xl', className)}>
        {title && <h2 id="dialog-title" className="text-base font-semibold text-text mb-1">{title}</h2>}
        {description && <p className="text-xs text-muted mb-4">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, title, side='right', children, className }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const sideClass = side === 'right'
    ? 'right-0 top-0 h-full w-[380px] max-w-full border-l'
    : 'left-0 top-0 h-full w-[340px] max-w-full border-r'
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
      <div className="absolute inset-0 bg-[rgba(15,20,25,0.6)]" onClick={onClose} />
      <div className={cn('absolute bg-elevated border-border flex flex-col', sideClass, className)}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          {title && <h2 id="sheet-title" className="text-sm font-semibold text-text">{title}</h2>}
          <button onClick={onClose} aria-label="Close panel"
            className="text-muted hover:text-text transition-colors ml-auto text-lg leading-none">×</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
