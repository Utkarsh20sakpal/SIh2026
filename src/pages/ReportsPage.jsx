import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { fetchReports, generateWorkOrderApi } from '../lib/api'
import {
  FileText,
  Printer,
  Download,
  Plus,
  Wrench,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Layers,
  ChevronRight,
  FileCheck,
} from 'lucide-react'

export default function ReportsPage() {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [activeTab, setActiveTab] = useState('splicing_guide') // 'splicing_guide' | 'work_orders'
  const { facilityName } = useSelector(s => s.telemetry)

  useEffect(() => {
    async function loadReports() {
      const data = await fetchReports()
      setReports(data)
      if (data.length > 0) setSelectedReport(data[0])
    }
    loadReports()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-mono font-black uppercase tracking-wider text-white">
              Maintenance Reports & Splicing Work Orders
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ISO 15236 COMPLIANT
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated shift handover logs, cold vulcanization engineering work-orders, and Joint-05 diamond splice procedure specifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-2 border border-slate-700 shadow-md active:scale-95 transition-all uppercase"
          >
            <Printer size={14} className="text-cyan-400" />
            <span>Export PDF / Print Report</span>
          </button>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 font-mono text-xs">
        <button
          onClick={() => setActiveTab('splicing_guide')}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'splicing_guide'
              ? 'bg-slate-800 text-cyan-400 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench size={14} />
          <span>Dedicated Joint-05 Splicing Procedure Guide</span>
        </button>
        <button
          onClick={() => setActiveTab('work_orders')}
          className={`px-4 py-2 rounded-t-lg font-bold transition-all flex items-center gap-2 ${
            activeTab === 'work_orders'
              ? 'bg-slate-800 text-cyan-400 border-t-2 border-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText size={14} />
          <span>Shift Handover & Inspection Work-Orders ({reports.length})</span>
        </button>
      </div>

      {/* ── Tab 1: Joint-05 Splicing Procedure Guide ──────────────────── */}
      {activeTab === 'splicing_guide' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-2xl space-y-5 print:bg-white print:text-black print:border-none">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
                NMDC LIMITED • OVERLAND BELTING ENGINEERING STANDARD
              </div>
              <h3 className="text-lg font-mono font-black text-white uppercase mt-0.5">
                Standard Operating Procedure: Joint-05 Cold Vulcanization Diamond Splice
              </h3>
              <div className="text-xs text-slate-400 font-mono mt-1">
                Facility: {facilityName} • Location: 800m Overland Curve Segment
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="text-red-400 font-bold">PRIORITY: EMERGENCY REPAIR</div>
              <div className="text-slate-400 text-[11px]">Doc Ref: NMDC-SOP-CV101-J05-v4</div>
            </div>
          </div>

          {/* Procedure Key Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Splicing Method</div>
              <div className="text-white font-black text-sm mt-1">Cold Vulcanization</div>
              <div className="text-cyan-400 text-[10px] mt-0.5">SC-4000 Cement Compound</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Curing Window</div>
              <div className="text-white font-black text-sm mt-1">45 Minutes</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Under 7 bar pressure at &gt;20°C</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Cut Pattern</div>
              <div className="text-white font-black text-sm mt-1">45° Bias Diamond</div>
              <div className="text-emerald-400 text-[10px] mt-0.5">Minimizes cord shear stress</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Execution Window</div>
              <div className="text-red-400 font-black text-sm mt-1">Within 6.0 Days</div>
              <div className="text-slate-400 text-[10px] mt-0.5">Shift downtime scheduled</div>
            </div>
          </div>

          {/* Step-by-Step Execution Protocol */}
          <div className="space-y-3 font-sans text-xs">
            <h4 className="text-xs font-mono font-bold uppercase text-cyan-400 tracking-wider">
              Step-by-Step Field Execution Steps (ISO 15236 / DIN 22101)
            </h4>

            <div className="space-y-2">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex gap-3">
                <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800">
                  01
                </span>
                <div>
                  <h5 className="font-mono font-bold text-white text-xs">Beltline Lockdown & Isolation</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Trip electrical feed breakers at Substation 4. Engage mechanical gravity take-up locking pins at 200m tail station. Verify zero residual belt tension across the 800m curve segment.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex gap-3">
                <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800">
                  02
                </span>
                <div>
                  <h5 className="font-mono font-bold text-white text-xs">Damaged Cover Stripping & Diamond Bias Layout</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Mark a 45-degree diamond bias cut line across the 1,600mm ST-5400 belt. Strip degraded top-cover rubber (delaminated 168mm section) down to steel cords using pneumatic stripping winch. Thoroughly buff cord surface with rotary wire brush.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex gap-3">
                <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800">
                  03
                </span>
                <div>
                  <h5 className="font-mono font-bold text-white text-xs">Application of SC-4000 Cement & Bonding Strips</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Apply first coat of REMA Tip-Top SC-4000 cement compound with ER-42 hardener (4% ratio). Allow 25 min tack time. Lay raw tie-gum rubber strips between steel cords. Apply second cement coat and mate diamond bias joint faces.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex gap-3">
                <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800">
                  04
                </span>
                <div>
                  <h5 className="font-mono font-bold text-white text-xs">Hydraulic Clamping & Ambient Cure</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Mount aluminum clamping beams across the splice. Apply 7 bar uniform hydraulic pressure across entire diamond surface. Maintain clamp for 45 minutes at &gt;20°C ambient temperature.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 flex gap-3">
                <span className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-cyan-800">
                  05
                </span>
                <div>
                  <h5 className="font-mono font-bold text-white text-xs">Post-Cure Ultrasonic Baseline Inspection</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                    Verify thickness restoration to &gt;21.5mm via non-contact ultrasonic gauge. Run conveyor unladen at 1.5 m/s for 2 full revolutions before loading iron ore feed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sign-Off Footer */}
          <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-400 gap-3">
            <div>
              Authorized Engineering Lead: <b className="text-white">Krish Sharma (NMDC)</b>
            </div>
            <div>
              Assigned Splicing Contractor: <b className="text-white">NMDC Vulcanizing Team Gamma</b>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Work Orders & Shift Reports List ───────────────────── */}
      {activeTab === 'work_orders' && (
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-lg space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Report ID</th>
                  <th className="py-2.5 px-3">Title & Classification</th>
                  <th className="py-2.5 px-3">Target Splice</th>
                  <th className="py-2.5 px-3">Technician / Lead</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                          r.status === 'APPROVED' || r.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{r.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{r.title}</div>
                      <div className="text-[11px] text-slate-400">{r.summary}</div>
                    </td>
                    <td className="py-3 px-3 text-cyan-300 font-bold">{r.targetJoint}</td>
                    <td className="py-3 px-3 text-slate-300">{r.technician}</td>
                    <td className="py-3 px-3 text-slate-400">{r.date}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={handlePrint}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-mono border border-slate-700"
                      >
                        Print Sheet
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
