import { describe, expect, it } from 'vitest'
import { MISSIONS_LEADERSHIP, missionLeadershipParId, validationMissionLeadership } from './leadership'

describe('données d’ordonnancement', () => {
  it('contient quatre scénarios numérotés de 1 à 4', () => {
    expect(MISSIONS_LEADERSHIP).toHaveLength(4)
    expect(MISSIONS_LEADERSHIP.map((m) => m.numero)).toEqual([1, 2, 3, 4])
    expect(new Set(MISSIONS_LEADERSHIP.map((m) => m.id)).size).toBe(4)
  })

  it('chaque scénario est structurellement valide', () => {
    expect(MISSIONS_LEADERSHIP.flatMap(validationMissionLeadership)).toEqual([])
  })

  it('chaque solution couvre toutes les actions obligatoires dans un ordre unique', () => {
    for (const mission of MISSIONS_LEADERSHIP) {
      const obligatoires = mission.actionsDisponibles.filter((a) => a.obligatoire).map((a) => a.id)
      expect(new Set(mission.solutionOrdre)).toEqual(new Set(obligatoires))
      expect(new Set(mission.solutionOrdre).size).toBe(mission.solutionOrdre.length)
    }
  })

  it('les leurres ne figurent jamais dans la solution', () => {
    for (const mission of MISSIONS_LEADERSHIP) {
      for (const action of mission.actionsDisponibles.filter((a) => !a.obligatoire)) {
        expect(mission.solutionOrdre).not.toContain(action.id)
      }
    }
  })

  it('le plan initial est toujours incomplet et inclus dans la solution', () => {
    for (const mission of MISSIONS_LEADERSHIP) {
      expect(mission.ordreInitial.length).toBeLessThan(mission.solutionOrdre.length)
      for (const id of mission.ordreInitial) expect(mission.solutionOrdre).toContain(id)
    }
  })

  it('missionLeadershipParId répond comme attendu', () => {
    expect(missionLeadershipParId('lead-3')?.numero).toBe(3)
    expect(missionLeadershipParId('inconnu')).toBeUndefined()
  })
})
