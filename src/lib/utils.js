import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) { return twMerge(clsx(inputs)) }

export const fmt = {
  time: (d = new Date()) =>
    (d instanceof Date ? d : new Date(d))
      .toLocaleTimeString('en-US', { hour12: false }),
  date: (d = new Date()) =>
    (d instanceof Date ? d : new Date(d))
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  num: (n, dec = 1) => Number(n).toFixed(dec),
}

export function statusToVariant(s = '') {
  const u = s.toUpperCase()
  if (['HEALTHY','NORMAL','OPTIMAL','ONLINE','RUNNING','RESOLVED','ACTIVE_GOOD'].some(k => u.includes(k))) return 'healthy'
  if (['WARNING','ELEVATED','DEGRADED','ATTENTION'].some(k => u.includes(k))) return 'warning'
  if (['CRITICAL','FAULT','OFFLINE','STOPPED','EMERGENCY'].some(k => u.includes(k))) return 'critical'
  if (['ACKNOWLEDGED'].some(k => u.includes(k))) return 'acknowledged'
  return 'neutral'
}
