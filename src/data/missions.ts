import {
  executerProgramme,
  longueurOptimale,
  type Direction,
  type Grille,
  LIMITE_COMMANDES,
} from '../engine/gridEngine'

export interface Mission {
  id: string
  numero: number
  titre: string
  objectif: string
  aide: string
  grille: Grille
  sequenceInitiale: Direction[]
  solution: Direction[]
}

const TAILLE_MIN = 5
const TAILLE_MAX = 8

function grille(taille: number, partial: Omit<Grille, 'width' | 'height'>): Grille {
  return { width: taille, height: taille, ...partial }
}

const D = {
  haut: 'haut' as Direction,
  bas: 'bas' as Direction,
  gauche: 'gauche' as Direction,
  droite: 'droite' as Direction,
}

/** Répète une direction sans dépendre d'un utilitaire externe. */
function repetition(direction: Direction, fois: number): Direction[] {
  return Array.from({ length: fois }, () => direction)
}

/**
 * Campagne « Navigation Algorithmique ».
 *
 * Les plateaux passent progressivement de 5×5 à 8×8. Chaque solution est un
 * plus court chemin vérifié par le moteur (BFS), ce qui garantit que 3 étoiles
 * sont réellement atteignables. Les goulets, couloirs et détours obligatoires
 * sont matérialisés par des listes d'obstacles explicites.
 */
export const MISSIONS: Mission[] = [
  {
    id: 'nav-1',
    numero: 1,
    titre: 'Initialisation du noyau',
    objectif: 'Atteindre le point de synchronisation en contournant le bloc mémoire défaillant.',
    aide: 'Le bloc mémoire occupe deux cellules verticales. Le trajet direct est coupé : calcule un détour par le haut.',
    grille: grille(5, {
      depart: { x: 0, y: 4 },
      cible: { x: 4, y: 4 },
      obstacles: [
        { x: 2, y: 4 },
        { x: 2, y: 3 },
      ],
    }),
    sequenceInitiale: [],
    solution: [...repetition(D.haut, 2), ...repetition(D.droite, 4), ...repetition(D.bas, 2)],
  },
  {
    id: 'nav-2',
    numero: 2,
    titre: 'Goulet d’étranglement',
    objectif: 'Traverser le pare-feu par son unique ouverture.',
    aide: 'Le pare-feu forme un mur vertical. Une seule cellule est ouverte : trouve-la avant de programmer la traversée.',
    grille: grille(5, {
      depart: { x: 0, y: 0 },
      cible: { x: 4, y: 4 },
      obstacles: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
      ],
    }),
    sequenceInitiale: [],
    solution: [...repetition(D.bas, 2), ...repetition(D.droite, 3), ...repetition(D.bas, 2), D.droite],
  },
  {
    id: 'nav-3',
    numero: 3,
    titre: 'Couloir étroit',
    objectif: 'Rejoindre le relais supérieur en suivant les deux couloirs imposés.',
    aide: 'Les cloisons t’obligent à alterner les déplacements horizontaux et verticaux. Aucun raccourci n’existe.',
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
    sequenceInitiale: [],
    solution: [
      ...repetition(D.droite, 5),
      ...repetition(D.haut, 2),
      ...repetition(D.gauche, 5),
      ...repetition(D.haut, 2),
      ...repetition(D.droite, 5),
      D.haut,
    ],
  },
  {
    id: 'nav-4',
    numero: 4,
    titre: 'Détour obligatoire',
    objectif: 'Contourner les deux cloisons et atteindre le port de sortie.',
    aide: 'Les cloisons se croisent : la sortie du premier couloir se trouve à l’opposé de l’entrée du second. Prépare un trajet en deux temps.',
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
    sequenceInitiale: [],
    solution: [
      ...repetition(D.bas, 5),
      ...repetition(D.droite, 3),
      ...repetition(D.haut, 5),
      ...repetition(D.droite, 2),
      ...repetition(D.bas, 5),
    ],
  },
  {
    id: 'nav-5',
    numero: 5,
    titre: 'Grille d’échantillonnage',
    objectif: 'Extraire le signal au centre du maillage en traversant les trois bandes.',
    aide: 'Deux bandes horizontales bloquent le plateau. Tu dois les franchir par des colonnes opposées, puis remonter vers la cible.',
    grille: grille(7, {
      depart: { x: 0, y: 6 },
      cible: { x: 6, y: 1 },
      obstacles: [
        { x: 0, y: 4 },
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
      ],
    }),
    sequenceInitiale: [],
    solution: [
      ...repetition(D.droite, 6),
      ...repetition(D.haut, 3),
      ...repetition(D.gauche, 6),
      ...repetition(D.haut, 2),
      ...repetition(D.droite, 6),
    ],
  },
  {
    id: 'nav-6',
    numero: 6,
    titre: 'Double cloisonnement',
    objectif: 'Atteindre le nœud terminal derrière deux cloisons décalées.',
    aide: 'Chaque cloison possède une seule ouverture, placée à une extrémité différente. Le chemin le plus court impose un aller-retour vertical.',
    grille: grille(7, {
      depart: { x: 0, y: 0 },
      cible: { x: 6, y: 6 },
      obstacles: [
        { x: 2, y: 0 },
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 2, y: 4 },
        { x: 2, y: 5 },
        { x: 4, y: 1 },
        { x: 4, y: 2 },
        { x: 4, y: 3 },
        { x: 4, y: 4 },
        { x: 4, y: 5 },
        { x: 4, y: 6 },
      ],
    }),
    sequenceInitiale: [],
    solution: [
      ...repetition(D.bas, 6),
      ...repetition(D.droite, 3),
      ...repetition(D.haut, 6),
      ...repetition(D.droite, 2),
      ...repetition(D.bas, 6),
      D.droite,
    ],
  },
  {
    id: 'nav-7',
    numero: 7,
    titre: 'Labyrinthe critique',
    objectif: 'Traverser le labyrinthe 8×8 et resynchroniser le nœud d’origine.',
    aide: 'La cible est au-dessus du point de départ. Les ouvertures des deux bandes sont aux extrémités opposées : balaye le plateau de droite à gauche.',
    grille: grille(8, {
      depart: { x: 0, y: 7 },
      cible: { x: 0, y: 0 },
      obstacles: [
        { x: 0, y: 5 },
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 1, y: 2 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
        { x: 7, y: 2 },
      ],
    }),
    sequenceInitiale: [],
    solution: [...repetition(D.droite, 7), ...repetition(D.haut, 3), ...repetition(D.gauche, 7), ...repetition(D.haut, 4)],
  },
  {
    id: 'nav-8',
    numero: 8,
    titre: 'Sas de décontamination',
    objectif: 'Franchir les deux sas de sécurité et rejoindre la zone de quarantaine.',
    aide: 'Les sas sont décalés : le premier s’ouvre en bas, le second en haut. Tu devras longer les cloisons sur toute leur longueur.',
    grille: grille(8, {
      depart: { x: 0, y: 2 },
      cible: { x: 6, y: 6 },
      obstacles: [
        { x: 3, y: 0 },
        { x: 3, y: 1 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 7 },
      ],
    }),
    sequenceInitiale: [],
    solution: [
      ...repetition(D.bas, 5),
      ...repetition(D.droite, 4),
      ...repetition(D.haut, 7),
      ...repetition(D.droite, 2),
      ...repetition(D.bas, 6),
    ],
  },
  {
    id: 'nav-9',
    numero: 9,
    titre: 'Programme corrompu',
    objectif: 'Un programme incomplet a été injecté dans le buffer. Corrige-le pour atteindre le terminal est.',
    aide: 'Le programme fourni exécute un trajet valide mais s’arrête une cellule avant la cible. Compare sa fin avec la position attendue, puis remplace les dernières instructions.',
    grille: grille(8, {
      depart: { x: 0, y: 0 },
      cible: { x: 7, y: 0 },
      obstacles: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
        { x: 1, y: 3 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 1, y: 6 },
        { x: 6, y: 1 },
        { x: 6, y: 2 },
        { x: 6, y: 3 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 6, y: 7 },
      ],
    }),
    sequenceInitiale: [
      ...repetition(D.bas, 7),
      ...repetition(D.droite, 5),
      ...repetition(D.haut, 3),
      D.gauche,
      ...repetition(D.haut, 4),
      ...repetition(D.droite, 2),
    ],
    solution: [...repetition(D.bas, 7), ...repetition(D.droite, 5), ...repetition(D.haut, 7), ...repetition(D.droite, 2)],
  },
]

