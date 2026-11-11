import { IcoEtoile } from './Ico'

interface LigneEtoilesProps {
  note: number
  total?: number
  taille?: number
  label?: string
}

/**
 * Affiche une note d'optimalité sous forme d'étoiles pleines ou éteintes.
 * Purement décoratif pour la note, mais porte un libellé accessible complet.
 */
export function LigneEtoiles({ note, total = 3, taille = 24, label }: LigneEtoilesProps) {
  const bornee = Math.max(0, Math.min(total, Math.round(note)))
  return (
    <span
      className="ligne-etoiles"
      role="img"
      aria-label={label ?? `${bornee} étoile${bornee > 1 ? 's' : ''} sur ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span key={index} className={`etoile${index < bornee ? ' etoile--pleine' : ' etoile--vide'}`}>
          <IcoEtoile taille={taille} />
        </span>
      ))}
    </span>
  )
}
