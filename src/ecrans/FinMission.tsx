import { Milo } from '../components/Milo'
import { IcoEtoile } from '../components/Ico'
import { LigneEtoiles } from '../components/Etoiles'

interface FinMissionProps {
  titre: string
  message: string
  /** Note d'optimalité (0 = module sans barème d'étoiles). */
  etoiles?: number
  /** Libellé du bouton de retour à la liste (« Une autre mission », « Un autre défi »…). */
  libelleAutre?: string
  onRejouer: () => void
  onAutreMission: () => void
  onTerminer: () => void
}

export function FinMission({
  titre,
  message,
  etoiles = 0,
  libelleAutre = 'Une autre mission',
  onRejouer,
  onAutreMission,
  onTerminer,
}: FinMissionProps) {
  return (
    <main className="ecran fin">
      <Milo taille={120} expression="content" />
      <h1 className="fin__titre">Validation confirmée</h1>
      <p className="fin__phrase">{message}</p>
      <p className="fin__phrase">
        <IcoEtoile taille={22} /> {titre}
      </p>
      {etoiles > 0 && (
        <div className="fin__score">
          <LigneEtoiles note={etoiles} taille={34} />
          <span>Score d’optimalité : {etoiles}/3</span>
        </div>
      )}
      <div className="fin__boutons">
        <button type="button" className="bouton bouton--principal" onClick={onRejouer}>
          Rejouer
        </button>
        <button type="button" className="bouton bouton--secondaire" onClick={onAutreMission}>
          {libelleAutre}
        </button>
        <button type="button" className="bouton bouton--discret" onClick={onTerminer}>
          Terminer
        </button>
      </div>
    </main>
  )
}
