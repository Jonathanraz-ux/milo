import { useCallback, useEffect, useState } from 'react'
import { Accueil } from './ecrans/Accueil'
import { ChoixMission } from './ecrans/ChoixMission'
import { JeuGuideMilo } from './ecrans/JeuGuideMilo'
import { ChoixEntrainement } from './ecrans/ChoixEntrainement'
import { JeuEntraineMilo } from './ecrans/JeuEntraineMilo'
import { ChoixErreur } from './ecrans/ChoixErreur'
import { JeuErreur } from './ecrans/JeuErreur'
import { ChoixLeadership } from './ecrans/ChoixLeadership'
import { JeuLeadership } from './ecrans/JeuLeadership'
import { Documentation } from './ecrans/Documentation'
import { FinMission } from './ecrans/FinMission'
import { MISSIONS, missionParId } from './data/missions'
import { DEFIS, defiParId } from './data/entrainement'
import { ERREURS_MISSIONS, erreurParId } from './data/erreurs'
import { MISSIONS_LEADERSHIP, missionLeadershipParId } from './data/leadership'
import {
  chargerProgression,
  enregistrerProgression,
  estTerminee as estTermineeProg,
  marquerTerminee,
  progressionVide,
  type Progression,
} from './progression/progression'

type Ecran =
  | { nom: 'accueil' }
  | { nom: 'choix' }
  | { nom: 'jeu'; missionId: string }
  | { nom: 'fin'; missionId: string }
  | { nom: 'choix-entrainement' }
  | { nom: 'jeu-entrainement'; defiId: string }
  | { nom: 'fin-entrainement'; defiId: string }
  | { nom: 'choix-erreur' }
  | { nom: 'jeu-erreur'; erreurId: string }
  | { nom: 'fin-erreur'; erreurId: string }
  | { nom: 'choix-leadership' }
  | { nom: 'jeu-leadership'; missionId: string }
  | { nom: 'fin-leadership'; missionId: string }
  | { nom: 'documentation' }

function messageFin(missionId: string): string {
  const mission = missionParId(missionId)
  if (mission && mission.sequenceInitiale.length > 0) {
    return 'Séquence optimisée : le buffer initial est désormais valide.'
  }
  return 'Cible atteinte : parcours validé par le moteur BFS.'
}

const MESSAGE_FIN_ENTRAINEMENT =
  'Classification conforme sur toutes les cibles : le jeu d’apprentissage généralise correctement.'

const MESSAGE_FIN_ERREUR =
  'Anomalie corrigée : le buffer rejoué atteint la cible sans collision.'

const MESSAGE_FIN_LEADERSHIP =
  'Ordre topologique validé : toutes les dépendances critiques sont satisfaites.'

