import { describe, expect, it } from 'vitest'
import { executerProgramme, longueurOptimale, LIMITE_COMMANDES } from '../engine/gridEngine'
import { MISSIONS, missionParId, validationMission } from './missions'

describe('données des missions de navigation', () => {
  it('contient neuf missions numérotées de 1 à 9', () => {
    expect(MISSIONS).toHaveLength(9)
    expect(MISSIONS.map((m) => m.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    expect(new Set(MISSIONS.map((m) => m.id)).size).toBe(9)
  })

  it('chaque mission est structurellement valide', () => {
    expect(MISSIONS.flatMap(validationMission)).toEqual([])
  })

  it('progresse de 5×5 à 8×8', () => {
    expect(MISSIONS.map((m) => m.grille.width)).toEqual([5, 5, 6, 6, 7, 7, 8, 8, 8])
    for (const mission of MISSIONS) {
      expect(mission.grille.width).toBe(mission.grille.height)
    }
  })

  it('missionParId retrouve une mission existante ou undefined', () => {
    expect(missionParId('nav-3')?.numero).toBe(3)
    expect(missionParId('inconnu')).toBeUndefined()
  })
})

describe('solvabilité des missions avec le vrai moteur', () => {
  it.each(MISSIONS.map((m) => [m.numero, m.id, m] as const))(
    'mission %i (%s) : la solution proposée amène MILO sur la cible',
    (_n, _id, mission) => {
      const parcours = executerProgramme(mission.grille, mission.solution)
      expect(parcours.statut).toBe('succes')
      expect(parcours.etapeEchouee).toBeNull()
      expect(parcours.positions.at(-1)).toEqual(mission.grille.cible)
    },
  )

  it.each(MISSIONS.map((m) => [m.numero, m.id, m] as const))(
    'mission %i (%s) : la solution est exactement le chemin optimal BFS',
    (_n, _id, mission) => {
      expect(longueurOptimale(mission.grille)).toBe(mission.solution.length)
    },
  )

  it('aucune séquence ne dépasse la limite de 24 instructions', () => {
    for (const mission of MISSIONS) {
      expect(mission.solution.length).toBeLessThanOrEqual(LIMITE_COMMANDES)
      expect(mission.sequenceInitiale.length).toBeLessThanOrEqual(LIMITE_COMMANDES)
    }
  })

  it('les missions préremplies commencent par un programme invalide', () => {
    for (const mission of MISSIONS.filter((m) => m.sequenceInitiale.length > 0)) {
      const parcours = executerProgramme(mission.grille, mission.sequenceInitiale)
      expect(parcours.statut).not.toBe('succes')
    }
  })

  it('la mission 9 est un programme corrompu proche de la cible', () => {
    const mission = MISSIONS[8]
    expect(mission.id).toBe('nav-9')
    expect(mission.sequenceInitiale.length).toBeGreaterThan(0)
    const parcours = executerProgramme(mission.grille, mission.sequenceInitiale)
    expect(parcours.statut).toBe('non-atteint')
  })
})
