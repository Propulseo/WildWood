'use client'

import { useState, useEffect } from 'react'

type Device = 'mobile' | 'tablet' | 'desktop'

interface DeviceInfo {
  device: Device
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

function getDevice(w: number): Device {
  if (w < 768) return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function useDevice(): DeviceInfo {
  const [device, setDevice] = useState<Device>('desktop')

  useEffect(() => {
    function update() { setDevice(getDevice(window.innerWidth)) }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    device,
    isMobile: device === 'mobile',
    isTablet: device === 'tablet',
    isDesktop: device === 'desktop',
  }
}
