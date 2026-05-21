interface Props {
  heading: number
}

const CARDINAL = [
  { label: 'N', deg: 0 },
  { label: 'NE', deg: 45 },
  { label: 'E', deg: 90 },
  { label: 'SE', deg: 135 },
  { label: 'S', deg: 180 },
  { label: 'SW', deg: 225 },
  { label: 'W', deg: 270 },
  { label: 'NW', deg: 315 },
]

export default function RadarCompass({ heading }: Props) {
  const size = 240
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10

  const rotation = -heading

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <defs>
          {/* Background fill gradient */}
          <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#041824" />
            <stop offset="70%" stopColor="#020e17" />
            <stop offset="100%" stopColor="#010a12" />
          </radialGradient>
          {/* Sweep gradient */}
          <radialGradient id="sweepGrad" cx="0%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.30" />
            <stop offset="60%" stopColor="#00e5ff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          {/* Center glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </radialGradient>
          {/* Outer ring glow */}
          <filter id="outerGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background fill */}
        <circle cx={cx} cy={cy} r={r + 4} fill="url(#bgGrad)" />

        {/* Outer decorative rings */}
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.08" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00e5ff" strokeWidth="1.5" strokeOpacity="0.25" filter="url(#outerGlow)" />
        <circle cx={cx} cy={cy} r={r - 1} fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.08" />

        {/* Rotating group */}
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>

          {/* Crosshair lines (very faint) */}
          <line x1={cx} y1={cy - r + 14} x2={cx} y2={cy + r - 14}
            stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.06" />
          <line x1={cx - r + 14} y1={cy} x2={cx + r - 14} y2={cy}
            stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.06" />

          {/* Concentric range rings */}
          {[0.35, 0.60, 0.82].map(frac => (
            <circle
              key={frac}
              cx={cx} cy={cy}
              r={(r - 16) * frac}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.5"
              strokeOpacity="0.12"
              strokeDasharray="4 8"
            />
          ))}

          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const deg = i * 5
            const isMajor = deg % 90 === 0
            const isMed = deg % 45 === 0
            const isSmall = deg % 10 === 0
            const tickLen = isMajor ? 14 : isMed ? 9 : isSmall ? 5 : 3
            const opacity = isMajor ? 1 : isMed ? 0.7 : isSmall ? 0.4 : 0.2
            const angle = (deg * Math.PI) / 180
            const x1 = cx + (r - 2) * Math.sin(angle)
            const y1 = cy - (r - 2) * Math.cos(angle)
            const x2 = cx + (r - 2 - tickLen) * Math.sin(angle)
            const y2 = cy - (r - 2 - tickLen) * Math.cos(angle)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#00e5ff"
                strokeWidth={isMajor ? 2 : 1}
                strokeOpacity={opacity}
                strokeLinecap="round"
              />
            )
          })}

          {/* Cardinal labels */}
          {CARDINAL.map(({ label, deg }) => {
            const angle = (deg * Math.PI) / 180
            const labelR = r - 28
            const x = cx + labelR * Math.sin(angle)
            const y = cy - labelR * Math.cos(angle)
            const isNorth = label === 'N'
            const isCardinal = label.length === 1
            return (
              <text
                key={label}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isNorth ? '#00e5ff' : isCardinal ? '#5bc8dc' : '#2a7a8f'}
                fontSize={isNorth ? 13 : isCardinal ? 10 : 8}
                fontWeight={isNorth || isCardinal ? 'bold' : 'normal'}
                fontFamily="monospace"
                letterSpacing="0"
              >
                {label}
              </text>
            )
          })}

          {/* Radar sweep sector */}
          <path
            d={sweepPath(cx, cy, r - 16, 0, 65)}
            fill="url(#sweepGrad)"
            className="radar-sweep"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />

          {/* North marker — distinctive red triangle inside ring */}
          <polygon
            points={`${cx},${cy - r + 3} ${cx - 4},${cy - r + 13} ${cx + 4},${cy - r + 13}`}
            fill="#ff3b5c"
            opacity="0.9"
          />
        </g>

        {/* Fixed heading indicator — needle pointing up */}
        <line
          x1={cx} y1={6}
          x2={cx} y2={28}
          stroke="#00e5ff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <polygon
          points={`${cx},4 ${cx - 5},20 ${cx + 5},20`}
          fill="#00e5ff"
        />
        {/* Notch at base of needle */}
        <rect x={cx - 3} y={26} width={6} height={3} rx={1} fill="#00e5ff" opacity="0.5" />

        {/* Center glow halo */}
        <circle cx={cx} cy={cy} r={14} fill="url(#centerGlow)" />
        {/* Center rings */}
        <circle cx={cx} cy={cy} r={10} fill="none" stroke="#00e5ff" strokeWidth="0.75" strokeOpacity="0.25" />
        <circle cx={cx} cy={cy} r={5} fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx={cx} cy={cy} r={2.5} fill="#00e5ff" />
      </svg>
    </div>
  )
}

function sweepPath(cx: number, cy: number, r: number, startAngle: number, sweepAngle: number): string {
  const start = ((startAngle - 90) * Math.PI) / 180
  const end = ((startAngle + sweepAngle - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}
