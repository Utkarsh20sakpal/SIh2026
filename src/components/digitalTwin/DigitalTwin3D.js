/**
 * ConveyorDigitalTwinEngine — High-Fidelity 3D Industrial WebGL Engine
 *
 * Implements a realistic, physically animated 1,200m overland iron ore conveyor belt:
 * - Animated textured troughed rubber belt with continuous chevron & steel-cord scrolling
 * - 120+ 3D hematite iron ore rock chunks traveling and cascading down the discharge chute
 * - Proportional rotation of drive drum, take-up pulley, and 30+ troughing idler rolls
 * - Animated optical laser scanning sheets and holographic sensor gantry stations
 * - 6 splice joint markers with dynamic health auras, beacon beams, and 72-hour decay
 * - Smooth camera interpolation (OrbitControls) with click-to-focus
 */

import * as THREE from 'three'

const C = {
  steel:        0x1e293b,
  steelDark:    0x0f172a,
  steelLight:   0x475569,
  yellow:       0xf59e0b,
  belt:         0x18202c,
  ore1:         0x78350f, // raw hematite
  ore2:         0x92400e, // iron oxide red
  ore3:         0x451a03, // magnetite dark
  cyan:         0x0ea5e9,
  optimal:      0x10b981,
  elevated:     0xf59e0b,
  critical:     0xef4444,
  ground:       0x060911,
}

const SPLICE_COUNT = 6

function createProceduralBeltTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Dark vulcanized rubber base
  ctx.fillStyle = '#141c26'
  ctx.fillRect(0, 0, size, size)

  // Surface texture noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const alpha = Math.random() * 0.08
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Steel cord longitudinal ribbing
  ctx.strokeStyle = '#222f3e'
  ctx.lineWidth = 3
  for (let y = 0; y < size; y += 24) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(size, y)
    ctx.stroke()
  }

  // Chevron cleats / chevron pattern
  ctx.strokeStyle = '#2d3d50'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  for (let x = -size; x < size * 2; x += 64) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 40, size / 2)
    ctx.lineTo(x, size)
    ctx.stroke()
  }

  // High-visibility cyan edge tracking lines
  ctx.strokeStyle = '#0ea5e9'
  ctx.lineWidth = 2
  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.moveTo(0, size * 0.08)
  ctx.lineTo(size, size * 0.08)
  ctx.moveTo(0, size * 0.92)
  ctx.lineTo(size, size * 0.92)
  ctx.stroke()
  ctx.globalAlpha = 1.0

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(12, 1)
  return texture
}

