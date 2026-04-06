'use client'

import { PetStage, EvolutionType } from '@/types/game'

interface PixelPetProps {
  stage: PetStage
  evolutionType?: EvolutionType | null
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const C: Record<EvolutionType | 'default' | 'elder', {
  body: string; dark: string; light: string; eye: string; pupil: string; accent: string
}> = {
  warrior: { body: '#ef4444', dark: '#991b1b', light: '#fca5a5', eye: '#fef08a', pupil: '#1c0505', accent: '#b91c1c' },
  sage:    { body: '#818cf8', dark: '#3730a3', light: '#c7d2fe', eye: '#bae6fd', pupil: '#0c0c2a', accent: '#6366f1' },
  dark:    { body: '#a855f7', dark: '#3b0764', light: '#e879f9', eye: '#f0abfc', pupil: '#1a0030', accent: '#7e22ce' },
  balance: { body: '#10b981', dark: '#064e3b', light: '#6ee7b7', eye: '#fde68a', pupil: '#052e16', accent: '#059669' },
  default: { body: '#6b7280', dark: '#374151', light: '#d1d5db', eye: '#f9fafb', pupil: '#111827', accent: '#4b5563' },
  elder:   { body: '#cbd5e1', dark: '#64748b', light: '#f1f5f9', eye: '#94a3b8', pupil: '#1e293b', accent: '#94a3b8' },
}

export function PixelPet({ stage, evolutionType, size = 'md', animate = true }: PixelPetProps) {
  const sizeMap = { sm: 48, md: 80, lg: 128 }
  const px = sizeMap[size]
  const c = stage === 'elder' ? C.elder : (evolutionType ? C[evolutionType] : C.default)

  const wrapClass = `inline-block ${
    animate
      ? stage === 'egg' ? 'animate-bounce'
      : stage === 'baby' ? 'animate-bounce'
      : 'animate-pulse'
      : ''
  }`

  return (
    <div className={wrapClass} style={{ imageRendering: 'pixelated', width: px, height: px }}>
      <svg width={px} height={px} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        {stage === 'egg' && <EggBody />}
        {stage === 'baby' && <BabyBody c={c} />}
        {stage === 'teen' && <TeenBody c={c} />}
        {stage === 'adult' && evolutionType === 'warrior' && <AdultWarrior c={c} />}
        {stage === 'adult' && evolutionType === 'sage' && <AdultSage c={c} />}
        {stage === 'adult' && evolutionType === 'dark' && <AdultDark c={c} />}
        {stage === 'adult' && evolutionType === 'balance' && <AdultBalance c={c} />}
        {stage === 'adult' && !evolutionType && <AdultDefault c={c} />}
        {stage === 'ultimate' && evolutionType === 'warrior' && <UltWarrior c={c} />}
        {stage === 'ultimate' && evolutionType === 'sage' && <UltSage c={c} />}
        {stage === 'ultimate' && evolutionType === 'dark' && <UltDark c={c} />}
        {stage === 'ultimate' && evolutionType === 'balance' && <UltBalance c={c} />}
        {stage === 'ultimate' && !evolutionType && <UltDefault c={c} />}
        {stage === 'elder' && <ElderBody c={c} evolutionType={evolutionType} />}
      </svg>
    </div>
  )
}

/* ── EGG ─────────────────────────────────────────── */
function EggBody() {
  return (
    <>
      {/* glow */}
      <ellipse cx="16" cy="18" rx="10" ry="12" fill="#fef9c3" opacity="0.3"/>
      {/* shell */}
      <ellipse cx="16" cy="18" rx="9" ry="11" fill="#fef08a"/>
      <ellipse cx="16" cy="18" rx="9" ry="11" fill="none" stroke="#d97706" strokeWidth="0.6"/>
      {/* shading */}
      <ellipse cx="16" cy="14" rx="9" ry="5" fill="#fbbf24" opacity="0.35"/>
      {/* highlight */}
      <ellipse cx="12" cy="12" rx="3" ry="2" fill="white" opacity="0.5"/>
      {/* crack lines */}
      <polyline points="14,8 13,11 15,13" fill="none" stroke="#d97706" strokeWidth="0.5" opacity="0.7"/>
      <polyline points="18,9 20,12 18,14" fill="none" stroke="#d97706" strokeWidth="0.5" opacity="0.7"/>
      {/* tiny eyes */}
      <ellipse cx="13" cy="19" rx="1.5" ry="1.5" fill="#1c1c1c"/>
      <ellipse cx="19" cy="19" rx="1.5" ry="1.5" fill="#1c1c1c"/>
      <circle cx="13.5" cy="18.5" r="0.5" fill="white"/>
      <circle cx="19.5" cy="18.5" r="0.5" fill="white"/>
      {/* sparkles */}
      <rect x="3" y="7" width="1" height="1" fill="#fbbf24" opacity="0.9"/>
      <rect x="5" y="5" width="1" height="1" fill="#fde68a" opacity="0.7"/>
      <rect x="27" y="9" width="1" height="1" fill="#fbbf24" opacity="0.9"/>
      <rect x="25" y="6" width="1" height="1" fill="#fde68a" opacity="0.7"/>
    </>
  )
}

/* ── BABY ─────────────────────────────────────────── */
function BabyBody({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* body blob */}
      <ellipse cx="16" cy="20" rx="10" ry="9" fill={c.body}/>
      {/* head */}
      <ellipse cx="16" cy="13" rx="9" ry="8" fill={c.body}/>
      {/* head highlight */}
      <ellipse cx="13" cy="10" rx="4" ry="2.5" fill={c.light} opacity="0.4"/>
      {/* left eye white */}
      <ellipse cx="12" cy="13" rx="3.5" ry="3.5" fill="white"/>
      {/* right eye white */}
      <ellipse cx="20" cy="13" rx="3.5" ry="3.5" fill="white"/>
      {/* left pupil */}
      <ellipse cx="12" cy="14" rx="2" ry="2" fill={c.pupil}/>
      {/* right pupil */}
      <ellipse cx="20" cy="14" rx="2" ry="2" fill={c.pupil}/>
      {/* eye highlights */}
      <circle cx="11" cy="13" r="0.7" fill="white"/>
      <circle cx="19" cy="13" r="0.7" fill="white"/>
      {/* cheeks */}
      <ellipse cx="8" cy="16" rx="2.5" ry="1.5" fill="#f9a8d4" opacity="0.6"/>
      <ellipse cx="24" cy="16" rx="2.5" ry="1.5" fill="#f9a8d4" opacity="0.6"/>
      {/* mouth */}
      <path d="M14,17 Q16,19 18,17" fill="none" stroke={c.dark} strokeWidth="0.8" strokeLinecap="round"/>
      {/* tiny arms */}
      <ellipse cx="7" cy="21" rx="2.5" ry="2" fill={c.body}/>
      <ellipse cx="25" cy="21" rx="2.5" ry="2" fill={c.body}/>
      {/* tiny feet */}
      <ellipse cx="12" cy="28" rx="3" ry="2" fill={c.dark}/>
      <ellipse cx="20" cy="28" rx="3" ry="2" fill={c.dark}/>
    </>
  )
}

