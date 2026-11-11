import { describe, expect, it } from 'vitest'
import { executerProgramme, longueurOptimale } from '../engine/gridEngine'
import { ERREURS_MISSIONS, erreurParId, validationErreur } from './erreurs'

describe('données du Debug Lab', () => {
  it('contient quatre anomalies numérotées de 1 à 4', () => {
    expect(ERREURS_MISSIONS).toHaveLength(4)
    expect(ERREURS_MISSIONS.map((m) => m.numero)).toEqual([1, 2, 3, 4])
    expect(new Set(ERREURS_MISSIONS.map((m) => m.id)).size).toBe(4)
  })

  it('chaque mission est valide', () => {
    expect(ERREURS_MISSIONS.flatMap(validationErreur)).toEqual([])
  })

  it('les plateaux restent en 5×5 ou 6×6', () => {
    for (const mission of ERREURS_MISSIONS) {
      expect([5, 6]).toContain(mission.grille.width)
      expect(mission.grille.width).toBe(mission.grille.height)
    }
  })

  it('le programme erroné de chaque mission fait échouer MILO', () => {
    for (const m of ERREURS_MISSIONS) {
      const p = executerProgramme(m.grille, m.programmeErrone)
      expect(p.statut).not.toBe('succes')
    }
  })

  it('la solution corrigée atteint la cible et est optimale', () => {
    for (const m of ERREURS_MISSIONS) {
      const p = executerProgramme(m.grille, m.solution)
      expect(p.statut).toBe('succes')
      expect(p.positions.at(-1)).toEqual(m.grille.cible)
      expect(m.solution.length).toBe(longueurOptimale(m.grille))
    }
  })

  it('les étapes d’échec déclarées correspondent au moteur', () => {
    for (const m of ERREURS_MISSIONS) {
      if (m.etapeEchouee === undefined) continue
      const p = executerProgramme(m.grille, m.programmeErrone)
      expect(p.etapeEchouee).toBe(m.etapeEchouee)
    }
  })

  it('erreurParId fonctionne', () => {
    expect(erreurParId('erreur-2')?.numero).toBe(2)
    expect(erreurParId('inconnu')).toBeUndefined()
  })
})
