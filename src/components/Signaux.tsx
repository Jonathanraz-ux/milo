import type { CategorieSignal, FormeSignal } from '../data/entrainement'

interface SignalDessinProps {
  forme: FormeSignal
  amplitude: number
  coherence: number
  categorie: CategorieSignal
  tailleMax?: number
  className?: string
}

const COULEURS: Record<CategorieSignal, string> = {
  signal: '#00e5ff',
  bruit: '#ff5353',
}

function enveloppe(t: number, centre: number, largeur: number): number {
  return Math.exp(-Math.pow((t - centre) / largeur, 2))
}

/** Déplacement vertical (positif vers le haut) de l'oscillogramme. */
function valeur(forme: FormeSignal, t: number, amplitude: number, coherence: number): number {
  const a = amplitude * 18
  const phase = t * Math.PI * 2
  switch (forme) {
    case 'porteuse':
      return Math.sin(phase * 2) * a
    case 'rafale':
      return Math.sin(phase * 7) * a * enveloppe(t, 0.5, 0.18)
    case 'impulsion':
      return Math.cos(phase * 12) * a * enveloppe(t, 0.5, 0.07) +
        Math.cos(phase * 12) * a * 0.35 * enveloppe(t, 0.22, 0.04)
    case 'derive':
      return Math.sin(phase * 1.5) * a * 0.55 + (t - 0.5) * a * 1.5
    case 'bruit':
      return ((Math.sin(phase * 17) + Math.sin(phase * 29)) / 2) * a * (1.2 - coherence)
    case 'interference':
      return Math.sin(phase * 2) * a * 0.45 + Math.sin(phase * 15) * a * 0.55
    case 'echo':
      return (
        Math.sin(phase * 2) * a * 0.7 +
        (t > 0.4 ? Math.sin((t - 0.4) * Math.PI * 12) * a * 0.3 * Math.exp(-4 * (t - 0.4)) : 0)
      )
    case 'saturation': {
      const brut = Math.sin(phase * 3) * a * 2.2
      const limite = a * 1.15
      return Math.max(-limite, Math.min(limite, brut))
    }
  }
}

function trace(forme: FormeSignal, amplitude: number, coherence: number): string {
  const points: string[] = []
  const pas = 72
  for (let i = 0; i <= pas; i++) {
    const t = i / pas
    const x = 3 + t * 94
    const y = Math.max(4, Math.min(56, 30 - valeur(forme, t, amplitude, coherence)))
    points.push(`${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `M ${points.join(' L ')}`
}

/**
 * Oscillogramme déterministe : la forme d'onde dépend de la forme du signal,
 * l'amplitude de sa caractéristique « amplitude » et la quantité de bruit de
 * sa caractéristique « cohérence ».
 */
export function SignalDessin({
  forme,
  amplitude,
  coherence,
  categorie,
  tailleMax = 124,
  className,
}: SignalDessinProps) {
  const couleur = COULEURS[categorie]
  const largeur = tailleMax
  const hauteur = Math.round(tailleMax * 0.62)
  return (
    <svg
      className={className}
      viewBox="0 0 100 60"
      width={largeur}
      height={hauteur}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="0" y="0" width="100" height="60" rx="4" fill="#080e14" stroke="#1c2f42" strokeWidth="1.5" />
      {Array.from({ length: 7 }, (_, i) => (
        <line
          key={`v-${i}`}
          x1={3 + i * (94 / 6)}
          y1="4"
          x2={3 + i * (94 / 6)}
          y2="56"
          stroke="#142336"
          strokeWidth="0.8"
        />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line
          key={`h-${i}`}
          x1="3"
          y1={4 + i * 13}
          x2="97"
          y2={4 + i * 13}
          stroke="#142336"
          strokeWidth="0.8"
        />
      ))}
      <line x1="3" y1="30" x2="97" y2="30" stroke="#203854" strokeWidth="1" strokeDasharray="2 2" />
      <path
        d={trace(forme, amplitude, coherence)}
        fill="none"
        stroke={couleur}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="96" cy="8" r="2.2" fill={couleur} />
    </svg>
  )
}
