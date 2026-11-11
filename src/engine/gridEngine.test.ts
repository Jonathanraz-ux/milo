import { describe, expect, it } from 'vitest'
import {
  caseAdjacente,
  cheminOptimal,
  dansGrille,
  estObstacle,
  etoilesPourLongueur,
  evaluerEtoiles,
  executerEtape,
  executerProgramme,
  longueurOptimale,
  memeCase,
  LIMITE_COMMANDES,
  type Grille,
} from './gridEngine'

const grilleTest: Grille = {
  width: 4,
  height: 4,
  depart: { x: 0, y: 0 },
  cible: { x: 3, y: 3 },
  obstacles: [{ x: 1, y: 1 }],
}

describe('caseAdjacente', () => {
  it('respecte les directions de l’écran', () => {
    const depart = { x: 2, y: 2 }
    expect(caseAdjacente(depart, 'haut')).toEqual({ x: 2, y: 1 })
    expect(caseAdjacente(depart, 'bas')).toEqual({ x: 2, y: 3 })
    expect(caseAdjacente(depart, 'gauche')).toEqual({ x: 1, y: 2 })
    expect(caseAdjacente(depart, 'droite')).toEqual({ x: 3, y: 2 })
  })
})

describe('dansGrille / estObstacle', () => {
  it('détecte les sorties de grille', () => {
    expect(dansGrille(grilleTest, { x: -1, y: 0 })).toBe(false)
    expect(dansGrille(grilleTest, { x: 4, y: 0 })).toBe(false)
    expect(dansGrille(grilleTest, { x: 0, y: -1 })).toBe(false)
    expect(dansGrille(grilleTest, { x: 0, y: 4 })).toBe(false)
    expect(dansGrille(grilleTest, { x: 3, y: 3 })).toBe(true)
  })

  it('reconnaît les obstacles', () => {
    expect(estObstacle(grilleTest, { x: 1, y: 1 })).toBe(true)
    expect(estObstacle(grilleTest, { x: 2, y: 1 })).toBe(false)
  })
})

describe('executerEtape', () => {
  it('autorise un déplacement libre', () => {
    const r = executerEtape(grilleTest, { x: 2, y: 2 }, 'gauche')
    expect(r).toEqual({ ok: true, from: { x: 2, y: 2 }, to: { x: 1, y: 2 } })
  })

  it('refuse la sortie de grille sans déplacer Milo', () => {
    const r = executerEtape(grilleTest, { x: 0, y: 2 }, 'gauche')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.raison).toBe('hors-grille')
    if (!r.ok) expect(r.to).toEqual({ x: -1, y: 2 })
  })

  it('refuse un obstacle sans déplacer Milo', () => {
    const r = executerEtape(grilleTest, { x: 0, y: 1 }, 'droite')
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.raison).toBe('obstacle')
    if (!r.ok) expect(r.from).toEqual({ x: 0, y: 1 })
  })
})

