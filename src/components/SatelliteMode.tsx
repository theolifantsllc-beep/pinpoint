import { useState, useMemo, useEffect } from 'react'
import { MOCK_SATELLITES, getSatellitePosition, type SatelliteEntry, type SatelliteType } from '../data/satelliteData'
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

const SCAN_THRESHOLD = 20 // degrees
const LOCK_THRESHOLD = 5

interface SatResult {
  sat: SatelliteEntry
  pos: { lat: number; lon: number }
  bearing: number
  diff: number
  distKm: number
  locked: boolean
}

const TYPE_COLOR: Record<SatelliteType, string> = {
  ISS: '#f59e0b',
  Starlink: '#00e5ff',
  GPS: '#22c55e',
  Weather: '#60a5fa',
  Science: '#a78bfa',
  Communication: '#f97316',
}

const TYPE_ICON: Record<SatelliteType, string> = {
  ISS: '🛸',
  Starlink: '◦',
  GPS: '◉',
  Weather: '☁',
  Science: '◈',
  Communication: '◎',
}

// Stable star positions
const STARS = Array.from({ length: 60 }, (_, i) => ({
  x: ((i * 83.7 + 11) % 100),
  y: ((i * 61.3 + 7) % 100),
  r: i % 8 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  o: 0.1 + (i % 10) * 0.06,
  twinkle: i % 5 === 0,
}))

function conePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

