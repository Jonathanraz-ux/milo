import { executerProgramme, longueurOptimale, LIMITE_COMMANDES, type Direction, type Grille } from '../engine/gridEngine'

export interface ErreurMission {
  id: string
  numero: number
  titre: string
  objectif: string
  aide: string
  grille: Grille
  /** Séquence corrompue injectée dans le buffer : elle fait échouer MILO. */
  programmeErrone: Direction[]
  /** Séquence corrigée qui mène MILO sur le nœud cible. */
  solution: Direction[]
  /** Étape à laquelle MILO se trompe (0-index, première instruction qui échoue). */
  etapeEchouee?: number
}

const TAILLE_MIN = 5
const TAILLE_MAX = 6

function grille(taille: number, partial: Omit<Grille, 'width' | 'height'>): Grille {
  return { width: taille, height: taille, ...partial }
}

export const ERREURS_MISSIONS: ErreurMission[] = [
  {
    id: 'erreur-1',
    numero: 1,
    titre: 'Pointeur hors limites',
    objectif: 'Une séquence courte mais invalide bloque MILO. Reconstruis un trajet sans collision.',
    aide: 'Le bloc mémoire corrompu occupe deux cellules verticales sur la ligne du nœud cible. La séquence injectée fonce droit dedans. Calcule un détour par le haut, puis reviens sur la ligne cible.',
    grille: grille(5, {
      depart: { x: 0, y: 4 },
      cible: { x: 4, y: 4 },
      obstacles: [
        { x: 2, y: 4 },
        { x: 2, y: 3 },
      ],
    }),
    programmeErrone: ['droite', 'droite'],
    solution: ['haut', 'haut', 'droite', 'droite', 'droite', 'droite', 'bas', 'bas'],
  },
  {
    id: 'erreur-2',
    numero: 2,
    titre: 'Mur logique',
    objectif: 'Le trajet direct est coupé par une cloison. Corrige le buffer pour atteindre le nœud est.',
    aide: 'La cloison verticale ne laisse aucune ouverture sur la ligne de départ. Il faut monter ou descendre avant de traverser, puis revenir à la ligne du nœud cible.',
    grille: grille(5, {
      depart: { x: 0, y: 2 },
      cible: { x: 4, y: 2 },
      obstacles: [
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
      ],
    }),
    programmeErrone: ['droite', 'droite'],
    solution: ['haut', 'haut', 'droite', 'droite', 'droite', 'droite', 'bas', 'bas'],
  },
  {
    id: 'erreur-3',
    numero: 3,
    titre: 'Couloir désynchronisé',
    objectif: 'Deux bandes horizontales imposent un balayage complet du plateau 6×6.',
    aide: 'La première bande se franchit à droite, la seconde à gauche. La séquence injectée monte trop tôt et percute la première bande. Reproduis un balayage en trois segments.',
    grille: grille(6, {
      depart: { x: 0, y: 5 },
      cible: { x: 5, y: 0 },
      obstacles: [
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
      ],
    }),
    programmeErrone: ['droite', 'droite', 'haut', 'haut'],
    solution: [
      'droite', 'droite', 'droite', 'droite', 'droite',
      'haut', 'haut',
      'gauche', 'gauche', 'gauche', 'gauche', 'gauche',
      'haut', 'haut',
      'droite', 'droite', 'droite', 'droite', 'droite',
      'haut',
    ],
    etapeEchouee: 2,
  },
  {
    id: 'erreur-4',
    numero: 4,
    titre: 'Dépendances circulaires',
    objectif: 'Contourner deux cloisons décalées pour resynchroniser le nœud terminal.',
    aide: 'La première cloison s’ouvre en bas, la seconde en haut. La séquence injectée coupe la première cloison. Longe les cloisons sur toute leur hauteur avant de changer de colonne.',
    grille: grille(6, {
      depart: { x: 0, y: 0 },
      cible: { x: 5, y: 5 },
      obstacles: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
      ],
    }),
    programmeErrone: ['bas', 'bas', 'droite', 'droite'],
    solution: [
      'bas', 'bas', 'bas', 'bas', 'bas',
      'droite', 'droite', 'droite',
      'haut', 'haut', 'haut', 'haut', 'haut',
      'droite', 'droite',
      'bas', 'bas', 'bas', 'bas', 'bas',
    ],
    etapeEchouee: 2,
  },
]

export function erreurParId(id: string): ErreurMission | undefined {
  return ERREURS_MISSIONS.find((m) => m.id === id)
}

export function validationErreur(mission: ErreurMission): string[] {
  const problemes: string[] = []
  const { grille: g } = mission
  if (g.width !== g.height) problemes.push(`${mission.id} : la grille doit être carrée`)
  if (g.width < TAILLE_MIN || g.width > TAILLE_MAX) {
    problemes.push(`${mission.id} : taille ${g.width} hors [${TAILLE_MIN}, ${TAILLE_MAX}]`)
  }
  if (mission.programmeErrone.length === 0) problemes.push(`${mission.id} : programme erroné vide`)
  if (mission.solution.length === 0) problemes.push(`${mission.id} : solution vide`)
  if (mission.solution.length > LIMITE_COMMANDES) problemes.push(`${mission.id} : solution trop longue`)
  if (mission.programmeErrone.length > LIMITE_COMMANDES) problemes.push(`${mission.id} : programme erroné trop long`)

  const cases = [g.depart, g.cible, ...g.obstacles]
  for (const c of cases) {
    if (c.x < 0 || c.y < 0 || c.x >= g.width || c.y >= g.height) {
      problemes.push(`${mission.id} : case hors grille`)
    }
  }
  if (g.obstacles.some((o) => (o.x === g.depart.x && o.y === g.depart.y) || (o.x === g.cible.x && o.y === g.cible.y))) {
    problemes.push(`${mission.id} : le départ ou la cible est un obstacle`)
  }

  const parcoursErrone = executerProgramme(g, mission.programmeErrone)
  if (parcoursErrone.statut === 'succes') {
    problemes.push(`${mission.id} : le programme erroné réussit déjà`)
  }

  const parcoursSolution = executerProgramme(g, mission.solution)
  if (parcoursSolution.statut !== 'succes') {
    problemes.push(`${mission.id} : la solution ne mène pas à la cible (${parcoursSolution.statut})`)
  }
  const optimal = longueurOptimale(g)
  if (optimal === null) {
    problemes.push(`${mission.id} : cible inaccessible`)
  } else if (mission.solution.length !== optimal) {
    problemes.push(`${mission.id} : solution de ${mission.solution.length} instructions, optimal ${optimal}`)
  }

  return problemes
}