describe('executerProgramme', () => {
  it('remplit positions avec le départ puis chaque arrivée valide', () => {
    const p = executerProgramme(grilleTest, ['droite', 'bas'])
    expect(p.positions).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ])
    expect(p.statut).toBe('obstacle')
    expect(p.etapeEchouee).toBe(1)
  })

  it('réussit quand Milo finit sur la cible', () => {
    const p = executerProgramme(grilleTest, ['droite', 'droite', 'droite', 'bas', 'bas', 'bas'])
    expect(p.statut).toBe('succes')
    expect(memeCase(p.positions.at(-1)!, grilleTest.cible)).toBe(true)
    expect(p.etapeEchouee).toBeNull()
  })

  it('échoue si Milo passe sur la cible puis repart', () => {
    const grille: Grille = {
      width: 3,
      height: 1,
      depart: { x: 0, y: 0 },
      cible: { x: 1, y: 0 },
      obstacles: [],
    }
    const p = executerProgramme(grille, ['droite', 'droite'])
    expect(p.positions.at(-1)).toEqual({ x: 2, y: 0 })
    expect(p.statut).toBe('non-atteint')
  })

  it('échoue quand le programme est vide', () => {
    const p = executerProgramme(grilleTest, [])
    expect(p.statut).toBe('programme-vide')
    expect(p.positions).toHaveLength(1)
    expect(p.etapeEchouee).toBeNull()
  })

  it('ne réussit jamais avec un programme vide, même si le départ est la cible', () => {
    const grille: Grille = {
      width: 2,
      height: 2,
      depart: { x: 1, y: 1 },
      cible: { x: 1, y: 1 },
      obstacles: [],
    }
    expect(executerProgramme(grille, []).statut).toBe('programme-vide')
  })

  it('s’arrête au premier déplacement invalide et n’exécute pas la suite', () => {
    const p = executerProgramme(grilleTest, ['gauche', 'droite', 'droite', 'bas'])
    expect(p.statut).toBe('hors-grille')
    expect(p.etapeEchouee).toBe(0)
    expect(p.positions).toEqual([{ x: 0, y: 0 }])
  })

  it('détecte une sortie de grille au milieu du parcours', () => {
    const grille: Grille = {
      width: 2,
      height: 2,
      depart: { x: 0, y: 0 },
      cible: { x: 1, y: 1 },
      obstacles: [],
    }
    const p = executerProgramme(grille, ['droite', 'haut'])
    expect(p.statut).toBe('hors-grille')
    expect(p.etapeEchouee).toBe(1)
    expect(p.positions).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ])
  })

  it('est déterministe : deux exécutions identiques donnent le même résultat', () => {
    const a = executerProgramme(grilleTest, ['droite', 'bas', 'bas', 'droite'])
    const b = executerProgramme(grilleTest, ['droite', 'bas', 'bas', 'droite'])
    expect(a).toEqual(b)
  })
})

describe('cheminOptimal (BFS)', () => {
  it('retourne le plus court chemin et évite les obstacles', () => {
    const chemin = cheminOptimal(grilleTest)
    expect(chemin).not.toBeNull()
    expect(chemin).toHaveLength(6)
    expect(executerProgramme(grilleTest, chemin!).statut).toBe('succes')
  })

  it('explore dans l’ordre figé haut, droite, bas, gauche', () => {
    const grille: Grille = {
      width: 3,
      height: 3,
      depart: { x: 0, y: 0 },
      cible: { x: 2, y: 0 },
      obstacles: [],
    }
    expect(cheminOptimal(grille)).toEqual(['droite', 'droite'])
  })

  it('retourne null si la cible est inaccessible', () => {
    const grille: Grille = {
      width: 3,
      height: 3,
      depart: { x: 0, y: 0 },
      cible: { x: 2, y: 2 },
      obstacles: [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 1, y: 2 },
      ],
    }
    expect(cheminOptimal(grille)).toBeNull()
    expect(longueurOptimale(grille)).toBeNull()
  })

  it('retourne un chemin vide si départ et cible coïncident', () => {
    const grille: Grille = {
      width: 2,
      height: 2,
      depart: { x: 1, y: 1 },
      cible: { x: 1, y: 1 },
      obstacles: [],
    }
    expect(cheminOptimal(grille)).toEqual([])
    expect(longueurOptimale(grille)).toBe(0)
  })
})

describe('barème d’optimalité', () => {
  it('donne trois étoiles au plus court chemin', () => {
    expect(etoilesPourLongueur(grilleTest, 6)).toBe(3)
  })

  it('donne deux étoiles dans la marge max(2, ceil(optimal × 0,2))', () => {
    expect(etoilesPourLongueur(grilleTest, 7)).toBe(2)
    expect(etoilesPourLongueur(grilleTest, 8)).toBe(2)
  })

  it('retombe à une étoile au-delà de la marge', () => {
    expect(etoilesPourLongueur(grilleTest, 9)).toBe(1)
  })

  it('ne note jamais un programme qui n’atteint pas la cible', () => {
    expect(evaluerEtoiles(grilleTest, ['droite', 'droite'])).toBe(0)
    expect(evaluerEtoiles(grilleTest, [])).toBe(0)
  })

  it('note un programme valide', () => {
    expect(evaluerEtoiles(grilleTest, ['droite', 'droite', 'droite', 'bas', 'bas', 'bas'])).toBe(3)
  })

  it('expose une limite de buffer de 24 instructions', () => {
    expect(LIMITE_COMMANDES).toBe(24)
  })
})