function SatelliteSkyView({ results, heading }: { results: SatResult[]; heading: number }) {
  const size = 250
  const cx = size / 2

  return (
    <div
      className="relative mx-auto rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Night sky background */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#02050f] via-[#01030a] to-black" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full bg-white ${s.twinkle ? 'animate-pulse' : ''}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r,
            height: s.r,
            opacity: s.o,
            animationDuration: `${2 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Range rings */}
      {[0.3, 0.55, 0.8].map(f => (
        <div
          key={f}
          className="absolute rounded-full border border-slate-800/30"
          style={{ width: size * f, height: size * f, top: (size - size * f) / 2, left: (size - size * f) / 2 }}
        />
      ))}

      {/* SVG: cone, orbit trails, satellite dots */}
      <svg className="absolute inset-0" width={size} height={size}>
        <defs>
          <radialGradient id="satConeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Scan cone */}
        <path
          d={conePath(cx, cx, cx - 6, -SCAN_THRESHOLD, SCAN_THRESHOLD)}
          fill="url(#satConeGrad)"
        />
        {[-SCAN_THRESHOLD, SCAN_THRESHOLD].map(angle => {
          const rad = ((angle - 90) * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={cx} y1={cx}
              x2={cx + (cx - 6) * Math.cos(rad)}
              y2={cx + (cx - 6) * Math.sin(rad)}
              stroke="#22c55e"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          )
        })}

        {/* Satellite markers */}
        {results.map(r => {
          const relAngle = r.bearing - heading
          const rad = ((relAngle - 90) * Math.PI) / 180
          // Scale: max distance ~15000km for LEO to edge; GEO always at ~80%
          const maxDist = r.sat.altitudeKm > 10000 ? 40000 : 12000
          const frac = Math.min(r.distKm / maxDist, 0.85)
          const x = cx + (cx - 14) * frac * Math.cos(rad)
          const y = cx + (cx - 14) * frac * Math.sin(rad)
          const color = TYPE_COLOR[r.sat.type]
          const isLocked = r.locked

          return (
            <g key={r.sat.id}>
              {/* Orbit trail — small arc in direction of travel */}
              <line
                x1={x - 5 * Math.cos((r.sat.orbitHeading * Math.PI) / 180)}
                y1={y - 5 * Math.sin((r.sat.orbitHeading * Math.PI) / 180)}
                x2={x + 5 * Math.cos((r.sat.orbitHeading * Math.PI) / 180)}
                y2={y + 5 * Math.sin((r.sat.orbitHeading * Math.PI) / 180)}
                stroke={color}
                strokeWidth="1"
                strokeOpacity={isLocked ? 0.7 : 0.3}
                strokeDasharray="2 2"
              />

              {/* Lock ring */}
              {isLocked && (
                <circle cx={x} cy={y} r={10} fill="none"
                  stroke={color} strokeWidth="1" strokeOpacity="0.5"
                  className="animate-ping"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}

              {/* Satellite dot */}
              <circle
                cx={x} cy={y}
                r={isLocked ? 5 : r.sat.type === 'ISS' ? 5 : 3}
                fill={color}
                opacity={isLocked ? 1 : 0.75}
                style={isLocked ? { filter: `drop-shadow(0 0 4px ${color})` } : {}}
              />

              {/* Label */}
              {(isLocked || r.sat.type === 'ISS') && (
                <text
                  x={x + 7} y={y + 4}
                  fontSize="7"
                  fill={color}
                  fontFamily="monospace"
                  opacity={0.9}
                >
                  {r.sat.name}
                </text>
              )}
            </g>
          )
        })}

        {/* Horizon line */}
        <line
          x1={6} y1={cx}
          x2={size - 6} y2={cx}
          stroke="#1e3a5f"
          strokeWidth="0.5"
          strokeDasharray="4 4"
          strokeOpacity="0.4"
        />
        <text x={8} y={cx - 3} fontSize="7" fill="#1e4070" fontFamily="monospace" opacity="0.5">HORIZON</text>
      </svg>

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-green-400/60 ring-1 ring-green-400/20" />
      </div>

      {/* Heading */}
      <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none">
        <span className="font-mono text-xs text-green-400/50">
          {Math.round(heading)}° {bearingLabel(heading)}
        </span>
      </div>
    </div>
  )
}

function SatelliteCard({ result, isTop }: { result: SatResult; isTop: boolean }) {
  const { sat, diff, distKm, locked } = result
  const color = TYPE_COLOR[sat.type]

  return (
    <div className={`rounded-xl border px-4 py-3 transition-all result-card-enter ${
      locked
        ? 'border-green-500/50 bg-green-900/10'
        : isTop
        ? 'border-slate-600/50 bg-radar-panel'
        : 'border-radar-border/30 bg-radar-panel/50'
    }`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base" style={{ color }}>{TYPE_ICON[sat.type]}</span>
          <div className="min-w-0">
            <div className={`font-mono font-bold text-sm ${locked ? 'text-green-300' : 'text-white'} truncate`}>
              {sat.name}
            </div>
            <div className="font-mono text-xs text-slate-500">{sat.type}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-mono text-sm font-bold ${locked ? 'text-green-400' : 'text-slate-300'}`}>
            {diff.toFixed(1)}° off
          </div>
          <div className="font-mono text-xs text-slate-500">{formatDistance(distKm)}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
        <Stat label="ALT" value={`${sat.altitudeKm.toLocaleString()} km`} />
        <Stat label="SPEED" value={`${(sat.speedKmh / 1000).toFixed(1)}k km/h`} />
        <Stat label="PERIOD" value={sat.periodMin >= 720 ? `${(sat.periodMin / 60).toFixed(0)}h` : `${sat.periodMin}min`} />
        <Stat label="INCLIN" value={`${sat.inclination}°`} />
        <Stat label="MAG" value={`${sat.magnitude > 0 ? '+' : ''}${sat.magnitude}`} />
        <Stat label="ORBIT" value={sat.altitudeKm > 10000 ? (sat.altitudeKm > 30000 ? 'GEO' : 'MEO') : 'LEO'} />
      </div>

      <p className="font-mono text-xs text-slate-600 mt-2 italic leading-snug">{sat.description}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xs text-slate-600">{label}</div>
      <div className="font-mono text-xs text-slate-300">{value}</div>
    </div>
  )
}