/* ── TEEN ─────────────────────────────────────────── */
function TeenBody({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* ear/horn nubs */}
      <polygon points="10,2 8,7 13,6" fill={c.dark}/>
      <polygon points="22,2 19,6 24,7" fill={c.dark}/>
      {/* head */}
      <rect x="7" y="4" width="18" height="14" rx="5" fill={c.body}/>
      {/* head highlight */}
      <ellipse cx="13" cy="8" rx="4" ry="2" fill={c.light} opacity="0.4"/>
      {/* left eye */}
      <ellipse cx="12" cy="11" rx="3" ry="3" fill="white"/>
      <ellipse cx="12" cy="12" rx="1.8" ry="1.8" fill={c.pupil}/>
      <circle cx="11.2" cy="11" r="0.6" fill="white"/>
      {/* right eye */}
      <ellipse cx="20" cy="11" rx="3" ry="3" fill="white"/>
      <ellipse cx="20" cy="12" rx="1.8" ry="1.8" fill={c.pupil}/>
      <circle cx="19.2" cy="11" r="0.6" fill="white"/>
      {/* mouth */}
      <path d="M13,15 Q16,17 19,15" fill="none" stroke={c.dark} strokeWidth="0.8" strokeLinecap="round"/>
      {/* body */}
      <rect x="9" y="17" width="14" height="10" rx="3" fill={c.body}/>
      {/* belly lighter */}
      <ellipse cx="16" cy="22" rx="5" ry="4" fill={c.light} opacity="0.3"/>
      {/* arms */}
      <rect x="3" y="17" width="7" height="7" rx="3" fill={c.body}/>
      <rect x="22" y="17" width="7" height="7" rx="3" fill={c.body}/>
      {/* legs */}
      <rect x="9" y="25" width="5" height="6" rx="2" fill={c.dark}/>
      <rect x="18" y="25" width="5" height="6" rx="2" fill={c.dark}/>
      {/* tail */}
      <path d="M23,22 Q29,20 28,26" fill="none" stroke={c.dark} strokeWidth="2" strokeLinecap="round"/>
    </>
  )
}

/* ── ADULT DEFAULT ─────────────────────────────────── */
function AdultDefault({ c }: { c: typeof C.default }) {
  return (
    <>
      <polygon points="11,0 9,5 14,4" fill={c.dark}/>
      <polygon points="21,0 23,5 18,4" fill={c.dark}/>
      <rect x="5" y="3" width="22" height="14" rx="4" fill={c.body}/>
      <ellipse cx="12" cy="10" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="12" cy="11" rx="2" ry="2" fill={c.pupil}/>
      <circle cx="11" cy="9.5" r="0.7" fill="white"/>
      <ellipse cx="20" cy="10" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="20" cy="11" rx="2" ry="2" fill={c.pupil}/>
      <circle cx="19" cy="9.5" r="0.7" fill="white"/>
      <path d="M13,15 Q16,17 19,15" fill="none" stroke={c.dark} strokeWidth="0.9" strokeLinecap="round"/>
      <rect x="7" y="16" width="18" height="11" rx="3" fill={c.body}/>
      <ellipse cx="16" cy="21" rx="6" ry="4" fill={c.light} opacity="0.3"/>
      <rect x="1" y="15" width="7" height="9" rx="3" fill={c.body}/>
      <rect x="24" y="15" width="7" height="9" rx="3" fill={c.body}/>
      <rect x="9" y="26" width="5" height="6" rx="2" fill={c.dark}/>
      <rect x="18" y="26" width="5" height="6" rx="2" fill={c.dark}/>
    </>
  )
}

