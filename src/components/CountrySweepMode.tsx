import { useState, useEffect, useRef, useCallback } from 'react'
import {
  getNearbySweepTargets, calcScore,
  DIFFICULTY_CONFIG,
  type SweepTarget, type Difficulty,
} from '../utils/countrySweep'
import { absAngularDiff, bearingLabel, formatDistance } from '../utils/geo'
import ManualHeadingControl from './ManualHeadingControl'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

type GameStatus = 'idle' | 'playing' | 'complete'

const LOCK_HOLD_MS = 600 // ms to hold alignment before discovery

export default function CountrySweepMode({
  userLat, userLon, heading, manualHeading, onManualChange, onBack,
}: Props) {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [targets, setTargets] = useState<SweepTarget[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [justDiscovered, setJustDiscovered] = useState<string | null>(null)

  // Track how long each undiscovered target has been in the lock zone
  const lockTimers = useRef<Map<string, number>>(new Map())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)

  const discovered = targets.filter(t => t.discovered)
  const remaining = targets.filter(t => !t.discovered)
  const cfg = DIFFICULTY_CONFIG[difficulty]

  const startGame = useCallback(() => {
    const t = getNearbySweepTargets(userLat, userLon, difficulty)
    setTargets(t)
    setTimeLeft(cfg.timeSeconds)
    setScore(0)
    setJustDiscovered(null)
    lockTimers.current.clear()
    startTimeRef.current = Date.now()
    setStatus('playing')
  }, [userLat, userLon, difficulty, cfg.timeSeconds])

  // Countdown timer
  useEffect(() => {
    if (status !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setStatus('complete')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  // Discovery check — runs on every heading change
  useEffect(() => {
    if (status !== 'playing') return

    const now = Date.now()
    setTargets(prev => {
      let changed = false
      const next = prev.map(t => {
        if (t.discovered) return t
        const diff = absAngularDiff(heading, t.bearing)
        if (diff <= cfg.threshold) {
          const entered = lockTimers.current.get(t.id)
          if (!entered) {
            lockTimers.current.set(t.id, now)
          } else if (now - entered >= LOCK_HOLD_MS) {
            // Discovered!
            lockTimers.current.delete(t.id)
            changed = true
            setJustDiscovered(t.id)
            setTimeout(() => setJustDiscovered(null), 1200)
            const elapsed = (now - startTimeRef.current) / 1000
            setScore(s => s + calcScore(1, 1, elapsed, cfg.timeSeconds))
            return { ...t, discovered: true, discoveredAt: now }
          }
        } else {
          lockTimers.current.delete(t.id)
        }
        return t
      })
      if (changed) {
        // Check if all discovered
        if (next.every(t => t.discovered)) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => setStatus('complete'), 600)
        }
      }
      return changed ? next : prev
    })
  }, [heading, status, cfg.threshold, cfg.timeSeconds])

  if (status === 'idle') {
    return (
      <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
        <Header onBack={onBack} title="COUNTRY SWEEP" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border border-radar-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full border border-radar-accent/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 56 56" className="w-16 h-16">
                <circle cx="28" cy="28" r="26" stroke="#00e5ff" strokeWidth="0.8" fill="none" strokeOpacity="0.3" />
                <circle cx="28" cy="28" r="18" stroke="#00e5ff" strokeWidth="0.5" fill="none" strokeOpacity="0.2" />
                <circle cx="28" cy="28" r="10" stroke="#00e5ff" strokeWidth="0.5" fill="none" strokeOpacity="0.15" />
                <line x1="28" y1="2" x2="28" y2="28" stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <h2 className="font-mono text-2xl font-bold text-white mb-2">Country Sweep</h2>
          <p className="font-mono text-sm text-slate-400 mb-8 max-w-xs">
            Rotate your phone to scan the horizon. Discover all surrounding countries before time runs out.
          </p>

          {/* Difficulty selector */}
          <div className="w-full max-w-xs mb-8">
            <div className="font-mono text-xs text-slate-600 tracking-wider mb-2">DIFFICULTY</div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-lg border font-mono text-xs font-bold tracking-wider transition-all active:scale-95 ${
                    difficulty === d
                      ? 'border-radar-accent bg-radar-accent/15 text-radar-accent'
                      : 'border-radar-border bg-radar-panel text-slate-500'
                  }`}
                >
                  {DIFFICULTY_CONFIG[d].label}
                </button>
              ))}
            </div>
            <div className="mt-2 font-mono text-xs text-slate-600 text-center">
              ±{cfg.threshold}° · {Math.round(cfg.radiusKm / 1000 * 10) / 10}k km · {cfg.timeSeconds}s
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full max-w-xs py-4 bg-radar-accent text-radar-bg font-mono font-bold text-lg tracking-widest rounded-xl shadow-lg shadow-radar-accent/25 active:scale-95 transition-all"
          >
            START SWEEP
          </button>
        </div>
      </div>
    )
  }

  if (status === 'complete') {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    return (
      <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
        <Header onBack={onBack} title="COUNTRY SWEEP" />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="relative w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full border-2 border-radar-green animate-ping opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full border border-radar-green/50 bg-radar-green/10">
              <span className="text-3xl">{discovered.length === targets.length ? '🌍' : '📡'}</span>
            </div>
          </div>
          <div className="font-mono text-xs text-radar-green tracking-widest mb-1">SWEEP COMPLETE</div>
          <h2 className="font-mono text-3xl font-bold text-white mb-4">{score} pts</h2>

          <div className="w-full max-w-xs rounded-2xl border border-radar-border bg-radar-panel p-4 mb-6 space-y-2">
            <ScoreRow label="DISCOVERED" value={`${discovered.length} / ${targets.length}`} highlight />
            <ScoreRow label="TIME" value={`${elapsed}s`} />
            <ScoreRow label="DIFFICULTY" value={cfg.label} />
          </div>

          {/* Discovered list */}
          <div className="w-full max-w-xs mb-6 max-h-40 overflow-y-auto results-list">
            <div className="font-mono text-xs text-slate-600 tracking-wider mb-2">FOUND</div>
            <div className="flex flex-wrap gap-1.5">
              {discovered.map(t => (
                <span key={t.id} className="font-mono text-xs bg-radar-panel border border-radar-green/30 text-radar-green rounded-lg px-2 py-1">
                  {t.flag} {t.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <button onClick={startGame} className="flex-1 py-3.5 bg-radar-accent text-radar-bg font-mono font-bold tracking-widest rounded-xl active:scale-95 transition-all">
              PLAY AGAIN
            </button>
            <button onClick={() => setStatus('idle')} className="px-4 py-3.5 border border-radar-border text-slate-400 font-mono text-sm rounded-xl active:scale-95 transition-all">
              MENU
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── PLAYING ──
  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
      {/* HUD */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={() => { setStatus('idle'); if (timerRef.current) clearInterval(timerRef.current) }}
          className="font-mono text-xs text-slate-500 active:text-slate-300">
          ← QUIT
        </button>
        <div className="text-center">
          <div className={`font-mono text-2xl font-bold tabular-nums ${timeLeft <= 20 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-bold text-radar-accent">{discovered.length}<span className="text-slate-600">/{targets.length}</span></div>
          <div className="font-mono text-xs text-slate-600">{score} pts</div>
        </div>
      </div>

      {/* Radar */}
      <div className="flex justify-center py-1">
        <SweepRadar
          targets={targets}
          heading={heading}
          threshold={cfg.threshold}
          justDiscovered={justDiscovered}
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-2">
        <span className="font-mono text-3xl font-bold text-white">{Math.round(heading)}°</span>
        <span className="font-mono text-lg text-radar-accent ml-2">{bearingLabel(heading)}</span>
      </div>

      {/* Manual slider */}
      {manualHeading && (
        <div className="px-4 mb-2">
          <ManualHeadingControl heading={heading} onChange={onManualChange} />
        </div>
      )}

      {/* Closest undiscovered hint */}
      {remaining.length > 0 && (
        <div className="px-4 mb-2">
          <NextTargetHint targets={remaining} heading={heading} />
        </div>
      )}

      {/* Discovered list */}
      <div className="flex-1 min-h-0 px-4 pb-4 overflow-y-auto results-list">
        <div className="font-mono text-xs text-slate-600 tracking-wider mb-2">
          DISCOVERED ({discovered.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {discovered.map(t => (
            <div
              key={t.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                t.id === justDiscovered
                  ? 'border-radar-green bg-radar-green/20 text-radar-green scale-110'
                  : 'border-radar-green/30 bg-radar-green/5 text-radar-green'
              }`}
            >
              <span>{t.flag}</span>
              <span>{t.name}</span>
            </div>
          ))}
          {remaining.map(t => {
            const diff = absAngularDiff(heading, t.bearing)
            const locking = diff <= cfg.threshold
            return (
              <div
                key={t.id}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all ${
                  locking
                    ? 'border-radar-warn/60 bg-radar-warn/10 text-radar-warn animate-pulse'
                    : 'border-slate-700/40 bg-slate-900/40 text-slate-700'
                }`}
              >
                <span className={locking ? '' : 'opacity-30'}>?</span>
                {locking && <span className="text-xs">{t.flag}</span>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Sweep Radar ────────────────────────────────────────────────────────────────

function SweepRadar({
  targets, heading, threshold, justDiscovered,
}: {
  targets: SweepTarget[]
  heading: number
  threshold: number
  justDiscovered: string | null
}) {
  const size = 260
  const cx = size / 2
  const rOuter = cx - 8

  // Map distance to radius: closer = inner ring
  const allDists = targets.map(t => t.distKm)
  const maxDist = Math.max(...allDists, 1)

  function targetPos(t: SweepTarget) {
    const radialFrac = 0.25 + 0.68 * (t.distKm / maxDist)
    const r = rOuter * radialFrac
    const a = ((t.bearing - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(a), y: cx + r * Math.sin(a) }
  }

  // Heading beam endpoint
  const hRad = ((heading - 90) * Math.PI) / 180
  const hx = cx + (rOuter - 4) * Math.cos(hRad)
  const hy = cx + (rOuter - 4) * Math.sin(hRad)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="sweepBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#041018" />
            <stop offset="100%" stopColor="#020b0f" />
          </radialGradient>
          <radialGradient id="beamGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <circle cx={cx} cy={cx} r={rOuter} fill="url(#sweepBg)" />
        <circle cx={cx} cy={cx} r={rOuter} fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.15" />

        {/* Distance rings */}
        {[0.33, 0.55, 0.78].map(f => (
          <circle key={f} cx={cx} cy={cx} r={rOuter * f} fill="none"
            stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="3 8" />
        ))}

        {/* Cardinal ticks */}
        {['N', 'E', 'S', 'W'].map((label, i) => {
          const deg = i * 90
          const a = ((deg - 90) * Math.PI) / 180
          const tx = cx + (rOuter - 12) * Math.cos(a)
          const ty = cx + (rOuter - 12) * Math.sin(a)
          return (
            <text key={label} x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
              fill="#1a4a5a" fontSize="9" fontFamily="monospace">{label}</text>
          )
        })}

        {/* Sweep beam */}
        <line x1={cx} y1={cx} x2={hx} y2={hy}
          stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />

        {/* Beam cone (threshold angle) */}
        {[threshold, -threshold].map((off, i) => {
          const a = ((heading + off - 90) * Math.PI) / 180
          return (
            <line key={i}
              x1={cx} y1={cx}
              x2={cx + (rOuter - 4) * Math.cos(a)}
              y2={cx + (rOuter - 4) * Math.sin(a)}
              stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.2" />
          )
        })}

        {/* Country markers */}
        {targets.map(t => {
          const { x, y } = targetPos(t)
          const diff = absAngularDiff(heading, t.bearing)
          const inCone = diff <= threshold
          const isJust = t.id === justDiscovered

          if (t.discovered) {
            return (
              <g key={t.id}>
                {isJust && (
                  <circle cx={x} cy={y} r={16} fill="none" stroke="#00ff88"
                    strokeWidth="1.5" strokeOpacity="0.5">
                    <animate attributeName="r" from="6" to="22" dur="0.8s" fill="freeze" />
                    <animate attributeName="stroke-opacity" from="0.8" to="0" dur="0.8s" fill="freeze" />
                  </circle>
                )}
                <circle cx={x} cy={y} r="5" fill="#00ff88" fillOpacity="0.9"
                  style={{ filter: 'drop-shadow(0 0 4px #00ff88)' }} />
                <text x={x} y={y - 9} textAnchor="middle" fill="#00ff88"
                  fontSize="8" fontFamily="monospace" fontWeight="bold">{t.flag}</text>
              </g>
            )
          }

          // Undiscovered
          return (
            <g key={t.id}>
              <circle cx={x} cy={y} r={inCone ? 5 : 4}
                fill={inCone ? '#ffaa0040' : '#1a4a5a40'}
                stroke={inCone ? '#ffaa00' : '#1a4a5a'}
                strokeWidth={inCone ? 1.5 : 0.8}
                style={inCone ? { filter: 'drop-shadow(0 0 4px #ffaa00)' } : undefined}
              />
              {inCone && (
                <text x={x} y={y - 8} textAnchor="middle" fill="#ffaa00"
                  fontSize="8" fontFamily="monospace">?</text>
              )}
            </g>
          )
        })}

        {/* Center */}
        <circle cx={cx} cy={cx} r="4" fill="#00e5ff" />
        <circle cx={cx} cy={cx} r="8" fill="none" stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.3" />
      </svg>
    </div>
  )
}

// ── Next target hint ──────────────────────────────────────────────────────────

function NextTargetHint({ targets, heading }: { targets: SweepTarget[]; heading: number }) {
  const closest = [...targets].sort((a, b) =>
    absAngularDiff(heading, a.bearing) - absAngularDiff(heading, b.bearing)
  )[0]
  if (!closest) return null

  const diff = absAngularDiff(heading, closest.bearing)
  const signedDiff = ((closest.bearing - heading + 540) % 360) - 180

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/50 bg-radar-panel/60">
      <div className="font-mono text-xs text-slate-600">NEAREST UNKNOWN</div>
      <div className="flex-1 font-mono text-xs text-slate-400 text-right">
        {diff.toFixed(0)}° {signedDiff > 0 ? '→' : '←'} · {formatDistance(closest.distKm)}
      </div>
    </div>
  )
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-4 pb-2">
      <button onClick={onBack} className="font-mono text-xs text-slate-500 active:text-slate-300">
        ← BACK
      </button>
      <h1 className="font-mono font-bold text-radar-accent tracking-widest text-sm">{title}</h1>
      <div className="w-12" />
    </div>
  )
}

function ScoreRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-xs text-slate-500 tracking-wider">{label}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-radar-accent text-lg' : 'text-white text-sm'}`}>{value}</span>
    </div>
  )
}
