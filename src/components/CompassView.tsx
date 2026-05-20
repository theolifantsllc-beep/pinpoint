import { useMemo, type ReactNode } from 'react'
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

  const dirLabel = bearingLabel(heading)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-2">
        <div>
          <h1 className="font-mono font-bold text-radar-accent text-xl tracking-widest">PINPOINT</h1>
          <p className="font-mono text-xs text-slate-500">Compass mode</p>
        </div>
        <div className="flex gap-1.5">
          <ModeBtn onClick={onSearch} title="Search & Point">🔍</ModeBtn>
          <ModeBtn onClick={onInvisibleLines} title="Invisible Lines">〰️</ModeBtn>
          <ModeBtn onClick={onFlightRadar} title="Flight Radar">✈️</ModeBtn>
          <ModeBtn onClick={onSweep} title="Country Sweep">🌍</ModeBtn>
          <ModeBtn onClick={onLayers} title="World Layers">🌐</ModeBtn>
          <ModeBtn onClick={onRadio} title="Radio Earth">📻</ModeBtn>
          <ModeBtn onClick={onSatellite} title="Satellite Mode">🛸</ModeBtn>
          <ModeBtn onClick={onGameMode} title="Game Mode" accent>▶</ModeBtn>
        </div>
      </div>

      {/* Compass */}
      <div className="flex flex-col items-center py-2">
        <RadarCompass heading={heading} />

        {/* Heading readout */}
        <div className="mt-2 text-center">
          <span className="font-mono text-5xl font-bold text-white">{Math.round(heading)}</span>
          <span className="font-mono text-2xl text-radar-accent ml-1">°</span>
          <div className="font-mono text-lg text-radar-accent tracking-widest mt-0.5">{dirLabel}</div>
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
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-slate-500 tracking-wider">
            POINTING {dirLabel} — {Math.round(heading)}°
          </span>
          <span className="font-mono text-xs text-slate-600">
            {results.length} found (±{THRESHOLD}°)
          </span>
        </div>

        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-3">
              <span className="text-slate-600 text-xl">◎</span>
            </div>
            <p className="font-mono text-slate-500 text-sm">No cities in this direction</p>
            <p className="font-mono text-slate-600 text-xs mt-1">Rotate to find matches</p>
          </div>
        ) : (
          <div className="results-list flex-1 space-y-2">
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

function ModeBtn({ onClick, title, children, accent }: {
  onClick: () => void
  title: string
  children: ReactNode
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base active:scale-95 transition-all ${
        accent
          ? 'border-radar-accent/50 bg-radar-accent/10 text-radar-accent'
          : 'border-slate-700/60 bg-slate-800/50 text-slate-400'
      }`}
    >
      {children}
    </button>
  )
}