/* ── ADULT WARRIOR ────────────────────────────────── */
function AdultWarrior({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* twin sharp horns */}
      <polygon points="10,0 7,6 13,5" fill={c.dark}/>
      <polygon points="22,0 19,5 25,6" fill={c.dark}/>
      {/* horn highlight */}
      <polygon points="10,0 10,4 12,4" fill={c.light} opacity="0.5"/>
      <polygon points="22,0 22,4 20,4" fill={c.light} opacity="0.5"/>
      {/* head */}
      <rect x="5" y="4" width="22" height="14" rx="3" fill={c.body}/>
      {/* head shading top */}
      <rect x="5" y="4" width="22" height="4" rx="3" fill={c.dark} opacity="0.3"/>
      {/* scale pattern on head */}
      <rect x="7" y="6" width="3" height="2" rx="0.5" fill={c.dark} opacity="0.25"/>
      <rect x="11" y="6" width="3" height="2" rx="0.5" fill={c.dark} opacity="0.25"/>
      <rect x="18" y="6" width="3" height="2" rx="0.5" fill={c.dark} opacity="0.25"/>
      <rect x="22" y="6" width="3" height="2" rx="0.5" fill={c.dark} opacity="0.25"/>
      {/* angry eyebrows */}
      <polygon points="8,7 12,8 8,8" fill={c.dark}/>
      <polygon points="24,7 20,8 24,8" fill={c.dark}/>
      {/* eyes */}
      <ellipse cx="11" cy="10" rx="3.5" ry="3" fill={c.eye}/>
      <ellipse cx="21" cy="10" rx="3.5" ry="3" fill={c.eye}/>
      <ellipse cx="11" cy="11" rx="2" ry="2" fill={c.pupil}/>
      <ellipse cx="21" cy="11" rx="2" ry="2" fill={c.pupil}/>
      <circle cx="10" cy="9.5" r="0.6" fill="white"/>
      <circle cx="20" cy="9.5" r="0.6" fill="white"/>
      {/* fangs */}
      <polygon points="13,16 14,19 15,16" fill="white"/>
      <polygon points="17,16 18,19 19,16" fill="white"/>
      {/* mouth line */}
      <rect x="12" y="16" width="8" height="1.5" fill={c.dark}/>
      {/* muscular body */}
      <rect x="5" y="17" width="22" height="11" rx="2" fill={c.body}/>
      {/* chest armor plate */}
      <rect x="8" y="18" width="16" height="8" rx="2" fill={c.dark} opacity="0.35"/>
      {/* chest muscle lines */}
      <rect x="14" y="19" width="4" height="1" fill={c.dark} opacity="0.5"/>
      <rect x="10" y="21" width="5" height="1" rx="0.5" fill={c.dark} opacity="0.4"/>
      <rect x="17" y="21" width="5" height="1" rx="0.5" fill={c.dark} opacity="0.4"/>
      {/* scale belly */}
      <ellipse cx="16" cy="22" rx="5" ry="3" fill={c.light} opacity="0.25"/>
      {/* thick arms */}
      <rect x="0" y="15" width="6" height="10" rx="3" fill={c.body}/>
      <rect x="26" y="15" width="6" height="10" rx="3" fill={c.body}/>
      {/* claws left */}
      <polygon points="0,25 1,28 3,25" fill={c.dark}/>
      <polygon points="2,25 3,28 5,25" fill={c.dark}/>
      {/* claws right */}
      <polygon points="27,25 28,28 30,25" fill={c.dark}/>
      <polygon points="29,25 30,28 32,25" fill={c.dark}/>
      {/* thick legs */}
      <rect x="8" y="27" width="6" height="5" rx="2" fill={c.dark}/>
      <rect x="18" y="27" width="6" height="5" rx="2" fill={c.dark}/>
      {/* foot claws */}
      <polygon points="8,32 10,30 12,32" fill={c.accent}/>
      <polygon points="18,32 20,30 22,32" fill={c.accent}/>
      {/* tail spike */}
      <path d="M27,20 Q32,18 31,26" fill="none" stroke={c.dark} strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="29,25 32,24 31,27" fill={c.dark}/>
    </>
  )
}

/* ── ADULT SAGE ───────────────────────────────────── */
function AdultSage({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* halo glow */}
      <ellipse cx="16" cy="4" rx="9" ry="3" fill={c.eye} opacity="0.25"/>
      {/* crown */}
      <rect x="8" y="1" width="16" height="3" fill="#fbbf24"/>
      <polygon points="9,1 9,4 12,1" fill="#fde68a"/>
      <polygon points="15,0 13,4 18,4 16,0" fill="#fef9c3"/>
      <polygon points="23,1 23,4 20,1" fill="#fde68a"/>
      <circle cx="16" cy="1" r="1.2" fill="#60a5fa"/>
      {/* head */}
      <rect x="5" y="3" width="22" height="14" rx="5" fill={c.body}/>
      <ellipse cx="13" cy="7" rx="5" ry="2.5" fill={c.light} opacity="0.4"/>
      {/* star eyes */}
      <ellipse cx="11" cy="10" rx="3.5" ry="3.5" fill="white"/>
      <ellipse cx="21" cy="10" rx="3.5" ry="3.5" fill="white"/>
      {/* star pupils */}
      <circle cx="11" cy="10" r="2" fill={c.pupil}/>
      <circle cx="21" cy="10" r="2" fill={c.pupil}/>
      {/* star highlights */}
      <polygon points="11,8 11.5,9.5 13,9.5 11.8,10.5 12.3,12 11,11 9.7,12 10.2,10.5 9,9.5 10.5,9.5" fill="white" opacity="0.9" transform="scale(0.6) translate(7,6)"/>
      <circle cx="10.3" cy="9.3" r="0.7" fill="white"/>
      <circle cx="20.3" cy="9.3" r="0.7" fill="white"/>
      {/* gentle smile */}
      <path d="M13,14 Q16,16.5 19,14" fill="none" stroke={c.dark} strokeWidth="0.9" strokeLinecap="round"/>
      {/* robe body */}
      <rect x="5" y="16" width="22" height="12" rx="4" fill={c.accent} opacity="0.85"/>
      <rect x="8" y="16" width="16" height="12" rx="3" fill={c.body}/>
      {/* robe trim */}
      <rect x="15" y="16" width="2" height="12" fill={c.eye} opacity="0.4"/>
      {/* magic orbs floating */}
      <circle cx="4" cy="18" r="2.5" fill={c.eye} opacity="0.85"/>
      <circle cx="4" cy="18" r="1.2" fill="white" opacity="0.6"/>
      <circle cx="28" cy="14" r="2" fill={c.eye} opacity="0.75"/>
      <circle cx="28" cy="14" r="1" fill="white" opacity="0.5"/>
      {/* wings */}
      <path d="M5,18 Q0,14 1,22 Q3,21 5,20" fill={c.light} opacity="0.7"/>
      <path d="M27,18 Q32,14 31,22 Q29,21 27,20" fill={c.light} opacity="0.7"/>
      {/* staff */}
      <rect x="29" y="10" width="1.5" height="18" rx="0.5" fill="#92400e"/>
      <circle cx="29.75" cy="10" r="2.5" fill={c.eye}/>
      <circle cx="29.75" cy="10" r="1.2" fill="white" opacity="0.7"/>
      {/* feet */}
      <ellipse cx="12" cy="28" rx="3.5" ry="2" fill={c.dark}/>
      <ellipse cx="20" cy="28" rx="3.5" ry="2" fill={c.dark}/>
    </>
  )
}

