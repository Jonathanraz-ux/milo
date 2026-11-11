import { DEFIS } from '../data/entrainement'
import { IcoCoche, IcoRetour } from '../components/Ico'
import { estTerminee, type Progression } from '../progression/progression'

interface ChoixEntrainementProps {
  progression: Progression
  onChoisir: (defiId: string) => void
  onRetour: () => void
}

export function ChoixEntrainement({ progression, onChoisir, onRetour }: ChoixEntrainementProps) {
  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Machine Learning Lab · k-NN
          <span className="bandeau__sous">Défis de classification supervisée</span>
        </h1>
      </div>

      <p className="objectif">
        Injecte des exemples étiquetés, choisis k, puis observe les voisins et le vote majoritaire. Le classificateur
        n’utilise jamais la classe réelle de la cible avant le verdict.
      </p>

      <ul className="missions">
        {DEFIS.map((defi) => (
          <li key={defi.id}>
            <button type="button" className="mission-carte" onClick={() => onChoisir(defi.id)}>
              <span className="mission-carte__numero">{defi.numero}</span>
              <span className="mission-carte__titre">{defi.titre}</span>
              <span className="mission-carte__objectif">{defi.objectif}</span>
              <span className="mission-carte__meta">
                {defi.exemples.length} exemples · {defi.tests.length} cible{defi.tests.length > 1 ? 's' : ''} · k ={' '}
                {defi.kRecommande}
              </span>
              {estTerminee(progression, defi.id) && (
                <span className="mission-carte__etat">
                  <IcoCoche />
                  Module validé
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
