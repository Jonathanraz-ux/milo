import { beforeEach, describe, expect, it } from 'vitest'
import {
  chargerProgression,
  enregistrerProgression,
  estTerminee,
  etoilesDe,
  marquerTerminee,
  progressionVide,
} from './progression'

describe('progression (persistance)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('charge une progression vide par défaut', () => {
    expect(chargerProgression()).toEqual(progressionVide)
    expect(progressionVide.etoiles).toEqual({})
  })

  it('enregistre et recharge une progression', () => {
    const p = marquerTerminee(progressionVide, 'nav-1', 2)
    enregistrerProgression(p)
    expect(chargerProgression()).toEqual(p)
  })

  it('ignore une donnée corrompue', () => {
    localStorage.setItem('milo.progression.v2', '{mauvais json')
    expect(chargerProgression()).toEqual(progressionVide)
  })

  it('ignore une structure sans tableau de missions terminées', () => {
    localStorage.setItem('milo.progression.v2', JSON.stringify({ terminees: 'oui' }))
    expect(chargerProgression()).toEqual(progressionVide)
  })
})

describe('marquerTerminee et étoiles', () => {
  it('mémorise la note d’optimalité', () => {
    const p = marquerTerminee(progressionVide, 'nav-1', 2)
    expect(estTerminee(p, 'nav-1')).toBe(true)
    expect(etoilesDe(p, 'nav-1')).toBe(2)
    expect(p.derniereMissionId).toBe('nav-1')
  })

  it('conserve la meilleure note quand on rejoue une mission', () => {
    let p = marquerTerminee(progressionVide, 'nav-1', 3)
    p = marquerTerminee(p, 'nav-1', 1)
    expect(etoilesDe(p, 'nav-1')).toBe(3)
    expect(p.terminees).toEqual(['nav-1'])
  })

  it('n’écrase jamais une note par une absence de note', () => {
    let p = marquerTerminee(progressionVide, 'lead-1', 2)
    p = marquerTerminee(p, 'lead-1')
    expect(etoilesDe(p, 'lead-1')).toBe(2)
  })

  it('borne les notes entre 1 et 3', () => {
    expect(etoilesDe(marquerTerminee(progressionVide, 'a', 9), 'a')).toBe(3)
    expect(etoilesDe(marquerTerminee(progressionVide, 'b', -4), 'b')).toBe(1)
    expect(etoilesDe(marquerTerminee(progressionVide, 'c', 2.4), 'c')).toBe(2)
  })

  it('retourne 0 pour une mission jamais notée', () => {
    expect(etoilesDe(progressionVide, 'inconnue')).toBe(0)
  })
})

describe('rétrocompatibilité', () => {
  it('attribue une étoile aux missions terminées avant l’ajout du barème', () => {
    localStorage.setItem(
      'milo.progression.v2',
      JSON.stringify({ terminees: ['nav-1', 'nav-2'], derniereMissionId: 'nav-2' }),
    )
    const p = chargerProgression()
    expect(p.terminees).toEqual(['nav-1', 'nav-2'])
    expect(etoilesDe(p, 'nav-1')).toBe(1)
    expect(etoilesDe(p, 'nav-2')).toBe(1)
  })

  it('ignore les notes non numériques et filtre les identifiants invalides', () => {
    localStorage.setItem(
      'milo.progression.v2',
      JSON.stringify({
        terminees: ['nav-1', 42, null, 'nav-3'],
        etoiles: { 'nav-1': 'trois', 'nav-3': 2.6 },
        derniereMissionId: 7,
      }),
    )
    const p = chargerProgression()
    expect(p.terminees).toEqual(['nav-1', 'nav-3'])
    expect(p.etoiles['nav-1']).toBe(1)
    expect(p.etoiles['nav-3']).toBe(3)
    expect(p.derniereMissionId).toBeNull()
  })
})
