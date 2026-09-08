/**
 * Report.js — MongoDB model for generated reports
 *
 * prd.md §Scope §4: Trends & Maintenance page — historical trends and
 * maintenance-related views.
 * prd.md §Scope §3: Alert page includes exportable log (Excel).
 * prd.md §FR-6: LangChain generates daily reports in plain language.
 */
const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema({
  reportId:   { type: String, required: true, unique: true },
  conveyorId: { type: String, default: 'CONVEYOR-C01' },

  type: {
    type: String,
    enum: ['Conveyor Performance','Damage Detection','Sensor Health','Alert History','Maintenance'],
    required: true,
  },
  title:       { type: String, required: true },
  generatedAt: { type: Date,   default: Date.now },

  // Plain-language AI summary (prd.md §FR-6: LangChain daily reports)
  aiSummary: { type: String },

  // Structured data payload — type-specific
  payload: { type: mongoose.Schema.Types.Mixed },

  // File reference if exported
  exportPath: { type: String, default: null },
  exportSize:  { type: String, default: null },

  status: { type: String, enum: ['GENERATING','READY','ARCHIVED'], default: 'READY' },
}, { timestamps: true })

ReportSchema.index({ generatedAt: -1 })
ReportSchema.index({ type: 1 })

module.exports = mongoose.model('Report', ReportSchema)
