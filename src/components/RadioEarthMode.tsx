import { useState, useMemo, useEffect, useRef } from 'react'
import { RADIO_SOURCES, type AudioSource } from '../data/radioEarthData'
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

const TUNE_THRESHOLD = 18 // degrees cone
const LOCK_THRESHOLD = 6  // degrees for "TUNED"

interface SourceResult {
  source: AudioSource
  bearing: number
  diff: number
  distKm: number
  tuned: boolean
}

// Pre-stable star positions
const STARS = Array.from({ length: 36 }, (_, i) => ({
  x: (((i * 137.5) % 100)),
  y: (((i * 97.3) % 100)),
  r: i % 5 === 0 ? 1.5 : 1,
  o: 0.15 + (i % 7) * 0.07,
}))

function conePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(toRad(startDeg))
  const y1 = cy + r * Math.sin(toRad(startDeg))
  const x2 = cx + r * Math.cos(toRad(endDeg))
  const y2 = cy + r * Math.sin(toRad(endDeg))
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}

function RadioRadarView({
  results,
  heading,
  playingId,
}: {
  results: SourceResult[]
  heading: number
  playingId: string | null
}) {
  const size = 240
  const cx = size / 2

  return (
    <div
      className="relative mx-auto rounded-full overflow-hidden"
      style={{ width: size, height: size }}
    >
      {/* Background */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#0a0a1a] via-[#050510] to-black" />

      {/* Stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o }}
        />
      ))}

      {/* Range rings */}
      {[0.3, 0.6, 0.9].map(f => (
        <div
          key={f}
          className="absolute rounded-full border border-slate-700/20"
          style={{ width: size * f, height: size * f, top: (size - size * f) / 2, left: (size - size * f) / 2 }}
        />
      ))}

      {/* SVG cone + source dots */}
      <svg className="absolute inset-0" width={size} height={size}>
        <defs>
          <radialGradient id="radioGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Cone */}
        <path
          d={conePath(cx, cx, cx - 6, -TUNE_THRESHOLD, TUNE_THRESHOLD)}
          fill="url(#radioGrad)"
        />
        {/* Cone edges */}
        {[-TUNE_THRESHOLD, TUNE_THRESHOLD].map(angle => {
          const rad = ((angle - 90) * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={cx} y1={cx}
              x2={cx + (cx - 6) * Math.cos(rad)}
              y2={cx + (cx - 6) * Math.sin(rad)}
              stroke="#a855f7"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          )
        })}

        {/* Source dots */}
        {results.map(r => {
          const relAngle = r.bearing - heading
          const rad = ((relAngle - 90) * Math.PI) / 180
          const frac = Math.min(r.distKm / 16000, 0.88)
          const x = cx + (cx - 14) * frac * Math.cos(rad)
          const y = cx + (cx - 14) * frac * Math.sin(rad)
          const isPlaying = playingId === r.source.id
          const isTuned = r.tuned

          return (
            <g key={r.source.id}>
              {/* Glow ring for tuned/playing */}
              {(isTuned || isPlaying) && (
                <circle cx={x} cy={y} r={isPlaying ? 10 : 7} fill="none"
                  stroke={isPlaying ? '#a855f7' : '#00e5ff'}
                  strokeWidth="1" strokeOpacity="0.5"
                  className="animate-ping" style={{ transformOrigin: `${x}px ${y}px` }}
                />
              )}
              {/* Core dot */}
              <circle
                cx={x} cy={y}
                r={isTuned ? 5 : 3.5}
                fill={isPlaying ? '#a855f7' : isTuned ? '#00e5ff' : r.source.waveColor}
                opacity={isTuned ? 1 : 0.7}
              />
              {/* Genre label for tuned sources */}
              {isTuned && (
                <text
                  x={x + 8} y={y + 4}
                  fontSize="7"
                  fill="#00e5ff"
                  fontFamily="monospace"
                  opacity={0.9}
                >
                  {r.source.city}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-purple-400/80 ring-2 ring-purple-400/20" />
      </div>

      {/* Heading */}
      <div className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none">
        <span className="font-mono text-xs text-purple-300/60">
          {Math.round(heading)}° {bearingLabel(heading)}
        </span>
      </div>
    </div>
  )
}

function Waveform({ playing, color }: { playing: boolean; color: string }) {
  const bars = 16
  return (
    <div className="flex items-center gap-px h-7" style={{ width: 64 }}>
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all"
          style={{
            width: 3,
            backgroundColor: color,
            height: playing
              ? `${20 + Math.abs(Math.sin(i * 0.8)) * 60}%`
              : '15%',
            animation: playing
              ? `waveBar ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`
              : 'none',
            animationDelay: `${i * 0.04}s`,
            opacity: playing ? 0.9 : 0.35,
          }}
        />
      ))}
    </div>
  )
}

function AudioSourceCard({
  result,
  isTop,
  isPlaying,
  onPlay,
}: {
  result: SourceResult
  isTop: boolean
  isPlaying: boolean
  onPlay: () => void
}) {
  const { source: s, diff, distKm, tuned } = result

  return (
    <div
      className={`rounded-xl border px-4 py-3 transition-all result-card-enter ${
        isPlaying
          ? 'border-purple-500/70 bg-purple-900/20 shadow-lg shadow-purple-900/20'
          : tuned
          ? 'border-radar-accent/50 bg-radar-accent/5'
          : isTop
          ? 'border-slate-600/50 bg-radar-panel'
          : 'border-radar-border/30 bg-radar-panel/50'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Play button */}
        <button
          onClick={onPlay}
          className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center text-base transition-all active:scale-90 ${
            isPlaying
              ? 'border-purple-400/60 bg-purple-500/20 text-purple-300'
              : tuned
              ? 'border-radar-accent/40 bg-radar-accent/10 text-radar-accent'
              : 'border-slate-700 bg-slate-800/60 text-slate-500'
          }`}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-sm font-bold ${isPlaying ? 'text-purple-200' : tuned ? 'text-white' : 'text-slate-300'} truncate`}>
              {s.title}
            </span>
            {tuned && !isPlaying && (
              <span className="font-mono text-xs text-radar-accent bg-radar-accent/10 border border-radar-accent/30 px-1.5 py-0.5 rounded">
                TUNED
              </span>
            )}
            {isPlaying && (
              <span className="font-mono text-xs text-purple-300 bg-purple-900/40 border border-purple-500/30 px-1.5 py-0.5 rounded">
                PLAYING
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-slate-500 mt-0.5">
            {s.city} · {s.genre}
          </div>
          <div className="font-mono text-xs text-slate-600 mt-1 italic leading-snug">
            {s.description}
          </div>

          {/* Tags */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {s.tags.slice(0, 3).map(tag => (
              <span key={tag} className="font-mono text-xs text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: distance + waveform */}
        <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
          <div className="font-mono text-xs text-slate-400">{formatDistance(distKm)}</div>
          <div className="font-mono text-xs text-slate-600">{diff.toFixed(1)}° off</div>
          <Waveform playing={isPlaying} color={s.waveColor} />
          {isPlaying && (
            <div className="font-mono text-xs text-slate-600">MOCK</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RadioEarthMode({
  userLat, userLon, heading, manualHeading, onManualChange, onBack,
}: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Tick for waveform animation heartbeat
  useEffect(() => {
    timerRef.current = setInterval(() => setTick(t => t + 1), 400)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const results = useMemo<SourceResult[]>(() => {
    return RADIO_SOURCES
      .map(s => {
        const bearing = bearingTo(userLat, userLon, s.lat, s.lon)
        const diff = absAngularDiff(heading, bearing)
        const distKm = distanceKm(userLat, userLon, s.lat, s.lon)
        return { source: s, bearing, diff, distKm, tuned: diff <= LOCK_THRESHOLD }
      })
      .filter(r => r.distKm > 20 && r.diff <= TUNE_THRESHOLD)
      .sort((a, b) => a.diff - b.diff)
  }, [userLat, userLon, heading])

  // Auto-announce tuned source
  const tunedSource = results.find(r => r.tuned)

  const handlePlay = (id: string) => {
    setPlayingId(prev => (prev === id ? null : id))
  }

  const dirLabel = bearingLabel(heading)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-2">
        <button onClick={onBack} className="font-mono text-xs text-slate-500 active:text-slate-300 transition-colors">
          ← BACK
        </button>
        <div className="text-center">
          <h1 className="font-mono font-bold text-purple-400 tracking-widest text-sm">RADIO EARTH</h1>
          <div className="font-mono text-xs text-slate-600">MOCK DATA</div>
        </div>
        <div className="font-mono text-xs text-right">
          <div className="text-slate-400">{Math.round(heading)}°</div>
          <div className="text-slate-600">{dirLabel}</div>
        </div>
      </div>

      {/* Radar */}
      <div className="flex justify-center py-1">
        <RadioRadarView results={results} heading={heading} playingId={playingId} />
      </div>

      {/* Tuned banner */}
      {tunedSource ? (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl border border-radar-accent/50 bg-radar-accent/8 flex items-center gap-3">
          <div
            className="w-1.5 h-8 rounded-full"
            style={{ backgroundColor: tunedSource.source.waveColor, boxShadow: `0 0 8px ${tunedSource.source.waveColor}` }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-radar-accent font-bold tracking-widest">TUNED IN</div>
            <div className="font-mono text-sm text-white truncate">{tunedSource.source.city} — {tunedSource.source.genre}</div>
            <div className="font-mono text-xs text-slate-600 italic truncate">{tunedSource.source.mood}</div>
          </div>
          <div className="font-mono text-xs text-slate-500">{tunedSource.diff.toFixed(1)}°</div>
        </div>
      ) : (
        <div className="mx-4 mb-2 px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/30 flex items-center gap-3">
          <div className="text-slate-600 text-base">〜</div>
          <div className="font-mono text-xs text-slate-600 italic">
            {results.length > 0 ? `${results.length} signal${results.length > 1 ? 's' : ''} nearby — rotate to tune` : 'Scanning the world\'s signals…'}
          </div>
        </div>
      )}

      {/* Playing banner */}
      {playingId && !tunedSource && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg border border-purple-800/40 bg-purple-900/10 flex items-center gap-2">
          <div className="text-purple-400 animate-pulse">♫</div>
          <div className="font-mono text-xs text-purple-300 flex-1">
            {RADIO_SOURCES.find(s => s.id === playingId)?.title}
          </div>
          <div className="font-mono text-xs text-slate-600">MOCK · visual only</div>
        </div>
      )}

      {/* Manual heading */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Source cards */}
      <div className="flex-1 min-h-0 overflow-y-auto results-list px-4 pb-6 space-y-2">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-xs text-slate-600 tracking-wider">
            WITHIN ±{TUNE_THRESHOLD}° — {results.length} signal{results.length !== 1 ? 's' : ''}
          </span>
          {/* tick drives re-render for waveform */}
          <span className="font-mono text-xs text-slate-700">{tick > -1 ? '' : ''}</span>
        </div>

        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3 opacity-30">〜</div>
            <p className="font-mono text-slate-500 text-sm">No signals in this direction</p>
            <p className="font-mono text-slate-600 text-xs mt-1">Point toward a major city</p>
          </div>
        )}

        {results.map((r, i) => (
          <AudioSourceCard
            key={r.source.id}
            result={r}
            isTop={i === 0}
            isPlaying={playingId === r.source.id}
            onPlay={() => handlePlay(r.source.id)}
          />
        ))}
      </div>
    </div>
  )
}