/* ── ADULT DARK ───────────────────────────────────── */
function AdultDark({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* dark aura */}
      <ellipse cx="16" cy="16" rx="14" ry="14" fill={c.dark} opacity="0.18"/>
      {/* three horns */}
      <polygon points="9,0 6,7 12,6" fill={c.dark}/>
      <polygon points="16,0 13,5 19,5" fill={c.accent}/>
      <polygon points="23,0 20,6 26,7" fill={c.dark}/>
      {/* horn details */}
      <polygon points="9,0 9,5 11,4" fill={c.light} opacity="0.35"/>
      <polygon points="23,0 23,5 21,4" fill={c.light} opacity="0.35"/>
      {/* head */}
      <rect x="5" y="5" width="22" height="13" rx="4" fill={c.body}/>
      <ellipse cx="16" cy="7" rx="9" ry="3" fill={c.dark} opacity="0.25"/>
      {/* glowing eyes */}
      <ellipse cx="11" cy="11" rx="3.5" ry="3" fill={c.eye}/>
      <ellipse cx="21" cy="11" rx="3.5" ry="3" fill={c.eye}/>
      {/* eye inner glow */}
      <ellipse cx="11" cy="11" rx="3.5" ry="3" fill={c.light} opacity="0.3"/>
      <ellipse cx="21" cy="11" rx="3.5" ry="3" fill={c.light} opacity="0.3"/>
      <ellipse cx="11" cy="12" rx="2" ry="1.8" fill={c.pupil}/>
      <ellipse cx="21" cy="12" rx="2" ry="1.8" fill={c.pupil}/>
      <circle cx="10.2" cy="10.5" r="0.7" fill="white" opacity="0.9"/>
      <circle cx="20.2" cy="10.5" r="0.7" fill="white" opacity="0.9"/>
      {/* sinister grin */}
      <path d="M11,16 Q16,19 21,16" fill="none" stroke={c.dark} strokeWidth="1" strokeLinecap="round"/>
      <polygon points="13,16 14,18.5 15,16" fill="white" opacity="0.9"/>
      <polygon points="17,16 18,18.5 19,16" fill="white" opacity="0.9"/>
      {/* body */}
      <rect x="6" y="17" width="20" height="11" rx="3" fill={c.body}/>
      <ellipse cx="16" cy="22" rx="6" ry="4" fill={c.dark} opacity="0.3"/>
      {/* bat wings */}
      <path d="M6,18 L0,8 L2,18 L0,24 L5,21" fill={c.dark} opacity="0.88"/>
      <path d="M26,18 L32,8 L30,18 L32,24 L27,21" fill={c.dark} opacity="0.88"/>
      {/* wing membrane lines */}
      <line x1="6" y1="18" x2="1" y2="12" stroke={c.accent} strokeWidth="0.5" opacity="0.5"/>
      <line x1="6" y1="18" x2="0" y2="20" stroke={c.accent} strokeWidth="0.5" opacity="0.5"/>
      <line x1="26" y1="18" x2="31" y2="12" stroke={c.accent} strokeWidth="0.5" opacity="0.5"/>
      <line x1="26" y1="18" x2="32" y2="20" stroke={c.accent} strokeWidth="0.5" opacity="0.5"/>
      {/* dark flame at bottom */}
      <ellipse cx="16" cy="28" rx="4" ry="2" fill={c.accent} opacity="0.5"/>
      {/* legs */}
      <rect x="9" y="27" width="5" height="5" rx="2" fill={c.dark}/>
      <rect x="18" y="27" width="5" height="5" rx="2" fill={c.dark}/>
      {/* claws */}
      <polygon points="9,32 11,30 13,32" fill={c.accent}/>
      <polygon points="19,32 21,30 23,32" fill={c.accent}/>
    </>
  )
}