export default function App() {
  const [ecran, setEcran] = useState<Ecran>({ nom: 'accueil' })
  const [progression, setProgression] = useState<Progression>(progressionVide)
  const [sonActif, setSonActif] = useState(true)
  const [animationsReduites, setAnimationsReduites] = useState(false)
  const [derniereNote, setDerniereNote] = useState(0)

  const missionEnCours =
    ecran.nom === 'jeu' || ecran.nom === 'fin' ? missionParId(ecran.missionId) : undefined
  const defiEnCours =
    ecran.nom === 'jeu-entrainement' || ecran.nom === 'fin-entrainement' ? defiParId(ecran.defiId) : undefined
  const erreurEnCours =
    ecran.nom === 'jeu-erreur' || ecran.nom === 'fin-erreur' ? erreurParId(ecran.erreurId) : undefined
  const missionLeadershipEnCours =
    ecran.nom === 'jeu-leadership' || ecran.nom === 'fin-leadership' ? missionLeadershipParId(ecran.missionId) : undefined

  useEffect(() => {
    setProgression(chargerProgression())
  }, [])

  useEffect(() => {
    enregistrerProgression(progression)
  }, [progression])

  const onReussite = useCallback((missionId: string, etoiles: number) => {
    setDerniereNote(etoiles)
    setProgression((p) => marquerTerminee(p, missionId, etoiles))
    setEcran({ nom: 'fin', missionId })
  }, [])

  const onReussiteDefi = useCallback((defiId: string) => {
    setProgression((p) => marquerTerminee(p, defiId))
    setEcran({ nom: 'fin-entrainement', defiId })
  }, [])

  const onReussiteErreur = useCallback((erreurId: string, etoiles: number) => {
    setDerniereNote(etoiles)
    setProgression((p) => marquerTerminee(p, erreurId, etoiles))
    setEcran({ nom: 'fin-erreur', erreurId })
  }, [])

  const onReussiteLeadership = useCallback((missionId: string) => {
    setProgression((p) => marquerTerminee(p, missionId))
    setEcran({ nom: 'fin-leadership', missionId })
  }, [])

  const onCommencer = useCallback(() => setEcran({ nom: 'choix' }), [])
  const onEntrainer = useCallback(() => setEcran({ nom: 'choix-entrainement' }), [])
  const onTrompe = useCallback(() => setEcran({ nom: 'choix-erreur' }), [])
  const onDiriger = useCallback(() => setEcran({ nom: 'choix-leadership' }), [])
  const onDocumentation = useCallback(() => setEcran({ nom: 'documentation' }), [])

  const onContinuer = useCallback(() => {
    const prochaineMission = MISSIONS.find((m) => !estTermineeProg(progression, m.id))
    if (prochaineMission) {
      setEcran({ nom: 'jeu', missionId: prochaineMission.id })
      return
    }
    const prochainDefi = DEFIS.find((d) => !estTermineeProg(progression, d.id))
    if (prochainDefi) {
      setEcran({ nom: 'jeu-entrainement', defiId: prochainDefi.id })
      return
    }
    const prochaineErreur = ERREURS_MISSIONS.find((e) => !estTermineeProg(progression, e.id))
    if (prochaineErreur) {
      setEcran({ nom: 'jeu-erreur', erreurId: prochaineErreur.id })
      return
    }
    const prochaineLeadership = MISSIONS_LEADERSHIP.find((m) => !estTermineeProg(progression, m.id))
    if (prochaineLeadership) {
      setEcran({ nom: 'jeu-leadership', missionId: prochaineLeadership.id })
      return
    }
    setEcran({ nom: 'jeu', missionId: MISSIONS[0].id })
  }, [progression])

  return (
    <div className="app" data-animations={animationsReduites ? 'reduites' : 'normales'}>
      <a className="saut-contenu" href="#contenu">
        Aller au contenu
      </a>
      <div id="contenu" style={{ display: 'contents' }}>
        {ecran.nom === 'accueil' && (
          <Accueil
            progression={progression}
            onCommencer={onCommencer}
            onEntrainer={onEntrainer}
            onTrompe={onTrompe}
            onDiriger={onDiriger}
            onDocumentation={onDocumentation}
            onContinuer={onContinuer}
          />
        )}
        {ecran.nom === 'choix' && (
          <ChoixMission
            progression={progression}
            onChoisir={(missionId) => setEcran({ nom: 'jeu', missionId })}
            onRetour={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'jeu' && missionEnCours && (
          <JeuGuideMilo
            key={missionEnCours.id}
            mission={missionEnCours}
            sonActif={sonActif}
            animationsReduites={animationsReduites}
            onToggleSon={() => setSonActif((v) => !v)}
            onToggleAnimations={() => setAnimationsReduites((v) => !v)}
            onRetour={() => setEcran({ nom: 'choix' })}
            onReussite={onReussite}
          />
        )}
        {ecran.nom === 'fin' && missionEnCours && (
          <FinMission
            titre={missionEnCours.titre}
            message={messageFin(missionEnCours.id)}
            etoiles={derniereNote}
            onRejouer={() => setEcran({ nom: 'jeu', missionId: missionEnCours.id })}
            onAutreMission={() => setEcran({ nom: 'choix' })}
            onTerminer={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'choix-entrainement' && (
          <ChoixEntrainement
            progression={progression}
            onChoisir={(defiId) => setEcran({ nom: 'jeu-entrainement', defiId })}
            onRetour={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'jeu-entrainement' && defiEnCours && (
          <JeuEntraineMilo
            key={defiEnCours.id}
            defi={defiEnCours}
            sonActif={sonActif}
            animationsReduites={animationsReduites}
            onToggleSon={() => setSonActif((v) => !v)}
            onToggleAnimations={() => setAnimationsReduites((v) => !v)}
            onRetour={() => setEcran({ nom: 'choix-entrainement' })}
            onReussite={onReussiteDefi}
          />
        )}
        {ecran.nom === 'fin-entrainement' && defiEnCours && (
          <FinMission
            titre={defiEnCours.titre}
            message={MESSAGE_FIN_ENTRAINEMENT}
            libelleAutre="Un autre défi"
            onRejouer={() => setEcran({ nom: 'jeu-entrainement', defiId: defiEnCours.id })}
            onAutreMission={() => setEcran({ nom: 'choix-entrainement' })}
            onTerminer={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'choix-erreur' && (
          <ChoixErreur
            progression={progression}
            onChoisir={(id) => setEcran({ nom: 'jeu-erreur', erreurId: id })}
            onRetour={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'jeu-erreur' && erreurEnCours && (
          <JeuErreur
            key={erreurEnCours.id}
            mission={erreurEnCours}
            sonActif={sonActif}
            animationsReduites={animationsReduites}
            onToggleSon={() => setSonActif((v) => !v)}
            onToggleAnimations={() => setAnimationsReduites((v) => !v)}
            onRetour={() => setEcran({ nom: 'choix-erreur' })}
            onReussite={onReussiteErreur}
          />
        )}
        {ecran.nom === 'fin-erreur' && erreurEnCours && (
          <FinMission
            titre={erreurEnCours.titre}
            message={MESSAGE_FIN_ERREUR}
            etoiles={derniereNote}
            libelleAutre="Une autre anomalie"
            onRejouer={() => setEcran({ nom: 'jeu-erreur', erreurId: erreurEnCours.id })}
            onAutreMission={() => setEcran({ nom: 'choix-erreur' })}
            onTerminer={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'choix-leadership' && (
          <ChoixLeadership
            progression={progression}
            onChoisir={(missionId) => setEcran({ nom: 'jeu-leadership', missionId })}
            onRetour={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'jeu-leadership' && missionLeadershipEnCours && (
          <JeuLeadership
            mission={missionLeadershipEnCours}
            sonActif={sonActif}
            animationsReduites={animationsReduites}
            onToggleSon={() => setSonActif((v) => !v)}
            onToggleAnimations={() => setAnimationsReduites((v) => !v)}
            onRetour={() => setEcran({ nom: 'choix-leadership' })}
            onReussite={onReussiteLeadership}
          />
        )}
        {ecran.nom === 'fin-leadership' && missionLeadershipEnCours && (
          <FinMission
            titre={missionLeadershipEnCours.titre}
            message={MESSAGE_FIN_LEADERSHIP}
            libelleAutre="Un autre scénario"
            onRejouer={() => setEcran({ nom: 'jeu-leadership', missionId: missionLeadershipEnCours.id })}
            onAutreMission={() => setEcran({ nom: 'choix-leadership' })}
            onTerminer={() => setEcran({ nom: 'accueil' })}
          />
        )}
        {ecran.nom === 'documentation' && <Documentation onRetour={() => setEcran({ nom: 'accueil' })} />}
      </div>
    </div>
  )
}
