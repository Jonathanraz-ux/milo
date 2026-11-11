import { describe, expect, it } from 'vitest'
import { classifier } from '../engine/knn'
import {
  DEFIS,
  K_OPTIONS,
  SEUIL_SIGNAL,
  SIGNAUX,
  categorieTheorique,
  caracteristiques,
  defiParId,
  signalDefi,
  signalParId,
  versExemples,
  validationDefi,
  type Defi,
} from './entrainement'

function predit(defi: Defi, exemplesIds: string[], testId: string, k = defi.kRecommande): string | null {
  const test = signalDefi(defi, testId)
  return (
    classifier(versExemples(exemplesIds), { id: testId, caracteristiques: caracteristiques(test) }, k)?.categorie ??
    null
  )
}

function bienClasse(defi: Defi, exemplesIds: string[], testId: string, k = defi.kRecommande): boolean {
  return predit(defi, exemplesIds, testId, k) === signalDefi(defi, testId).categorie
}

describe('structure des données d’entraînement', () => {
  it('contient quatre défis numérotés de 1 à 4', () => {
    expect(DEFIS).toHaveLength(4)
    expect(DEFIS.map((d) => d.numero)).toEqual([1, 2, 3, 4])
    expect(new Set(DEFIS.map((d) => d.id)).size).toBe(4)
  })

  it('chaque défi est structurellement valide', () => {
    expect(DEFIS.flatMap(validationDefi)).toEqual([])
  })

  it('les k proposés sont 1, 3 et 5', () => {
    expect([...K_OPTIONS]).toEqual([1, 3, 5])
    for (const defi of DEFIS) expect(K_OPTIONS).toContain(defi.kRecommande)
  })

  it('le catalogue est unique, normalisé et cohérent avec la règle visible', () => {
    const signaux = Object.values(SIGNAUX)
    expect(new Set(signaux.map((s) => s.id)).size).toBe(signaux.length)
    for (const signal of signaux) {
      expect(signal.amplitude).toBeGreaterThan(0)
      expect(signal.amplitude).toBeLessThanOrEqual(1)
      expect(signal.coherence).toBeGreaterThan(0)
      expect(signal.coherence).toBeLessThanOrEqual(1)
      expect(signal.categorie).toBe(categorieTheorique(signal.amplitude, signal.coherence))
    }
  })

  it('un signal n’est exploitable que si amplitude ET cohérence atteignent 0,55', () => {
    expect(categorieTheorique(SEUIL_SIGNAL, SEUIL_SIGNAL)).toBe('signal')
    expect(categorieTheorique(SEUIL_SIGNAL - 0.01, 0.9)).toBe('bruit')
    expect(categorieTheorique(0.9, SEUIL_SIGNAL - 0.01)).toBe('bruit')
  })

  it('defiParId, signalParId et signalDefi répondent comme attendu', () => {
    expect(defiParId('entrainement-2')?.numero).toBe(2)
    expect(defiParId('inconnu')).toBeUndefined()
    expect(signalParId('porteuse-alpha').code).toBe('SIG-α')
    expect(() => signalParId('inconnu')).toThrow()
    expect(() => signalDefi(DEFIS[0], 'bruit-blanc')).toThrow()
  })
})

describe('scénarios d’apprentissage (vrai algorithme)', () => {
  it('chaque défi démarre avec un jeu incomplet qui échoue au moins une cible', () => {
    for (const defi of DEFIS) {
      const rates = defi.tests.filter((test) => !bienClasse(defi, defi.exemplesInitiaux, test))
      expect(rates, `défi ${defi.id} : le départ devrait rater au moins une cible`).not.toHaveLength(0)
    }
  })

  it('défi 1 : la micro-coupure est mal classée puis corrigée par un exemple proche', () => {
    const defi = DEFIS[0]
    expect(predit(defi, defi.exemplesInitiaux, 'micro-coupure')).toBe('signal')
    expect(signalParId('micro-coupure').categorie).toBe('bruit')
    expect(bienClasse(defi, ['porteuse-alpha', 'interference'], 'micro-coupure')).toBe(true)
  })

  it('défi 4 : k = 1 est piégé par la dérive thermique, k = 3 corrige', () => {
    const defi = DEFIS[3]
    const cible = 'relais-orbital'
    expect(signalParId(cible).categorie).toBe('signal')

    // Un seul voisin : la dérive thermique (bruit) est la plus proche.
    expect(predit(defi, ['derive-thermique', 'porteuse-alpha'], cible, 1)).toBe('bruit')

    // k = 3 avec seulement deux exemples : égalité tranchée par le plus proche.
    expect(predit(defi, ['derive-thermique', 'porteuse-alpha'], cible, 3)).toBe('bruit')

    // En ajoutant l'impulsion calibrée, deux voisins sur trois votent SIGNAL.
    expect(predit(defi, ['derive-thermique', 'porteuse-alpha', 'impulsion-calibree'], cible, 3)).toBe('signal')
  })
})

describe('réussite possible avec toute l’étagère', () => {
  it.each(DEFIS.map((d) => [d.numero, d.id, d] as const))(
    'défi %i (%s) : toutes les cibles sont correctement classées',
    (_n, _id, defi) => {
      for (const test of defi.tests) {
        expect(bienClasse(defi, defi.exemples, test), `échec sur la cible « ${test} »`).toBe(true)
      }
    },
  )

  it('la prédiction ne dépend pas de l’ordre des exemples', () => {
    for (const defi of DEFIS) {
      for (const test of defi.tests) {
        const cible = { id: test, caracteristiques: caracteristiques(signalParId(test)) }
        const direct = classifier(versExemples(defi.exemples), cible, defi.kRecommande)
        const retourne = classifier(versExemples([...defi.exemples].reverse()), cible, defi.kRecommande)
        expect(direct?.categorie).toBe(retourne?.categorie)
      }
    }
  })
})