/* ── ADULT BALANCE ────────────────────────────────── */
function AdultBalance({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* outer halo glow */}
      <ellipse cx="16" cy="6" rx="11" ry="4" fill={c.eye} opacity="0.2"/>
      {/* halo ring */}
      <ellipse cx="16" cy="4" rx="8" ry="2.5" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
      <ellipse cx="16" cy="4" rx="8" ry="2.5" fill="none" stroke="#fef08a" strokeWidth="0.5" opacity="0.7"/>
      {/* leaf crown */}
      <ellipse cx="11" cy="3" rx="2.5" ry="1.2" fill={c.dark} opacity="0.8" transform="rotate(-20,11,3)"/>
      <ellipse cx="21" cy="3" rx="2.5" ry="1.2" fill={c.dark} opacity="0.8" transform="rotate(20,21,3)"/>
      <ellipse cx="16" cy="2" rx="2" ry="1.2" fill={c.accent}/>
      {/* head */}
      <rect x="5" y="4" width="22" height="14" rx="6" fill={c.body}/>
      <ellipse cx="13" cy="7" rx="5" ry="2.5" fill={c.light} opacity="0.4"/>
      {/* crescent eyes */}
      <ellipse cx="11" cy="10" rx="3" ry="3" fill="white"/>
      <ellipse cx="21" cy="10" rx="3" ry="3" fill="white"/>
      <ellipse cx="11.5" cy="10.5" rx="2.2" ry="2.2" fill={c.body}/>
      <ellipse cx="21.5" cy="10.5" rx="2.2" ry="2.2" fill={c.body}/>
      <circle cx="10.5" cy="9.5" r="0.6" fill="white"/>
      <circle cx="20.5" cy="9.5" r="0.6" fill="white"/>
      {/* warm smile */}
      <path d="M12,15 Q16,17.5 20,15" fill="none" stroke={c.dark} strokeWidth="1" strokeLinecap="round"/>
      {/* cheeks */}
      <ellipse cx="8" cy="14" rx="2" ry="1.3" fill="#f9a8d4" opacity="0.55"/>
      <ellipse cx="24" cy="14" rx="2" ry="1.3" fill="#f9a8d4" opacity="0.55"/>
      {/* body */}
      <rect x="6" y="17" width="20" height="11" rx="5" fill={c.body}/>
      {/* yin-yang belly */}
      <circle cx="16" cy="22" r="5" fill={c.dark} opacity="0.5"/>
      <path d="M16,17 A5,5 0 0,1 16,27 A2.5,2.5 0 0,0 16,22 A2.5,2.5 0 0,1 16,17" fill={c.light} opacity="0.6"/>
      <circle cx="16" cy="19.5" r="1.2" fill={c.dark} opacity="0.7"/>
      <circle cx="16" cy="24.5" r="1.2" fill={c.light} opacity="0.7"/>
      {/* gentle arms */}
      <rect x="1" y="17" width="6" height="8" rx="3" fill={c.body}/>
      <rect x="25" y="17" width="6" height="8" rx="3" fill={c.body}/>
      {/* vine details */}
      <path d="M1,20 Q-1,18 0,15" fill="none" stroke={c.dark} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      <path d="M31,20 Q33,18 32,15" fill="none" stroke={c.dark} strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
      {/* legs */}
      <rect x="9" y="27" width="5" height="5" rx="2.5" fill={c.accent}/>
      <rect x="18" y="27" width="5" height="5" rx="2.5" fill={c.accent}/>
      {/* light particles */}
      <circle cx="3" cy="10" r="1" fill={c.eye} opacity="0.8"/>
      <circle cx="29" cy="8" r="1" fill={c.eye} opacity="0.8"/>
      <circle cx="5" cy="28" r="0.8" fill={c.eye} opacity="0.6"/>
    </>
  )
}

/* ── ULTIMATE WARRIOR ─────────────────────────────── */
function UltWarrior({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* power aura */}
      <ellipse cx="16" cy="16" rx="15" ry="15" fill={c.body} opacity="0.12"/>
      <ellipse cx="16" cy="16" rx="15" ry="15" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.4"/>
      {/* three horns now */}
      <polygon points="9,0 6,6 12,5" fill={c.dark}/>
      <polygon points="16,0 13,4 19,4" fill={c.accent}/>
      <polygon points="23,0 20,5 26,6" fill={c.dark}/>
      {/* flame on horn tips */}
      <ellipse cx="9" cy="0" rx="1.5" ry="1" fill="#fbbf24" opacity="0.9"/>
      <ellipse cx="16" cy="0" rx="1.5" ry="1" fill="#fb923c" opacity="0.9"/>
      <ellipse cx="23" cy="0" rx="1.5" ry="1" fill="#fbbf24" opacity="0.9"/>
      {/* head */}
      <rect x="4" y="4" width="24" height="14" rx="3" fill={c.body}/>
      <rect x="4" y="4" width="24" height="5" rx="3" fill={c.dark} opacity="0.3"/>
      {/* scale armor on head */}
      {[6,10,14,18,22].map(x => (
        <rect key={x} x={x} y="5" width="3" height="2" rx="0.5" fill={c.dark} opacity="0.25"/>
      ))}
      <polygon points="7,8 11,9 7,9" fill={c.dark}/>
      <polygon points="25,8 21,9 25,9" fill={c.dark}/>
      {/* blazing eyes */}
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill={c.eye}/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill={c.eye}/>
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill="#fef08a" opacity="0.4"/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill="#fef08a" opacity="0.4"/>
      <ellipse cx="11" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <ellipse cx="21" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <circle cx="9.8" cy="10.5" r="0.8" fill="white"/>
      <circle cx="19.8" cy="10.5" r="0.8" fill="white"/>
      {/* flame breath mouth */}
      <rect x="12" y="16" width="8" height="2" fill={c.dark}/>
      <polygon points="12,16 13,19 14,16" fill="white"/>
      <polygon points="16,16 17,20 18,16" fill="white"/>
      <polygon points="18,16 19,19 20,16" fill="white"/>
      <ellipse cx="16" cy="20" rx="3" ry="1.5" fill="#fb923c" opacity="0.7"/>
      {/* armored body */}
      <rect x="4" y="17" width="24" height="12" rx="2" fill={c.body}/>
      <rect x="7" y="18" width="18" height="9" rx="2" fill={c.dark} opacity="0.35"/>
      {[9,13,17,21].map(x => (
        <rect key={x} x={x} y="19" width="2" height="3" rx="0.5" fill={c.dark} opacity="0.4"/>
      ))}
      <ellipse cx="16" cy="23" rx="4" ry="2.5" fill={c.accent} opacity="0.35"/>
      {/* wings now! */}
      <path d="M4,18 L0,8 L2,20 L0,26 L4,23" fill={c.accent} opacity="0.7"/>
      <path d="M28,18 L32,8 L30,20 L32,26 L28,23" fill={c.accent} opacity="0.7"/>
      {/* thick legs */}
      <rect x="7" y="28" width="7" height="4" rx="2" fill={c.dark}/>
      <rect x="18" y="28" width="7" height="4" rx="2" fill={c.dark}/>
      <polygon points="7,32 10,29 13,32" fill={c.accent}/>
      <polygon points="19,32 22,29 25,32" fill={c.accent}/>
      {/* energy particles */}
      <circle cx="2" cy="6" r="1" fill={c.eye} opacity="0.9"/>
      <circle cx="30" cy="4" r="1" fill={c.eye} opacity="0.9"/>
      <circle cx="1" cy="14" r="0.8" fill="#fbbf24" opacity="0.8"/>
      <circle cx="31" cy="12" r="0.8" fill="#fbbf24" opacity="0.8"/>
    </>
  )
}

