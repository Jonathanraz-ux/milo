export type Direction = 'haut' | 'bas' | 'gauche' | 'droite'

export interface Cell {
  x: number
  y: number
}

export interface Grille {
  width: number
  height: number
  depart: Cell
  cible: Cell
  obstacles: Cell[]
}

export type EtapeResultat =
  | { ok: true; from: Cell; to: Cell }
  | { ok: false; from: Cell; to: Cell; raison: 'hors-grille' | 'obstacle' }

export type ParcoursStatut = 'succes' | 'hors-grille' | 'obstacle' | 'non-atteint' | 'programme-vide'

export interface Parcours {
  statut: ParcoursStatut
  positions: Cell[]
  etapeEchouee: number | null
}

/** Note finale d'une mission. 0 = non validée. */
export type Etoiles = 1 | 2 | 3

/** Limite du buffer de commandes pour les missions de navigation. */
export const LIMITE_COMMANDES = 24

const DELTAS: Record<Direction, Cell> = {
  haut: { x: 0, y: -1 },
  bas: { x: 0, y: 1 },
  gauche: { x: -1, y: 0 },
  droite: { x: 1, y: 0 },
}

/**
 * Ordre d'exploration du BFS. Il est figé pour que la longueur optimale et le
 * chemin retourné restent strictement déterministes d'une exécution à l'autre.
 */
const ORDRE_BFS: readonly Direction[] = ['haut', 'droite', 'bas', 'gauche']

export function caseAdjacente(from: Cell, direction: Direction): Cell {
  const d = DELTAS[direction]
  return { x: from.x + d.x, y: from.y + d.y }
}

export function memeCase(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y
}

export function dansGrille(grille: Grille, cell: Cell): boolean {
  return cell.x >= 0 && cell.y >= 0 && cell.x < grille.width && cell.y < grille.height
}

export function estObstacle(grille: Grille, cell: Cell): boolean {
  return grille.obstacles.some((o) => memeCase(o, cell))
}

export function executerEtape(grille: Grille, from: Cell, direction: Direction): EtapeResultat {
  const to = caseAdjacente(from, direction)
  if (!dansGrille(grille, to)) return { ok: false, from, to, raison: 'hors-grille' }
  if (estObstacle(grille, to)) return { ok: false, from, to, raison: 'obstacle' }
  return { ok: true, from, to }
}

export function executerProgramme(grille: Grille, program: Direction[]): Parcours {
  const positions: Cell[] = [{ ...grille.depart }]
  if (program.length === 0) {
    return { statut: 'programme-vide', positions, etapeEchouee: null }
  }

  let courant: Cell = { ...grille.depart }
  for (let i = 0; i < program.length; i++) {
    const etape = executerEtape(grille, courant, program[i])
    if (!etape.ok) {
      return { statut: etape.raison, positions, etapeEchouee: i }
    }
    courant = etape.to
    positions.push({ ...courant })
  }

  const statut: ParcoursStatut = memeCase(courant, grille.cible) ? 'succes' : 'non-atteint'
  return { statut, positions, etapeEchouee: null }
}

function cle(cell: Cell): string {
  return `${cell.x},${cell.y}`
}

/**
 * Calcule un plus court chemin (BFS) entre le départ et la cible, en évitant
 * les obstacles. Retourne `null` si la cible est inaccessible.
 *
 * Le BFS est volontairement implémenté ici plutôt que dans l'UI : les étoiles
 * et les validations de données reposent sur la même source de vérité.
 */
export function cheminOptimal(grille: Grille): Direction[] | null {
  if (!dansGrille(grille, grille.depart) || !dansGrille(grille, grille.cible)) return null
  if (estObstacle(grille, grille.depart) || estObstacle(grille, grille.cible)) return null
  if (memeCase(grille.depart, grille.cible)) return []

  const depart = cle(grille.depart)
  const arrivee = cle(grille.cible)
  const file: Cell[] = [{ ...grille.depart }]
  const vus = new Set<string>([depart])
  const parents = new Map<string, { precedent: string; direction: Direction }>()

  for (let index = 0; index < file.length; index++) {
    const courant = file[index]
    for (const direction of ORDRE_BFS) {
      const etape = executerEtape(grille, courant, direction)
      if (!etape.ok) continue
      const suivant = cle(etape.to)
      if (vus.has(suivant)) continue
      vus.add(suivant)
      parents.set(suivant, { precedent: cle(courant), direction })
      if (suivant === arrivee) {
        const chemin: Direction[] = []
        let noeud = arrivee
        while (noeud !== depart) {
          const parent = parents.get(noeud)
          if (!parent) return null
          chemin.push(parent.direction)
          noeud = parent.precedent
        }
        return chemin.reverse()
      }
      file.push({ ...etape.to })
    }
  }

  return null
}

export function longueurOptimale(grille: Grille): number | null {
  return cheminOptimal(grille)?.length ?? null
}

/**
 * Convertit un nombre d'instructions en note, uniquement si la mission est
 * validée. La marge pour 2 étoiles grandit avec la longueur du parcours afin
 * de rester lisible sur les grands plateaux (8×8).
 */
export function etoilesPourLongueur(grille: Grille, nbCommandes: number): Etoiles {
  const optimal = longueurOptimale(grille)
  if (optimal === null) return 1
  if (nbCommandes <= optimal) return 3
  const marge = Math.max(2, Math.ceil(optimal * 0.2))
  if (nbCommandes <= optimal + marge) return 2
  return 1
}

/** Évalue un programme complet : 0 si la cible n'est pas atteinte. */
export function evaluerEtoiles(grille: Grille, program: Direction[]): Etoiles | 0 {
  const parcours = executerProgramme(grille, program)
  if (parcours.statut !== 'succes') return 0
  return etoilesPourLongueur(grille, program.length)
}
