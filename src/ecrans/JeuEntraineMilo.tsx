import { useCallback, useEffect, useRef, useState } from 'react'
import { classifier, type Prediction } from '../engine/knn'
import {
  K_OPTIONS,
  LIBELLES_CATEGORIES,
  caracteristiques,
  signalDefi,
  signalParId,
  versExemples,
  type CategorieSignal,
  type Defi,
} from '../data/entrainement'
import { SignalDessin } from '../components/Signaux'
import { NuageSignaux } from '../components/NuageSignaux'
import { Milo } from '../components/Milo'
import { IcoAide, IcoCoche, IcoEtoile, IcoGo, IcoRejouer, IcoRetour, IcoSon } from '../components/Ico'
import { utiliserVoix } from '../audio/tts'
import { jouerBip } from '../audio/bips'

interface JeuEntraineMiloProps {
  defi: Defi
  sonActif: boolean
  animationsReduites: boolean
  onToggleSon: () => void
  onToggleAnimations: () => void
  onRetour: () => void
  onReussite: (defiId: string) => void
}

type Phase = 'selection' | 'reflexion' | 'verdict'

const DELAI_REFLEXION = 900

function libelle(categorie: string): string {
  return LIBELLES_CATEGORIES[categorie as CategorieSignal] ?? categorie.toUpperCase()
}

function classeMessage(phase: Phase, juste: boolean): string {
  if (phase === 'verdict') return juste ? 'message message--succes' : 'message message--echec'
  return 'message message--attente'
}

function messageDePhase(
  phase: Phase,
  juste: boolean,
  prediction: Prediction | null,
  codeCible: string,
  categorieVraie: string,
  k: number,
): string {
  switch (phase) {
    case 'selection':
      return `[SYSTÈME] Échantillon étiqueté prêt · k = ${k}. Sélectionne une cible puis lance la classification.`
    case 'reflexion':
      return '[k-NN] Calcul des distances euclidiennes dans l’espace (amplitude, cohérence)…'
    case 'verdict':
      if (juste) {
        return `[VALIDÉ] Classe prédite « ${prediction ? libelle(prediction.categorie) : '—'} » conforme à la vérité terrain « ${categorieVraie} ».`
      }
      return `[ANOMALIE] Classe prédite « ${prediction ? libelle(prediction.categorie) : '—'} » ≠ vérité terrain « ${categorieVraie} ». Ajuste k ou injecte un exemple proche de ${codeCible}.`
  }
}