/* ── ULTIMATE SAGE ────────────────────────────────── */
function UltSage({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* divine light aura */}
      <ellipse cx="16" cy="16" rx="15" ry="15" fill={c.eye} opacity="0.1"/>
      {/* large wings */}
      <path d="M5,16 Q0,6 2,20 Q4,19 5,18" fill={c.light} opacity="0.8"/>
      <path d="M5,16 Q-1,12 0,22 Q3,22 5,20" fill={c.body} opacity="0.5"/>
      <path d="M27,16 Q32,6 30,20 Q28,19 27,18" fill={c.light} opacity="0.8"/>
      <path d="M27,16 Q33,12 32,22 Q29,22 27,20" fill={c.body} opacity="0.5"/>
      {/* grand crown */}
      <rect x="7" y="1" width="18" height="3" fill="#fbbf24"/>
      <polygon points="8,1 8,4 11,1" fill="#fef08a"/>
      <polygon points="15,0 13,4 19,4 17,0" fill="white"/>
      <polygon points="24,1 24,4 21,1" fill="#fef08a"/>
      <circle cx="16" cy="0" r="1.5" fill="#60a5fa"/>
      <circle cx="10" cy="1" r="1" fill="#f472b6"/>
      <circle cx="22" cy="1" r="1" fill="#34d399"/>
      {/* head */}
      <rect x="5" y="3" width="22" height="14" rx="5" fill={c.body}/>
      <ellipse cx="13" cy="7" rx="5" ry="2.5" fill={c.light} opacity="0.45"/>
      {/* radiant eyes */}
      <ellipse cx="11" cy="10" rx="4" ry="4" fill="white"/>
      <ellipse cx="21" cy="10" rx="4" ry="4" fill="white"/>
      <ellipse cx="11" cy="10" rx="4" ry="4" fill={c.eye} opacity="0.4"/>
      <ellipse cx="21" cy="10" rx="4" ry="4" fill={c.eye} opacity="0.4"/>
      <circle cx="11" cy="10" r="2.2" fill={c.pupil}/>
      <circle cx="21" cy="10" r="2.2" fill={c.pupil}/>
      <circle cx="10" cy="9" r="0.9" fill="white"/>
      <circle cx="20" cy="9" r="0.9" fill="white"/>
      {/* wise smile */}
      <path d="M13,15 Q16,17 19,15" fill="none" stroke={c.dark} strokeWidth="1" strokeLinecap="round"/>
      {/* flowing robe */}
      <rect x="5" y="16" width="22" height="13" rx="5" fill={c.accent}/>
      <rect x="8" y="16" width="16" height="13" rx="4" fill={c.body}/>
      {/* robe patterns */}
      <rect x="14" y="17" width="4" height="11" fill={c.eye} opacity="0.2"/>
      <rect x="9" y="20" width="14" height="1" fill={c.eye} opacity="0.2"/>
      <rect x="9" y="24" width="14" height="1" fill={c.eye} opacity="0.2"/>
      {/* powerful staff */}
      <rect x="28" y="5" width="2" height="22" rx="1" fill="#92400e"/>
      <circle cx="29" cy="5" r="3.5" fill={c.eye}/>
      <circle cx="29" cy="5" r="2" fill="white" opacity="0.7"/>
      <circle cx="29" cy="5" r="1" fill={c.accent}/>
      {/* orbiting spheres */}
      <circle cx="3" cy="16" r="2.5" fill={c.eye} opacity="0.9"/>
      <circle cx="3" cy="16" r="1.2" fill="white" opacity="0.6"/>
      <circle cx="5" cy="28" r="1.8" fill={c.eye} opacity="0.7"/>
      {/* feet */}
      <ellipse cx="12" cy="29" rx="3.5" ry="2" fill={c.dark}/>
      <ellipse cx="20" cy="29" rx="3.5" ry="2" fill={c.dark}/>
      {/* light particles everywhere */}
      <circle cx="2" cy="8" r="1" fill="#fef08a" opacity="0.9"/>
      <circle cx="30" cy="10" r="0.8" fill="#fef08a" opacity="0.8"/>
      <circle cx="1" cy="25" r="0.8" fill={c.eye} opacity="0.7"/>
      <circle cx="31" cy="28" r="0.8" fill={c.eye} opacity="0.7"/>
    </>
  )
}

