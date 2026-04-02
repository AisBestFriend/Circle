'use client'

import { PetStage, EvolutionType } from '@/types/game'

interface PixelPetProps {
  stage: PetStage
  evolutionType?: EvolutionType | null
  size?: 'sm' | 'md' | 'lg'
  animate?: boolean
}

const petColors: Record<EvolutionType | 'default', { body: string; eye: string; accent: string }> = {
  warrior: { body: '#ef4444', eye: '#fbbf24', accent: '#dc2626' },
  sage: { body: '#3b82f6', eye: '#a5f3fc', accent: '#1d4ed8' },
  dark: { body: '#7c3aed', eye: '#f0abfc', accent: '#4c1d95' },
  balance: { body: '#10b981', eye: '#fde68a', accent: '#047857' },
  default: { body: '#f59e0b', eye: '#1f2937', accent: '#d97706' },
}

export function PixelPet({ stage, evolutionType, size = 'md', animate = true }: PixelPetProps) {
  const colors = evolutionType ? petColors[evolutionType] : petColors.default
  const sizeMap = { sm: 48, md: 80, lg: 128 }
  const px = sizeMap[size]

  if (stage === 'egg') {
    return (
      <div
        className={`inline-block ${animate ? 'animate-bounce' : ''}`}
        style={{ imageRendering: 'pixelated', width: px, height: px }}
      >
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="#fde68a" />
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="none" stroke="#d97706" strokeWidth="1" />
          <ellipse cx="6" cy="7" rx="1" ry="1.5" fill="#fcd34d" opacity="0.6" />
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
          {/* Body */}
          <rect x="5" y="7" width="6" height="6" rx="1" fill={colors.body} />
          {/* Head */}
          <rect x="4" y="3" width="8" height="7" rx="2" fill={colors.body} />
          {/* Eyes */}
          <rect x="6" y="5" width="2" height="2" fill={colors.eye} />
          <rect x="9" y="5" width="2" height="2" fill={colors.eye} />
          {/* Pupils */}
          <rect x="6" y="6" width="1" height="1" fill="#1f2937" />
          <rect x="9" y="6" width="1" height="1" fill="#1f2937" />
          {/* Mouth */}
          <rect x="7" y="8" width="2" height="1" fill={colors.accent} />
          {/* Feet */}
          <rect x="5" y="13" width="2" height="2" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="2" height="2" rx="1" fill={colors.accent} />
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
          {/* Body */}
          <rect x="4" y="8" width="8" height="5" rx="1" fill={colors.body} />
          {/* Head */}
          <rect x="3" y="2" width="10" height="8" rx="2" fill={colors.body} />
          {/* Eyes */}
          <rect x="5" y="4" width="2" height="3" fill={colors.eye} />
          <rect x="9" y="4" width="2" height="3" fill={colors.eye} />
          <rect x="5" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="9" y="5" width="1" height="1" fill="#1f2937" />
          {/* Mouth */}
          <rect x="6" y="8" width="4" height="1" fill={colors.accent} />
          {/* Arms */}
          <rect x="1" y="9" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="12" y="9" width="3" height="2" rx="1" fill={colors.body} />
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
          {/* Body */}
          <rect x="4" y="7" width="8" height="6" rx="1" fill={colors.body} />
          {/* Head */}
          <rect x="3" y="1" width="10" height="8" rx="2" fill={colors.body} />
          {/* Crown/Hair */}
          <rect x="4" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="7" y="0" width="2" height="3" fill={colors.accent} />
          <rect x="10" y="0" width="2" height="2" fill={colors.accent} />
          {/* Eyes */}
          <rect x="5" y="3" width="2" height="3" fill={colors.eye} />
          <rect x="9" y="3" width="2" height="3" fill={colors.eye} />
          <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
          <rect x="9" y="4" width="1" height="1" fill="#1f2937" />
          {/* Smile */}
          <rect x="6" y="7" width="1" height="1" fill={colors.accent} />
          <rect x="7" y="8" width="2" height="1" fill={colors.accent} />
          <rect x="9" y="7" width="1" height="1" fill={colors.accent} />
          {/* Arms */}
          <rect x="1" y="8" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="12" y="8" width="3" height="2" rx="1" fill={colors.body} />
          {/* Legs */}
          <rect x="5" y="13" width="2" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="2" height="3" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  // Ultimate
  return (
    <div
      className={`inline-block ${animate ? 'animate-pulse' : ''}`}
      style={{ imageRendering: 'pixelated', width: px, height: px }}
    >
      <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        {/* Aura */}
        <circle cx="8" cy="8" r="7" fill={colors.body} opacity="0.2" />
        {/* Body */}
        <rect x="4" y="7" width="8" height="6" rx="1" fill={colors.body} />
        {/* Head */}
        <rect x="3" y="1" width="10" height="8" rx="2" fill={colors.body} />
        {/* Wings */}
        <polygon points="0,6 3,4 3,10" fill={colors.accent} opacity="0.8" />
        <polygon points="16,6 13,4 13,10" fill={colors.accent} opacity="0.8" />
        {/* Crown */}
        <rect x="5" y="0" width="2" height="2" fill="#fbbf24" />
        <rect x="7" y="0" width="2" height="3" fill="#fbbf24" />
        <rect x="9" y="0" width="2" height="2" fill="#fbbf24" />
        {/* Eyes - glowing */}
        <rect x="5" y="3" width="2" height="3" fill={colors.eye} />
        <rect x="9" y="3" width="2" height="3" fill={colors.eye} />
        <rect x="5" y="3" width="2" height="3" fill={colors.eye} opacity="0.5" />
        {/* Pupils */}
        <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
        <rect x="9" y="4" width="1" height="1" fill="#1f2937" />
        {/* Smile */}
        <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
        {/* Legs */}
        <rect x="5" y="13" width="2" height="3" rx="1" fill={colors.accent} />
        <rect x="9" y="13" width="2" height="3" rx="1" fill={colors.accent} />
      </svg>
    </div>
  )
}
