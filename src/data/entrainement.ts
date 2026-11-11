import { classifier, type Exemple } from '../engine/knn'

export type CategorieSignal = 'signal' | 'bruit'

export type FormeSignal =
  | 'porteuse'
  | 'rafale'
  | 'impulsion'
  | 'derive'
  | 'bruit'
  | 'interference'
  | 'echo'
  | 'saturation'

export interface Signal {
  id: string
  /** Nom technique affiché dans l'interface. */
  nom: string
  /** Code court utilisé dans les journaux système. */
  code: string
  forme: FormeSignal
  /** Caractéristique 1 : amplitude normalisée entre 0 et 1. */
  amplitude: number
  /** Caractéristique 2 : cohérence normalisée entre 0 et 1. */
  coherence: number
  categorie: CategorieSignal
}

export interface Defi {
  id: string
  numero: number
  titre: string
  objectif: string
  aide: string
  /** Signaux posés sur l'étagère : chacun est un exemple étiqueté. */
  exemples: string[]
  /** Exemples déjà injectés dans le jeu d'apprentissage au démarrage. */
  exemplesInitiaux: string[]
  /** Cibles évaluées une par une, jamais présentes dans l'étagère. */
  tests: string[]
  /** k conseillé pour ce défi (1, 3 ou 5). */
  kRecommande: number
}

/** Seuil de décision visible du jeu de données. */
export const SEUIL_SIGNAL = 0.55

export const K_OPTIONS = [1, 3, 5] as const

/**
 * Catalogue de signaux. Les catégories suivent une règle simple et visible :
 * un signal exploitable a une amplitude ET une cohérence supérieures au seuil.
 * Toute combinaison qui échoue à l'un des deux critères est classée « bruit ».
 */
export const SIGNAUX: Record<string, Signal> = {
  'porteuse-alpha': {
    id: 'porteuse-alpha',
    nom: 'Porteuse α',
    code: 'SIG-α',
    forme: 'porteuse',
    amplitude: 0.82,
    coherence: 0.88,
    categorie: 'signal',
  },
  telemetrie: {
    id: 'telemetrie',
    nom: 'Télémétrie',
    code: 'TLM-07',
    forme: 'porteuse',
    amplitude: 0.7,
    coherence: 0.74,
    categorie: 'signal',
  },
  'burst-synchro': {
    id: 'burst-synchro',
    nom: 'Burst de synchronisation',
    code: 'BST-12',
    forme: 'rafale',
    amplitude: 0.9,
    coherence: 0.62,
    categorie: 'signal',
  },
  'impulsion-calibree': {
    id: 'impulsion-calibree',
    nom: 'Impulsion calibrée',
    code: 'IMP-03',
    forme: 'impulsion',
    amplitude: 0.61,
    coherence: 0.93,
    categorie: 'signal',
  },
  'relais-orbital': {
    id: 'relais-orbital',
    nom: 'Relais orbital',
    code: 'ORB-91',
    forme: 'rafale',
    amplitude: 0.84,
    coherence: 0.58,
    categorie: 'signal',
  },
  'parasite-large': {
    id: 'parasite-large',
    nom: 'Parasite large bande',
    code: 'PRS-44',
    forme: 'bruit',
    amplitude: 0.35,
    coherence: 0.4,
    categorie: 'bruit',
  },
  interference: {
    id: 'interference',
    nom: 'Interférence',
    code: 'INT-22',
    forme: 'interference',
    amplitude: 0.25,
    coherence: 0.9,
    categorie: 'bruit',
  },
  'derive-thermique': {
    id: 'derive-thermique',
    nom: 'Dérive thermique',
    code: 'DRV-08',
    forme: 'derive',
    amplitude: 0.78,
    coherence: 0.35,
    categorie: 'bruit',
  },
  'bruit-blanc': {
    id: 'bruit-blanc',
    nom: 'Bruit blanc',
    code: 'BRT-00',
    forme: 'bruit',
    amplitude: 0.42,
    coherence: 0.18,
    categorie: 'bruit',
  },
  'echo-multipath': {
    id: 'echo-multipath',
    nom: 'Écho multipath',
    code: 'ECH-31',
    forme: 'echo',
    amplitude: 0.3,
    coherence: 0.6,
    categorie: 'bruit',
  },
  'micro-coupure': {
    id: 'micro-coupure',
    nom: 'Micro-coupure',
    code: 'MCP-05',
    forme: 'impulsion',
    amplitude: 0.12,
    coherence: 0.85,
    categorie: 'bruit',
  },
  'saturation-adc': {
    id: 'saturation-adc',
    nom: "Saturation de l'ADC",
    code: 'SAT-99',
    forme: 'saturation',
    amplitude: 0.95,
    coherence: 0.25,
    categorie: 'bruit',
  },
  'porteuse-faible': {
    id: 'porteuse-faible',
    nom: 'Porteuse faible',
    code: 'SIG-β',
    forme: 'porteuse',
    amplitude: 0.52,
    coherence: 0.92,
    categorie: 'bruit',
  },
}

