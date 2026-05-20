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
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 8

  // Rotate the compass ring so N always points up, and heading indicator stays at top
  const rotation = -heading

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG compass */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
      >
        {/* Outer glow ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.15" />
        <circle cx={cx} cy={cy} r={r - 12} fill="none" stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.1" />

        {/* Rotating group */}
        <g transform={`rotate(${rotation}, ${cx}, ${cy})`}>
          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const deg = i * 5
            const isMajor = deg % 90 === 0
            const isMed = deg % 45 === 0
            const tickLen = isMajor ? 16 : isMed ? 10 : 5
            const angle = (deg * Math.PI) / 180
            const x1 = cx + (r - 2) * Math.sin(angle)
            const y1 = cy - (r - 2) * Math.cos(angle)
            const x2 = cx + (r - 2 - tickLen) * Math.sin(angle)
            const y2 = cy - (r - 2 - tickLen) * Math.cos(angle)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isMajor ? '#00e5ff' : isMed ? '#00e5ff88' : '#00e5ff33'}
                strokeWidth={isMajor ? 2 : 1}
              />
            )
          })}

          {/* Cardinal labels */}
          {CARDINAL.map(({ label, deg }) => {
            const angle = (deg * Math.PI) / 180
            const labelR = r - 30
            const x = cx + labelR * Math.sin(angle)
            const y = cy - labelR * Math.cos(angle)
            const isNorth = label === 'N'
            return (
              <text
                key={label}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isNorth ? '#00e5ff' : '#6ec9dd'}
                fontSize={isNorth ? 14 : 10}
                fontWeight={isNorth ? 'bold' : 'normal'}
                fontFamily="monospace"
              >
                {label}
              </text>
            )
          })}

          {/* Radar sweep */}
          <defs>
            <radialGradient id="sweepGrad" cx="0%" cy="0%" r="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="dotGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Concentric range rings */}
          {[0.33, 0.66].map((frac) => (
            <circle
              key={frac}
              cx={cx} cy={cy}
              r={(r - 24) * frac}
              fill="none"
              stroke="#00e5ff"
              strokeWidth="0.5"
              strokeOpacity="0.15"
              strokeDasharray="3 6"
            />
          ))}

          {/* Sweep sector */}
          <path
            d={sweepPath(cx, cy, r - 24, 0, 60)}
            fill="url(#sweepGrad)"
            className="radar-sweep"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>

        {/* Fixed heading indicator (always points up = current direction) */}
        <line
          x1={cx} y1={8}
          x2={cx} y2={38}
          stroke="#00e5ff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon
          points={`${cx},6 ${cx - 5},22 ${cx + 5},22`}
          fill="#00e5ff"
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="4" fill="#00e5ff" />
        <circle cx={cx} cy={cy} r="8" fill="none" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.3" />
      </svg>
    </div>
  )
}

function sweepPath(
  cx: number, cy: number, r: number,
  startAngle: number, sweepAngle: number
): string {
  const start = ((startAngle - 90) * Math.PI) / 180
  const end = ((startAngle + sweepAngle - 90) * Math.PI) / 180
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
}
