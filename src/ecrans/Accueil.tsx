import { Milo } from '../components/Milo'
import { IcoEtoile } from '../components/Ico'
import type { Progression } from '../progression/progression'

interface AccueilProps {
  progression: Progression
  onCommencer: () => void
  onEntrainer: () => void
  onTrompe: () => void
  onDiriger: () => void
  onDocumentation: () => void
  onContinuer: () => void
}

export function Accueil({
  progression,
  onCommencer,
  onEntrainer,
  onTrompe,
  onDiriger,
  onDocumentation,
  onContinuer,
}: AccueilProps) {
  const aProgression = progression.terminees.length > 0 || progression.derniereMissionId !== null
  const totalEtoiles = Object.values(progression.etoiles).reduce((total, note) => total + note, 0)

  return (
    <main className="ecran accueil">
      <h1 className="accueil__titre">MILO Core // Système d’Exploration &amp; IA</h1>
      <p className="accueil__phrase">
        Plateforme d’apprentissage algorithmique : navigation BFS, classification k-NN et analyse d’anomalies.
      </p>
      <div className="accueil__milo">
        <Milo taille={140} expression="content" />
      </div>

      {aProgression && (
        <p className="accueil__score">
          <IcoEtoile taille={20} /> Score global : {totalEtoiles} étoile{totalEtoiles > 1 ? 's' : ''} ·{' '}
          {progression.terminees.length} module{progression.terminees.length > 1 ? 's' : ''} validé
          {progression.terminees.length > 1 ? 's' : ''}
        </p>
      )}

      <div className="lieux">
        <button type="button" className="lieu" onClick={onCommencer}>
          <IcoEtoile taille={40} />
          Navigation Algorithmique
          <span className="lieu__desc">BFS, chemins optimaux et grilles dynamiques 5×5 → 8×8.</span>
        </button>

        <button type="button" className="lieu" onClick={onEntrainer}>
          <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="5" width="18" height="14" rx="3" fill="#0b1a26" stroke="#00e5ff" strokeWidth="1.8" />
            <path d="M5 14 L8 10 L11 15 L14 8 L17 13 L19 11" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18" cy="8" r="1.6" fill="#ff5353" />
          </svg>
          Machine Learning Lab (k-NN)
          <span className="lieu__desc">Classification supervisée, densité d’échantillons et faux positifs.</span>
        </button>

        <button type="button" className="lieu" onClick={onTrompe}>
          <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="4" width="18" height="16" rx="2" fill="#1a0e12" stroke="#ff5353" strokeWidth="1.8" />
            <path d="M7 9 L10 12 L7 15" fill="none" stroke="#ff5353" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 15 L17 15" fill="none" stroke="#ff5353" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Debug Lab (Analyse d’Anomalies)
          <span className="lieu__desc">Localise les instructions corrompues et reconstruis le buffer.</span>
        </button>

        <button type="button" className="lieu" onClick={onDiriger}>
          <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" fill="#0a1a14" stroke="#00e676" strokeWidth="1.8" />
            <path d="M12 7v5l3 3" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="1.2" fill="#00e676" />
          </svg>
          Ordonnancement &amp; Dépendances Critiques
          <span className="lieu__desc">Graphes de dépendances, chemin critique et bascule sans interruption.</span>
        </button>

        <button type="button" className="lieu" onClick={onDocumentation}>
          <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 3 h9 l4 4 v14 H6 Z" fill="#101d2d" stroke="#8fa0b3" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M15 3 v5 h5 M9 12 h7 M9 16 h7" fill="none" stroke="#8fa0b3" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          Documentation &amp; Spécifications Techniques
          <span className="lieu__desc">Architecture, moteur BFS, barème d’optimalité et contraintes.</span>
        </button>
      </div>

      {aProgression && (
        <button type="button" className="bouton bouton--principal bouton--grand" onClick={onContinuer}>
          Reprendre la progression
        </button>
      )}
    </main>
  )
}
