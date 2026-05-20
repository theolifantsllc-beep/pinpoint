import { useState, useEffect, useCallback } from 'react'
import PermissionScreen from './components/PermissionScreen'
import CompassView from './components/CompassView'
import GameMode from './components/GameMode'
import InvisibleLines from './components/InvisibleLines'
import FlightRadarMode from './components/FlightRadarMode'
import { requestCompassPermission, startCompass } from './utils/compass'

type Screen = 'permission' | 'compass' | 'game' | 'lines' | 'flight'

export interface AppState {
  locationGranted: boolean
  compassGranted: boolean
  compassAvailable: boolean
  userLat: number | null
  userLon: number | null
  heading: number
  manualHeading: boolean
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('permission')
  const [state, setState] = useState<AppState>({
    locationGranted: false,
    compassGranted: false,
    compassAvailable: false,
    userLat: null,
    userLon: null,
    heading: 0,
    manualHeading: false,
  })

  const updateHeading = useCallback((h: number) => {
    setState(prev => ({ ...prev, heading: h }))
  }, [])

  // Start compass once granted
  useEffect(() => {
    if (!state.compassGranted) return
    const stop = startCompass(updateHeading)
    return stop
  }, [state.compassGranted, updateHeading])

  const handleRequestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState(prev => ({
          ...prev,
          locationGranted: true,
          userLat: pos.coords.latitude,
          userLon: pos.coords.longitude,
        }))
      },
      () => {
        // Use a fallback location (center of world) so the app still works
        setState(prev => ({
          ...prev,
          locationGranted: true,
          userLat: 52.3676,
          userLon: 4.9041,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleRequestCompass = async () => {
    const granted = await requestCompassPermission()
    if (granted) {
      setState(prev => ({ ...prev, compassGranted: true, compassAvailable: true, manualHeading: false }))
    } else {
      setState(prev => ({ ...prev, compassGranted: true, compassAvailable: false, manualHeading: true }))
    }
  }

  const handleStart = () => {
    setScreen('compass')
  }

  const handleManualChange = (h: number) => {
    setState(prev => ({ ...prev, heading: h }))
  }

  const canStart = state.locationGranted && state.compassGranted

  if (screen === 'permission') {
    return (
      <PermissionScreen
        locationGranted={state.locationGranted}
        compassGranted={state.compassGranted}
        onRequestLocation={handleRequestLocation}
        onRequestCompass={handleRequestCompass}
        onStart={handleStart}
        canStart={canStart}
      />
    )
  }

  if (screen === 'game') {
    return (
      <GameMode
        userLat={state.userLat!}
        userLon={state.userLon!}
        heading={state.heading}
        manualHeading={state.manualHeading}
        onManualChange={handleManualChange}
        onBack={() => setScreen('compass')}
      />
    )
  }

  if (screen === 'lines') {
    return (
      <InvisibleLines
        userLat={state.userLat!}
        userLon={state.userLon!}
        heading={state.heading}
        manualHeading={state.manualHeading}
        onManualChange={handleManualChange}
        onBack={() => setScreen('compass')}
      />
    )
  }

  if (screen === 'flight') {
    return (
      <FlightRadarMode
        userLat={state.userLat!}
        userLon={state.userLon!}
        heading={state.heading}
        manualHeading={state.manualHeading}
        onManualChange={handleManualChange}
        onBack={() => setScreen('compass')}
      />
    )
  }

  return (
    <CompassView
      userLat={state.userLat!}
      userLon={state.userLon!}
      heading={state.heading}
      manualHeading={state.manualHeading}
      compassAvailable={state.compassAvailable}
      onManualChange={handleManualChange}
      onGameMode={() => setScreen('game')}
      onInvisibleLines={() => setScreen('lines')}
      onFlightRadar={() => setScreen('flight')}
    />
  )
}