/* ── ULTIMATE DARK ────────────────────────────────── */
function UltDark({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* massive dark aura */}
      <ellipse cx="16" cy="16" rx="15" ry="15" fill={c.dark} opacity="0.3"/>
      <ellipse cx="16" cy="16" rx="15" ry="15" fill="none" stroke={c.accent} strokeWidth="1" opacity="0.5"/>
      {/* five horns */}
      <polygon points="6,0 3,7 9,6" fill={c.dark}/>
      <polygon points="11,0 8,5 14,5" fill={c.accent}/>
      <polygon points="16,0 13,4 19,4" fill={c.dark}/>
      <polygon points="21,0 18,5 24,5" fill={c.accent}/>
      <polygon points="26,0 23,6 29,7" fill={c.dark}/>
      {/* head */}
      <rect x="4" y="5" width="24" height="13" rx="4" fill={c.body}/>
      <ellipse cx="16" cy="7" rx="10" ry="3" fill={c.dark} opacity="0.3"/>
      {/* demonic glowing eyes */}
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill={c.eye}/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill={c.eye}/>
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill={c.light} opacity="0.5"/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill={c.light} opacity="0.5"/>
      <ellipse cx="11" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <ellipse cx="21" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <circle cx="9.8" cy="10.5" r="0.9" fill="white"/>
      <circle cx="19.8" cy="10.5" r="0.9" fill="white"/>
      {/* sinister wide grin */}
      <path d="M9,16 Q16,21 23,16" fill={c.dark} strokeWidth="1"/>
      <path d="M9,16 Q16,21 23,16" fill="none" stroke="white" strokeWidth="0.8"/>
      {[10,13,16,19,22].map(x => (
        <polygon key={x} points={`${x},16 ${x+1},19 ${x+2},16`} fill="white" opacity="0.85"/>
      ))}
      {/* body */}
      <rect x="5" y="17" width="22" height="12" rx="3" fill={c.body}/>
      <ellipse cx="16" cy="23" rx="7" ry="5" fill={c.dark} opacity="0.35"/>
      {/* massive bat wings */}
      <path d="M5,18 L0,4 L3,20 L0,28 L5,24" fill={c.dark} opacity="0.92"/>
      <path d="M27,18 L32,4 L29,20 L32,28 L27,24" fill={c.dark} opacity="0.92"/>
      {/* wing veins */}
      <line x1="5" y1="18" x2="0" y2="8" stroke={c.accent} strokeWidth="0.7" opacity="0.6"/>
      <line x1="5" y1="20" x2="1" y2="24" stroke={c.accent} strokeWidth="0.7" opacity="0.6"/>
      <line x1="27" y1="18" x2="32" y2="8" stroke={c.accent} strokeWidth="0.7" opacity="0.6"/>
      <line x1="27" y1="20" x2="31" y2="24" stroke={c.accent} strokeWidth="0.7" opacity="0.6"/>
      {/* dark energy flames */}
      <ellipse cx="16" cy="30" rx="5" ry="2.5" fill={c.accent} opacity="0.6"/>
      <ellipse cx="16" cy="29" rx="3" ry="1.5" fill={c.light} opacity="0.4"/>
      {/* legs */}
      <rect x="8" y="28" width="6" height="4" rx="2" fill={c.dark}/>
      <rect x="18" y="28" width="6" height="4" rx="2" fill={c.dark}/>
      <polygon points="8,32 11,29 14,32" fill={c.accent}/>
      <polygon points="18,32 21,29 24,32" fill={c.accent}/>
      {/* evil particles */}
      <circle cx="2" cy="12" r="1.2" fill={c.light} opacity="0.8"/>
      <circle cx="30" cy="10" r="1.2" fill={c.light} opacity="0.8"/>
      <circle cx="1" cy="22" r="1" fill={c.accent} opacity="0.7"/>
      <circle cx="31" cy="22" r="1" fill={c.accent} opacity="0.7"/>
    </>
  )
}

/* ── ULTIMATE BALANCE ─────────────────────────────── */
function UltBalance({ c }: { c: typeof C.default }) {
  return (
    <>
      {/* divine aura */}
      <ellipse cx="16" cy="16" rx="15" ry="15" fill={c.eye} opacity="0.12"/>
      {/* large halo */}
      <ellipse cx="16" cy="5" rx="12" ry="3.5" fill="none" stroke="#fbbf24" strokeWidth="2"/>
      <ellipse cx="16" cy="5" rx="12" ry="3.5" fill="none" stroke="#fef9c3" strokeWidth="0.8" opacity="0.8"/>
      {/* nature crown */}
      {[-4,-2,0,2,4].map((offset, i) => (
        <ellipse key={i} cx={16+offset*2} cy={3+Math.abs(offset)*0.5} rx="1.8" ry="1" fill={i===2?c.accent:c.dark} opacity="0.85" transform={`rotate(${offset*10},${16+offset*2},3)`}/>
      ))}
      {/* head */}
      <rect x="5" y="4" width="22" height="14" rx="6" fill={c.body}/>
      <ellipse cx="13" cy="8" rx="6" ry="3" fill={c.light} opacity="0.4"/>
      {/* peaceful radiant eyes */}
      <ellipse cx="11" cy="11" rx="4" ry="4" fill="white"/>
      <ellipse cx="21" cy="11" rx="4" ry="4" fill="white"/>
      <ellipse cx="11" cy="11" rx="4" ry="4" fill={c.eye} opacity="0.35"/>
      <ellipse cx="21" cy="11" rx="4" ry="4" fill={c.eye} opacity="0.35"/>
      {/* crescent pupils */}
      <ellipse cx="11.5" cy="11.5" rx="2.5" ry="2.5" fill={c.body}/>
      <ellipse cx="21.5" cy="11.5" rx="2.5" ry="2.5" fill={c.body}/>
      <circle cx="10.3" cy="10.3" r="0.9" fill="white"/>
      <circle cx="20.3" cy="10.3" r="0.9" fill="white"/>
      {/* blissful smile */}
      <path d="M12,16 Q16,19 20,16" fill="none" stroke={c.dark} strokeWidth="1.1" strokeLinecap="round"/>
      {/* rosy cheeks */}
      <ellipse cx="8" cy="14" rx="2.2" ry="1.4" fill="#f9a8d4" opacity="0.6"/>
      <ellipse cx="24" cy="14" rx="2.2" ry="1.4" fill="#f9a8d4" opacity="0.6"/>
      {/* flowing body */}
      <rect x="5" y="17" width="22" height="13" rx="6" fill={c.body}/>
      <ellipse cx="16" cy="23" rx="8" ry="6" fill={c.light} opacity="0.25"/>
      {/* large yin-yang */}
      <circle cx="16" cy="23" r="6" fill={c.dark} opacity="0.45"/>
      <path d="M16,17 A6,6 0 0,1 16,29 A3,3 0 0,0 16,23 A3,3 0 0,1 16,17" fill={c.light} opacity="0.6"/>
      <circle cx="16" cy="20" r="1.5" fill={c.dark} opacity="0.7"/>
      <circle cx="16" cy="26" r="1.5" fill={c.light} opacity="0.7"/>
      {/* large nature wings */}
      <path d="M5,19 Q-1,12 0,23 Q2,23 5,21" fill={c.body} opacity="0.7"/>
      <path d="M5,19 Q0,10 1,20" fill={c.light} opacity="0.5"/>
      <path d="M27,19 Q33,12 32,23 Q30,23 27,21" fill={c.body} opacity="0.7"/>
      <path d="M27,19 Q32,10 31,20" fill={c.light} opacity="0.5"/>
      {/* legs */}
      <rect x="9" y="29" width="5" height="3" rx="2.5" fill={c.accent}/>
      <rect x="18" y="29" width="5" height="3" rx="2.5" fill={c.accent}/>
      {/* divine light particles */}
      {[[2,8],[30,6],[1,20],[31,18],[4,28],[28,30]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i%2===0?1:0.7} fill={c.eye} opacity={0.7+i*0.05}/>
      ))}
    </>
  )
}

