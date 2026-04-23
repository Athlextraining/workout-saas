export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 54"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ATHLEX training"
      role="img"
    >
      <title>ATHLEX training</title>
      <g>
        <text
          x="80"
          y="28"
          textAnchor="middle"
          fontFamily="var(--font-league-spartan), system-ui, sans-serif"
          fontWeight="800"
          fontSize="30"
          letterSpacing="4"
          fill="currentColor"
        >
          ATHLEX
        </text>
        <line
          x1="18"
          y1="36"
          x2="62"
          y2="36"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.35"
        />
        <line
          x1="98"
          y1="36"
          x2="142"
          y2="36"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.35"
        />
        <text
          x="80"
          y="48"
          textAnchor="middle"
          fontFamily="var(--font-league-spartan), system-ui, sans-serif"
          fontWeight="500"
          fontSize="10"
          letterSpacing="6"
          fill="currentColor"
          opacity="0.75"
        >
          TRAINING
        </text>
      </g>
    </svg>
  )
}