export function JeuEntraineMilo({
  defi,
  sonActif,
  animationsReduites,
  onToggleSon,
  onToggleAnimations,
  onRetour,
  onReussite,
}: JeuEntraineMiloProps) {
  const [exemplesChoisis, setExemplesChoisis] = useState<string[]>(defi.exemplesInitiaux)
  const [phase, setPhase] = useState<Phase>('selection')
  const [testIndex, setTestIndex] = useState(0)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [k, setK] = useState(defi.kRecommande)
  const [aideOuverte, setAideOuverte] = useState(false)

  const timersRef = useRef<number[]>([])
  const tokenRef = useRef(0)

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
      tokenRef.current += 1
    }
  }, [clearTimers])

  const bip = useCallback(
    (nom: Parameters<typeof jouerBip>[0]) => {
      if (sonActif) jouerBip(nom)
    },
    [sonActif],
  )

  const signalTest = signalDefi(defi, defi.tests[testIndex])
  const dernierTest = testIndex === defi.tests.length - 1
  const categorieVraie = LIBELLES_CATEGORIES[signalTest.categorie]
  const juste = prediction !== null && prediction.categorie === signalTest.categorie
  const exemplesSignaux = exemplesChoisis.map((id) => signalParId(id))
  const enReflexion = phase === 'reflexion'

  const basculerExemple = useCallback(
    (id: string) => {
      if (phase !== 'selection') return
      const dejaLa = exemplesChoisis.includes(id)
      setExemplesChoisis(dejaLa ? exemplesChoisis.filter((x) => x !== id) : [...exemplesChoisis, id])
      setPrediction(null)
      bip(dejaLa ? 'clic' : 'ajout')
    },
    [bip, exemplesChoisis, phase],
  )

  const choisirK = useCallback(
    (option: number) => {
      if (phase === 'reflexion') return
      setK(option)
      setPrediction(null)
      setPhase('selection')
      bip('clic')
    },
    [bip, phase],
  )

  const demander = useCallback(() => {
    if (phase !== 'selection' || exemplesChoisis.length === 0) return
    clearTimers()
    const token = ++tokenRef.current
    const resultat = classifier(versExemples(exemplesChoisis), {
      id: signalTest.id,
      caracteristiques: caracteristiques(signalTest),
    }, k)
    setPrediction(resultat)
    setPhase('reflexion')
    bip('go')

    const t = window.setTimeout(() => {
      if (token !== tokenRef.current) return
      setPhase('verdict')
      bip(resultat?.categorie === signalTest.categorie ? 'succes' : 'erreur-douce')
    }, DELAI_REFLEXION)
    timersRef.current.push(t)
  }, [bip, clearTimers, exemplesChoisis, k, phase, signalTest])

  const revoirExemples = useCallback(() => {
    clearTimers()
    tokenRef.current += 1
    setPrediction(null)
    setPhase('selection')
    bip('clic')
  }, [bip, clearTimers])

  const cibleSuivante = useCallback(() => {
    clearTimers()
    tokenRef.current += 1
    setPrediction(null)
    setTestIndex((i) => i + 1)
    setPhase('selection')
    bip('clic')
  }, [bip, clearTimers])

  const recommencer = useCallback(() => {
    clearTimers()
    tokenRef.current += 1
    setExemplesChoisis(defi.exemplesInitiaux)
    setTestIndex(0)
    setPrediction(null)
    setK(defi.kRecommande)
    setPhase('selection')
    bip('clic')
  }, [bip, clearTimers, defi])

  useEffect(() => {
    if (sonActif && phase === 'verdict' && prediction) {
      utiliserVoix(
        juste
          ? `Classification conforme. Classe ${libelle(prediction.categorie)}.`
          : `Anomalie détectée. Classe prédite ${libelle(prediction.categorie)}, vérité terrain ${categorieVraie}.`,
      )
    }
  }, [phase, juste, prediction, categorieVraie, sonActif])

  let logSysteme = `[ÉCHANTILLON] ${exemplesChoisis.length} exemples étiquetés · k = ${k}. En attente d’une cible.`
  if (phase === 'reflexion') {
    logSysteme = `[k-NN] ${exemplesChoisis.length} distances calculées · recherche des ${Math.min(k, exemplesChoisis.length)} voisins les plus proches…`
  } else if (phase === 'verdict' && prediction) {
    const voix = prediction.voisins.filter((v) => v.exemple.categorie === prediction.categorie).length
    logSysteme = `[k-NN] k effectif = ${prediction.k} · vote ${voix}/${prediction.k} · voisin le plus proche ${signalParId(prediction.voisin.id).code} (d = ${prediction.distance.toFixed(3)}).`
  }

  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Défi {defi.numero} · {defi.titre}
          <span className="bandeau__sous">Machine Learning Lab · k-NN supervisé</span>
        </h1>
        <button
          type="button"
          className="bouton bouton--secondaire"
          onClick={() => setAideOuverte((v) => !v)}
          aria-expanded={aideOuverte}
        >
          <IcoAide />
          Protocole
        </button>
        <button type="button" className="bouton bouton--secondaire" onClick={onToggleSon} aria-pressed={sonActif}>
          <IcoSon actif={sonActif} />
          {sonActif ? 'Audio actif' : 'Audio coupé'}
        </button>
      </div>

      {aideOuverte && (
        <section className="aide" aria-label="Protocole d’entraînement">
          <p className="aide__texte">{defi.aide}</p>
          <ul className="legende">
            <li>
              <span className="panier panier--signal">SIGNAL</span> Amplitude ≥ 0,55 ET cohérence ≥ 0,55.
            </li>
            <li>
              <span className="panier panier--bruit">BRUIT</span> Au moins une des deux caractéristiques sous le seuil.
            </li>
            <li>
              <strong>k</strong> = nombre de voisins consultés. k = 1 suit un seul exemple ; k = 3 ou 5 applique un vote
              majoritaire.
            </li>
          </ul>
          <button type="button" className="bouton bouton--secondaire" onClick={onToggleAnimations}>
            Animations : {animationsReduites ? 'réduites' : 'normales'}
          </button>
        </section>
      )}

      <p className="objectif">
        <IcoEtoile taille={26} /> {defi.objectif}
      </p>

      <div className="entrainement">
        <section aria-label="Jeu d’apprentissage étiqueté">
          <h2 className="zone-titre">
            Jeu d’apprentissage étiqueté
            <span className="zone-titre__compteur">
              {exemplesChoisis.length} / {defi.exemples.length} injectés
            </span>
          </h2>
          <ul className="etagere">
            {defi.exemples.map((id) => {
              const signal = signalDefi(defi, id)
              const choisi = exemplesChoisis.includes(id)
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`fiche${choisi ? ' fiche--choisie' : ''}`}
                    onClick={() => basculerExemple(id)}
                    disabled={phase !== 'selection'}
                    aria-pressed={choisi}
                    aria-label={`${choisi ? 'Retirer' : 'Injecter'} ${signal.nom} (${LIBELLES_CATEGORIES[signal.categorie]})`}
                  >
                    <span className="fiche__dessin">
                      <SignalDessin
                        forme={signal.forme}
                        amplitude={signal.amplitude}
                        coherence={signal.coherence}
                        categorie={signal.categorie}
                        tailleMax={104}
                      />
                    </span>
                    <span className="fiche__code">{signal.code}</span>
                    <span className="fiche__nom">{signal.nom}</span>
                    <span className={`panier panier--${signal.categorie}`}>{LIBELLES_CATEGORIES[signal.categorie]}</span>
                    <span className="fiche__mesures">
                      A {signal.amplitude.toFixed(2)} · C {signal.coherence.toFixed(2)}
                    </span>
                    {choisi && (
                      <span className="fiche__etat">
                        <IcoCoche taille={16} /> Injecté
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panneau-entrainement" aria-label="Classification de la cible">
          <div className="selecteur-k" role="group" aria-label="Nombre de voisins k">
            <span className="selecteur-k__label">Voisins k</span>
            {K_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`k-bouton${k === option ? ' k-bouton--actif' : ''}`}
                onClick={() => choisirK(option)}
                disabled={enReflexion}
                aria-pressed={k === option}
              >
                {option}
              </button>
            ))}
            {k === defi.kRecommande && <span className="selecteur-k__conseil">recommandé</span>}
          </div>

          <div className="zone-test">
            <div className="zone-test__entete">
              <h2 className="zone-titre">Cible à classifier</h2>
              <span className="zone-titre__compteur">
                Cible {testIndex + 1} / {defi.tests.length}
              </span>
            </div>

            <div className="zone-test__fiche">
              <SignalDessin
                forme={signalTest.forme}
                amplitude={signalTest.amplitude}
                coherence={signalTest.coherence}
                categorie={signalTest.categorie}
                tailleMax={150}
              />
              <span className="zone-test__labels">
                <span className="fiche__code">{signalTest.code}</span>
                <span className="fiche__nom">{signalTest.nom}</span>
                <span className="fiche__mesures">
                  A {signalTest.amplitude.toFixed(2)} · C {signalTest.coherence.toFixed(2)}
                </span>
                {phase === 'verdict' ? (
                  <span className={`panier panier--${signalTest.categorie}`}>{categorieVraie}</span>
                ) : (
                  <span className="panier panier--inconnu">CLASSE ?</span>
                )}
              </span>
            </div>

            <p className={`milo-parle${enReflexion ? ' milo-parle--concentre' : ''}`}>
              <Milo
                taille={64}
                expression={
                  phase === 'reflexion' ? 'concentre' : phase === 'verdict' ? (juste ? 'content' : 'surpris') : 'neutre'
                }
              />
              <span className="milo-parle__bulle log" aria-live="polite">
                {logSysteme}
              </span>
            </p>

            <NuageSignaux
              exemples={exemplesSignaux}
              cible={signalTest}
              voisins={prediction?.voisins.map((v) => v.exemple.id)}
            />

            <div className="exemples-monstres" aria-label="Exemples injectés">
              {exemplesChoisis.length === 0 ? (
                <span className="exemples-monstres__vide">Aucun exemple injecté.</span>
              ) : (
                exemplesChoisis.map((id) => {
                  const signal = signalParId(id)
                  return (
                    <span key={id} className="vignette">
                      {signal.code}
                      <span className={`panier panier--${signal.categorie}`}>
                        {LIBELLES_CATEGORIES[signal.categorie]}
                      </span>
                    </span>
                  )
                })
              )}
            </div>

            {phase === 'verdict' && prediction && (
              <div className="voisins">
                <p className="voisins__titre">Voisins retenus · k = {prediction.k}</p>
                <ol className="voisins__liste">
                  {prediction.voisins.map((voisin, index) => {
                    const signal = signalParId(voisin.exemple.id)
                    return (
                      <li key={voisin.exemple.id} className="voisins__item">
                        <span className="voisins__rang">{index + 1}</span>
                        <span className="voisins__code">{signal.code}</span>
                        <span className="voisins__nom">{signal.nom}</span>
                        <span className={`panier panier--${signal.categorie}`}>
                          {LIBELLES_CATEGORIES[signal.categorie]}
                        </span>
                        <span className="voisins__distance">d = {voisin.distance.toFixed(3)}</span>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}

            <p className={classeMessage(phase, juste)} role="status" aria-live="polite">
              {messageDePhase(phase, juste, prediction, signalTest.code, categorieVraie, k)}
            </p>

            <div className="actions">
              {phase !== 'verdict' && (
                <button
                  type="button"
                  className="bouton bouton--principal"
                  onClick={demander}
                  disabled={enReflexion || exemplesChoisis.length === 0}
                >
                  <IcoGo />
                  Exécuter la classification
                </button>
              )}

              {phase === 'verdict' && !juste && (
                <button type="button" className="bouton bouton--principal" onClick={revoirExemples}>
                  <IcoGo />
                  Injecter un exemple
                </button>
              )}

              {phase === 'verdict' && juste && dernierTest && (
                <button type="button" className="bouton bouton--principal" onClick={() => onReussite(defi.id)}>
                  <IcoCoche />
                  Valider le module
                </button>
              )}

              {phase === 'verdict' && juste && !dernierTest && (
                <button type="button" className="bouton bouton--principal" onClick={cibleSuivante}>
                  <IcoGo />
                  Cible suivante
                </button>
              )}

              {phase === 'verdict' && !juste && (
                <button type="button" className="bouton bouton--discret" onClick={recommencer}>
                  <IcoRejouer />
                  Réinitialiser
                </button>
              )}

              {phase !== 'verdict' && (
                <button type="button" className="bouton bouton--discret" onClick={recommencer} disabled={enReflexion}>
                  <IcoRejouer />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
