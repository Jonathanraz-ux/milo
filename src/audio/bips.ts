export type Bip = 'clic' | 'ajout' | 'go' | 'succes' | 'arret' | 'erreur-douce' | 'parler'

let audioCtx: AudioContext | null = null

function contexte(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  return audioCtx
}

function note(ctx: AudioContext, freq: number, debut: number, duree: number, volume = 0.07) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, ctx.currentTime + debut)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + debut + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + debut + duree)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + debut)
  osc.stop(ctx.currentTime + debut + duree + 0.05)
}

export function jouerBip(bip: Bip): void {
  const ctx = contexte()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()
  switch (bip) {
    case 'clic':
      note(ctx, 520, 0, 0.08, 0.05)
      break
    case 'ajout':
      note(ctx, 660, 0, 0.1, 0.05)
      break
    case 'go':
      note(ctx, 440, 0, 0.1)
      note(ctx, 660, 0.1, 0.12)
      break
    case 'succes':
      note(ctx, 523, 0, 0.12)
      note(ctx, 659, 0.12, 0.12)
      note(ctx, 784, 0.24, 0.25)
      break
    case 'arret':
      note(ctx, 392, 0, 0.12, 0.05)
      break
    case 'parler':
      note(ctx, 520, 0, 0.09)
      note(ctx, 620, 0.09, 0.09)
      break
  }
}
