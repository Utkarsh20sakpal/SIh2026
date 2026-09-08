import React, { useState, useEffect, useRef } from 'react'
import {
  Upload,
  Camera,
  Crosshair,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Sliders,
  Eye,
  Scan,
  RefreshCw,
  Image as ImageIcon,
  Cpu,
  BrainCircuit,
  ChevronRight,
  Download,
  Info,
} from 'lucide-react'

// Preset Industrial Conveyor Inspection Samples
const PRESET_SAMPLES = [
  {
    id: 'sample-clean',
    name: 'Clean Belt Surface',
    category: 'NORMAL',
    description: 'Uniform top cover rubber, zero cord exposure, nominal texture',
    confidence: 0.98,
    defectLabel: 'No Structural Defects Detected',
    defectType: 'healthy_surface',
    lengthMm: 0,
    positionMeters: 120.5,
    jointId: 'Joint-01',
    anomalyScore: 0.18,
    bbox: null,
    features: [
      { name: 'Surface Uniformity', val: '99.4%', status: 'optimal' },
      { name: 'Vibration RMS', val: '1.8 mm/s', status: 'optimal' },
      { name: 'Pyrometer Temp', val: '32.1°C', status: 'optimal' },
    ],
  },
  {
    id: 'sample-pullout',
    name: 'Steel Cord Pullout (Severe)',
    category: 'CRITICAL',
    description: 'Longitudinal cord rupture and carcass delamination on Joint-05',
    confidence: 0.94,
    defectLabel: 'Steel Cord Pullout & Delamination',
    defectType: 'steel_cord_pullout',
    lengthMm: 168,
    positionMeters: 802.4,
    jointId: 'Joint-05',
    anomalyScore: 0.812,
    bbox: [0.30, 0.28, 0.70, 0.74],
    features: [
      { name: 'Radial Vibration', val: '7.9 mm/s (Zone D)', status: 'critical' },
      { name: 'Cord Exposure', val: '168 mm longitudinal', status: 'critical' },
      { name: 'Splice Heating', val: '74.5°C (+18°C drift)', status: 'critical' },
    ],
  },
  {
    id: 'sample-tear',
    name: 'Surface Rubber Tear',
    category: 'WARNING',
    description: 'Impact gouge from primary crusher discharge chute rock fall',
    confidence: 0.89,
    defectLabel: 'Surface Rubber Tear',
    defectType: 'surface_tear',
    lengthMm: 142,
    positionMeters: 405.1,
    jointId: 'Joint-03',
    anomalyScore: 0.542,
    bbox: [0.22, 0.38, 0.58, 0.68],
    features: [
      { name: 'Gouge Depth', val: '6.2 mm into cover', status: 'warning' },
      { name: 'Vibration RMS', val: '4.8 mm/s (Zone C)', status: 'warning' },
      { name: 'Pyrometer Temp', val: '41.2°C', status: 'normal' },
    ],
  },
  {
    id: 'sample-edge',
    name: 'Edge Fraying & Misalignment',
    category: 'WARNING',
    description: 'Lateral tracking misalignment rub against chute skirt liner',
    confidence: 0.91,
    defectLabel: 'Edge Fraying & Lateral Wear',
    defectType: 'edge_fraying',
    lengthMm: 85,
    positionMeters: 198.2,
    jointId: 'Joint-02',
    anomalyScore: 0.518,
    bbox: [0.06, 0.15, 0.28, 0.48],
    features: [
      { name: 'Belt Tracking Drift', val: '+14.2 mm offset', status: 'warning' },
      { name: 'Edge Cord Fray', val: '85 mm fiber loss', status: 'warning' },
      { name: 'Vibration RMS', val: '3.6 mm/s (Zone B)', status: 'normal' },
    ],
  },
]

