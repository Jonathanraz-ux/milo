import { IcoRetour } from '../components/Ico'

interface DocumentationProps {
  onRetour: () => void
}

export function Documentation({ onRetour }: DocumentationProps) {
  return (
    <main className="ecran">
      <div className="bandeau">
        <button type="button" className="bouton bouton--secondaire" onClick={onRetour}>
          <IcoRetour />
          Retour
        </button>
        <h1 className="bandeau__titre">
          Documentation &amp; Spécifications Techniques
          <span className="bandeau__sous">MILO Core · architecture, algorithmes et barème</span>
        </h1>
      </div>

      <section className="aide">
        <h2>1. Architecture système</h2>
        <p className="aide__texte">
          L’application est un client React/TypeScript strictement hors ligne. Aucun appel réseau n’est effectué :
          progression et préférences sont stockées dans <code>localStorage</code> sous la clé
          <code>milo.progression.v2</code>.
        </p>
        <ul>
          <li>
            <strong>src/engine</strong> — logique pure et testable (grille, BFS, k-NN), sans dépendance à React.
          </li>
          <li>
            <strong>src/data</strong> — missions, signaux, anomalies et graphes d’ordonnancement.
          </li>
          <li>
            <strong>src/ecrans</strong> — interfaces de jeu et de sélection.
          </li>
          <li>
            <strong>src/progression</strong> — persistance des missions terminées et des notes d’optimalité.
          </li>
        </ul>
      </section>

      <section className="aide">
        <h2>2. Navigation Algorithmique — moteur de grille</h2>
        <p className="aide__texte">
          Les plateaux vont de 5×5 à 8×8. Chaque mission est validée par un parcours en largeur (BFS) déterministe :
          l’ordre d’exploration est figé à <code>haut, droite, bas, gauche</code>. Le BFS sert de source unique de
          vérité pour la longueur optimale et le calcul des étoiles.
        </p>
        <ul>
          <li>Départ, cible et blocs mémoire sont des coordonnées entières.</li>
          <li>Une collision ou un débordement interrompt immédiatement la séquence.</li>
          <li>Le buffer de commandes est plafonné à 24 instructions.</li>
        </ul>
      </section>

      <section className="aide">
        <h2>3. Barème d’optimalité</h2>
        <p className="aide__texte">
          La note dépend du nombre d’instructions réellement exécutées et de la longueur optimale calculée par BFS.
        </p>
        <ul>
          <li>⭐⭐⭐ — nombre d’instructions inférieur ou égal à l’optimal.</li>
          <li>⭐⭐ — dépassement borné par <code>max(2, ceil(optimal × 0,2))</code>.</li>
          <li>⭐ — séquence valide mais nettement plus longue que l’optimal.</li>
          <li>0 — cible non atteinte ; aucune progression n’est enregistrée.</li>
        </ul>
        <p className="aide__texte">
          La meilleure note obtenue est conservée : rejouer une mission ne peut jamais faire baisser le score.
        </p>
      </section>

      <section className="aide">
        <h2>4. Machine Learning Lab — k-NN supervisé</h2>
        <p className="aide__texte">
          Le classificateur reçoit uniquement des exemples étiquetés et les deux caractéristiques de la cible
          (<strong>amplitude</strong> et <strong>cohérence</strong>, normalisées entre 0 et 1). Il n’a jamais accès à la
          classe réelle de la cible avant le verdict.
        </p>
        <ul>
          <li>Distance euclidienne dans le plan (amplitude, cohérence).</li>
          <li>Tri déterministe par distance croissante puis ordre d’entrée.</li>
          <li>Vote majoritaire sur les k voisins ; égalité tranchée par le voisin le plus proche.</li>
          <li>Règle visible du jeu de données : SIGNAL si amplitude ≥ 0,55 ET cohérence ≥ 0,55, sinon BRUIT.</li>
        </ul>
        <p className="aide__texte">
          Le défi 4 illustre un faux positif : avec k = 1, un outlier (dérive thermique) impose sa classe. Passer à
          k = 3 et injecter un exemple cohérent rétablit la majorité.
        </p>
      </section>

      <section className="aide">
        <h2>5. Debug Lab — analyse d’anomalies</h2>
        <p className="aide__texte">
          Chaque mission injecte une séquence corrompue dans le buffer. L’élève doit localiser l’instruction fautive,
          reconstruire un parcours valide et minimiser le nombre d’instructions. Le même moteur BFS et le même barème
          que la navigation sont réutilisés.
        </p>
      </section>

      <section className="aide">
        <h2>6. Ordonnancement &amp; dépendances critiques</h2>
        <p className="aide__texte">
          Les missions de leadership sont des graphes de dépendances : chaque action possède des prérequis et un effet.
          Un plan valide est une séquence topologique complète des actions obligatoires. Les actions leurres sont
          détectables mais ne doivent pas être exécutées.
        </p>
      </section>

      <section className="aide">
        <h2>7. Contraintes d’exécution</h2>
        <ul>
          <li>100 % hors ligne, sans dépendance lourde supplémentaire.</li>
          <li>Interfaces accessibles : cibles tactiles ≥ 48 px, focus visible, libellés ARIA.</li>
          <li>Animations réductibles depuis chaque écran de jeu.</li>
          <li>Suite de tests Vitest : moteur, données, progression et scénarios de classification.</li>
        </ul>
      </section>
    </main>
  )
}