/* ── ULTIMATE DEFAULT ─────────────────────────────── */
function UltDefault({ c }: { c: typeof C.default }) {
  return (
    <>
      <ellipse cx="16" cy="16" rx="14" ry="14" fill={c.body} opacity="0.15"/>
      <polygon points="10,0 7,6 13,5" fill={c.dark}/>
      <polygon points="16,0 13,4 19,4" fill={c.dark}/>
      <polygon points="22,0 19,5 25,6" fill={c.dark}/>
      <rect x="4" y="4" width="24" height="14" rx="4" fill={c.body}/>
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill="white"/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill="white"/>
      <ellipse cx="11" cy="11" rx="4" ry="3.5" fill={c.eye} opacity="0.4"/>
      <ellipse cx="21" cy="11" rx="4" ry="3.5" fill={c.eye} opacity="0.4"/>
      <ellipse cx="11" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <ellipse cx="21" cy="12" rx="2.2" ry="2" fill={c.pupil}/>
      <circle cx="9.8" cy="10.5" r="0.8" fill="white"/>
      <circle cx="19.8" cy="10.5" r="0.8" fill="white"/>
      <path d="M13,16 Q16,18 19,16" fill="none" stroke={c.dark} strokeWidth="0.9" strokeLinecap="round"/>
      <rect x="5" y="17" width="22" height="12" rx="3" fill={c.body}/>
      <path d="M4,18 L0,8 L2,20 L0,26 L4,23" fill={c.accent} opacity="0.8"/>
      <path d="M28,18 L32,8 L30,20 L32,26 L28,23" fill={c.accent} opacity="0.8"/>
      <ellipse cx="16" cy="22" rx="7" ry="5" fill={c.light} opacity="0.25"/>
      <rect x="8" y="28" width="6" height="4" rx="2" fill={c.dark}/>
      <rect x="18" y="28" width="6" height="4" rx="2" fill={c.dark}/>
      <circle cx="2" cy="6" r="1.2" fill={c.eye} opacity="0.9"/>
      <circle cx="30" cy="4" r="1.2" fill={c.eye} opacity="0.9"/>
    </>
  )
}

/* ── ELDER ────────────────────────────────────────── */
function ElderBody({ c, evolutionType }: { c: typeof C.default; evolutionType?: EvolutionType | null }) {
  const accentColor = evolutionType
    ? C[evolutionType].accent
    : c.accent
  return (
    <>
      {/* faded aura */}
      <ellipse cx="16" cy="16" rx="12" ry="12" fill={accentColor} opacity="0.08"/>
      {/* wrinkled head - slightly smaller */}
      <rect x="7" y="4" width="18" height="13" rx="5" fill={c.body}/>
      <ellipse cx="14" cy="7" rx="4" ry="2" fill={c.light} opacity="0.35"/>
      {/* white hair wisps */}
      <path d="M8,5 Q7,2 9,3" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
      <path d="M13,4 Q12,1 14,2" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
      <path d="M19,4 Q20,1 21,3" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
      <path d="M23,5 Q25,2 24,4" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
      {/* tired wise eyes */}
      <ellipse cx="12" cy="10" rx="3" ry="2" fill="white"/>
      <ellipse cx="20" cy="10" rx="3" ry="2" fill="white"/>
      {/* wrinkle over eyes */}
      <path d="M9,9 Q12,8 15,9" fill="none" stroke={c.dark} strokeWidth="0.7" opacity="0.5"/>
      <path d="M17,9 Q20,8 23,9" fill="none" stroke={c.dark} strokeWidth="0.7" opacity="0.5"/>
      <ellipse cx="12" cy="10.5" rx="1.8" ry="1.5" fill={c.eye}/>
      <ellipse cx="20" cy="10.5" rx="1.8" ry="1.5" fill={c.eye}/>
      <circle cx="11.5" cy="10" r="0.5" fill="white"/>
      <circle cx="19.5" cy="10" r="0.5" fill="white"/>
      {/* gentle old smile */}
      <path d="M12,14 Q16,16 20,14" fill="none" stroke={c.dark} strokeWidth="0.9" strokeLinecap="round"/>
      {/* wrinkle lines */}
      <path d="M10,12 Q9,13 10,14" fill="none" stroke={c.dark} strokeWidth="0.5" opacity="0.4"/>
      <path d="M22,12 Q23,13 22,14" fill="none" stroke={c.dark} strokeWidth="0.5" opacity="0.4"/>
      {/* small hunched body */}
      <rect x="8" y="16" width="16" height="10" rx="4" fill={c.body}/>
      <ellipse cx="16" cy="21" rx="5" ry="3.5" fill={c.light} opacity="0.25"/>
      {/* small arms */}
      <rect x="3" y="17" width="6" height="6" rx="3" fill={c.body}/>
      <rect x="23" y="17" width="6" height="6" rx="3" fill={c.body}/>
      {/* staff */}
      <rect x="25" y="8" width="1.5" height="22" rx="0.8" fill="#78716c"/>
      <ellipse cx="25.75" cy="8" rx="2" ry="2" fill={accentColor} opacity="0.8"/>
      <circle cx="25.75" cy="8" r="1" fill="white" opacity="0.5"/>
      {/* short legs */}
      <rect x="10" y="25" width="4" height="5" rx="2" fill={c.dark}/>
      <rect x="18" y="25" width="4" height="5" rx="2" fill={c.dark}/>
      {/* small memory glimmer */}
      <circle cx="4" cy="14" r="1" fill={accentColor} opacity="0.5"/>
      <circle cx="6" cy="8" r="0.7" fill="white" opacity="0.4"/>
    </>
  )
}
