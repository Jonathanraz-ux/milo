import type { Direction } from '../engine/gridEngine'

interface IcoProps {
  taille?: number | string
  className?: string
}

export function IcoFleche({ direction, taille = 28 }: { direction: Direction; taille?: number }) {
  const rotation = { haut: 0, droite: 90, bas: 180, gauche: 270 }[direction]
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g transform={`rotate(${rotation} 12 12)`}>
        <path
          d="M12 4 L12 20 M12 4 L6 10 M12 4 L18 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function IcoEtoile({ taille = 32, className }: IcoProps & { className?: string }) {
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5L2.6 9.3l6.5-.9z"
        fill="#ffc93c"
        stroke="#24333f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IcoRocher({ taille = 32 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 18 L6 9 L11 5 L18 7 L21 14 L19 18 Z"
        fill="#b9a68e"
        stroke="#24333f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M6 9 L12 11 L18 7" fill="none" stroke="#24333f" strokeWidth="1.2" opacity="0.5" />
    </svg>
  )
}

export function IcoRetour({ taille = 26 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M15 5 L8 12 L15 19"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IcoAide({ taille = 26 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M9.2 9.2 a2.8 2.8 0 1 1 3.6 2.7 c-0.8 0.3 -0.8 1 -0.8 1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function IcoSon({ actif, taille = 26 }: { actif: boolean; taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 9.5 h3.5 L12 5.5 v13 L7.5 14.5 H4 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {actif ? (
        <path
          d="M15.5 9 a4.5 4.5 0 0 1 0 6 M18 6.5 a8 8 0 0 1 0 11"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M15.5 9.5 L20.5 14.5 M20.5 9.5 L15.5 14.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

export function IcoCoche({ taille = 22 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12.5 L10 17.5 L19 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IcoGo({ taille = 26 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M7 5 L19 12 L7 19 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function IcoStop({ taille = 24 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor" />
    </svg>
  )
}

export function IcoRejouer({ taille = 24 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4 12 a8 8 0 1 1 2.6 5.9 M4 12 L4 7 M4 12 L9 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IcoEffacer({ taille = 24 }: IcoProps) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 7 h14 M9 7 V5 h6 v2 M8 7 l1 12 h6 l1 -12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
