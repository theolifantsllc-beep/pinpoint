import { City } from '../utils/cities'
import { formatDistance } from '../utils/geo'

interface Props {
  city: City
  distance: number
  bearingDiff: number
  isTop: boolean
  index: number
}

export default function CityResultCard({ city, distance, bearingDiff, isTop, index }: Props) {
  // Alignment quality: 0° = perfect, 8° = threshold edge
  const alignPct = Math.max(0, 1 - bearingDiff / 8)
  const alignColor = bearingDiff < 2
    ? '#00ff88'
    : bearingDiff < 4
    ? '#00e5ff'
    : bearingDiff < 6
    ? '#ffaa00'
    : '#4a6070'

  const badge = city.type === 'capital'
    ? { label: 'CAPITAL', color: 'text-radar-accent border-radar-accent/40 bg-radar-accent/10' }
    : city.type === 'landmark'
    ? { label: 'LANDMARK', color: 'text-radar-warn border-radar-warn/40 bg-radar-warn/10' }
    : { label: 'CITY', color: 'text-slate-500 border-slate-700/60 bg-slate-800/40' }

  return (
    <div
      className={`result-card-enter flex items-stretch gap-0 rounded-xl border overflow-hidden transition-all ${
        isTop
          ? 'border-radar-accent/40 bg-radar-panel shadow-lg shadow-radar-accent/8'
          : 'border-slate-800/80 bg-radar-panel/60'
      }`}
      style={{ animationDelay: `${index * 35}ms` }}
    >
      {/* Alignment bar — left strip colored by how close bearing is */}
      <div
        className="w-1 shrink-0 rounded-l-xl transition-all duration-300"
        style={{
          background: `linear-gradient(to bottom, ${alignColor}${Math.round(alignPct * 255).toString(16).padStart(2, '0')}, transparent)`,
          opacity: 0.8 + alignPct * 0.2,
        }}
      />

      {/* Content */}
      <div className="flex items-center gap-3 px-3 py-2.5 flex-1 min-w-0">
        {/* City info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`font-mono font-bold text-sm truncate ${isTop ? 'text-white' : 'text-slate-200'}`}>
              {city.name}
            </span>
            <span className={`font-mono text-xs px-1.5 py-px rounded border shrink-0 ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <div className="font-mono text-xs text-slate-500 truncate">
            {city.country}
          </div>
        </div>

        {/* Metrics */}
        <div className="text-right shrink-0 space-y-0.5">
          <div className={`font-mono text-sm font-bold tabular-nums ${isTop ? 'text-white' : 'text-slate-300'}`}>
            {formatDistance(distance)}
          </div>
          <div className="font-mono text-xs tabular-nums" style={{ color: alignColor }}>
            {bearingDiff < 0.5 ? 'dead ahead' : `${bearingDiff.toFixed(1)}° off`}
          </div>
        </div>
      </div>
    </div>
  )
}
