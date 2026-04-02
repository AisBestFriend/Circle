'use client'

import { PetStage, EvolutionType } from '@/types/game'

interface PixelPetProps {
  stage: PetStage
  evolutionType?: EvolutionType | null
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const petColors: Record<EvolutionType | 'default', { body: string; eye: string; accent: string }> = {
  warrior: { body: '#ef4444', eye: '#fef08a', accent: '#991b1b' },
  sage: { body: '#818cf8', eye: '#bae6fd', accent: '#3730a3' },
  dark: { body: '#a855f7', eye: '#f0abfc', accent: '#3b0764' },
  balance: { body: '#10b981', eye: '#fde68a', accent: '#064e3b' },
  default: { body: '#9ca3af', eye: '#e5e7eb', accent: '#374151' },
}

const elderColors = { body: '#e2e8f0', eye: '#94a3b8', accent: '#cbd5e1' }

export function PixelPet({ stage, evolutionType, size = 'md', animate = true }: PixelPetProps) {
  const colors = stage === 'elder'
    ? elderColors
    : evolutionType ? petColors[evolutionType] : petColors.default
  const sizeMap = { sm: 48, md: 80, lg: 128 }
  const px = sizeMap[size]

  if (stage === 'egg') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-bounce' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          {/* Egg body */}
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="#fde68a" />
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="none" stroke="#d97706" strokeWidth="0.5" />
          {/* Shine */}
          <ellipse cx="6" cy="6" rx="1.5" ry="1" fill="#fef9c3" opacity="0.7" />
          {/* Eyes - two small dots */}
          <rect x="6" y="9" width="1" height="1" fill="#1f2937" />
          <rect x="9" y="9" width="1" height="1" fill="#1f2937" />
        </svg>
      </div>
    )
  }

  if (stage === 'baby') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-bounce' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          {/* Head - big and round */}
          <rect x="4" y="2" width="8" height="6" rx="3" fill={colors.body} />
          {/* Body - small round */}
          <rect x="5" y="8" width="6" height="4" rx="2" fill={colors.body} />
          {/* Tiny arm nubs */}
          <rect x="2" y="9" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="11" y="9" width="3" height="2" rx="1" fill={colors.body} />
          {/* Eyes */}
          <rect x="6" y="4" width="1" height="1" fill={colors.eye} />
          <rect x="9" y="4" width="1" height="1" fill={colors.eye} />
          {/* Rosy cheeks */}
          <rect x="5" y="6" width="1" height="1" fill={colors.accent} opacity="0.5" />
          <rect x="10" y="6" width="1" height="1" fill={colors.accent} opacity="0.5" />
          {/* Small mouth */}
          <rect x="7" y="6" width="2" height="1" fill={colors.accent} />
          {/* Feet */}
          <rect x="5" y="12" width="2" height="2" rx="1" fill={colors.accent} />
          <rect x="9" y="12" width="2" height="2" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  if (stage === 'teen') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-pulse' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          {/* Single horn */}
          <rect x="8" y="0" width="2" height="1" fill={colors.accent} />
          <rect x="7" y="1" width="2" height="2" fill={colors.body} />
          {/* Head */}
          <rect x="3" y="2" width="10" height="7" rx="2" fill={colors.body} />
          {/* Eyes - more defined with pupils */}
          <rect x="5" y="4" width="2" height="2" fill={colors.eye} />
          <rect x="9" y="4" width="2" height="2" fill={colors.eye} />
          <rect x="6" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="5" width="1" height="1" fill="#1f2937" />
          {/* Mouth */}
          <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
          {/* Body - medium */}
          <rect x="4" y="9" width="8" height="4" rx="1" fill={colors.body} />
          {/* Arms */}
          <rect x="1" y="10" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="12" y="10" width="3" height="2" rx="1" fill={colors.body} />
          {/* Legs */}
          <rect x="5" y="13" width="2" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="2" height="3" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  if (stage === 'adult') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-pulse' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          {/* Power spikes on head */}
          <rect x="3" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="7" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="11" y="0" width="2" height="2" fill={colors.accent} />
          {/* Head - wide/strong */}
          <rect x="2" y="1" width="12" height="7" rx="2" fill={colors.body} />
          {/* Eyes */}
          <rect x="4" y="3" width="3" height="2" fill={colors.eye} />
          <rect x="9" y="3" width="3" height="2" fill={colors.eye} />
          <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="4" width="1" height="1" fill="#1f2937" />
          {/* Smile */}
          <rect x="5" y="6" width="1" height="1" fill={colors.accent} />
          <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
          <rect x="10" y="6" width="1" height="1" fill={colors.accent} />
          {/* Body - wide/muscular */}
          <rect x="2" y="8" width="12" height="5" rx="1" fill={colors.body} />
          {/* Thick arms */}
          <rect x="0" y="8" width="2" height="4" rx="1" fill={colors.body} />
          <rect x="14" y="8" width="2" height="4" rx="1" fill={colors.body} />
          {/* Legs - sturdy */}
          <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  if (stage === 'ultimate') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-pulse' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`@keyframes auraPulse{0%,100%{opacity:.08}50%{opacity:.3}}.aura-glow{animation:auraPulse 1.8s ease-in-out infinite}`}</style>
          </defs>
          {/* Glowing aura */}
          <circle cx="8" cy="8" r="7.5" fill={colors.body} className="aura-glow" />
          {/* Crown spikes */}
          <rect x="4" y="0" width="2" height="3" fill="#fbbf24" />
          <rect x="7" y="0" width="2" height="4" fill="#fef08a" />
          <rect x="10" y="0" width="2" height="3" fill="#fbbf24" />
          {/* Crown base band */}
          <rect x="3" y="2" width="10" height="2" fill="#fbbf24" opacity="0.7" />
          {/* Head */}
          <rect x="2" y="2" width="12" height="7" rx="2" fill={colors.body} />
          {/* Glowing eyes (double layer) */}
          <rect x="4" y="4" width="3" height="2" fill={colors.eye} />
          <rect x="9" y="4" width="3" height="2" fill={colors.eye} />
          <rect x="4" y="4" width="3" height="2" fill={colors.eye} opacity="0.5" />
          <rect x="9" y="4" width="3" height="2" fill={colors.eye} opacity="0.5" />
          <rect x="5" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="5" width="1" height="1" fill="#1f2937" />
          {/* Body */}
          <rect x="2" y="9" width="12" height="4" rx="1" fill={colors.body} />
          {/* Wings */}
          <polygon points="0,9 2,7 2,13" fill={colors.accent} opacity="0.85" />
          <polygon points="16,9 14,7 14,13" fill={colors.accent} opacity="0.85" />
          {/* Legs */}
          <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          {/* Sparkles */}
          <rect x="1" y="2" width="1" height="1" fill="#fef08a" opacity="0.9" />
          <rect x="14" y="3" width="1" height="1" fill="#fef08a" opacity="0.9" />
          <rect x="0" y="6" width="1" height="1" fill="#fef08a" opacity="0.6" />
          <rect x="15" y="7" width="1" height="1" fill="#fef08a" opacity="0.6" />
        </svg>
      </div>
    )
  }

  // Elder - hunched with staff
  return (
    <div
      className="inline-block"
      style={{ imageRendering: 'pixelated', width: px, height: px }}
    >
      <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        {/* Staff / cane */}
        <rect x="12" y="4" width="1" height="12" fill="#6b7280" />
        <rect x="10" y="4" width="3" height="1" rx="0.5" fill="#4b5563" />
        {/* Head - slightly forward (hunched) */}
        <rect x="3" y="2" width="8" height="6" rx="2" fill={colors.body} />
        {/* Wrinkle lines */}
        <rect x="4" y="4" width="2" height="1" rx="0.5" fill={colors.eye} opacity="0.5" />
        <rect x="8" y="4" width="2" height="1" rx="0.5" fill={colors.eye} opacity="0.5" />
        {/* Tired eyes */}
        <rect x="5" y="4" width="1" height="1" fill={colors.eye} />
        <rect x="9" y="4" width="1" height="1" fill={colors.eye} />
        {/* Mouth */}
        <rect x="6" y="6" width="3" height="1" fill={colors.accent} />
        {/* Body - smaller/hunched */}
        <rect x="3" y="8" width="8" height="4" rx="1" fill={colors.body} />
        {/* Arm holding staff */}
        <rect x="11" y="10" width="2" height="2" rx="1" fill={colors.body} />
        {/* Other arm (drooping) */}
        <rect x="1" y="10" width="2" height="2" rx="1" fill={colors.body} />
        {/* Legs - shorter */}
        <rect x="4" y="12" width="2" height="3" rx="1" fill={colors.accent} />
        <rect x="7" y="12" width="2" height="3" rx="1" fill={colors.accent} />
      </svg>
    </div>
  )
}
