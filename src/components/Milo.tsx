interface MiloProps {
  taille?: number | string
  expression?: 'neutre' | 'content' | 'surpris' | 'concentre'
  className?: string
}

export function Milo({ taille = 96, expression = 'neutre', className }: MiloProps) {
  // Config visuelle selon l'état système du drone
  const etat = {
    neutre: {
      lumiere: '#00e5ff',
      halo: 'rgba(0, 229, 255, 0.4)',
      accent: '#00b4cc',
      leds: '#00e5ff',
    },
    content: {
      lumiere: '#00e676',
      halo: 'rgba(0, 230, 118, 0.45)',
      accent: '#00c853',
      leds: '#00e676',
    },
    surpris: {
      lumiere: '#ff5252',
      halo: 'rgba(255, 82, 82, 0.45)',
      accent: '#d50000',
      leds: '#ff5252',
    },
    concentre: {
      lumiere: '#ffd600',
      halo: 'rgba(255, 214, 0, 0.45)',
      accent: '#ffab00',
      leds: '#ffd600',
    },
  }[expression]

  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 100 100"
      role="img"
      aria-label="MILO Core Unit"
      className={className}
    >
      <defs>
        <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e2c3d" />
          <stop offset="100%" stopColor="#0d1722" />
        </linearGradient>
        <linearGradient id="armureGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2c3e52" />
          <stop offset="100%" stopColor="#15212e" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ombre portée dynamique sous le robot */}
      <ellipse cx="50" cy="91" rx="26" ry="5.5" fill="rgba(0, 0, 0, 0.45)" />

      {/* Répulseurs / Chenilles inférieures */}
      <rect x="22" y="78" width="18" height="9" rx="3" fill="#141d27" stroke="#2a3b4e" strokeWidth="1.5" />
      <rect x="60" y="78" width="18" height="9" rx="3" fill="#141d27" stroke="#2a3b4e" strokeWidth="1.5" />
      <line x1="26" y1="82" x2="36" y2="82" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />
      <line x1="64" y1="82" x2="74" y2="82" stroke="#00e5ff" strokeWidth="1.5" opacity="0.6" />

      {/* Châssis principal angulaire */}
      <polygon
        points="26,38 74,38 82,74 18,74"
        fill="url(#chassisGrad)"
        stroke="#33475d"
        strokeWidth="2"
      />

      {/* Blindage central */}
      <polygon
        points="30,42 70,42 76,70 24,70"
        fill="url(#armureGrad)"
        stroke="#475f7a"
        strokeWidth="1.2"
      />

      {/* Tête / Dôme capteurs supérieur */}
      <path
        d="M32 38 L38 20 L62 20 L68 38 Z"
        fill="#1e2c3d"
        stroke="#384f68"
        strokeWidth="1.8"
      />

      {/* Antenne / Radar supérieur */}
      <line x1="50" y1="20" x2="50" y2="11" stroke="#4a637f" strokeWidth="2" />
      <circle cx="50" cy="9" r="3.5" fill={etat.lumiere} filter="url(#glow)" />

      {/* Visière optique principale (HUD) */}
      <rect
        x="33"
        y="46"
        width="34"
        height="15"
        rx="4"
        fill="#080e14"
        stroke="#1c2f42"
        strokeWidth="1.5"
      />

      {/* Capteur optique / Scanner selon expression */}
      {expression === 'neutre' && (
        <g filter="url(#glow)">
          <line x1="37" y1="53.5" x2="63" y2="53.5" stroke={etat.lumiere} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="50" cy="53.5" r="3" fill="#ffffff" />
        </g>
      )}

      {expression === 'content' && (
        <g filter="url(#glow)">
          <path
            d="M38 55 Q50 49 62 55"
            fill="none"
            stroke={etat.lumiere}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="43" cy="52" r="1.5" fill="#ffffff" />
          <circle cx="57" cy="52" r="1.5" fill="#ffffff" />
        </g>
      )}

      {expression === 'surpris' && (
        <g filter="url(#glow)">
          <circle cx="50" cy="53.5" r="5" fill="none" stroke={etat.lumiere} strokeWidth="3" />
          <circle cx="50" cy="53.5" r="2" fill="#ffffff" />
        </g>
      )}

      {expression === 'concentre' && (
        <g filter="url(#glow)">
          <circle cx="50" cy="53.5" r="4.5" fill="none" stroke={etat.lumiere} strokeWidth="2" />
          <line x1="42" y1="53.5" x2="58" y2="53.5" stroke={etat.lumiere} strokeWidth="1.8" />
          <line x1="50" y1="47" x2="50" y2="60" stroke={etat.lumiere} strokeWidth="1.8" />
          <circle cx="50" cy="53.5" r="1.5" fill="#ffffff" />
        </g>
      )}

      {/* Indicateurs LED latéraux */}
      <circle cx="28" cy="48" r="1.8" fill={etat.leds} opacity="0.85" filter="url(#glow)" />
      <circle cx="28" cy="54" r="1.8" fill={etat.leds} opacity="0.85" filter="url(#glow)" />
      <circle cx="72" cy="48" r="1.8" fill={etat.leds} opacity="0.85" filter="url(#glow)" />
      <circle cx="72" cy="54" r="1.8" fill={etat.leds} opacity="0.85" filter="url(#glow)" />

      {/* Badge central du Core MILO */}
      <polygon points="50,60 54,64 50,68 46,64" fill={etat.accent} />
    </svg>
  )
}
