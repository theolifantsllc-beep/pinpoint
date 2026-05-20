import { useState, useRef, useEffect, useMemo } from 'react'
import { searchLocations, getRecentSearches, saveRecentSearch, type SearchLocation } from '../utils/searchLocations'
import { bearingTo, distanceKm, angularDiff, formatDistance, bearingLabel } from '../utils/geo'
import ManualHeadingControl from './ManualHeadingControl'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

const TYPE_LABEL: Record<string, string> = {
  capital: 'Capital',
  major_city: 'City',
  landmark: 'Landmark',
  country: 'Country',
  continent: 'Continent',
}
const TYPE_COLOR: Record<string, string> = {
  capital: 'text-radar-accent',
  major_city: 'text-slate-400',
  landmark: 'text-radar-warn',
  country: 'text-radar-green',
  continent: 'text-purple-400',
}

export default function SearchPoint({ userLat, userLon, heading, manualHeading, onManualChange, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<SearchLocation | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recents, setRecents] = useState<SearchLocation[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setRecents(getRecentSearches())
  }, [])

  const results = useMemo(() => searchLocations(query, 8), [query])

  const targetBearing = useMemo(
    () => (target ? bearingTo(userLat, userLon, target.lat, target.lon) : 0),
    [target, userLat, userLon]
  )
  const targetDist = useMemo(
    () => (target ? distanceKm(userLat, userLon, target.lat, target.lon) : 0),
    [target, userLat, userLon]
  )
  // Signed diff: positive = target is to the RIGHT, negative = to the LEFT
  const diff = target ? angularDiff(heading, targetBearing) : 0
  const absDiff = Math.abs(diff)
  const locked = absDiff < 4

  function selectTarget(loc: SearchLocation) {
    setTarget(loc)
    setQuery(loc.name)
    setShowDropdown(false)
    saveRecentSearch(loc)
    setRecents(getRecentSearches())
    inputRef.current?.blur()
  }

  function clearTarget() {
    setTarget(null)
    setQuery('')
    setShowDropdown(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const showList = showDropdown && (query.length > 0 ? results.length > 0 : recents.length > 0)
  const listItems = query.length > 0 ? results : recents

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button onClick={onBack} className="font-mono text-xs text-slate-500 active:text-slate-300 shrink-0">
          ← BACK
        </button>
        {/* Search bar */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true); if (!e.target.value) setTarget(null) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Search city, country, landmark…"
            className="w-full bg-radar-panel border border-radar-border rounded-xl px-4 py-2.5 font-mono text-sm text-white placeholder-slate-600 outline-none focus:border-radar-accent/60 transition-colors"
          />
          {query && (
            <button
              onMouseDown={e => { e.preventDefault(); clearTarget() }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* ── Autocomplete dropdown ───────────────────────────── */}
      {showList && (
        <div className="mx-4 mb-1 rounded-xl border border-radar-border bg-radar-panel shadow-2xl shadow-black/60 overflow-hidden z-10">
          {query.length === 0 && (
            <div className="px-4 py-2 font-mono text-xs text-slate-600 tracking-wider border-b border-radar-border">
              RECENT SEARCHES
            </div>
          )}
          {listItems.map(loc => (
            <button
              key={loc.id}
              onMouseDown={e => { e.preventDefault(); selectTarget(loc) }}
              onTouchStart={() => selectTarget(loc)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 active:bg-slate-700/60 transition-colors text-left border-b border-radar-border/40 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm text-white truncate">{loc.name}</div>
                <div className="font-mono text-xs text-slate-500 truncate">{loc.country}</div>
              </div>
              <span className={`font-mono text-xs shrink-0 ${TYPE_COLOR[loc.type]}`}>
                {TYPE_LABEL[loc.type]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── No target selected: idle state ─────────────────── */}
      {!target && !showList && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full border border-radar-border flex items-center justify-center mb-5 relative">
            <div className="absolute inset-0 rounded-full border border-radar-accent/10 animate-ping" style={{ animationDuration: '3s' }} />
            <svg viewBox="0 0 48 48" className="w-12 h-12">
              <circle cx="24" cy="24" r="20" stroke="#00e5ff" strokeWidth="0.8" fill="none" strokeOpacity="0.3" />
              <line x1="24" y1="4" x2="24" y2="44" stroke="#0d3a4f" strokeWidth="0.8" />
              <line x1="4" y1="24" x2="44" y2="24" stroke="#0d3a4f" strokeWidth="0.8" />
              <circle cx="24" cy="24" r="3" fill="#00e5ff" fillOpacity="0.4" />
              <polygon points="24,4 26.5,14 24,12 21.5,14" fill="#00e5ff" />
            </svg>
          </div>
          <p className="font-mono text-slate-400 text-sm mb-1">Search for any place on Earth</p>
          <p className="font-mono text-slate-600 text-xs">Then point your phone toward it</p>
          {recents.length > 0 && (
            <div className="mt-8 w-full max-w-xs">
              <div className="font-mono text-xs text-slate-600 tracking-wider mb-2">RECENT</div>
              <div className="space-y-1">
                {recents.slice(0, 4).map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectTarget(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-radar-border/50 bg-radar-panel/60 active:bg-slate-800 transition-colors"
                  >
                    <span className="font-mono text-sm text-slate-300 flex-1 text-left">{r.name}</span>
                    <span className={`font-mono text-xs ${TYPE_COLOR[r.type]}`}>{TYPE_LABEL[r.type]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Target selected: guidance mode ─────────────────── */}
      {target && !showList && (
        <div className="flex-1 flex flex-col items-center min-h-0 px-4 pb-4">

          {/* Direction compass */}
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-xs">
            <DirectionCompass diff={diff} locked={locked} />

            {/* Turn instruction */}
            <div className="mt-3 text-center h-8 flex items-center justify-center">
              {locked ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-radar-green animate-ping" />
                  <span className="font-mono font-bold text-radar-green tracking-widest text-sm">TARGET ACQUIRED</span>
                  <div className="w-2 h-2 rounded-full bg-radar-green animate-ping" />
                </div>
              ) : (
                <span className="font-mono text-sm text-slate-400">
                  Turn <span className={`font-bold ${diff > 0 ? 'text-radar-warn' : 'text-blue-400'}`}>
                    {diff > 0 ? `${Math.round(diff)}° right` : `${Math.round(-diff)}° left`}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Manual heading */}
          {manualHeading && (
            <div className="w-full mb-3">
              <ManualHeadingControl heading={heading} onChange={onManualChange} />
            </div>
          )}

          {/* Target info card */}
          <div className={`w-full rounded-2xl border p-4 transition-all ${
            locked
              ? 'border-radar-green/50 bg-radar-green/10 shadow-lg shadow-radar-green/10'
              : 'border-radar-border bg-radar-panel'
          }`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-mono font-bold text-white text-lg leading-tight truncate">{target.name}</div>
                <div className="font-mono text-sm text-slate-400">{target.country}</div>
              </div>
              <span className={`font-mono text-xs mt-1 shrink-0 ${TYPE_COLOR[target.type]}`}>
                {TYPE_LABEL[target.type]}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InfoCell label="DISTANCE" value={formatDistance(targetDist)} highlight={locked} />
              <InfoCell label="BEARING" value={`${Math.round(targetBearing)}°`} />
              <InfoCell label="DIRECTION" value={bearingLabel(targetBearing)} />
              <InfoCell label="OFF BY" value={absDiff < 0.5 ? '< 0.5°' : `${absDiff.toFixed(1)}°`} highlight={locked} />
              <InfoCell label="YOUR HDG" value={`${Math.round(heading)}°`} />
              <InfoCell label="TARGET" value={bearingLabel(targetBearing)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Direction Compass ──────────────────────────────────────────────────────────
// Arrow points toward the target. When diff = 0, it points straight up = aligned.

function DirectionCompass({ diff, locked }: { diff: number; locked: boolean }) {
  const size = 220
  const cx = size / 2
  const r = size / 2 - 8

  const arrowColor = locked ? '#00ff88'
    : Math.abs(diff) < 10 ? '#ffaa00'
    : Math.abs(diff) < 25 ? '#ff8c00'
    : '#00e5ff'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Locked glow ring */}
      {locked && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'radial-gradient(circle, #00ff88 0%, transparent 70%)' }}
        />
      )}

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={locked ? '#00ff88' : '#00e5ff'}
          strokeWidth="1.5" strokeOpacity={locked ? 0.5 : 0.2} />
        {/* Inner ring */}
        <circle cx={cx} cy={cx} r={r - 20} fill="none" stroke="#0d3a4f" strokeWidth="0.5" />

        {/* Tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const deg = i * 10
          const isMajor = deg % 90 === 0
          const angle = (deg * Math.PI) / 180
          const x1 = cx + (r - 2) * Math.sin(angle)
          const y1 = cx - (r - 2) * Math.cos(angle)
          const x2 = cx + (r - 2 - (isMajor ? 12 : 5)) * Math.sin(angle)
          const y2 = cx - (r - 2 - (isMajor ? 12 : 5)) * Math.cos(angle)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isMajor ? '#00e5ff' : '#0d3a4f'} strokeWidth={isMajor ? 1.5 : 0.8} />
        })}

        {/* Cardinal labels (fixed — N always up) */}
        {[['N', 0], ['E', 90], ['S', 180], ['W', 270]].map(([label, deg]) => {
          const angle = (Number(deg) * Math.PI) / 180
          const lr = r - 28
          const x = cx + lr * Math.sin(angle)
          const y = cx - lr * Math.cos(angle)
          return (
            <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="central"
              fill="#3d6b7a" fontSize="10" fontFamily="monospace">{label}</text>
          )
        })}

        {/* Rotating arrow group */}
        <g transform={`rotate(${diff}, ${cx}, ${cx})`}>
          {/* Arrow shaft */}
          <line x1={cx} y1={cx + 40} x2={cx} y2={cx - r + 26}
            stroke={arrowColor} strokeWidth="2.5" strokeLinecap="round"
            style={{ filter: locked ? `drop-shadow(0 0 6px ${arrowColor})` : undefined }} />
          {/* Arrowhead */}
          <polygon
            points={`${cx},${cx - r + 18} ${cx - 8},${cx - r + 34} ${cx + 8},${cx - r + 34}`}
            fill={arrowColor}
            style={{ filter: locked ? `drop-shadow(0 0 8px ${arrowColor})` : undefined }}
          />
          {/* Tail */}
          <line x1={cx} y1={cx + 40} x2={cx} y2={cx + 50}
            stroke={arrowColor} strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
        </g>

        {/* Center dot */}
        <circle cx={cx} cy={cx} r="5" fill={arrowColor}
          style={{ filter: locked ? `drop-shadow(0 0 6px ${arrowColor})` : undefined }} />
      </svg>

      {/* Degree readout overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="mt-16 text-center">
          <div className={`font-mono text-xs ${locked ? 'text-radar-green' : 'text-slate-600'}`}>
            {locked ? '● LOCKED' : `${Math.abs(diff).toFixed(1)}°`}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="text-center">
      <div className="font-mono text-xs text-slate-600 mb-0.5">{label}</div>
      <div className={`font-mono text-xs font-bold ${highlight ? 'text-radar-green' : 'text-slate-300'}`}>{value}</div>
    </div>
  )
}