export const LIBELLES_CATEGORIES: Record<CategorieSignal, string> = {
  signal: 'SIGNAL',
  bruit: 'BRUIT',
}

export const DEFIS: Defi[] = [
  {
    id: 'entrainement-1',
    numero: 1,
    titre: 'Classification binaire',
    objectif: 'Étiqueter les signaux entrants à partir d’un échantillon minimal.',
    aide: 'Règle visible : un signal exploitable a une amplitude ≥ 0,55 ET une cohérence ≥ 0,55. Avec un seul exemple, le classificateur applique la classe du voisin le plus proche, même si elle est fausse. Injecte un contre-exemple proche de la cible.',
    exemples: ['porteuse-alpha', 'derive-thermique', 'impulsion-calibree', 'parasite-large', 'interference'],
    exemplesInitiaux: ['porteuse-alpha'],
    tests: ['telemetrie', 'micro-coupure'],
    kRecommande: 1,
  },
  {
    id: 'entrainement-2',
    numero: 2,
    titre: 'Bruit de fond',
    objectif: 'Isoler un burst de synchronisation malgré la présence d’un signal saturé.',
    aide: 'Deux exemples opposés ne suffisent pas à couvrir l’espace des caractéristiques. Le burst de synchronisation est proche de la saturation en amplitude, mais sa cohérence le range côté signal. Ajoute un exemple de relais orbital pour déplacer la frontière de décision.',
    exemples: ['impulsion-calibree', 'saturation-adc', 'relais-orbital', 'bruit-blanc', 'interference'],
    exemplesInitiaux: ['impulsion-calibree', 'saturation-adc'],
    tests: ['burst-synchro', 'derive-thermique'],
    kRecommande: 1,
  },
  {
    id: 'entrainement-3',
    numero: 3,
    titre: 'Jeu de données dense',
    objectif: 'Stabiliser trois classifications successives avec un jeu d’apprentissage étendu.',
    aide: 'La densité des exemples compte plus que leur nombre brut : il faut couvrir les zones de l’espace où se trouvent les cibles. Vérifie les voisins affichés et compare les distances avant de conclure.',
    exemples: ['bruit-blanc', 'porteuse-alpha', 'interference', 'impulsion-calibree', 'parasite-large', 'relais-orbital', 'saturation-adc'],
    exemplesInitiaux: ['bruit-blanc'],
    tests: ['telemetrie', 'micro-coupure', 'derive-thermique'],
    kRecommande: 1,
  },
  {
    id: 'entrainement-4',
    numero: 4,
    titre: 'Voisinage élargi (k-NN)',
    objectif: 'Corriger un faux positif dû à un exemple aberrant en passant à k = 3.',
    aide: 'Un seul voisin peut être un outlier : la dérive thermique est très proche du relais orbital par la distance, mais sa cohérence est trop faible. Avec deux exemples, k = 3 reste bloqué sur une égalité. Ajoute l’impulsion calibrée : trois voisins votent alors SIGNAL à la majorité.',
    exemples: ['derive-thermique', 'porteuse-alpha', 'impulsion-calibree', 'bruit-blanc'],
    exemplesInitiaux: ['derive-thermique', 'porteuse-alpha'],
    tests: ['relais-orbital'],
    kRecommande: 3,
  },
]

export function defiParId(id: string): Defi | undefined {
  return DEFIS.find((d) => d.id === id)
}

export function signalParId(id: string): Signal {
  const signal = SIGNAUX[id]
  if (!signal) throw new Error(`Signal inconnu : ${id}`)
  return signal
}

