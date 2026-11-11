export interface Progression {
  terminees: string[]
  /** Note d'optimalité par identifiant de mission (1 à 3). */
  etoiles: Record<string, number>
  derniereMissionId: string | null
}

export const progressionVide: Progression = { terminees: [], etoiles: {}, derniereMissionId: null }
const CLE_PROGRESSION = 'milo.progression.v2'

function normaliserEtoiles(valeur: unknown): Record<string, number> {
  if (valeur === null || typeof valeur !== 'object' || Array.isArray(valeur)) return {}
  const notes: Record<string, number> = {}
  for (const [id, note] of Object.entries(valeur as Record<string, unknown>)) {
    if (typeof note !== 'number' || !Number.isFinite(note)) continue
    notes[id] = Math.max(1, Math.min(3, Math.round(note)))
  }
  return notes
}

export function chargerProgression(): Progression {
  try {
    const raw = localStorage.getItem(CLE_PROGRESSION)
    if (!raw) return progressionVide
    const data = JSON.parse(raw) as Partial<Progression>
    if (!Array.isArray(data.terminees)) return progressionVide
    const terminees = data.terminees.filter((id) => typeof id === 'string')
    const etoiles = normaliserEtoiles(data.etoiles)
    // Rétrocompatibilité : une mission validée avant l'ajout des étoiles
    // conserve son statut et reçoit la note minimale.
    for (const id of terminees) {
      if (etoiles[id] === undefined) etoiles[id] = 1
    }
    return {
      terminees,
      etoiles,
      derniereMissionId: typeof data.derniereMissionId === 'string' ? data.derniereMissionId : null,
    }
  } catch {
    return progressionVide
  }
}

export function enregistrerProgression(progression: Progression): void {
  try {
    localStorage.setItem(CLE_PROGRESSION, JSON.stringify(progression))
  } catch {
    // Ignorer (mode hors ligne/private)
  }
}

/**
 * Marque une mission comme terminée. Si une note d'optimalité est fournie,
 * seule la meilleure note obtenue est conservée.
 */
export function marquerTerminee(progression: Progression, missionId: string, etoiles?: number): Progression {
  const terminees = progression.terminees.includes(missionId)
    ? progression.terminees
    : [...progression.terminees, missionId]
  const notes = { ...progression.etoiles }
  if (typeof etoiles === 'number' && Number.isFinite(etoiles)) {
    const note = Math.max(1, Math.min(3, Math.round(etoiles)))
    notes[missionId] = Math.max(notes[missionId] ?? 0, note)
  }
  return { terminees, etoiles: notes, derniereMissionId: missionId }
}

export function estTerminee(progression: Progression, missionId: string): boolean {
  return progression.terminees.includes(missionId)
}

/** Note d'optimalité connue, ou 0 si la mission n'a jamais été notée. */
export function etoilesDe(progression: Progression, missionId: string): number {
  return progression.etoiles[missionId] ?? 0
}
