import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  evaluerEtoiles,
  executerProgramme,
  longueurOptimale,
  LIMITE_COMMANDES,
  type Cell,
  type Direction,
  type ParcoursStatut,
} from '../engine/gridEngine'
import type { ErreurMission } from '../data/erreurs'
import { Milo } from '../components/Milo'
import { LigneEtoiles } from '../components/Etoiles'
import {
  IcoAide,
  IcoEffacer,
  IcoEtoile,
  IcoFleche,
  IcoGo,
  IcoRejouer,
  IcoRetour,
  IcoRocher,
  IcoSon,
  IcoStop,
} from '../components/Ico'
import { utiliserVoix } from '../audio/tts'
import { jouerBip } from '../audio/bips'

interface JeuErreurProps {
  mission: ErreurMission
  sonActif: boolean
  animationsReduites: boolean
  onToggleSon: () => void
  onToggleAnimations: () => void
  onRetour: () => void
  onReussite: (id: string, etoiles: number) => void
}

type Phase = 'apercu' | 'edition' | 'execution' | 'succes' | 'echec' | 'arret'

const DUREE_PAS = 650
const DELAI_DEPART = 400
const DELAI_FIN = 550

const LIBELLES: Record<Direction, string> = {
  haut: 'Haut',
  bas: 'Bas',
  gauche: 'Gauche',
  droite: 'Droite',
}

function variablesGrille(largeur: number, hauteur: number): CSSProperties {
  return { '--grille-w': largeur, '--grille-h': hauteur } as unknown as CSSProperties
}

function messageDePhase(
  phase: Phase,
  echec: ParcoursStatut | null,
  nbCommandes: number,
  optimal: number | null,
  etoiles: number | null,
): string {
  switch (phase) {
    case 'apercu':
      return '[ANOMALIE] Séquence corrompue chargée. Inspecte-la, puis corrige le buffer.'
    case 'edition':
      return `[ÉDITION] Buffer ${nbCommandes}/${LIMITE_COMMANDES} instructions · optimal BFS ${optimal ?? '—'}.`
    case 'execution':
      return '[EXÉCUTION] Rejeu de la séquence corrigée…'
    case 'succes':
      return `[CORRIGÉ] Séquence valide en ${nbCommandes} instructions (optimal ${optimal ?? '—'}) · note ${etoiles ?? 1}/3.`
    case 'arret':
      return '[INTERRUPTION] Rejeu suspendu. Le buffer reste modifiable.'
    case 'echec':
      switch (echec) {
        case 'obstacle':
          return '[ERREUR] Collision avec un bloc mémoire corrompu. Séquence interrompue.'
        case 'hors-grille':
          return '[ERREUR] Débordement de grille : coordonnée hors limites.'
        case 'programme-vide':
          return '[ERREUR] Buffer vide : aucune instruction à exécuter.'
        default:
          return '[ERREUR] Cible non atteinte : la séquence se termine hors du nœud cible.'
      }
  }
}

function classeMessage(phase: Phase): string {
  if (phase === 'succes') return 'message message--succes'
  if (phase === 'echec') return 'message message--echec'
  if (phase === 'arret') return 'message message--arret'
  return 'message message--attente'
}