export class ConveyorDigitalTwinEngine {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      length: options.length ?? 26,
      onJointSelect: options.onJointSelect ?? (() => {}),
    }
    this.beltSpeed = 4.2 // m/s
    this.raf = null
    this.clock = new THREE.Clock()
    this.jointMeshes = {}
    this.rotatingRolls = []
    this.oreLumps = []
    this.laserPlanes = []

    // Camera tweening
    this.targetCameraPos = null
    this.targetLookAt = new THREE.Vector3(0, 1, 0)
    this.currentLookAt = new THREE.Vector3(0, 1, 0)

    this._initRenderer()
    this._buildScene()
    this._animate()
  }

  _initRenderer() {
    const w = this.container.clientWidth
    const h = this.container.clientHeight || 550

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h)
    this.renderer.setClearColor(C.ground)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.container.appendChild(this.renderer.domElement)

    this.camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 300)
    this.camera.position.set(10, 8, 16)
    this.camera.lookAt(0, 1, 0)

    this._addOrbitControls()

    this.resizeOb = new ResizeObserver(() => this._onResize())
    this.resizeOb.observe(this.container)
  }

  _addOrbitControls() {
    let dragging = false, prev = null
    let theta = 0.65, phi = 0.68, radius = 22
    const target = this.currentLookAt

    const updateCamera = () => {
      this.camera.position.set(
        target.x + radius * Math.sin(phi) * Math.sin(theta),
        target.y + radius * Math.cos(phi),
        target.z + radius * Math.sin(phi) * Math.cos(theta),
      )
      this.camera.lookAt(target)
    }
    updateCamera()

    const el = this.renderer.domElement
    el.addEventListener('mousedown', e => {
      dragging = true
      prev = [e.clientX, e.clientY]
      this.targetCameraPos = null
    })
    el.addEventListener('mousemove', e => {
      if (!dragging || !prev) return
      theta -= (e.clientX - prev[0]) * 0.0055
      phi = Math.max(0.12, Math.min(Math.PI * 0.48, phi - (e.clientY - prev[1]) * 0.0055))
      prev = [e.clientX, e.clientY]
      updateCamera()
    })
    el.addEventListener('mouseup', () => { dragging = false; prev = null })
    el.addEventListener('mouseleave', () => { dragging = false })
    el.addEventListener('wheel', e => {
      e.preventDefault()
      radius = Math.max(4, Math.min(55, radius + e.deltaY * 0.025))
      updateCamera()
    }, { passive: false })

    this._orbitState = {
      setTarget: (x, y, z) => {
        this.targetLookAt.set(x, y, z)
      },
      setParams: (t, p, r) => {
        theta = t; phi = p; radius = r; updateCamera()
      },
    }
  }

  _buildScene() {
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(C.ground, 0.015)

    // Ambient & Studio Lighting
    this.scene.add(new THREE.AmbientLight(0x475569, 1.4))

    const sun = new THREE.DirectionalLight(0xffffff, 1.8)
    sun.position.set(12, 22, 12)
    this.scene.add(sun)

    const blueFill = new THREE.DirectionalLight(0x0ea5e9, 0.6)
    blueFill.position.set(-14, 8, -8)
    this.scene.add(blueFill)

    const L = this.options.length
    const halfL = L / 2

    // ── Steel Truss & Gantry Structure ─────────────────────────────
    const steelMat = new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8, roughness: 0.3 })
    const steelLightMat = new THREE.MeshStandardMaterial({ color: C.steelLight, metalness: 0.7, roughness: 0.4 })

    // Longitudinal I-Beams / Stringers
    for (const z of [-0.95, 0.95]) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(L, 0.12, 0.12), steelMat)
      beam.position.set(0, 0.5, z)
      this.scene.add(beam)
    }

    // Truss Vertical Legs & Cross Bracing
    for (let x = -halfL + 2; x <= halfL - 2; x += 3.5) {
      // Legs
      for (const z of [-0.95, 0.95]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 0.12), steelMat)
        leg.position.set(x, 0, z)
        this.scene.add(leg)
      }
      // Horizontal cross-tie
      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.9), steelMat)
      tie.position.set(x, -0.4, 0)
      this.scene.add(tie)

      // Diagonal X-brace
      const diag1 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), steelMat)
      diag1.position.set(x, 0, 0)
      diag1.rotation.x = Math.PI / 4.5
      this.scene.add(diag1)

      const diag2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), steelMat)
      diag2.position.set(x, 0, 0)
      diag2.rotation.x = -Math.PI / 4.5
      this.scene.add(diag2)
    }

    // Safety Walkway Guardrails
    const railMat = new THREE.MeshStandardMaterial({ color: C.yellow, roughness: 0.4 })
    for (const z of [-1.15, 1.15]) {
      // Top rail
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.04, 0.04), railMat)
      topRail.position.set(0, 1.3, z)
      this.scene.add(topRail)

      // Mid rail
      const midRail = new THREE.Mesh(new THREE.BoxGeometry(L, 0.03, 0.03), railMat)
      midRail.position.set(0, 0.95, z)
      this.scene.add(midRail)

      // Stanchions
      for (let x = -halfL + 1; x <= halfL - 1; x += 2.5) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.04), railMat)
        post.position.set(x, 0.9, z)
        this.scene.add(post)
      }
    }

    // ── Idler Roll Sets (3-Roll Troughed Idlers) ───────────────────
    this.rotatingRolls = []
    for (let x = -halfL + 1.2; x < halfL; x += 2.2) {
      // Center Roll
      const rollGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.65, 16)
      const centerRoll = new THREE.Mesh(rollGeo, steelLightMat)
      centerRoll.position.set(x, 0.52, 0)
      centerRoll.rotation.x = Math.PI / 2
      this.scene.add(centerRoll)
      this.rotatingRolls.push(centerRoll)

      // Wing Rolls (35° Trough Angle)
      const ang = THREE.MathUtils.degToRad(35)
      for (const sign of [-1, 1]) {
        const wingRoll = new THREE.Mesh(rollGeo, steelLightMat)
        wingRoll.position.set(x, 0.52 + Math.sin(ang) * 0.42 * sign, sign * 0.58)
        wingRoll.rotation.x = Math.PI / 2
        wingRoll.rotation.z = -ang * sign
        this.scene.add(wingRoll)
        this.rotatingRolls.push(wingRoll)
      }

      // Return Idler (flat, underneath)
      const returnRoll = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 12), steelLightMat)
      returnRoll.position.set(x, 0.08, 0)
      returnRoll.rotation.x = Math.PI / 2
      this.scene.add(returnRoll)
      this.rotatingRolls.push(returnRoll)
    }

    // ── Head Drive Station (Discharge End) ──────────────────────────
    const headGrp = new THREE.Group()
    headGrp.position.set(halfL, 0.6, 0)
    const drumGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.9, 32)
    this.headDrum = new THREE.Mesh(drumGeo, steelLightMat)
    this.headDrum.rotation.z = Math.PI / 2
    headGrp.add(this.headDrum)

    // Motor & Gearbox Enclosure
    const motor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.1), steelMat)
    motor.position.set(1.5, 0, 0)
    headGrp.add(motor)

    // Discharge Chute Funnel
    const chuteGeo = new THREE.ConeGeometry(1.4, 1.8, 4)
    const chuteMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
    const chute = new THREE.Mesh(chuteGeo, chuteMat)
    chute.position.set(0.6, -1.0, 0)
    chute.rotation.y = Math.PI / 4
    headGrp.add(chute)
    this.scene.add(headGrp)

    // ── Tail Loading Hopper Station ────────────────────────────────
    const tailGrp = new THREE.Group()
    tailGrp.position.set(-halfL, 0.6, 0)
    this.tailPulley = new THREE.Mesh(drumGeo, steelLightMat)
    this.tailPulley.rotation.z = Math.PI / 2
    tailGrp.add(this.tailPulley)

    // Feed Hopper
    const hopper = new THREE.Mesh(new THREE.ConeGeometry(1.5, 1.6, 4), chuteMat)
    hopper.position.set(0, 1.4, 0)
    hopper.rotation.x = Math.PI
    hopper.rotation.y = Math.PI / 4
    tailGrp.add(hopper)
    this.scene.add(tailGrp)

    // ── Animated Troughed Conveyor Belt ────────────────────────────
    this.beltTexture = createProceduralBeltTexture()
    this.bottomBeltTexture = createProceduralBeltTexture()

    const beltMaterial = new THREE.MeshStandardMaterial({
      map: this.beltTexture,
      roughness: 0.5,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })

    // Top troughed belt strand
    const topGeo = new THREE.PlaneGeometry(L, 1.8, 120, 6)
    const pos = topGeo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      const trough = -(z * z) * 0.18
      pos.setY(i, pos.getY(i) + trough)
    }
    topGeo.rotateX(-Math.PI / 2)
    topGeo.computeVertexNormals()

    this.topBelt = new THREE.Mesh(topGeo, beltMaterial)
    this.topBelt.position.set(0, 0.52, 0)
    this.scene.add(this.topBelt)

    // Bottom return belt strand
    const botMaterial = new THREE.MeshStandardMaterial({
      map: this.bottomBeltTexture,
      roughness: 0.6,
      metalness: 0.1,
      side: THREE.DoubleSide,
    })
    this.botBelt = new THREE.Mesh(new THREE.PlaneGeometry(L, 1.6), botMaterial)
    this.botBelt.position.set(0, 0.08, 0)
    this.botBelt.rotation.x = Math.PI / 2
    this.scene.add(this.botBelt)

    // ── Traveling 3D Iron Ore Lumps ────────────────────────────────
    this._buildIronOreChunks(L)

    // ── Sensor Gantries & Laser Scanners ───────────────────────────
    this._buildSensorGantries(L)

    // ── 6 Splice Joint Markers ─────────────────────────────────────
    this.jointPositions = Array.from({ length: SPLICE_COUNT }, (_, i) =>
      -halfL + ((i + 1) / (SPLICE_COUNT + 1)) * L
    )
    this._buildJointMarkers()

    // ── Ground Cyber-Grid ──────────────────────────────────────────
    const grid = new THREE.GridHelper(L + 16, 40, 0x0ea5e9, 0x1e293b)
    grid.position.y = -0.6
    this.scene.add(grid)

    // Click Raycasting
    this.raycaster = new THREE.Raycaster()
    this.renderer.domElement.addEventListener('click', e => this._onClick(e))
  }

  _buildIronOreChunks(L) {
    this.oreLumps = []
    const oreCount = 130
    const halfL = L / 2

    const oreGeos = [
      new THREE.DodecahedronGeometry(0.12, 0),
      new THREE.IcosahedronGeometry(0.15, 0),
      new THREE.TetrahedronGeometry(0.14, 0),
    ]

    const oreColors = [C.ore1, C.ore2, C.ore3]

    for (let i = 0; i < oreCount; i++) {
      const geo = oreGeos[i % oreGeos.length]
      const color = oreColors[i % oreColors.length]
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        metalness: 0.2,
      })
      const mesh = new THREE.Mesh(geo, mat)

      // Random position along top belt
      const x = -halfL + Math.random() * L
      const z = (Math.random() - 0.5) * 0.95
      const y = 0.56 - (z * z) * 0.16 + (Math.random() * 0.08)

      mesh.position.set(x, y, z)
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
      mesh.scale.setScalar(0.7 + Math.random() * 0.8)

      mesh.userData = {
        speedFactor: 0.98 + Math.random() * 0.04,
        rotSpeed: (Math.random() - 0.5) * 2,
        initialZ: z,
      }

      this.scene.add(mesh)
      this.oreLumps.push(mesh)
    }
  }

  _buildSensorGantries(L) {
    const halfL = L / 2
    const mat = new THREE.MeshStandardMaterial({ color: C.steel, metalness: 0.8, roughness: 0.3 })
    this.laserPlanes = []

    const gantries = [
      { x: -halfL + 4,  label: 'YOLOv8 Optical Line-Scan (CAM-01)', color: 0x0ea5e9 },
      { x: 0,           label: 'Ultrasonic Carcass Scanner',        color: 0x38bdf8 },
      { x: halfL - 4,   label: 'ADXL345 Tri-Axial Gantry',          color: 0x10b981 },
    ]

    gantries.forEach(({ x, color }) => {
      const gantryGrp = new THREE.Group()
      gantryGrp.position.set(x, 0, 0)

      // Arch Portal
      for (const z of [-1.3, 1.3]) {
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), mat)
        pillar.position.set(0, 1.1, z)
        gantryGrp.add(pillar)
      }
      const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.7), mat)
      topBeam.position.set(0, 2.2, 0)
      gantryGrp.add(topBeam)

      // Sensor Head Box
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155 }))
      head.position.set(0, 2.05, 0)
      gantryGrp.add(head)

      // Volumetric Laser Sheet
      const laserGeo = new THREE.PlaneGeometry(0.04, 1.6)
      const laserMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      })
      const laser = new THREE.Mesh(laserGeo, laserMat)
      laser.position.set(0, 1.25, 0)
      laser.rotation.x = Math.PI / 2
      laser.rotation.z = Math.PI / 2
      gantryGrp.add(laser)
      this.laserPlanes.push(laser)

      this.scene.add(gantryGrp)
    })
  }

  _buildJointMarkers() {
    this.jointMeshes = {}

    this.jointPositions.forEach((x, i) => {
      const id = `Joint-0${i + 1}`
      const isCritical = i === 4 // Joint-05
      const isWarning = i === 2  // Joint-03
      const color = isCritical ? C.critical : isWarning ? C.elevated : C.optimal

      const group = new THREE.Group()
      group.position.set(x, 0.54, 0)

      // 45-Degree Diamond Bias Splice Seam on Belt
      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.05, 1.8),
        new THREE.MeshStandardMaterial({ color, roughness: 0.2, metalness: 0.5 })
      )
      seam.rotation.y = Math.PI / 6 // 30-45 deg bias angle
      group.add(seam)

      // Holographic Sphere Beacon Pin
      const sphereGeo = new THREE.SphereGeometry(0.2, 20, 20)
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: isCritical ? 1.0 : 0.3,
        roughness: 0.2,
      })
      const sphere = new THREE.Mesh(sphereGeo, sphereMat)
      sphere.position.set(0, 0.55, 0)
      group.add(sphere)

      // Beacon Vertical Beam
      const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8)
      const beamMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
      })
      const beam = new THREE.Mesh(beamGeo, beamMat)
      beam.position.set(0, 1.2, 0)
      group.add(beam)

      // Glowing Aura Ring
      const auraGeo = new THREE.RingGeometry(0.3, 0.48, 32)
      const auraMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: isCritical ? 0.9 : 0.35,
        side: THREE.DoubleSide,
      })
      const aura = new THREE.Mesh(auraGeo, auraMat)
      aura.rotation.x = Math.PI / 2
      aura.position.set(0, 0.02, 0)
      group.add(aura)

      // Pulsating Point Light for degraded joints
      const pointLight = new THREE.PointLight(color, isCritical ? 3.0 : 0.6, 5)
      pointLight.position.set(0, 0.7, 0)
      group.add(pointLight)

      group.userData = { jointId: id, clickable: true, index: i }
      this.scene.add(group)

      this.jointMeshes[id] = {
        group,
        sphere,
        seam,
        aura,
        beam,
        pointLight,
        isCritical,
      }
    })
  }

  updateJointStates(joints) {
    if (!joints || !Array.isArray(joints)) return

    joints.forEach(j => {
      const meshObj = this.jointMeshes[j.id] || this.jointMeshes[`Joint-0${j.id.slice(-1)}`]
      if (!meshObj) return

      let color = C.optimal
      let emissiveInt = 0.2
      let auraOpacity = 0.35
      let lightIntensity = 0.6
      let isCrit = false

      if (j.health <= 45 || j.status === 'CRITICAL' || j.status === 'CRITICAL_DELAMINATION') {
        color = C.critical
        emissiveInt = 1.0
        auraOpacity = 0.9
        lightIntensity = 3.5
        isCrit = true
      } else if (j.health <= 75 || j.status === 'ELEVATED_WEAR' || j.status === 'WARNING') {
        color = C.elevated
        emissiveInt = 0.5
        auraOpacity = 0.6
        lightIntensity = 1.5
      }

      meshObj.sphere.material.color.setHex(color)
      meshObj.sphere.material.emissive.setHex(color)
      meshObj.sphere.material.emissiveIntensity = emissiveInt
      meshObj.seam.material.color.setHex(color)
      meshObj.aura.material.color.setHex(color)
      meshObj.aura.material.opacity = auraOpacity
      meshObj.beam.material.color.setHex(color)
      meshObj.pointLight.color.setHex(color)
      meshObj.pointLight.intensity = lightIntensity
      meshObj.isCritical = isCrit
    })
  }

  focusJoint(jointId) {
    const meshObj = this.jointMeshes[jointId] || this.jointMeshes[`Joint-0${jointId.slice(-1)}`]
    if (!meshObj) return

    const pos = meshObj.group.position
    this.targetLookAt.set(pos.x, pos.y + 0.4, pos.z)
  }

  setCameraPreset(name) {
    const halfL = this.options.length / 2
    if (name === 'HEAD') {
      this._orbitState.setParams(0.3, 0.72, 9)
      this._orbitState.setTarget(halfL - 1, 0.8, 0)
    } else if (name === 'TAIL') {
      this._orbitState.setParams(3.14, 0.72, 9)
      this._orbitState.setTarget(-halfL + 1, 0.8, 0)
    } else if (name === 'CURVE_J05' || name === 'FOLLOW_J05') {
      this.focusJoint('Joint-05')
      this._orbitState.setParams(0.5, 0.65, 8)
    } else if (name === 'TOP_DOWN') {
      this._orbitState.setParams(0.0, 0.05, 28)
      this._orbitState.setTarget(0, 1, 0)
    } else {
      // ORBIT
      this._orbitState.setParams(0.65, 0.68, 22)
      this._orbitState.setTarget(0, 1, 0)
    }
  }

  _onClick(e) {
    const rect = this.renderer.domElement.getBoundingClientRect()
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )
    this.raycaster.setFromCamera(mouse, this.camera)

    const clickables = []
    Object.values(this.jointMeshes).forEach(m => {
      clickables.push(m.sphere, m.seam, m.aura)
    })

    const hits = this.raycaster.intersectObjects(clickables, true)
    if (hits.length > 0) {
      let curr = hits[0].object
      while (curr && !curr.userData.jointId && curr.parent) {
        curr = curr.parent
      }
      if (curr && curr.userData.jointId) {
        this.focusJoint(curr.userData.jointId)
        this.options.onJointSelect(curr.userData.jointId)
      }
    }
  }

  _onResize() {
    if (!this.container || !this.renderer || !this.camera) return
    const w = this.container.clientWidth
    const h = this.container.clientHeight || 550
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  _animate() {
    this.raf = requestAnimationFrame(() => this._animate())
    const dt = this.clock.getDelta()
    const time = this.clock.getElapsedTime()

    const L = this.options.length
    const halfL = L / 2

    // ── 1. Animated Belt Scrolling ─────────────────────────────────
    if (this.beltTexture && this.bottomBeltTexture) {
      const scrollSpeed = (this.beltSpeed / 14) * dt
      this.beltTexture.offset.x -= scrollSpeed
      this.bottomBeltTexture.offset.x += scrollSpeed
    }

    // ── 2. Rotate Drums & Idler Rolls ──────────────────────────────
    const rotSpeed = this.beltSpeed * dt * 2.5
    if (this.headDrum) this.headDrum.rotation.x += rotSpeed
    if (this.tailPulley) this.tailPulley.rotation.x += rotSpeed

    this.rotatingRolls.forEach(r => {
      r.rotation.x += rotSpeed
    })

    // ── 3. Animate 3D Iron Ore Particles ───────────────────────────
    this.oreLumps.forEach(ore => {
      ore.position.x += this.beltSpeed * dt * ore.userData.speedFactor

      // When ore reaches head drum discharge chute, animate drop & loop back
      if (ore.position.x > halfL - 0.2) {
        ore.position.y -= dt * 4.5
        if (ore.position.y < -0.8) {
          // Reset to tail hopper
          ore.position.x = -halfL + 0.4
          const z = ore.userData.initialZ
          ore.position.y = 0.56 - (z * z) * 0.16
        }
      } else {
        const z = ore.userData.initialZ
        ore.position.y = 0.56 - (z * z) * 0.16
      }
    })

    // ── 4. Animate Laser Sheet Scanning Pulses ─────────────────────
    this.laserPlanes.forEach((laser, idx) => {
      const pulse = 0.35 + Math.sin(time * 8 + idx * 1.5) * 0.25
      laser.material.opacity = pulse
    })

    // ── 5. Animate Joint Glow Auras ────────────────────────────────
    Object.values(this.jointMeshes).forEach(m => {
      if (m.isCritical) {
        const pulse = 1.0 + Math.sin(time * 7) * 0.4
        m.aura.scale.set(pulse, pulse, 1)
        m.pointLight.intensity = 2.5 + Math.sin(time * 7) * 1.8
      }
    })

    // ── 6. Smooth Camera LookAt Interpolation ───────────────────────
    this.currentLookAt.lerp(this.targetLookAt, 0.08)
    this.camera.lookAt(this.currentLookAt)

    this.renderer.render(this.scene, this.camera)
  }

  destroy() {
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.resizeOb) this.resizeOb.disconnect()
    if (this.renderer) {
      this.renderer.dispose()
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
    }
  }
}
