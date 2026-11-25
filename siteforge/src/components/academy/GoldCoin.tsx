/** Metallic SF coin — SVG, no emoji. */
export function GoldCoin({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = `sf-coin-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="32%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#fff4dc" />
          <stop offset="35%" stopColor="#f0c14b" />
          <stop offset="70%" stopColor="#c45a28" />
          <stop offset="100%" stopColor="#6b3010" />
        </radialGradient>
        <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe0a8" />
          <stop offset="45%" stopColor="#a86a28" />
          <stop offset="100%" stopColor="#ffe0a8" />
        </linearGradient>
        <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.8"
            floodColor="#ffb35c"
            floodOpacity="0.55"
          />
        </filter>
      </defs>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={`url(#${id}-rim)`}
        filter={`url(#${id}-glow)`}
      />
      <circle cx="32" cy="32" r="25.5" fill={`url(#${id}-face)`} />
      <circle
        cx="32"
        cy="32"
        r="22"
        fill="none"
        stroke="#5a3010"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      <circle
        cx="32"
        cy="32"
        r="18.5"
        fill="none"
        stroke="#fff4dc"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* SF mark */}
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
        fontWeight="800"
        fontSize="16"
        fill="#5a2808"
        opacity="0.9"
      >
        SF
      </text>
      {/* specular highlight */}
      <ellipse
        cx="22"
        cy="18"
        rx="10"
        ry="6"
        fill="#fff"
        opacity="0.28"
        transform="rotate(-28 22 18)"
      />
    </svg>
  );
}