// Legend pill
function TypeLegend() {
  const types: SatelliteType[] = ['ISS', 'Starlink', 'GPS', 'Weather', 'Science', 'Communication']
  return (
    <div className="flex gap-1.5 flex-wrap px-4 pb-1">
      {types.map(t => (
        <span key={t} className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-1">
          <span style={{ color: TYPE_COLOR[t] }}>{TYPE_ICON[t]}</span>
          <span className="text-slate-500">{t}</span>
        </span>
      ))}
    </div>
  )
}

export default function SatelliteMode({
  userLat, userLon, heading, manualHeading, onManualChange, onBack,
}: Props) {
  const [now, setNow] = useState(() => Date.now())

  // Update positions every 2s
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 2000)
    return () => clearInterval(id)
  }, [])

  const results = useMemo<SatResult[]>(() => {
    return MOCK_SATELLITES
      .map(sat => {
        const pos = getSatellitePosition(sat, now)
        const bearing = bearingTo(userLat, userLon, pos.lat, pos.lon)
        const diff = absAngularDiff(heading, bearing)
        const distKm = distanceKm(userLat, userLon, pos.lat, pos.lon)
        return { sat, pos, bearing, diff, distKm, locked: diff <= LOCK_THRESHOLD }
      })
      .filter(r => r.diff <= SCAN_THRESHOLD)
      .sort((a, b) => a.diff - b.diff)
  }, [userLat, userLon, heading, now])

  const lockedSat = results.find(r => r.locked)
  const dirLabel = bearingLabel(heading)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-2">
        <button onClick={onBack} className="font-mono text-xs text-slate-500 active:text-slate-300 transition-colors">
          ← BACK
        </button>
        <div className="text-center">
          <h1 className="font-mono font-bold text-green-400 tracking-widest text-sm">SATELLITE MODE</h1>
          <div className="font-mono text-xs text-slate-600">DEMO ORBITS</div>
        </div>
        <div className="font-mono text-xs text-right">
          <div className="text-slate-400">{Math.round(heading)}°</div>
          <div className="text-slate-600">{dirLabel}</div>
        </div>
      </div>

      {/* Sky view */}
      <div className="flex justify-center py-1">
        <SatelliteSkyView results={results} heading={heading} />
      </div>

      {/* Lock banner */}
      {lockedSat ? (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl border border-green-500/50 bg-green-900/10 flex items-center gap-3">
          <div className="font-mono text-xs text-green-400 font-bold tracking-widest animate-pulse">⊙ LOCKED</div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-sm text-white truncate">{lockedSat.sat.name}</div>
            <div className="font-mono text-xs text-green-600">{lockedSat.sat.altitudeKm.toLocaleString()} km altitude</div>
          </div>
          <div className="font-mono text-xs text-slate-500">{lockedSat.diff.toFixed(1)}°</div>
        </div>
      ) : (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/20 flex items-center gap-2">
          <div className="text-slate-700 text-sm">◎</div>
          <div className="font-mono text-xs text-slate-600 italic">
            {results.length > 0
              ? `${results.length} satellite${results.length > 1 ? 's' : ''} in view — point to lock`
              : 'Scanning orbit…'}
          </div>
        </div>
      )}

      {/* Manual heading */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Legend */}
      <TypeLegend />

      {/* Satellite cards */}
      <div className="flex-1 min-h-0 overflow-y-auto results-list px-4 pb-6 space-y-2">
        <div className="mb-1">
          <span className="font-mono text-xs text-slate-600 tracking-wider">
            WITHIN ±{SCAN_THRESHOLD}° — {results.length} object{results.length !== 1 ? 's' : ''}
          </span>
        </div>

        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3 opacity-20">◎</div>
            <p className="font-mono text-slate-500 text-sm">No satellites in this direction</p>
            <p className="font-mono text-slate-600 text-xs mt-1">Rotate to scan the orbit</p>
          </div>
        )}

        {results.map((r, i) => (
          <SatelliteCard key={r.sat.id} result={r} isTop={i === 0} />
        ))}
      </div>
    </div>
  )
}
