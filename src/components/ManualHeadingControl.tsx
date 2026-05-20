interface Props {
  heading: number
  onChange: (heading: number) => void
}

export default function ManualHeadingControl({ heading, onChange }: Props) {
  return (
    <div className="w-full px-4 py-3 bg-radar-panel border border-radar-border rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-radar-warn">MANUAL MODE — sensors unavailable</span>
        <span className="text-xs font-mono text-radar-accent font-bold">{Math.round(heading)}°</span>
      </div>
      <input
        type="range"
        min={0}
        max={359}
        value={Math.round(heading)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #00e5ff ${(heading / 359) * 100}%, #0d3a4f ${(heading / 359) * 100}%)`,
        }}
      />
      <div className="flex justify-between mt-1 text-xs font-mono text-slate-600">
        <span>N 0°</span>
        <span>E 90°</span>
        <span>S 180°</span>
        <span>W 270°</span>
        <span>N 360°</span>
      </div>
    </div>
  )
}
