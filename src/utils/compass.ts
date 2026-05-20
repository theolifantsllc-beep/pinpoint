export type CompassSource = 'device' | 'manual' | 'unavailable'

export interface CompassState {
  heading: number
  source: CompassSource
  available: boolean
}

type HeadingCallback = (heading: number) => void

let listener: ((e: DeviceOrientationEvent) => void) | null = null

export function startCompass(onHeading: HeadingCallback): () => void {
  function handleOrientation(e: DeviceOrientationEvent) {
    // webkitCompassHeading is iOS-specific and already gives true north
    const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
    if (ios != null && ios >= 0) {
      onHeading(ios)
      return
    }
    // Android: alpha is degrees from north (but inverted — negate it)
    if (e.alpha != null) {
      const heading = (360 - e.alpha) % 360
      onHeading(heading)
    }
  }

  listener = handleOrientation
  window.addEventListener('deviceorientation', handleOrientation, true)

  return () => {
    if (listener) {
      window.removeEventListener('deviceorientation', listener, true)
      listener = null
    }
  }
}

export async function requestCompassPermission(): Promise<boolean> {
  // iOS 13+ requires explicit permission
  const doeWithPermission = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<string>
  }
  if (typeof doeWithPermission.requestPermission === 'function') {
    try {
      const result = await doeWithPermission.requestPermission()
      return result === 'granted'
    } catch {
      return false
    }
  }
  // Non-iOS: just try to listen
  return new Promise((resolve) => {
    let resolved = false
    const check = (e: DeviceOrientationEvent) => {
      window.removeEventListener('deviceorientation', check, true)
      const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
      resolved = true
      resolve(e.alpha != null || (ios != null && ios >= 0))
    }
    window.addEventListener('deviceorientation', check, true)
    setTimeout(() => {
      if (!resolved) {
        window.removeEventListener('deviceorientation', check, true)
        resolve(false)
      }
    }, 1500)
  })
}
