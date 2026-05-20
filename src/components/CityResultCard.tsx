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
  const typeColor: Record<string, string> = {
    capital: 'text-radar-accent',
    major_city: 'text-slate-400',
    landmark: 'text-radar-warn',
  }
  const typeBadge: Record<string, string> = {
    capital: 'CAPITAL',
    major_city: 'CITY',
    landmark: 'LANDMARK',
  }

  return (
    <div
      className={`result-card-enter flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
        isTop
          ? 'border-radar-accent/60 bg-radar-accent/10 shadow-md shadow-radar-accent/10'
          : 'border-radar-border/60 bg-radar-panel/80'
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Rank */}
      <div className={`w-6 text-center text-xs font-mono font-bold ${isTop ? 'text-radar-accent' : 'text-slate-600'}`}>
        {isTop ? '◆' : `${index + 1}`}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-mono font-semibold text-sm truncate ${isTop ? 'text-white' : 'text-slate-200'}`}>
            {city.name}
          </span>
          <span className={`text-xs font-mono shrink-0 ${typeColor[city.type]}`}>
            {typeBadge[city.type]}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-mono truncate">{city.country}</div>
      </div>

      {/* Metrics */}
      <div className="text-right shrink-0">
        <div className={`font-mono text-sm font-semibold ${isTop ? 'text-radar-green' : 'text-slate-300'}`}>
          {formatDistance(distance)}
        </div>
        <div className={`font-mono text-xs ${bearingDiff < 2 ? 'text-radar-green' : bearingDiff < 5 ? 'text-radar-warn' : 'text-slate-500'}`}>
          {bearingDiff.toFixed(1)}° off
        </div>
      </div>
    </div>
  )
}
