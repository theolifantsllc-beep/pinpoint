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
    <div className="flex flex-col items-center justify-center min-h-screen bg-radar-bg px-6 py-12 select-none">
      {/* Logo / Title */}
      <div className="mb-10 text-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-radar-accent/30 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-0 rounded-full border border-radar-accent/50" />
          {/* Compass needle */}
          <svg viewBox="0 0 48 48" className="w-14 h-14" fill="none">
            <circle cx="24" cy="24" r="22" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.4" />
            <circle cx="24" cy="24" r="14" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.3" />
            {/* N needle */}
            <polygon points="24,4 27,24 24,21 21,24" fill="#00e5ff" />
            {/* S needle */}
            <polygon points="24,44 27,24 24,27 21,24" fill="#444" />
            <circle cx="24" cy="24" r="2.5" fill="#00e5ff" />
          </svg>
        </div>

        <h1 className="text-4xl font-mono font-bold tracking-widest text-radar-accent mb-2">
          PINPOINT
        </h1>
        <p className="text-sm text-slate-400 font-mono tracking-wide max-w-xs">
          Point your phone and discover what lies in that direction.
        </p>
      </div>

      {/* Permission Buttons */}
      <div className="w-full max-w-xs space-y-4 mb-8">
        <PermissionButton
          label="Enable Location"
          description="Know where you are"
          icon="📍"
          granted={locationGranted}
          onClick={onRequestLocation}
        />
        <PermissionButton
          label="Enable Compass"
          description="Know where you're pointing"
          icon="🧭"
          granted={compassGranted}
          onClick={onRequestCompass}
        />
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={`w-full max-w-xs py-4 rounded-xl font-mono font-bold text-lg tracking-widest transition-all duration-300 ${
          canStart
            ? 'bg-radar-accent text-radar-bg shadow-lg shadow-radar-accent/30 active:scale-95'
            : 'bg-radar-border text-slate-600 cursor-not-allowed'
        }`}
      >
        {canStart ? 'LAUNCH' : 'PERMISSIONS NEEDED'}
      </button>

      <p className="mt-6 text-xs text-slate-600 text-center font-mono max-w-xs">
        Location stays on your device. Nothing is sent anywhere.
      </p>
    </div>
  )
}

function PermissionButton({
  label,
  description,
  icon,
  granted,
  onClick,
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
      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 active:scale-95 ${
        granted
          ? 'border-radar-green/50 bg-radar-green/10 cursor-default'
          : 'border-radar-border bg-radar-panel hover:border-radar-accent/50'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <div className="text-left flex-1">
        <div className={`font-mono font-semibold text-sm ${granted ? 'text-radar-green' : 'text-slate-200'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-500 font-mono">{description}</div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        granted ? 'border-radar-green bg-radar-green/20' : 'border-slate-600'
      }`}>
        {granted && (
          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  )
}
