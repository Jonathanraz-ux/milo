export type Voix = 'milo'

let synth: SpeechSynthesis | null = null
let voixDisponible = false

function activerVoix() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  synth = window.speechSynthesis
  // Réveiller la voix (Safari a besoin d'un petit délai parfois)
  const vois = synth.getVoices()
  voixDisponible = vois.length > 0
  if (!voixDisponible) {
    synth.onvoiceschanged = () => {
      const v = synth?.getVoices() ?? []
      voixDisponible = v.length > 0
    }
  }
}

activerVoix()

export function parler(texte: string): void {
  try {
    if (!synth || !voixDisponible || texte.trim() === '') return
    // Stoppe un éventuel discours en cours pour ne pas chevaucher
    synth.cancel()
    const utter = new SpeechSynthesisUtterance(texte)
    utter.lang = 'fr-FR'
    // Débit posé et hauteur neutre : restitution de logs système, pas de voix enfantine.
    utter.rate = 1
    utter.pitch = 0.95
    utter.volume = 0.9
    synth.speak(utter)
  } catch {
    // Silencieux si non disponible
  }
}

export function utiliserVoix(texte: string): void {
  parler(texte)
}
