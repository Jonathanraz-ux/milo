import type { Signal } from '../data/entrainement'

interface NuageSignauxProps {
  exemples: Signal[]
  cible?: Signal
  /** Identifiants des voisins retenus par le classificateur. */
  voisins?: string[]
}

const TAILLE = 320
const MARGE = 36
const PLOT = TAILLE - MARGE * 2
const SEUIL = 0.55

function px(coherence: number): number {
  return MARGE + coherence * PLOT
}

function py(amplitude: number): number {
  return TAILLE - MARGE - amplitude * PLOT
}

/**
 * Nuage de points du laboratoire : cohérence en abscisse, amplitude en
 * ordonnée. Les deux seuils de la règle visible sont matérialisés, ainsi que
 * la cible et les k voisins effectivement consultés.
 */
export function NuageSignaux({ exemples, cible, voisins = [] }: NuageSignauxProps) {
  const voisinsSet = new Set(voisins)
  return (
    <figure className="nuage">
      <svg
        className="nuage__svg"
        viewBox={`0 0 ${TAILLE} ${TAILLE}`}
        role="img"
        aria-label="Nuage de points des signaux : cohérence en abscisse, amplitude en ordonnée."
      >
        <rect x="0" y="0" width={TAILLE} height={TAILLE} rx="8" fill="#080e14" stroke="#1c2f42" strokeWidth="2" />

        {[0.25, 0.5, 0.75].map((valeur) => (
          <g key={valeur}>
            <line x1={px(valeur)} y1={py(0)} x2={px(valeur)} y2={py(1)} stroke="#142336" strokeWidth="1" />
            <line x1={px(0)} y1={py(valeur)} x2={px(1)} y2={py(valeur)} stroke="#142336" strokeWidth="1" />
          </g>
        ))}

        <line
          x1={px(SEUIL)}
          y1={py(0)}
          x2={px(SEUIL)}
          y2={py(1)}
          stroke="#ffd600"
          strokeWidth="1.4"
          strokeDasharray="5 4"
          opacity="0.7"
        />
        <line
          x1={px(0)}
          y1={py(SEUIL)}
          x2={px(1)}
          y2={py(SEUIL)}
          stroke="#ffd600"
          strokeWidth="1.4"
          strokeDasharray="5 4"
          opacity="0.7"
        />
        <text x={px(SEUIL) + 4} y={py(0) - 6} className="nuage__seuil">
          0,55
        </text>
        <text x={px(0) + 4} y={py(SEUIL) - 5} className="nuage__seuil">
          0,55
        </text>

        {exemples.map((signal) => {
          const choisi = voisinsSet.has(signal.id)
          const couleur = signal.categorie === 'signal' ? '#00e5ff' : '#ff5353'
          return (
            <g key={signal.id}>
              <circle
                cx={px(signal.coherence)}
                cy={py(signal.amplitude)}
                r={choisi ? 9 : 6}
                fill={couleur}
                fillOpacity={0.85}
                stroke={choisi ? '#ffd600' : '#080e14'}
                strokeWidth={choisi ? 2.4 : 1.4}
              >
                <title>{`${signal.code} · ${signal.categorie}`}</title>
              </circle>
            </g>
          )
        })}

        {cible && (
          <g>
            <polygon
              points={`${px(cible.coherence)},${py(cible.amplitude) - 10} ${px(cible.coherence) + 8},${py(cible.amplitude)} ${px(cible.coherence)},${py(cible.amplitude) + 10} ${px(cible.coherence) - 8},${py(cible.amplitude)}`}
              fill="#ffd600"
              stroke="#080e14"
              strokeWidth="1.6"
            >
              <title>{`Cible · ${cible.code}`}</title>
            </polygon>
            <text x={px(cible.coherence)} y={py(cible.amplitude) - 15} textAnchor="middle" className="nuage__cible">
              CIBLE
            </text>
          </g>
        )}

        <text x={TAILLE / 2} y={TAILLE - 10} textAnchor="middle" className="nuage__axe">
          COHÉRENCE →
        </text>
        <text
          x="14"
          y={TAILLE / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${TAILLE / 2})`}
          className="nuage__axe"
        >
          AMPLITUDE →
        </text>
      </svg>
      <figcaption className="nuage__legende">
        <span className="nuage__legende-item">
          <span className="nuage__pastille nuage__pastille--signal" /> SIGNAL
        </span>
        <span className="nuage__legende-item">
          <span className="nuage__pastille nuage__pastille--bruit" /> BRUIT
        </span>
        <span className="nuage__legende-item">
          <span className="nuage__pastille nuage__pastille--cible" /> CIBLE
        </span>
        <span className="nuage__legende-item">
          <span className="nuage__pastille nuage__pastille--voisin" /> VOISIN
        </span>
      </figcaption>
    </figure>
  )
}
