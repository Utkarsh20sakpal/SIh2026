import React, { useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectJoint } from '../../store/slices/twinSlice'
import { ConveyorDigitalTwinEngine } from './DigitalTwin3D'

export function DigitalTwinCanvas({ className = '', onSelectJoint }) {
  const containerRef = useRef(null)
  const engineRef    = useRef(null)
  const dispatch     = useDispatch()

  const { beltSpeed, joints, selectedJointId, camera } = useSelector(s => s.twin)

  const handleJointSelect = useCallback((id) => {
    dispatch(selectJoint(id))
    if (onSelectJoint) onSelectJoint(id)
  }, [dispatch, onSelectJoint])

  // Init Three.js engine once
  useEffect(() => {
    if (!containerRef.current) return
    const engine = new ConveyorDigitalTwinEngine(containerRef.current, {
      length: 26,
      onJointSelect: handleJointSelect,
    })
    engineRef.current = engine

    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [handleJointSelect])

  // Sync belt speed
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.beltSpeed = beltSpeed
    }
  }, [beltSpeed])

  // Sync joint visual state (colors, emissive, aura)
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateJointStates(joints)
    }
  }, [joints])

  // Focus camera when joint selection changes
  useEffect(() => {
    if (engineRef.current && selectedJointId) {
      engineRef.current.focusJoint(selectedJointId)
    }
  }, [selectedJointId])

  // Sync camera angle preset
  useEffect(() => {
    if (engineRef.current && camera) {
      engineRef.current.setCameraPreset(camera)
    }
  }, [camera])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing ${className}`}
      aria-label="3D Conveyor Belt Digital Twin WebGL Viewport"
    />
  )
}