export function missionParId(id: string): Mission | undefined {
  return MISSIONS.find((m) => m.id === id)
}

export function validationMission(mission: Mission): string[] {
  const problemes: string[] = []
  const { grille: g } = mission

  if (g.width !== g.height) problemes.push(`${mission.id} : la grille doit être carrée`)
  if (g.width < TAILLE_MIN || g.width > TAILLE_MAX) {
    problemes.push(`${mission.id} : taille ${g.width} hors [${TAILLE_MIN}, ${TAILLE_MAX}]`)
  }
  if (mission.solution.length === 0) problemes.push(`${mission.id} : solution vide`)
  if (mission.solution.length > LIMITE_COMMANDES) {
    problemes.push(`${mission.id} : solution de ${mission.solution.length} commandes (> ${LIMITE_COMMANDES})`)
  }
  if (mission.sequenceInitiale.length > LIMITE_COMMANDES) {
    problemes.push(`${mission.id} : séquence initiale trop longue`)
  }

  const cases = [g.depart, g.cible, ...g.obstacles]
  for (const cellule of cases) {
    if (cellule.x < 0 || cellule.y < 0 || cellule.x >= g.width || cellule.y >= g.height) {
      problemes.push(`${mission.id} : une case est hors grille`)
    }
  }

  if (g.obstacles.some((o) => (o.x === g.depart.x && o.y === g.depart.y) || (o.x === g.cible.x && o.y === g.cible.y))) {
    problemes.push(`${mission.id} : le départ ou la cible est un obstacle`)
  }
  if (new Set(g.obstacles.map((o) => `${o.x},${o.y}`)).size !== g.obstacles.length) {
    problemes.push(`${mission.id} : obstacle en double`)
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

  if (mission.sequenceInitiale.length > 0) {
    const parcoursInitial = executerProgramme(g, mission.sequenceInitiale)
    if (parcoursInitial.statut === 'succes') {
      problemes.push(`${mission.id} : la séquence initiale réussit déjà la mission`)
    }
  }

  return problemes
}
