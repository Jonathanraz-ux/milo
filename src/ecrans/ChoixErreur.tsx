import { ERREURS_MISSIONS } from '../data/erreurs'
import { longueurOptimale } from '../engine/gridEngine'
import { IcoCoche, IcoRetour } from '../components/Ico'
import { LigneEtoiles } from '../components/Etoiles'
import { estTerminee, etoilesDe, type Progression } from '../progression/progression'

interface ChoixErreurProps {
  progression: Progression
  onChoisir: (id: string) => void
  onRetour: () => void
}

export function ChoixErreur({ progression, onChoisir, onRetour }: ChoixErreurProps) {
  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Debug Lab · Analyse d’Anomalies
          <span className="bandeau__sous">Correction de buffers corrompus · 5×5 → 6×6</span>
        </h1>
      </div>

      <p className="objectif">
        Chaque anomalie contient une séquence invalide. Localise l’instruction fautive, reconstruis un trajet valide et
        minimise le nombre d’instructions.
      </p>

      <ul className="missions">
        {ERREURS_MISSIONS.map((mission) => {
          const note = etoilesDe(progression, mission.id)
          const optimal = longueurOptimale(mission.grille)
          return (
            <li key={mission.id}>
              <button type="button" className="mission-carte" onClick={() => onChoisir(mission.id)}>
                <span className="mission-carte__numero">{mission.numero}</span>
                <span className="mission-carte__titre">{mission.titre}</span>
                <span className="mission-carte__objectif">{mission.objectif}</span>
                <span className="mission-carte__meta">
                  Grille {mission.grille.width}×{mission.grille.height} · optimal {optimal ?? '—'} instructions
                </span>
                {note > 0 && <LigneEtoiles note={note} taille={18} />}
                {estTerminee(progression, mission.id) && (
                  <span className="mission-carte__etat">
                    <IcoCoche />
                    Anomalie corrigée
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
