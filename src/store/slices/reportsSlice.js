import { createSlice } from '@reduxjs/toolkit'

const REPORTS = [
  { id:'RPT-001', type:'Conveyor Performance',  date:'08 Sep 2026', title:'Daily Performance Summary — C-01',     status:'READY',      size:'1.2 MB' },
  { id:'RPT-002', type:'Damage Detection',       date:'07 Sep 2026', title:'Defect Detection Report — J-04 Critical', status:'READY',   size:'2.8 MB' },
  { id:'RPT-003', type:'Alert History',          date:'07 Sep 2026', title:'Alert Log Export — Last 5 Minutes',       status:'READY',   size:'0.4 MB' },
  { id:'RPT-004', type:'Sensor Health',          date:'06 Sep 2026', title:'Sensor Calibration Status Report',         status:'READY',   size:'0.9 MB' },
  { id:'RPT-005', type:'Maintenance',            date:'05 Sep 2026', title:'Predictive Maintenance Plan — Week 36',    status:'READY',   size:'1.6 MB' },
  { id:'RPT-006', type:'Conveyor Performance',  date:'07 Sep 2026', title:'Shift Report — Night Shift 06–07 Sep',    status:'ARCHIVED', size:'1.1 MB' },
]

export const reportsSlice = createSlice({
  name: 'reports',
  initialState: { list: REPORTS, generating: false, filter: { type:'ALL' } },
  reducers: {
    setGenerating:  (s, a) => { s.generating = a.payload },
    setTypeFilter:  (s, a) => { s.filter.type = a.payload },
    pushReport:     (s, a) => { s.list.unshift({ id:`RPT-${Date.now()}`, status:'READY', ...a.payload }) },
  },
})

export const { setGenerating, setTypeFilter, pushReport } = reportsSlice.actions
export default reportsSlice.reducer
