import { useMemo, useState } from 'react'
import RadarCompass from './RadarCompass'
import CityResultCard from './CityResultCard'
import ManualHeadingControl from './ManualHeadingControl'
import { CITIES } from '../utils/cities'
import { bearingTo, distanceKm, absAngularDiff, bearingLabel } from '../utils/geo'

const THRESHOLD = 8 // degrees

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  compassAvailable: boolean
  onManualChange: (h: number) => void
  onGameMode: () => void
  onInvisibleLines: () => void
  onFlightRadar: () => void
  onSearch: () => void
  onSweep: () => void
  onLayers: () => void
  onRadio: () => void
  onSatellite: () => void
}

export default function CompassView({
  userLat,
  userLon,
  heading,
  manualHeading,
  onManualChange,
  onGameMode,
  onInvisibleLines,
  onFlightRadar,
  onSearch,
  onSweep,
  onLayers,
  onRadio,
  onSatellite,
}: Props) {
  const results = useMemo(() => {
    return CITIES
      .map(city => {
        const bearing = bearingTo(userLat, userLon, city.lat, city.lon)
        const diff = absAngularDiff(heading, bearing)
        const dist = distanceKm(userLat, userLon, city.lat, city.lon)
        return { city, bearing, diff, dist }
      })
      .filter(r => r.diff <= THRESHOLD && r.dist > 1)
      .sort((a, b) => a.diff !== b.diff ? a.diff - b.diff : a.dist - b.dist)
      .slice(0, 10)
  }, [userLat, userLon, heading])

  const [menuOpen, setMenuOpen] = useState(false)
  const dirLabel = bearingLabel(heading)

  const MODES = [
    { icon: '🔍', label: 'Search',    onClick: onSearch },
    { icon: '〰️', label: 'Lines',     onClick: onInvisibleLines },
    { icon: '✈️', label: 'Flights',   onClick: onFlightRadar },
    { icon: '🌍', label: 'Sweep',     onClick: onSweep },
    { icon: '🌐', label: 'Layers',    onClick: onLayers },
    { icon: '📻', label: 'Radio',     onClick: onRadio },
    { icon: '🛸', label: 'Satellite', onClick: onSatellite },
    { icon: '▶',  label: 'Game',      onClick: onGameMode, accent: true },
  ]

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
      {/* Menu overlay */}
      {menuOpen && (
        <div
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-radar-panel border-t border-slate-700/60 rounded-t-2xl px-4 pt-4 pb-safe-bottom pb-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto mb-4" />
            <p className="font-mono text-xs text-slate-500 tracking-widest text-center mb-3">SELECT MODE</p>
            <div className="grid grid-cols-4 gap-3">
              {MODES.map(m => (
                <button
                  key={m.label}
                  onClick={() => { setMenuOpen(false); m.onClick() }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border active:scale-95 transition-all ${
                    m.accent
                      ? 'border-radar-accent/50 bg-radar-accent/10 text-radar-accent'
                      : 'border-slate-700/60 bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <span className="text-xl leading-none">{m.icon}</span>
                  <span className="font-mono text-xs text-slate-400">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-2">
        <div>
          <h1 className="font-mono font-bold text-radar-accent text-xl tracking-widest">PINPOINT</h1>
          <p className="font-mono text-xs text-slate-500">Compass mode</p>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          className="w-10 h-10 rounded-xl border border-slate-700/60 bg-slate-800/50 flex items-center justify-center text-slate-400 active:scale-95 transition-all"
        >
          ☰
        </button>
      </div>

      {/* Compass */}
      <div className="flex flex-col items-center pt-1 pb-0">
        <RadarCompass heading={heading} />

        {/* Heading readout — overlaid just below compass */}
        <div className="flex items-baseline gap-1 -mt-1">
          <span className="font-mono text-4xl font-bold text-white tabular-nums leading-none">
            {Math.round(heading).toString().padStart(3, '0')}
          </span>
          <span className="font-mono text-xl text-radar-accent leading-none">°</span>
          <span className="font-mono text-xl font-bold text-radar-accent tracking-widest ml-1 leading-none">
            {dirLabel}
          </span>
        </div>
      </div>

      {/* Manual slider */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Results */}
      <div className="flex-1 flex flex-col min-h-0 px-4 pb-safe-bottom pb-4">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-2.5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
          <span className="font-mono text-xs text-slate-600 tracking-widest shrink-0">
            {results.length > 0
              ? `${results.length} CITIES  ·  ±${THRESHOLD}°`
              : `SCANNING  ·  ±${THRESHOLD}°`}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        </div>

        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full border border-slate-800 bg-radar-panel/60 flex items-center justify-center mb-4">
              <span className="text-slate-700 text-2xl">◎</span>
            </div>
            <p className="font-mono text-slate-500 text-sm">Nothing in this direction</p>
            <p className="font-mono text-slate-700 text-xs mt-1.5">Rotate slowly to scan</p>
          </div>
        ) : (
          <div className="results-list flex-1 space-y-1.5">
            {results.map((r, i) => (
              <CityResultCard
                key={r.city.id}
                city={r.city}
                distance={r.dist}
                bearingDiff={r.diff}
                isTop={i === 0}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

