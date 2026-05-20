import { useState, useEffect, useRef, useCallback } from 'react'
import { getRandomCity } from '../utils/cities'
import { bearingTo, distanceKm, absAngularDiff, formatDistance, bearingLabel } from '../utils/geo'
import ManualHeadingControl from './ManualHeadingControl'
import type { City } from '../utils/cities'

interface Props {
  userLat: number
  userLon: number
  heading: number
  manualHeading: boolean
  onManualChange: (h: number) => void
  onBack: () => void
}

type GameStatus = 'idle' | 'playing' | 'won'

const WIN_THRESHOLD = 3 // degrees

function getHeatLabel(diff: number): { label: string; color: string } {
  if (diff <= WIN_THRESHOLD) return { label: 'LOCKED', color: 'text-radar-green' }
  if (diff <= 8) return { label: 'HOT', color: 'text-orange-400' }
  if (diff <= 20) return { label: 'WARM', color: 'text-yellow-500' }
  if (diff <= 45) return { label: 'COOL', color: 'text-blue-400' }
  return { label: 'COLD', color: 'text-slate-500' }
}

function calcScore(seconds: number, accuracyDeg: number): number {
  const timePenalty = Math.min(seconds * 5, 800)
  const accuracyBonus = Math.max(0, 100 - accuracyDeg * 10)
  return Math.max(100, Math.round(1000 - timePenalty + accuracyBonus))
}

