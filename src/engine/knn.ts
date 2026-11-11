/**
 * Classificateur k plus proches voisins (k-NN), local et déterministe.
 *
 * Le moteur ne reçoit QUE les exemples étiquetés et les caractéristiques de la
 * cible : il n'a aucun accès à la catégorie réelle de la cible, qui reste dans
 * les données du jeu et n'est révélée qu'après la prédiction.
 *
 * Déterminisme : les exemples sont triés par distance croissante puis par ordre
 * d'entrée. Le vote majoritaire parcourt ce classement dans l'ordre : en cas
 * d'égalité de voix, la catégorie du voisin le plus proche l'emporte.
 */

export interface Exemple {
  id: string
  /** Deux caractéristiques normalisées entre 0 et 1. */
  caracteristiques: readonly [number, number]
  categorie: string
}

export interface Cible {
  id: string
  caracteristiques: readonly [number, number]
}

export interface Voisin {
  exemple: Exemple
  /** Distance euclidienne jusqu'à la cible. */
  distance: number
}

export interface Prediction {
  categorie: string
  /** L'exemple le plus proche, quel que soit k. */
  voisin: Exemple
  /** Distance euclidienne jusqu'au voisin le plus proche. */
  distance: number
  /** Les k voisins effectivement consultés, du plus proche au plus loin. */
  voisins: Voisin[]
  /** k effectif, borné par le nombre d'exemples disponibles. */
  k: number
}

export function distance(a: readonly [number, number], b: readonly [number, number]): number {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Prédit la catégorie de `cible` à partir des seuls `exemples`.
 * `k` vaut 1 par défaut (plus proche voisin). Retourne `null` quand aucun
 * exemple n'a été montré.
 */
export function classifier(exemples: readonly Exemple[], cible: Cible, k = 1): Prediction | null {
  if (exemples.length === 0) return null

  const classement = exemples.map((exemple, index) => ({
    exemple,
    distance: distance(exemple.caracteristiques, cible.caracteristiques),
    index,
  }))
  classement.sort((a, b) => a.distance - b.distance || a.index - b.index)

  const kDemande = Number.isFinite(k) ? Math.trunc(k) : 1
  const effectif = Math.min(Math.max(1, kDemande), classement.length)
  const voisins: Voisin[] = classement.slice(0, effectif).map(({ exemple, distance: d }) => ({
    exemple,
    distance: d,
  }))

  const comptes = new Map<string, number>()
  for (const voisin of voisins) {
    const categorie = voisin.exemple.categorie
    comptes.set(categorie, (comptes.get(categorie) ?? 0) + 1)
  }

  let categorie = voisins[0].exemple.categorie
  let meilleurCompte = 0
  for (const voisin of voisins) {
    const compte = comptes.get(voisin.exemple.categorie) ?? 0
    if (compte > meilleurCompte) {
      meilleurCompte = compte
      categorie = voisin.exemple.categorie
    }
  }

  return {
    categorie,
    voisin: voisins[0].exemple,
    distance: voisins[0].distance,
    voisins,
    k: effectif,
  }
}