export function signalDefi(defi: Defi, id: string): Signal {
  if (!defi.exemples.includes(id) && !defi.tests.includes(id)) {
    throw new Error(`Le signal ${id} n'appartient pas au défi ${defi.id}`)
  }
  return signalParId(id)
}

/** Transforme des ids de signaux en exemples étiquetés pour le classificateur. */
export function versExemples(ids: string[]): Exemple[] {
  return ids.map((id) => {
    const signal = signalParId(id)
    return { id, caracteristiques: caracteristiques(signal), categorie: signal.categorie }
  })
}

export function caracteristiques(signal: Signal): readonly [number, number] {
  return [signal.amplitude, signal.coherence]
}

/** Classe théorique attendue d'après la règle visible du jeu de données. */
export function categorieTheorique(amplitude: number, coherence: number): CategorieSignal {
  return amplitude >= SEUIL_SIGNAL && coherence >= SEUIL_SIGNAL ? 'signal' : 'bruit'
}

function predit(defi: Defi, exemplesIds: string[], testId: string, k: number): string | null {
  const test = signalDefi(defi, testId)
  return (
    classifier(versExemples(exemplesIds), { id: testId, caracteristiques: caracteristiques(test) }, k)?.categorie ??
    null
  )
}

export function validationDefi(defi: Defi): string[] {
  const problemes: string[] = []
  if (defi.numero < 1) problemes.push(`${defi.id} : numéro invalide`)
  if (defi.exemples.length < 2) problemes.push(`${defi.id} : moins de 2 exemples sur l'étagère`)
  if (defi.tests.length < 1) problemes.push(`${defi.id} : aucun test`)
  if (new Set(defi.exemples).size !== defi.exemples.length) problemes.push(`${defi.id} : exemple en double`)
  if (new Set(defi.tests).size !== defi.tests.length) problemes.push(`${defi.id} : test en double`)
  if (!(K_OPTIONS as readonly number[]).includes(defi.kRecommande)) {
    problemes.push(`${defi.id} : k recommandé ${defi.kRecommande} hors de {1, 3, 5}`)
  }

  for (const id of [...defi.exemples, ...defi.tests]) {
    if (!SIGNAUX[id]) problemes.push(`${defi.id} : signal inconnu « ${id} »`)
  }
  for (const id of defi.exemplesInitiaux) {
    if (!defi.exemples.includes(id)) problemes.push(`${defi.id} : exemple initial « ${id} » absent de l'étagère`)
  }
  for (const id of defi.tests) {
    if (defi.exemples.includes(id)) problemes.push(`${defi.id} : la cible « ${id} » est aussi un exemple`)
  }
  if (defi.exemplesInitiaux.length === 0) problemes.push(`${defi.id} : aucun exemple initial`)
  if (defi.exemplesInitiaux.length === defi.exemples.length) {
    problemes.push(`${defi.id} : tous les exemples sont déjà injectés, rien à apprendre`)
  }

  for (const id of [...defi.exemples, ...defi.tests]) {
    const signal = SIGNAUX[id]
    if (!signal) continue
    const horsBornes = [signal.amplitude, signal.coherence].some((v) => !(v > 0 && v <= 1))
    if (horsBornes) problemes.push(`${defi.id} : caractéristiques hors 0..1 pour « ${id} »`)
    if (signal.categorie !== categorieTheorique(signal.amplitude, signal.coherence)) {
      problemes.push(`${defi.id} : la catégorie de « ${id} » contredit la règle visible`)
    }
  }

  if (defi.exemplesInitiaux.length > 0 && defi.tests.length > 0) {
    const echecsInitiaux = defi.tests.filter(
      (test) => predit(defi, defi.exemplesInitiaux, test, defi.kRecommande) !== signalDefi(defi, test).categorie,
    )
    if (echecsInitiaux.length === 0) {
      problemes.push(`${defi.id} : le jeu initial classe déjà toutes les cibles`)
    }
  }

  if (defi.exemples.length > 0) {
    for (const test of defi.tests) {
      if (predit(defi, defi.exemples, test, defi.kRecommande) !== signalDefi(defi, test).categorie) {
        problemes.push(`${defi.id} : l'étagère complète échoue sur « ${test} » au k recommandé`)
      }
    }
  }

  return problemes
}
