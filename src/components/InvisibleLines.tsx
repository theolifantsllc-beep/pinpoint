import { useState, useEffect, useRef } from 'react'
import { getLineFeatures, getOceanIcon, type LineFeature } from '../utils/lineData'
import { bearingLabel, formatDistance } from '../utils/geo'
import ManualHeadingControl from './ManualHeadingControl'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

const CONTINENT_COLOR: Record<string, string> = {
  Europe: 'text-blue-400',
  Asia: 'text-orange-400',
  Africa: 'text-yellow-500',
  'North America': 'text-green-400',
  'South America': 'text-emerald-400',
  Oceania: 'text-purple-400',
  Antarctica: 'text-slate-300',
}

export default function InvisibleLines({ userLat, userLon, heading, manualHeading, onManualChange, onBack }: Props) {
  const [features, setFeatures] = useState<LineFeature[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dirLabel = bearingLabel(heading)

  // Debounce updates to ~120ms so list doesn't flicker too fast
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFeatures(getLineFeatures(userLat, userLon, heading))
    }, 120)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [userLat, userLon, heading])

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <button
          onClick={onBack}
          className="font-mono text-xs text-slate-500 active:text-slate-300 transition-colors"
        >
          ← BACK
        </button>
        <h1 className="font-mono font-bold text-radar-accent tracking-widest text-sm">INVISIBLE LINES</h1>
        <div className="w-12" />
      </div>

      {/* Beam / Direction indicator */}
      <div className="mx-4 mb-1 rounded-xl border border-radar-accent/20 bg-radar-panel overflow-hidden">
        {/* Animated beam line */}
        <div className="relative h-10 flex items-center px-4">
          <div className="absolute inset-0 flex items-center px-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-radar-accent/60 to-radar-accent" />
            <div className="ml-1 text-radar-accent text-xs">▶</div>
          </div>
          <div className="relative bg-radar-panel px-3 font-mono text-radar-accent font-bold text-lg">
            {Math.round(heading)}°
          </div>
          <div className="relative ml-2 font-mono text-sm text-slate-400 tracking-widest">{dirLabel}</div>
        </div>

        {/* Description */}
        <div className="px-4 pb-3">
          <p className="font-mono text-xs text-slate-500">
            A line from your location at <span className="text-slate-300">{Math.round(heading)}° {dirLabel}</span> crosses:
          </p>
        </div>
      </div>

      {/* Manual slider */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Feature list */}
      <div className="flex-1 min-h-0 overflow-y-auto results-list px-4 pb-6">
        {/* Origin */}
        <div className="flex items-start gap-3 py-2">
          <div className="flex flex-col items-center mt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-radar-accent ring-2 ring-radar-accent/30" />
            <div className="w-px flex-1 min-h-[24px] bg-radar-accent/20" />
          </div>
          <div className="pb-2">
            <div className="font-mono text-sm text-radar-accent font-bold">📍 Your location</div>
            <div className="font-mono text-xs text-slate-600">0 km</div>
          </div>
        </div>

        {features.map((f, i) => {
          const isLast = i === features.length - 1
          const isOcean = f.type !== 'country'
          return (
            <div key={`${f.name}-${f.distKm}`} className="flex items-start gap-3">
              {/* Timeline spine */}
              <div className="flex flex-col items-center mt-1 shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                  isOcean
                    ? 'border-blue-500/60 bg-blue-500/20'
                    : 'border-slate-500/60 bg-slate-500/20'
                }`} />
                {!isLast && (
                  <div className={`w-px flex-1 min-h-[24px] ${
                    isOcean ? 'bg-blue-900/40' : 'bg-slate-700/40'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 py-2 ${!isLast ? 'border-b border-slate-800/40' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base leading-none shrink-0">
                      {f.type === 'country' ? f.flag : getOceanIcon(f.type)}
                    </span>
                    <div className="min-w-0">
                      <div className={`font-mono text-sm font-semibold truncate ${
                        isOcean ? 'text-blue-300' : 'text-white'
                      }`}>
                        {f.name}
                      </div>
                      {f.continent && (
                        <div className={`font-mono text-xs ${CONTINENT_COLOR[f.continent] ?? 'text-slate-500'}`}>
                          {f.continent}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-slate-500 shrink-0 text-right">
                    {formatDistance(f.distKm)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {features.length === 0 && (
          <div className="flex items-center justify-center py-12 text-slate-600 font-mono text-sm">
            Calculating...
          </div>
        )}

        {/* End of Earth label */}
        {features.length > 0 && (
          <div className="flex items-start gap-3 pt-1">
            <div className="flex flex-col items-center mt-1 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-700 bg-slate-900" />
            </div>
            <div className="py-2">
              <div className="font-mono text-xs text-slate-700">↩ antipodal point (~20,000 km)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