export function JeuErreur({
  mission,
  sonActif,
  animationsReduites,
  onToggleSon,
  onToggleAnimations,
  onRetour,
  onReussite,
}: JeuErreurProps) {
  const [sequence, setSequence] = useState<Direction[]>(() => [...mission.programmeErrone])
  const [phase, setPhase] = useState<Phase>('apercu')
  const [echec, setEchec] = useState<ParcoursStatut | null>(null)
  const [position, setPosition] = useState<Cell>(() => mission.grille.depart)
  const [currentIndex, setCurrentIndex] = useState<number | null>(null)
  const [aideOuverte, setAideOuverte] = useState(false)
  const [etoiles, setEtoiles] = useState<number | null>(null)

  const timersRef = useRef<number[]>([])
  const tokenRef = useRef(0)
  const executionRef = useRef(false)
  const optimal = longueurOptimale(mission.grille)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      tokenRef.current += 1
      executionRef.current = false
    }
  }, [clearTimers])

  const bip = useCallback(
    (nom: Parameters<typeof jouerBip>[0]) => {
      if (sonActif) jouerBip(nom)
    },
    [sonActif],
  )

  const lancer = useCallback(() => {
    if (executionRef.current) return
    if (sequence.length === 0) return
    clearTimers()
    executionRef.current = true
    const token = ++tokenRef.current
    const parcours = executerProgramme(mission.grille, sequence)
    setPhase('execution')
    setEchec(null)
    setEtoiles(null)
    setPosition(mission.grille.depart)
    setCurrentIndex(null)
    bip('go')

    const pas = parcours.positions.slice(1)
    pas.forEach((pos, i) => {
      const t = window.setTimeout(() => {
        if (token !== tokenRef.current) return
        setPosition(pos)
        setCurrentIndex(i)
      }, DELAI_DEPART + i * DUREE_PAS)
      timersRef.current.push(t)
    })

    const fin = window.setTimeout(() => {
      if (token !== tokenRef.current) return
      executionRef.current = false
      if (parcours.statut === 'succes') {
        const note = evaluerEtoiles(mission.grille, sequence)
        const noteFinale = note > 0 ? note : 1
        setEtoiles(noteFinale)
        setPhase('succes')
        setCurrentIndex(null)
        bip(noteFinale === 3 ? 'succes' : 'clic')
        onReussite(mission.id, noteFinale)
      } else {
        setPhase('echec')
        setEchec(parcours.statut)
        setCurrentIndex(parcours.etapeEchouee)
        bip('erreur-douce')
      }
    }, DELAI_DEPART + pas.length * DUREE_PAS + DELAI_FIN)
    timersRef.current.push(fin)
  }, [bip, clearTimers, mission, onReussite, sequence])

  const stop = useCallback(() => {
    if (!executionRef.current) return
    clearTimers()
    tokenRef.current += 1
    executionRef.current = false
    setPhase('arret')
    setEchec(null)
    setCurrentIndex(null)
    bip('arret')
  }, [bip, clearTimers])

  const recommencerProgrammeErrone = useCallback(() => {
    clearTimers()
    tokenRef.current += 1
    executionRef.current = false
    setSequence([...mission.programmeErrone])
    setPosition(mission.grille.depart)
    setCurrentIndex(null)
    setPhase('apercu')
    setEchec(null)
    setEtoiles(null)
    bip('clic')
  }, [bip, clearTimers, mission])

  const vider = useCallback(() => {
    if (phase === 'execution') return
    setSequence([])
    bip('clic')
  }, [bip, phase])

  const ajouter = useCallback(
    (dir: Direction) => {
      if (phase === 'execution') return
      if (sequence.length >= LIMITE_COMMANDES) return
      setSequence((s) => [...s, dir])
      bip('ajout')
      if (phase === 'apercu') setPhase('edition')
    },
    [bip, phase, sequence.length],
  )

  const retirer = useCallback(
    (index: number) => {
      if (phase === 'execution') return
      setSequence((s) => s.filter((_, i) => i !== index))
      bip('clic')
      if (phase === 'apercu') setPhase('edition')
    },
    [bip, phase],
  )

  const enExecution = phase === 'execution'
  const pleine = sequence.length >= LIMITE_COMMANDES
  const cases: number[] = Array.from({ length: mission.grille.width * mission.grille.height }, (_, i) => i)

  useEffect(() => {
    if (sonActif) {
      utiliserVoix(messageDePhase(phase, echec, sequence.length, optimal, etoiles))
    }
  }, [phase, echec, sonActif, sequence.length, optimal, etoiles])

  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Anomalie {mission.numero} · {mission.titre}
          <span className="bandeau__sous">
            Debug Lab · {mission.grille.width}×{mission.grille.height}
          </span>
        </h1>
        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={() => setAideOuverte((v) => !v)}
          aria-expanded={aideOuverte}
        >
          <IcoAide />
          Spécifications
        </button>
        <button type="button" className="bouton bouton--secondaire" onClick={onToggleSon} aria-pressed={sonActif}>
          <IcoSon actif={sonActif} />
          {sonActif ? 'Audio actif' : 'Audio coupé'}
        </button>
      </div>

      {aideOuverte && (
        <section className="aide" aria-label="Spécifications du débogage">
          <p className="aide__texte">{mission.aide}</p>
          <p className="aide__texte">
            <strong>Barème :</strong> ⭐ correction valide · ⭐⭐ buffer réduit · ⭐⭐⭐ chemin le plus court (BFS).
          </p>
          <button type="button" className="bouton bouton--secondaire" onClick={onToggleAnimations}>
            Animations : {animationsReduites ? 'réduites' : 'normales'}
          </button>
        </section>
      )}

      <p className="objectif">
        <IcoEtoile taille={26} /> {mission.objectif}
      </p>

      <div className="jeu">
        <div className="jeu__plateau-zone">
          <div
            className="plateau"
            role="img"
            style={variablesGrille(mission.grille.width, mission.grille.height)}
            aria-label={`Plateau de débogage ${mission.grille.width} sur ${mission.grille.height}.`}
          >
            <div className="plateau__grille">
              {cases.map((i) => {
                const x = i % mission.grille.width
                const y = Math.floor(i / mission.grille.width)
                const estCible = x === mission.grille.cible.x && y === mission.grille.cible.y
                const estRocher = mission.grille.obstacles.some((o) => o.x === x && o.y === y)
                const remplissage = estRocher ? (
                  <span className="case__remplissage">
                    <IcoRocher taille="100%" />
                  </span>
                ) : estCible ? (
                  <span className={`case__remplissage${animationsReduites ? '' : ' etoile-clignote'}`}>
                    <IcoEtoile taille="100%" />
                  </span>
                ) : null
                return (
                  <div key={i} className={`case${estCible ? ' case--cible' : ''}`} aria-hidden="true">
                    {remplissage}
                  </div>
                )
              })}
            </div>
            <div
              className="plateau__milo"
              style={{ transform: `translate(${position.x * 100}%, ${position.y * 100}%)` }}
            >
              <Milo
                taille="100%"
                expression={
                  phase === 'succes' ? 'content' : phase === 'echec' ? 'surpris' : enExecution ? 'concentre' : 'neutre'
                }
              />
            </div>
          </div>
        </div>

        <div className="panneau">
          <div className="indicateur-optimal" role="status">
            <span>OPTIMAL BFS : {optimal ?? '—'} instructions</span>
            <span>
              BUFFER : {sequence.length}/{LIMITE_COMMANDES}
            </span>
          </div>

          <div className={`sequence${enExecution ? ' sequence--execution' : ''}`}>
            {sequence.length === 0 ? (
              <span className="sequence__vide">Buffer vide : aucune instruction.</span>
            ) : (
              sequence.map((dir, i) => (
                <span key={`${dir}-${i}`} className={`commande${currentIndex === i ? ' commande--encours' : ''}`}>
                  {currentIndex === i && (
                    <span className="commande__marque" aria-hidden="true">
                      ▶
                    </span>
                  )}
                  <IcoFleche direction={dir} taille={20} />
                  {LIBELLES[dir]}
                  <button
                    type="button"
                    className="commande__retirer"
                    onClick={() => retirer(i)}
                    disabled={enExecution}
                    aria-label={`Retirer l'instruction ${i + 1}`}
                  >
                    ×
                  </button>
                </span>
              ))
            )}
            <span className="sequence__compteur">
              {sequence.length} / {LIMITE_COMMANDES}
            </span>
          </div>

          <div className="commandes-direction" role="group" aria-label="Ajouter une instruction">
            {(['haut', 'gauche', 'droite', 'bas'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                className={`bouton-dir dir-${dir}`}
                onClick={() => ajouter(dir)}
                disabled={enExecution || pleine}
              >
                <IcoFleche direction={dir} taille={30} />
                {LIBELLES[dir]}
              </button>
            ))}
          </div>

          <div className="actions">
            <button
              type="button"
              className="bouton bouton--principal"
              onClick={lancer}
              disabled={enExecution || sequence.length === 0}
            >
              <IcoGo />
              Exécuter
            </button>
            <button type="button" className="bouton bouton--corail" onClick={stop} disabled={!enExecution}>
              <IcoStop />
              Interrompre
            </button>
            <button type="button" className="bouton bouton--secondaire" onClick={recommencerProgrammeErrone} disabled={enExecution}>
              <IcoRejouer />
              Recharger l’anomalie
            </button>
            <button type="button" className="bouton bouton--discret" onClick={vider} disabled={enExecution}>
              <IcoEffacer />
              Vider le buffer
            </button>
          </div>

          <p className={classeMessage(phase)} role="status" aria-live="polite">
            {messageDePhase(phase, echec, sequence.length, optimal, etoiles)}
          </p>

          {phase === 'succes' && etoiles !== null && (
            <div className="resultat-etoiles">
              <LigneEtoiles note={etoiles} taille={30} />
              <span>Score d’optimalité : {etoiles}/3</span>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
