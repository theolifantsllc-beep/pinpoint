interface Props {
  locationGranted: boolean
  compassGranted: boolean
  onRequestLocation: () => void
  onRequestCompass: () => void
  onStart: () => void
  canStart: boolean
}

export default function PermissionScreen({
  locationGranted,
  compassGranted,
  onRequestLocation,
  onRequestCompass,
  onStart,
  canStart,
}: Props) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-radar-bg px-6 py-12 select-none overflow-hidden">

      {/* Background star field */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.r, height: s.r, opacity: s.o }}
        />
      ))}

      {/* Background accent rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full border border-radar-accent/5" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[360px] h-[360px] rounded-full border border-radar-accent/5" />
      </div>

      {/* Logo */}
      <div className="relative mb-10 text-center z-10">
        <div className="relative inline-flex items-center justify-center w-28 h-28 mb-6">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border border-radar-accent/20 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-[-8px] rounded-full border border-radar-accent/10 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
          {/* Static rings */}
          <div className="absolute inset-0 rounded-full border border-radar-accent/40" />
          <div className="absolute inset-[10px] rounded-full border border-radar-accent/15" />
          {/* Compass SVG */}
          <svg viewBox="0 0 56 56" className="w-16 h-16" fill="none">
            <defs>
              <radialGradient id="compassBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#041824" />
                <stop offset="100%" stopColor="#020e17" />
              </radialGradient>
            </defs>
            <circle cx="28" cy="28" r="26" fill="url(#compassBg)" />
            <circle cx="28" cy="28" r="26" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="28" cy="28" r="17" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.15" />
            {/* N needle */}
            <polygon points="28,4 31,28 28,25 25,28" fill="#00e5ff" />
            {/* S needle */}
            <polygon points="28,52 31,28 28,31 25,28" fill="#1a3a4a" />
            {/* Cardinal ticks */}
            {[0, 90, 180, 270].map(deg => {
              const rad = (deg * Math.PI) / 180
              return (
                <line
                  key={deg}
                  x1={28 + 24 * Math.sin(rad)}
                  y1={28 - 24 * Math.cos(rad)}
                  x2={28 + 20 * Math.sin(rad)}
                  y2={28 - 20 * Math.cos(rad)}
                  stroke="#00e5ff"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
              )
            })}
            <circle cx="28" cy="28" r="3" fill="#00e5ff" />
            <circle cx="28" cy="28" r="5" fill="none" stroke="#00e5ff" strokeWidth="0.75" strokeOpacity="0.4" />
          </svg>
        </div>

        <h1 className="text-4xl font-mono font-bold tracking-[0.2em] text-radar-accent mb-2">
          PINPOINT
        </h1>
        <p className="text-sm text-slate-400 font-mono max-w-[260px] leading-relaxed">
          Point your phone.<br />Discover what lies in that direction.
        </p>
      </div>

      {/* Permission buttons */}
      <div className="w-full max-w-xs space-y-3 mb-8 z-10">
        <PermissionButton
          label="Location"
          description="Know where you are on Earth"
          icon="📍"
          granted={locationGranted}
          onClick={onRequestLocation}
        />
        <PermissionButton
          label="Compass"
          description="Know which direction you're facing"
          icon="🧭"
          granted={compassGranted}
          onClick={onRequestCompass}
        />
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full max-w-xs py-4 rounded-2xl font-mono font-bold text-base tracking-[0.2em] transition-all duration-300 z-10 ${
          canStart
            ? 'bg-radar-accent text-radar-bg shadow-xl shadow-radar-accent/25 active:scale-95 launch-glow'
            : 'bg-radar-panel border border-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        {canStart ? 'LAUNCH' : 'GRANT PERMISSIONS'}
      </button>

      <p className="mt-5 text-xs text-slate-700 text-center font-mono max-w-xs z-10">
        No data leaves your device.
      </p>
    </div>
  )
}

function PermissionButton({
  label, description, icon, granted, onClick,
}: {
  label: string
  description: string
  icon: string
  granted: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={granted}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all duration-300 active:scale-95 ${
        granted
          ? 'border-radar-green/40 bg-radar-green/8 cursor-default'
          : 'border-slate-800 bg-radar-panel active:border-radar-accent/40'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg ${
        granted ? 'bg-radar-green/15' : 'bg-slate-800'
      }`}>
        {icon}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className={`font-mono font-bold text-sm ${granted ? 'text-radar-green' : 'text-slate-200'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-600 font-mono truncate">{description}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
        granted ? 'border-radar-green bg-radar-green/20' : 'border-slate-700'
      }`}>
        {granted && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
            <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}

// Stable star field
const STARS = Array.from({ length: 50 }, (_, i) => ({
  x: (i * 137.5) % 100,
  y: (i * 97.3 + 13) % 100,
  r: i % 7 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
  o: 0.04 + (i % 9) * 0.025,
}))
