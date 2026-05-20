import { useState, useEffect, useRef, useMemo } from 'react'
import { getNearbyFlights, type Aircraft } from '../utils/flightService'
import { bearingTo, distanceKm, absAngularDiff, formatDistance, bearingLabel } from '../utils/geo'
import ManualHeadingControl from './ManualHeadingControl'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

const H_THRESHOLD = 25 // degrees horizontal cone

interface AircraftResult {
  aircraft: Aircraft
  bearing: number
  diff: number
  distKm: number
  locked: boolean
}

function altitudeFt(m: number) {
  return `${Math.round(m * 3.281).toLocaleString()} ft`
}

function SkyRadarView({ results, heading }: { results: AircraftResult[]; heading: number }) {
  const size = 260
  const cx = size / 2

  return (
    <div
      className="relative mx-auto overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      {/* Sky background */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-slate-900 via-slate-950 to-black">
        {/* Stars */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: s.x, top: s.y, width: s.r, height: s.r, opacity: s.o }}
          />
        ))}
      </div>

      {/* Range rings */}
      {[0.25, 0.5, 0.75].map(f => (
        <div
          key={f}
          className="absolute rounded-full border border-slate-700/30"
          style={{
            width: size * f,
            height: size * f,
            top: (size - size * f) / 2,
            left: (size - size * f) / 2,
          }}
        />
      ))}

      {/* Viewing cone */}
      <svg className="absolute inset-0" width={size} height={size}>
        <defs>
          <radialGradient id="coneGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Cone sector pointing up (north = current heading) */}
        <path
          d={conePath(cx, cx, cx - 6, -H_THRESHOLD, H_THRESHOLD)}
          fill="url(#coneGrad)"
        />
        {/* Cone edges */}
        {[-H_THRESHOLD, H_THRESHOLD].map(angle => {
          const rad = ((angle - 90) * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={cx} y1={cx}
              x2={cx + (cx - 6) * Math.cos(rad)}
              y2={cx + (cx - 6) * Math.sin(rad)}
              stroke="#00e5ff"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          )
        })}
      </svg>

      {/* Aircraft dots */}
      {results.map(r => {
        // Convert relative bearing to position on radar
        const relAngle = r.bearing - heading
        const rad = ((relAngle - 90) * Math.PI) / 180
        // Scale distance: max ~15000km maps to edge
        const radialFrac = Math.min(r.distKm / 14000, 0.9)
        const x = cx + (cx - 14) * radialFrac * Math.cos(rad)
        const y = cx + (cx - 14) * radialFrac * Math.sin(rad)

        return (
          <div
            key={r.aircraft.id}
            className="absolute"
            style={{ left: x - 8, top: y - 8, width: 16, height: 16 }}
          >
            {/* Ping for locked */}
            {r.locked && (
              <div className="absolute inset-0 rounded-full border border-radar-accent animate-ping opacity-60" />
            )}
            {/* Aircraft dot */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-all ${
                r.locked ? 'scale-125' : ''
              }`}
              style={{ transform: `rotate(${r.aircraft.heading - heading}deg)` }}
            >
              <div
                className={`text-sm leading-none ${r.locked ? 'text-radar-accent' : 'text-slate-400'}`}
              >
                ✈
              </div>
            </div>
            {/* Label for locked */}
            {r.locked && (
              <div
                className="absolute left-5 top-0 bg-radar-bg/90 border border-radar-accent/60 rounded px-1.5 py-0.5 whitespace-nowrap"
                style={{ fontSize: 9 }}
              >
                <span className="font-mono text-radar-accent font-bold">
                  {r.aircraft.flightNumber}
                </span>
              </div>
            )}
          </div>
        )
      })}

      {/* Center cross */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-radar-accent/80 ring-2 ring-radar-accent/20" />
      </div>

      {/* Heading label */}
      <div className="absolute top-2 left-0 right-0 flex justify-center">
        <span className="font-mono text-xs text-radar-accent/70">{Math.round(heading)}° {bearingLabel(heading)}</span>
      </div>
    </div>
  )
}

export default function FlightRadarMode({
  userLat, userLon, heading, manualHeading, onManualChange, onBack,
}: Props) {
  const [flights, setFlights] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = async () => {
    const data = await getNearbyFlights(userLat, userLon)
    setFlights(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    intervalRef.current = setInterval(load, 15000) // refresh every 15s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLat, userLon])

  const results = useMemo<AircraftResult[]>(() => {
    return flights
      .map(ac => {
        const bearing = bearingTo(userLat, userLon, ac.lat, ac.lon)
        const diff = absAngularDiff(heading, bearing)
        const distKm = distanceKm(userLat, userLon, ac.lat, ac.lon)
        return { aircraft: ac, bearing, diff, distKm, locked: diff <= 5 }
      })
      .filter(r => r.diff <= H_THRESHOLD)
      .sort((a, b) => a.diff - b.diff)
  }, [flights, userLat, userLon, heading])

  const lockedFlight = results.find(r => r.locked)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={onBack} className="font-mono text-xs text-slate-500 active:text-slate-300 transition-colors">
          ← BACK
        </button>
        <div className="text-center">
          <h1 className="font-mono font-bold text-radar-accent tracking-widest text-sm">FLIGHT RADAR</h1>
          <div className="font-mono text-xs text-slate-600">DEMO DATA</div>
        </div>
        <div className="font-mono text-xs text-slate-500 text-right">
          {loading ? '...' : `${flights.length} flights`}
        </div>
      </div>

      {/* Sky radar */}
      <div className="flex justify-center py-2">
        <SkyRadarView results={results} heading={heading} />
      </div>

      {/* Locked flight banner */}
      {lockedFlight && (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl border border-radar-accent/60 bg-radar-accent/10 flex items-center gap-3 animate-pulse">
          <div className="text-radar-accent font-mono text-xs font-bold">⊙ LOCKED</div>
          <div className="flex-1 font-mono text-sm font-bold text-white truncate">
            Flight to {lockedFlight.aircraft.destination}
          </div>
          <div className="font-mono text-xs text-radar-accent">{lockedFlight.diff.toFixed(1)}° off</div>
        </div>
      )}

      {/* Manual heading */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Flight list */}
      <div className="flex-1 min-h-0 overflow-y-auto results-list px-4 pb-6 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-xs text-slate-600 tracking-wider">
            WITHIN ±{H_THRESHOLD}° — {results.length} aircraft
          </span>
        </div>

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">✈️</div>
            <p className="font-mono text-slate-500 text-sm">No flights in this direction</p>
            <p className="font-mono text-slate-600 text-xs mt-1">Rotate to scan the sky</p>
          </div>
        )}

        {results.map((r, i) => (
          <FlightCard key={r.aircraft.id} result={r} isTop={i === 0} />
        ))}
      </div>
    </div>
  )
}

function FlightCard({ result, isTop }: { result: AircraftResult; isTop: boolean }) {
  const { aircraft: ac, diff, distKm, locked } = result
  return (
    <div className={`rounded-xl border px-4 py-3 transition-all result-card-enter ${
      locked
        ? 'border-radar-accent/60 bg-radar-accent/10'
        : isTop
        ? 'border-slate-600/60 bg-radar-panel'
        : 'border-radar-border/40 bg-radar-panel/60'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="font-mono font-bold text-sm text-white truncate">
            ✈ Flight to {ac.destination}
          </div>
          <div className="font-mono text-xs text-slate-400 truncate">
            {ac.airline} · {ac.flightNumber}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-mono text-sm font-bold ${locked ? 'text-radar-accent' : 'text-slate-300'}`}>
            {diff.toFixed(1)}° off
          </div>
          <div className="font-mono text-xs text-slate-500">{formatDistance(distKm)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1">
        <Stat label="FROM" value={ac.originCode || ac.origin} />
        <Stat label="TO" value={ac.destinationCode || ac.destination} />
        <Stat label="TYPE" value={ac.aircraftType.split(' ').pop() ?? ac.aircraftType} />
        <Stat label="ALT" value={altitudeFt(ac.altitudeM)} />
        <Stat label="SPEED" value={`${Math.round(ac.speedKmh)} km/h`} />
        <Stat label="HDG" value={`${Math.round(ac.heading)}°`} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-slate-600">{label}</div>
      <div className="font-mono text-xs text-slate-300 truncate">{value}</div>
    </div>
  )
}

function conePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

// Pre-generate random star positions (stable across renders)
const STARS = Array.from({ length: 40 }, () => ({
  x: `${Math.random() * 100}%`,
  y: `${Math.random() * 100}%`,
  r: Math.random() < 0.3 ? 1.5 : 1,
  o: 0.2 + Math.random() * 0.5,
}))
