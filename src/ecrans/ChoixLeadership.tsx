import { MISSIONS_LEADERSHIP } from '../data/leadership'
import { IcoCoche, IcoRetour } from '../components/Ico'
import { estTerminee, type Progression } from '../progression/progression'

interface ChoixLeadershipProps {
  progression: Progression
  onChoisir: (missionId: string) => void
  onRetour: () => void
}

export function ChoixLeadership({ progression, onChoisir, onRetour }: ChoixLeadershipProps) {
  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Ordonnancement &amp; Dépendances Critiques
          <span className="bandeau__sous">Graphes de tâches · chemin critique · bascule blue/green</span>
        </h1>
      </div>

      <p className="objectif">
        Chaque mission est un graphe de dépendances. Un plan valide respecte tous les prérequis et n’exécute pas les
        actions leurres.
      </p>

      <ul className="missions">
        {MISSIONS_LEADERSHIP.map((mission) => (
          <li key={mission.id}>
            <button type="button" className="mission-carte" onClick={() => onChoisir(mission.id)}>
              <span className="mission-carte__numero">{mission.numero}</span>
              <span className="mission-carte__titre">{mission.titre}</span>
              <span className="mission-carte__objectif">{mission.objectif}</span>
              <span className="mission-carte__meta">
                {mission.solutionOrdre.length} étapes critiques · {mission.actionsDisponibles.length} actions disponibles
              </span>
              {estTerminee(progression, mission.id) && (
                <span className="mission-carte__etat">
                  <IcoCoche />
                  Plan validé
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
