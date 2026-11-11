import { describe, expect, it } from 'vitest'
import { classifier, distance, type Cible, type Exemple } from './knn'

const ex = (id: string, x: number, y: number, categorie: string): Exemple => ({
  id,
  caracteristiques: [x, y],
  categorie,
})

const cibleDe = (x: number, y: number): Cible => ({ id: 'cible', caracteristiques: [x, y] })

describe('distance', () => {
  it('mesure la distance euclidienne', () => {
    expect(distance([0, 0], [3, 4])).toBe(5)
    expect(distance([1, 1], [1, 1])).toBe(0)
  })
})

describe('classificateur 1-NN (comportement par défaut)', () => {
  it('choisit l’exemple le plus proche', () => {
    const prediction = classifier([ex('a', 0.1, 0.1, 'bruit'), ex('b', 0.9, 0.9, 'signal')], cibleDe(0.8, 0.85))
    expect(prediction?.categorie).toBe('signal')
    expect(prediction?.voisin.id).toBe('b')
    expect(prediction?.k).toBe(1)
  })

  it('retourne null sans aucun exemple', () => {
    expect(classifier([], cibleDe(0.5, 0.5))).toBeNull()
  })

  it('ne consulte jamais une catégorie sur la cible : seule la distance compte', () => {
    const exemples = [ex('a', 0.5, 0.5, 'bruit'), ex('b', 0.5, 0.5, 'signal')]
    const cible = cibleDe(0.5, 0.5)
    expect(classifier(exemples, cible)?.categorie).toBe('bruit')
    expect(classifier([...exemples].reverse(), cible)?.categorie).toBe('signal')
  })

  it('est déterministe : ex æquo tranché par l’ordre des exemples', () => {
    const cible = cibleDe(0.5, 0.5)
    const ordreA = [ex('gauche', 0, 0.5, 'bruit'), ex('droite', 1, 0.5, 'signal')]
    const ordreB = [ex('droite', 1, 0.5, 'signal'), ex('gauche', 0, 0.5, 'bruit')]
    const premier = classifier(ordreA, cible)
    expect(premier?.categorie).toBe('bruit')
    expect(premier?.distance).toBeCloseTo(0.5, 10)
    expect(classifier(ordreA, cible)).toEqual(premier)
    expect(classifier(ordreB, cible)?.categorie).toBe('signal')
  })

  it('rend toujours la même prédiction sur dix appels identiques', () => {
    const exemples = [ex('a', 0.2, 0.3, 'signal'), ex('b', 0.7, 0.6, 'bruit'), ex('c', 0.9, 0.2, 'signal')]
    const cible = cibleDe(0.6, 0.5)
    const resultats = new Set(Array.from({ length: 10 }, () => JSON.stringify(classifier(exemples, cible))))
    expect(resultats.size).toBe(1)
  })
})

describe('k plus proches voisins', () => {
  const exemples = [
    ex('a', 0.1, 0.1, 'bruit'),
    ex('b', 0.2, 0.2, 'signal'),
    ex('c', 0.3, 0.3, 'signal'),
  ]

  it('applique un vote majoritaire à k = 3', () => {
    const prediction = classifier(exemples, cibleDe(0.15, 0.15), 3)
    expect(prediction?.categorie).toBe('signal')
    expect(prediction?.k).toBe(3)
    expect(prediction?.voisins).toHaveLength(3)
    expect(prediction?.voisins.map((v) => v.exemple.id)).toEqual(['a', 'b', 'c'])
  })

  it('k = 1 reste sensible au voisin le plus proche', () => {
    expect(classifier(exemples, cibleDe(0.15, 0.15), 1)?.categorie).toBe('bruit')
  })

  it('borne k au nombre d’exemples disponibles', () => {
    const prediction = classifier(exemples.slice(0, 2), cibleDe(0.15, 0.15), 5)
    expect(prediction?.k).toBe(2)
    expect(prediction?.voisins).toHaveLength(2)
  })

  it('normalise un k invalide vers 1', () => {
    expect(classifier(exemples, cibleDe(0.15, 0.15), 0)?.k).toBe(1)
    expect(classifier(exemples, cibleDe(0.15, 0.15), Number.NaN)?.k).toBe(1)
    expect(classifier(exemples, cibleDe(0.15, 0.15), 2.7)?.k).toBe(2)
  })

  it('tranche une égalité de voix par le voisin le plus proche', () => {
    const prediction = classifier(exemples, cibleDe(0.15, 0.15), 2)
    expect(prediction?.voisins).toHaveLength(2)
    // Voix : bruit 1 / signal 1. Le plus proche (a, bruit) impose sa classe.
    expect(prediction?.categorie).toBe('bruit')
  })

  it('expose les k voisins triés par distance croissante', () => {
    const prediction = classifier([...exemples].reverse(), cibleDe(0.15, 0.15), 3)
    const distances = prediction!.voisins.map((v) => v.distance)
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })
})
