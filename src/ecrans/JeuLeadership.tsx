import { useCallback, useState } from 'react'
import { type MissionLeadership } from '../data/leadership'
import { Milo } from '../components/Milo'
import { IcoAide, IcoEffacer, IcoRetour, IcoSon } from '../components/Ico'
import { utiliserVoix } from '../audio/tts'
import { jouerBip } from '../audio/bips'

interface JeuLeadershipProps {
  mission: MissionLeadership
  sonActif: boolean
  animationsReduites: boolean
  onToggleSon: () => void
  onToggleAnimations: () => void
  onRetour: () => void
  onReussite: (missionId: string) => void
}

export function JeuLeadership({
  mission,
  sonActif,
  animationsReduites,
  onToggleSon,
  onToggleAnimations,
  onRetour,
  onReussite,
}: JeuLeadershipProps) {
  const [plan, setPlan] = useState<string[]>(() => [...mission.ordreInitial])
  const [aideOuverte, setAideOuverte] = useState(false)
  const [message, setMessage] = useState<string>(
    mission.ordreInitial.length > 0
      ? `[PLAN] ${mission.ordreInitial.length} action(s) préchargée(s). Réordonne le plan avant validation.`
      : '[PLAN] Ordre topologique attendu. Ajoute les actions puis vérifie les dépendances.',
  )
  const [statut, setStatut] = useState<'edition' | 'succes' | 'erreur'>('edition')

  const bip = useCallback(
    (nom: Parameters<typeof jouerBip>[0]) => {
      if (sonActif) jouerBip(nom)
    },
    [sonActif],
  )

  const ajouterAction = useCallback(
    (actionId: string) => {
      if (statut !== 'edition') return
      if (plan.includes(actionId)) return
      setPlan((p) => [...p, actionId])
      bip('ajout')
      setMessage('[PLAN] Action ajoutée. Vérifie les prérequis avant de valider.')
      if (sonActif) utiliserVoix('Action ajoutée. Vérifie les prérequis avant de valider.')
    },
    [bip, plan, sonActif, statut],
  )

  const retirerAction = useCallback(
    (index: number) => {
      if (statut !== 'edition') return
      setPlan((p) => p.filter((_, i) => i !== index))
      bip('clic')
      setMessage('[PLAN] Action retirée. Le graphe de dépendances reste à compléter.')
      if (sonActif) utiliserVoix('Action retirée. Le graphe de dépendances reste à compléter.')
    },
    [bip, sonActif, statut],
  )

  const monter = useCallback(
    (index: number) => {
      if (statut !== 'edition') return
      if (index <= 0) return
      setPlan((p) => {
        const copie = [...p]
        const temp = copie[index - 1]
        copie[index - 1] = copie[index]
        copie[index] = temp
        return copie
      })
      bip('clic')
    },
    [bip, statut],
  )

  const descendre = useCallback(
    (index: number) => {
      if (statut !== 'edition') return
      if (index >= plan.length - 1) return
      setPlan((p) => {
        const copie = [...p]
        const temp = copie[index + 1]
        copie[index + 1] = copie[index]
        copie[index] = temp
        return copie
      })
      bip('clic')
    },
    [bip, plan.length, statut],
  )

  const effacer = useCallback(() => {
    if (statut !== 'edition') return
    setPlan([])
    bip('clic')
    setMessage('[PLAN] Plan réinitialisé. Aucune action ordonnée.')
    if (sonActif) utiliserVoix('Plan réinitialisé. Aucune action ordonnée.')
  }, [bip, sonActif, statut])

  const verifier = useCallback(() => {
    if (statut !== 'edition') return
    if (plan.length === 0) {
      setMessage('[ERREUR] Plan vide : aucune action à ordonnancer.')
      if (sonActif) utiliserVoix('Plan vide. Aucune action à ordonnancer.')
      bip('erreur-douce')
      return
    }

    const solution = mission.solutionOrdre
    if (plan.length !== solution.length) {
      setStatut('erreur')
      setMessage(`[ANOMALIE] Nombre d'actions incorrect : ${plan.length} / ${solution.length}. Le graphe requiert toutes les dépendances critiques.`)
      if (sonActif) utiliserVoix("Nombre d'actions incorrect. Le graphe requiert toutes les dépendances critiques.")
      bip('erreur-douce')
      return
    }

    const estBon = plan.every((id, i) => id === solution[i])
    if (estBon) {
      setStatut('succes')
      setMessage('[VALIDÉ] Ordre topologique conforme : toutes les dépendances sont satisfaites.')
      if (sonActif) utiliserVoix('Ordre topologique conforme. Toutes les dépendances sont satisfaites.')
      bip('succes')
      onReussite(mission.id)
    } else {
      setStatut('erreur')
      setMessage('[ANOMALIE] Ordre invalide : un prérequis est exécuté après son dépendant. Repositionne les actions bloquantes.')
      if (sonActif) utiliserVoix('Ordre invalide. Un prérequis est exécuté après son dépendant.')
      bip('erreur-douce')
    }
  }, [bip, mission.solutionOrdre, onReussite, plan, sonActif, statut])

  const recommencer = useCallback(() => {
    setPlan([...mission.ordreInitial])
    setStatut('edition')
    setMessage(
      mission.ordreInitial.length > 0
        ? '[PLAN] Réinitialisé depuis le plan préchargé. Réordonne les actions.'
        : '[PLAN] Réinitialisé. Ajoute les actions dans l’ordre topologique.',
    )
    bip('clic')
    if (sonActif) utiliserVoix('Plan réinitialisé. Ajoute les actions dans l ordre topologique.')
  }, [bip, mission.ordreInitial, sonActif])

  const actionParId = (id: string) => mission.actionsDisponibles.find((a) => a.id === id)

  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Séquence {mission.numero} · {mission.titre}
          <span className="bandeau__sous">Ordonnancement &amp; Dépendances Critiques</span>
        </h1>
        <button type="button" className="bouton bouton--secondaire" onClick={onToggleSon} aria-pressed={sonActif}>
          <IcoSon actif={sonActif} />
          {sonActif ? 'Son activé' : 'Son coupé'}
        </button>
      </div>

      <section className="aide" aria-label="Mission">
        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{mission.titre}</h2>
        <div style={{ marginBottom: '10px' }}>
          <strong>Objectif système</strong>
          <p style={{ margin: '4px 0 0 0', textAlign: 'left' }}>{mission.objectif}</p>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Procédure</strong>
          <ol style={{ margin: '4px 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {mission.aFaire.map((item, idx) => (
              <li key={idx} style={{ textAlign: 'left' }}>{item}</li>
            ))}
          </ol>
        </div>
        {mission.aRespecter && mission.aRespecter.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <strong>Contraintes de dépendance</strong>
            <ul style={{ margin: '4px 0 0 18px', padding: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {mission.aRespecter.map((item, idx) => (
                <li key={idx} style={{ textAlign: 'left' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        {mission.conseilAdulte && (
          <div>
            <strong>Note technique</strong>
            <p style={{ margin: '4px 0 0 0', textAlign: 'left' }}>{mission.conseilAdulte}</p>
          </div>
        )}
        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={() => setAideOuverte((v) => !v)}
          aria-expanded={aideOuverte}
          style={{ marginTop: '10px' }}
        >
          <IcoAide />
          Protocole
        </button>
      </section>

      {aideOuverte && (
        <section className="aide" aria-label="Aide à l’ordonnancement">
          <p className="aide__texte">
            Propriété d’un ordre topologique : aucune arête du graphe ne doit pointer vers une action déjà exécutée.
            Commence par les actions sans prérequis, puis retire-les du graphe.
          </p>
          <button type="button" className="bouton bouton--secondaire" onClick={onToggleAnimations}>
            Animations : {animationsReduites ? 'réduites' : 'normales'}
          </button>
        </section>
      )}

      <div className="jeu">
        <div className="jeu__plateau-zone">
          <div className="graphe-bloc" role="img" aria-label={`Graphe de dépendances de la séquence ${mission.numero}`}>
            <div className="graphe-bloc__noyau">
              <Milo
                taille={92}
                expression={statut === 'succes' ? 'content' : statut === 'erreur' ? 'surpris' : 'neutre'}
              />
              <span className="graphe-bloc__etiquette">MILO Core</span>
            </div>
            <div className="graphe-bloc__resume">
              <p className="graphe-bloc__titre">Graphe critique</p>
              <dl className="graphe-bloc__stats">
                <div>
                  <dt>Actions</dt>
                  <dd>{mission.solutionOrdre.length}</dd>
                </div>
                <div>
                  <dt>Prérequis</dt>
                  <dd>{mission.aRespecter.length}</dd>
                </div>
                <div>
                  <dt>Leurres</dt>
                  <dd>{mission.actionsDisponibles.filter((a) => !a.obligatoire).length}</dd>
                </div>
              </dl>
              <p className="graphe-bloc__etat">
                {statut === 'succes' ? 'ORDRE VALIDE' : statut === 'erreur' ? 'CYCLE / ORDRE INVALIDE' : 'EN ATTENTE'}
              </p>
            </div>
          </div>
        </div>

        <div className="panneau">
          <div className="aide">
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Actions disponibles (dont leurres)</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {mission.actionsDisponibles.map((action) => {
                const dejaPris = plan.includes(action.id)
                return (
                  <button
                    key={action.id}
                    type="button"
                    className="bouton bouton--secondaire"
                    onClick={() => ajouterAction(action.id)}
                    disabled={statut !== 'edition' || dejaPris}
                    style={{ opacity: dejaPris ? 0.5 : 1 }}
                  >
                    {action.libelle}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="aide" style={{ marginTop: '12px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>Séquence d’exécution (ordre topologique)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {plan.length === 0 ? (
                <span className="sequence__vide">Séquence vide. Ajoute une action depuis le catalogue.</span>
              ) : (
                plan.map((actionId, i) => {
                  const action = actionParId(actionId)
                  if (!action) return null
                  return (
                    <div
                      key={`${actionId}-${i}`}
                      className={`plan-item${statut === 'succes' ? ' plan-item--succes' : statut === 'erreur' ? ' plan-item--erreur' : ''}`}
                    >
                      <span className="plan-item__rang">{i + 1}.</span>
                      <span style={{ flex: 1 }}>{action.libelle}</span>
                      {statut === 'edition' && (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button type="button" className="bouton bouton--discret" onClick={() => monter(i)} disabled={i <= 0}>
                            ↑
                          </button>
                          <button type="button" className="bouton bouton--discret" onClick={() => descendre(i)} disabled={i >= plan.length - 1}>
                            ↓
                          </button>
                          <button type="button" className="bouton bouton--discret" onClick={() => retirerAction(i)}>
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="actions" style={{ marginTop: '12px' }}>
            <button type="button" className="bouton bouton--principal" onClick={verifier} disabled={statut !== 'edition'}>
              Valider la séquence
            </button>
            <button type="button" className="bouton bouton--secondaire" onClick={recommencer}>
              <IcoEffacer />
              Réinitialiser
            </button>
            <button type="button" className="bouton bouton--discret" onClick={effacer} disabled={statut !== 'edition'}>
              Vider la séquence
            </button>
          </div>

          <p
            className={`message ${statut === 'succes' ? 'message--succes' : statut === 'erreur' ? 'message--echec' : 'message--attente'}`}
            role="status"
            aria-live="polite"
            style={{ marginTop: '12px' }}
          >
            {message}
          </p>
        </div>
      </div>
    </main>
  )
}