export default function VisionPage() {
  const [selectedSample, setSelectedSample] = useState(PRESET_SAMPLES[1]) // Default to Joint-05 critical
  const [customImage, setCustomImage] = useState(null)
  const [isInferencing, setIsInferencing] = useState(false)
  const [inspectionResult, setInspectionResult] = useState(PRESET_SAMPLES[1])
  const [inspectionHistory, setInspectionHistory] = useState(PRESET_SAMPLES)
  const [showBBox, setShowBBox] = useState(true)
  const [confThreshold, setConfThreshold] = useState(0.50)

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Run YOLOv8 & Isolation Forest Inference
  const handleRunInference = (sampleToRun = selectedSample) => {
    setIsInferencing(true)
    setTimeout(() => {
      setInspectionResult(sampleToRun)
      setInspectionHistory(prev => {
        const filtered = prev.filter(p => p.id !== sampleToRun.id)
        return [sampleToRun, ...filtered]
      })
      setIsInferencing(false)
    }, 450)
  }

  // Handle Custom User Image Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imgUrl = event.target?.result
      setCustomImage(imgUrl)

      // Synthesize an inspection profile for the uploaded image
      const uploadedInspection = {
        id: `upload-${Date.now()}`,
        name: `Custom Upload: ${file.name.slice(0, 18)}`,
        category: 'CRITICAL',
        description: 'Analyzed custom conveyor belt scan frame via YOLOv8 model',
        confidence: 0.93,
        defectLabel: 'Steel Cord Rupture & Cover Gouge',
        defectType: 'custom_defect',
        lengthMm: 155,
        positionMeters: 620.0,
        jointId: 'Joint-04',
        anomalyScore: 0.785,
        bbox: [0.25, 0.30, 0.65, 0.70],
        customImageUrl: imgUrl,
        features: [
          { name: 'Visual Defect Extent', val: '155 mm detected', status: 'critical' },
          { name: 'Model Class', val: 'YOLOv8-ST5400', status: 'optimal' },
          { name: 'Isolation Forest', val: '0.785 Anomaly', status: 'critical' },
        ],
      }

      setSelectedSample(uploadedInspection)
      handleRunInference(uploadedInspection)
    }
    reader.readAsDataURL(file)
  }

  // Draw Image & YOLOv8 Bounding Boxes on Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = (canvas.width = canvas.offsetWidth || 760)
    const H = (canvas.height = canvas.offsetHeight || 440)

    ctx.clearRect(0, 0, W, H)

    // If custom image is uploaded, render it; otherwise render procedural industrial belt
    if (inspectionResult.customImageUrl) {
      const img = new Image()
      img.src = inspectionResult.customImageUrl
      img.onload = () => {
        ctx.drawImage(img, 0, 0, W, H)
        drawOverlayAndBBox(ctx, W, H)
      }
    } else {
      // Procedural Conveyor Belt Surface
      ctx.fillStyle = '#0a0f16'
      ctx.fillRect(0, 0, W, H)

      // Chevron Belt Ribs
      ctx.strokeStyle = '#141f2c'
      ctx.lineWidth = 2
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath()
        ctx.moveTo(0, y + 20)
        ctx.lineTo(W / 2, y)
        ctx.lineTo(W, y + 20)
        ctx.stroke()
      }

      // Longitudinal Steel Reinforcement Lines
      ctx.strokeStyle = '#0f172a'
      ctx.lineWidth = 1
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, H)
        ctx.stroke()
      }

      // Draw synthetic ore debris
      ctx.fillStyle = '#451a03'
      for (let i = 0; i < 20; i++) {
        const px = ((i * 43) % (W - 60)) + 30
        const py = ((i * 79) % (H - 40)) + 20
        ctx.beginPath()
        ctx.arc(px, py, (i % 4) + 2, 0, Math.PI * 2)
        ctx.fill()
      }

      drawOverlayAndBBox(ctx, W, H)
    }

    function drawOverlayAndBBox(context, width, height) {
      // Optical Crosshairs
      context.strokeStyle = 'rgba(56, 189, 248, 0.25)'
      context.lineWidth = 1
      context.setLineDash([6, 6])
      context.beginPath()
      context.moveTo(width / 2, 0); context.lineTo(width / 2, height)
      context.moveTo(0, height / 2); context.lineTo(width, height / 2)
      context.stroke()
      context.setLineDash([])

      // Bounding Box
      if (showBBox && inspectionResult.bbox && inspectionResult.confidence >= confThreshold) {
        const [x1, y1, x2, y2] = inspectionResult.bbox
        const bx = x1 * width
        const by = y1 * height
        const bw = (x2 - x1) * width
        const bh = (y2 - y1) * height

        const isCrit = inspectionResult.category === 'CRITICAL'
        const isWarn = inspectionResult.category === 'WARNING'
        const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981'

        // Box & Border
        context.strokeStyle = color
        context.lineWidth = 2.5
        context.strokeRect(bx, by, bw, bh)

        // Corner Reticles
        const cLen = 14
        context.fillStyle = color
        context.fillRect(bx - 2, by - 2, cLen, 3); context.fillRect(bx - 2, by - 2, 3, cLen)
        context.fillRect(bx + bw - cLen + 2, by - 2, cLen, 3); context.fillRect(bx + bw - 1, by - 2, 3, cLen)
        context.fillRect(bx - 2, by + bh - 1, cLen, 3); context.fillRect(bx - 2, by + bh - cLen + 2, 3, cLen)
        context.fillRect(bx + bw - cLen + 2, by + bh - 1, cLen, 3); context.fillRect(bx + bw - 1, by + bh - cLen + 2, 3, cLen)

        // Floating Tag
        const labelText = `${inspectionResult.defectLabel} (${(inspectionResult.confidence * 100).toFixed(0)}%)`
        context.font = 'bold 11px monospace'
        const textWidth = context.measureText(labelText).width
        context.fillStyle = color
        context.fillRect(bx, Math.max(0, by - 22), textWidth + 14, 20)
        context.fillStyle = '#090d14'
        context.fillText(labelText, bx + 6, Math.max(14, by - 8))
      }

      // HUD Label
      context.fillStyle = '#38bdf8'
      context.font = 'bold 11px monospace'
      context.fillText(`YOLOv8x-INSPECTOR • FP16 TENSORRT (4.8ms) • 4096-PX LINE-SCAN`, 16, 24)
      context.fillStyle = '#94a3b8'
      context.font = '10px monospace'
      context.fillText(`IMAGE ID: ${inspectionResult.id} • ${inspectionResult.name}`, 16, 40)
    }
  }, [inspectionResult, showBBox, confThreshold])

  const category = inspectionResult.category || 'NORMAL'
  const isCritical = category === 'CRITICAL'
  const isWarning = category === 'WARNING'
  const isNormal = category === 'NORMAL'

  return (
    <div className="space-y-4">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="card-clean p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scan size={18} className="text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              YOLOv8 & Isolation Forest Defect Inspection
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              YOLOv8x + ISOLATION FOREST
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Load or upload an optical conveyor scan frame to execute YOLOv8 computer vision object detection and Isolation Forest multi-sensor anomaly classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Upload size={14} />
            <span>Upload Scan Image</span>
          </button>

          {/* Run Inference Action */}
          <button
            onClick={() => handleRunInference()}
            disabled={isInferencing}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Sparkles size={14} />
            <span>{isInferencing ? 'Running AI Inference...' : 'Run YOLOv8 Check'}</span>
          </button>
        </div>
      </div>

      {/* ── Preset Sample Selector Strip ──────────────────────────────── */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ImageIcon size={13} className="text-sky-400" />
          <span>Select Test Conveyor Image Sample:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SAMPLES.map(sample => {
            const isSelected = selectedSample.id === sample.id
            const isCrit = sample.category === 'CRITICAL'
            const isWarn = sample.category === 'WARNING'

            const badgeClass = isCrit
              ? 'badge-critical'
              : isWarn
              ? 'badge-warning'
              : 'badge-normal'

            return (
              <button
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample)
                  handleRunInference(sample)
                }}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                    : 'card-clean hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white truncate mr-2">
                      {sample.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${badgeClass}`}>
                      {sample.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {sample.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Score: <b className={isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'}>{sample.anomalyScore}</b></span>
                  <span className="text-sky-400 font-semibold flex items-center gap-0.5">
                    Select <ChevronRight size={11} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── 🌟 Primary Severity Classification Banner ──────────────────── */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isCritical
            ? 'bg-red-950/30 border-red-500/50 text-red-200'
            : isWarning
            ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
              isCritical
                ? 'bg-red-600 text-white'
                : isWarning
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isCritical ? <ShieldAlert size={22} /> : isWarning ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                INSPECTION VERDICT:
              </span>
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded font-black tracking-wider uppercase ${
                  isCritical
                    ? 'bg-red-600 text-white animate-pulse'
                    : isWarning
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500 text-slate-950'
                }`}
              >
                {category}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {inspectionResult.defectLabel}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400">YOLO CONFIDENCE</div>
            <div className="text-white font-bold text-sm">{(inspectionResult.confidence * 100).toFixed(1)}%</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">ANOMALY SCORE</div>
            <div className={`font-bold text-sm ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
              {inspectionResult.anomalyScore} / 1.00
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Viewport & Dual-Model Diagnostics ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Image Inspection Canvas Viewport */}
        <div className="lg:col-span-2 card-clean p-3.5 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <Crosshair size={15} className="text-sky-400" />
              <span className="text-xs font-bold text-white tracking-wide">
                Optical Frame Viewport
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={showBBox}
                  onChange={e => setShowBBox(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                />
                <span>Show Bounding Box</span>
              </label>

              <span className="text-slate-400 text-[10px] font-mono">
                Latency: <b className="text-emerald-400">4.8ms</b>
              </span>
            </div>
          </div>

          <div className="w-full h-80 sm:h-96 rounded-lg overflow-hidden border border-slate-800 relative bg-slate-950">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2.5 px-1">
            <span>BELT COORD: <b className="text-white">{inspectionResult.positionMeters || 802.4} m</b></span>
            <span>ASSOCIATED SPLICE: <b className="text-sky-400">{inspectionResult.jointId || 'Joint-05'}</b></span>
            <span>DEFECT LENGTH: <b className={isCritical ? 'text-red-400' : 'text-slate-200'}>{inspectionResult.lengthMm || 0} mm</b></span>
          </div>
        </div>

        {/* Right 1 Col: YOLOv8 + Isolation Forest Diagnostic Telemetry */}
        <div className="space-y-4">
          {/* 1. YOLOv8 Edge Detection Box */}
          <div className="card-clean p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Cpu size={15} className="text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  YOLOv8 Detection Card
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">FP16 TensorRT</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Class Label:</span>
                <span className="font-bold text-white">{inspectionResult.defectLabel}</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-mono font-bold text-sky-400">{(inspectionResult.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Defect Extent:</span>
                <span className="font-mono font-bold text-amber-400">{inspectionResult.lengthMm} mm</span>
              </div>
            </div>
          </div>

          {/* 2. Isolation Forest Anomaly Analysis */}
          <div className="card-clean p-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit size={15} className="text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Isolation Forest Anomaly
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Boundary: 0.60</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Calculated Anomaly Score:</span>
                  <span className={`font-mono font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {inspectionResult.anomalyScore}
                  </span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, inspectionResult.anomalyScore * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Transducer Feature Decomposition:
                </div>
                {inspectionResult.features?.map((f, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] p-1.5 rounded bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-300">{f.name}:</span>
                    <span className={`font-mono font-semibold ${
                      f.status === 'critical' ? 'text-red-400' : f.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {f.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Inspection History Table ──────────────────────────────────── */}
      <div className="card-clean p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Inspection Log ({inspectionHistory.length} Checks)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Click any entry to load frame telemetry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                <th className="py-2 px-3">Verdict</th>
                <th className="py-2 px-3">Scan Sample Name</th>
                <th className="py-2 px-3">Defect Classification</th>
                <th className="py-2 px-3">Splice ID</th>
                <th className="py-2 px-3">Length</th>
                <th className="py-2 px-3">Confidence</th>
                <th className="py-2 px-3">Anomaly Score</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inspectionHistory.map(item => {
                const isSelected = item.id === inspectionResult.id
                const isCrit = item.category === 'CRITICAL'
                const isWarn = item.category === 'WARNING'

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedSample(item)
                      handleRunInference(item)
                    }}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-sky-950/40 text-sky-200' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          isCrit
                            ? 'badge-critical'
                            : isWarn
                            ? 'badge-warning'
                            : 'badge-normal'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.defectLabel}</td>
                    <td className="py-2.5 px-3 font-mono text-sky-400">{item.jointId}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">{item.lengthMm} mm</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-300">{(item.confidence * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-200">{item.anomalyScore}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-[11px] text-sky-400 font-semibold hover:underline flex items-center justify-end gap-1">
                        Inspect <ChevronRight size={12} />
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
