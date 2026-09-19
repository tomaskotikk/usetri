'use client'
import { useEffect } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

export function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { damping: 30, stiffness: 45, mass: 1.1 })
  const display = useTransform(spring, (v) => `${Math.round(v).toLocaleString('cs-CZ')}${suffix}`)

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  return <motion.span>{display}</motion.span>
}
