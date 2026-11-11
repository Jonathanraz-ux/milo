import { MISSIONS } from '../data/missions'
import { longueurOptimale } from '../engine/gridEngine'
import { IcoCoche, IcoRetour } from '../components/Ico'
import { LigneEtoiles } from '../components/Etoiles'
import { estTerminee, etoilesDe, type Progression } from '../progression/progression'

interface ChoixMissionProps {
  progression: Progression
  onChoisir: (missionId: string) => void
  onRetour: () => void
}

export function ChoixMission({ progression, onChoisir, onRetour }: ChoixMissionProps) {
  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Navigation Algorithmique
          <span className="bandeau__sous">Sélection de séquence · 5×5 → 8×8</span>
        </h1>
      </div>

      <ul className="missions">
        {MISSIONS.map((mission) => {
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
                    Module validé
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