export default function GameMode({ userLat, userLon, heading, manualHeading, onManualChange, onBack }: Props) {
  const [status, setStatus] = useState<GameStatus>('idle')
  const [target, setTarget] = useState<City | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [finalScore, setFinalScore] = useState(0)
  const [finalAccuracy, setFinalAccuracy] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [wonOnce, setWonOnce] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRef = useRef<number>(0)
  const wonRef = useRef(false)

  const targetBearing = target ? bearingTo(userLat, userLon, target.lat, target.lon) : 0
  const targetDist = target ? distanceKm(userLat, userLon, target.lat, target.lon) : 0
  const diff = target ? absAngularDiff(heading, targetBearing) : 180

  const heat = getHeatLabel(diff)

  const startGame = useCallback(() => {
    wonRef.current = false
    setTarget(getRandomCity())
    setStatus('playing')
    setElapsed(0)
    startRef.current = Date.now()
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 500)
  }, [])

  // Check win condition
  useEffect(() => {
    if (status !== 'playing' || !target || wonRef.current) return
    if (diff <= WIN_THRESHOLD) {
      wonRef.current = true
      const secs = Math.floor((Date.now() - startRef.current) / 1000)
      if (timerRef.current) clearInterval(timerRef.current)
      setFinalScore(calcScore(secs, diff))
      setFinalAccuracy(diff)
      setFinalTime(secs)
      setStatus('won')
      setWonOnce(true)
    }
  }, [diff, status, target])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const dirToTarget = bearingLabel(targetBearing)

  return (
    <div className="flex flex-col h-screen bg-radar-bg overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 font-mono text-xs text-slate-500 active:text-slate-300 transition-colors"
        >
          ← BACK
        </button>
        <h1 className="font-mono font-bold text-radar-accent tracking-widest">GAME MODE</h1>
        <div className="w-12" />
      </div>

      {status === 'idle' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-20 h-20 rounded-full border-2 border-radar-accent/30 flex items-center justify-center mb-6">
            <svg viewBox="0 0 40 40" className="w-12 h-12">
              <circle cx="20" cy="20" r="18" stroke="#00e5ff" strokeWidth="1" fill="none" strokeOpacity="0.3" />
              <polygon points="20,4 23,20 20,17 17,20" fill="#00e5ff" />
              <circle cx="20" cy="20" r="2.5" fill="#00e5ff" />
            </svg>
          </div>
          <h2 className="font-mono text-2xl font-bold text-white mb-2">Find the City</h2>
          <p className="font-mono text-sm text-slate-400 mb-8 max-w-xs">
            A random city will be chosen. Rotate your phone until you point directly at it.
            The closer you are to 0° off, the faster you win.
          </p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-radar-accent text-radar-bg font-mono font-bold text-lg tracking-widest rounded-xl shadow-lg shadow-radar-accent/30 active:scale-95 transition-all"
          >
            START CHALLENGE
          </button>
        </div>
      )}

      {status === 'playing' && target && (
        <div className="flex-1 flex flex-col items-center px-6 pt-4">
          {/* Timer */}
          <div className="font-mono text-5xl font-bold text-white mb-1">{elapsed}<span className="text-xl text-slate-500">s</span></div>

          {/* Target city */}
          <div className="mb-4 text-center">
            <div className="font-mono text-xs text-slate-500 tracking-widest mb-1">FIND THIS CITY</div>
            <div className="font-mono text-2xl font-bold text-white">{target.name}</div>
            <div className="font-mono text-sm text-slate-400">{target.country}</div>
            <div className="font-mono text-xs text-slate-600 mt-1">{formatDistance(targetDist)} away</div>
          </div>

          {/* Heat indicator */}
          <div className={`w-full max-w-xs py-4 rounded-2xl border-2 text-center mb-4 transition-all ${
            diff <= WIN_THRESHOLD ? 'border-radar-green/60 bg-radar-green/10' :
            diff <= 8 ? 'border-orange-500/40 bg-orange-500/10' :
            diff <= 20 ? 'border-yellow-600/40 bg-yellow-600/10' :
            'border-slate-700 bg-radar-panel'
          }`}>
            <div className={`font-mono text-4xl font-bold ${heat.color}`}>{heat.label}</div>
            <div className="font-mono text-sm text-slate-400 mt-1">{diff.toFixed(1)}° off target</div>
          </div>

          {/* Current heading */}
          <div className="text-center mb-4">
            <span className="font-mono text-3xl font-bold text-white">{Math.round(heading)}°</span>
            <span className="font-mono text-slate-500 ml-2 text-lg">{bearingLabel(heading)}</span>
          </div>

          {/* Direction hint */}
          <div className="flex items-center gap-2 text-slate-500 font-mono text-xs mb-4">
            <span>Target is</span>
            <span className="text-radar-accent font-bold">{dirToTarget}</span>
            <span>({Math.round(targetBearing)}°)</span>
          </div>

          {/* Directional arrow */}
          <div className="relative w-24 h-24 mb-4">
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              style={{ transform: `rotate(${targetBearing - heading}deg)` }}
            >
              <svg viewBox="0 0 48 48" className="w-16 h-16">
                <circle cx="24" cy="24" r="22" stroke="#0d3a4f" strokeWidth="2" fill="none" />
                <polygon points="24,6 28,24 24,20 20,24" fill="#00e5ff" />
                <polygon points="24,42 28,24 24,28 20,24" fill="#444" />
                <circle cx="24" cy="24" r="3" fill="#00e5ff" />
              </svg>
            </div>
          </div>

          {/* Manual slider */}
          {manualHeading && (
            <div className="w-full max-w-xs">
              <ManualHeadingControl heading={heading} onChange={onManualChange} />
            </div>
          )}
        </div>
      )}

      {status === 'won' && target && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Success animation */}
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-radar-green animate-ping opacity-50" />
            <div className="absolute inset-2 rounded-full border border-radar-green opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-14 h-14">
                <circle cx="24" cy="24" r="22" stroke="#00ff88" strokeWidth="2" fill="#00ff8818" />
                <path d="M14 24l7 7 13-13" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          </div>

          <div className="font-mono text-xs text-radar-green tracking-widest mb-1">CITY FOUND</div>
          <h2 className="font-mono text-3xl font-bold text-white mb-1">{target.name}</h2>
          <p className="font-mono text-slate-400 text-sm mb-6">{target.country}</p>

          {/* Score card */}
          <div className="w-full max-w-xs rounded-2xl border border-radar-border bg-radar-panel p-5 mb-6 space-y-3">
            <ScoreRow label="SCORE" value={finalScore.toString()} highlight />
            <ScoreRow label="TIME" value={`${finalTime}s`} />
            <ScoreRow label="ACCURACY" value={`${finalAccuracy.toFixed(1)}°`} />
            <ScoreRow label="DISTANCE" value={formatDistance(targetDist)} />
          </div>

          <div className="flex gap-3 w-full max-w-xs">
            <button
              onClick={startGame}
              className="flex-1 py-4 bg-radar-accent text-radar-bg font-mono font-bold tracking-widest rounded-xl active:scale-95 transition-all"
            >
              NEXT
            </button>
            {wonOnce && (
              <button
                onClick={onBack}
                className="px-4 py-4 border border-radar-border text-slate-400 font-mono text-sm rounded-xl active:scale-95 transition-all"
              >
                QUIT
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-xs text-slate-500 tracking-wider">{label}</span>
      <span className={`font-mono font-bold ${highlight ? 'text-radar-accent text-xl' : 'text-white text-sm'}`}>
        {value}
      </span>
    </div>
  )
}
