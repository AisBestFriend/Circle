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
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="#fde68a" />
          <ellipse cx="8" cy="9" rx="5" ry="6" fill="none" stroke="#d97706" strokeWidth="0.5" />
          <ellipse cx="6" cy="6" rx="1.5" ry="1" fill="#fef9c3" opacity="0.7" />
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
          <rect x="4" y="2" width="8" height="6" rx="3" fill={colors.body} />
          <rect x="5" y="8" width="6" height="4" rx="2" fill={colors.body} />
          <rect x="2" y="9" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="11" y="9" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="6" y="4" width="1" height="1" fill={colors.eye} />
          <rect x="9" y="4" width="1" height="1" fill={colors.eye} />
          <rect x="5" y="6" width="1" height="1" fill={colors.accent} opacity="0.5" />
          <rect x="10" y="6" width="1" height="1" fill={colors.accent} opacity="0.5" />
          <rect x="7" y="6" width="2" height="1" fill={colors.accent} />
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
          <rect x="8" y="0" width="2" height="1" fill={colors.accent} />
          <rect x="7" y="1" width="2" height="2" fill={colors.body} />
          <rect x="3" y="2" width="10" height="7" rx="2" fill={colors.body} />
          <rect x="5" y="4" width="2" height="2" fill={colors.eye} />
          <rect x="9" y="4" width="2" height="2" fill={colors.eye} />
          <rect x="6" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
          <rect x="4" y="9" width="8" height="4" rx="1" fill={colors.body} />
          <rect x="1" y="10" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="12" y="10" width="3" height="2" rx="1" fill={colors.body} />
          <rect x="5" y="13" width="2" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="2" height="3" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  if (stage === 'adult') {
    // 진화 타입별 다른 외형
    if (evolutionType === 'warrior') {
      // 전사형: 뿔 2개, 날카로운 눈, 방패 문양
      return (
        <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
          <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            {/* 날카로운 뿔 2개 */}
            <polygon points="4,0 3,3 5,3" fill={colors.accent} />
            <polygon points="12,0 11,3 13,3" fill={colors.accent} />
            {/* 머리 */}
            <rect x="2" y="2" width="12" height="7" rx="1" fill={colors.body} />
            {/* 날카로운 눈 (삼각형 눈썹) */}
            <rect x="4" y="3" width="3" height="2" fill={colors.eye} />
            <rect x="9" y="3" width="3" height="2" fill={colors.eye} />
            <rect x="4" y="3" width="3" height="1" fill={colors.accent} opacity="0.7" />
            <rect x="9" y="3" width="3" height="1" fill={colors.accent} opacity="0.7" />
            <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
            <rect x="10" y="4" width="1" height="1" fill="#1f2937" />
            {/* 이빨 */}
            <rect x="6" y="7" width="1" height="2" fill="white" />
            <rect x="9" y="7" width="1" height="2" fill="white" />
            {/* 근육질 몸 */}
            <rect x="2" y="8" width="12" height="5" rx="1" fill={colors.body} />
            {/* 가슴 문양 */}
            <rect x="6" y="9" width="4" height="1" fill={colors.accent} />
            <rect x="7" y="10" width="2" height="2" fill={colors.accent} />
            {/* 굵은 팔 */}
            <rect x="0" y="8" width="2" height="5" rx="1" fill={colors.body} />
            <rect x="14" y="8" width="2" height="5" rx="1" fill={colors.body} />
            {/* 다리 */}
            <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
            <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          </svg>
        </div>
      )
    }

    if (evolutionType === 'sage') {
      // 현자형: 왕관, 별 눈, 긴 망토
      return (
        <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
          <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            {/* 왕관 */}
            <rect x="3" y="0" width="10" height="2" fill="#fbbf24" />
            <rect x="3" y="0" width="2" height="3" fill="#fbbf24" />
            <rect x="7" y="0" width="2" height="4" fill="#fef08a" />
            <rect x="11" y="0" width="2" height="3" fill="#fbbf24" />
            {/* 머리 */}
            <rect x="2" y="2" width="12" height="7" rx="2" fill={colors.body} />
            {/* 별 모양 눈 */}
            <rect x="4" y="3" width="3" height="3" fill={colors.eye} />
            <rect x="3" y="4" width="5" height="1" fill={colors.eye} />
            <rect x="9" y="3" width="3" height="3" fill={colors.eye} />
            <rect x="8" y="4" width="5" height="1" fill={colors.eye} />
            <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
            <rect x="10" y="4" width="1" height="1" fill="#1f2937" />
            {/* 부드러운 미소 */}
            <rect x="5" y="7" width="6" height="1" fill={colors.accent} rx="0.5" />
            {/* 망토 */}
            <rect x="1" y="8" width="14" height="5" rx="1" fill={colors.accent} opacity="0.6" />
            <rect x="3" y="8" width="10" height="5" rx="1" fill={colors.body} />
            {/* 지팡이 */}
            <rect x="14" y="6" width="1" height="10" fill="#6b7280" />
            <rect x="13" y="6" width="3" height="1" fill="#fbbf24" />
            {/* 마법 파티클 */}
            <rect x="1" y="5" width="1" height="1" fill="#fef08a" opacity="0.8" />
            <rect x="0" y="9" width="1" height="1" fill={colors.eye} opacity="0.6" />
            {/* 다리 */}
            <rect x="5" y="13" width="2" height="3" rx="1" fill={colors.accent} />
            <rect x="9" y="13" width="2" height="3" rx="1" fill={colors.accent} />
          </svg>
        </div>
      )
    }

    if (evolutionType === 'dark') {
      // 다크형: 뿔 3개, 날개, 어두운 오라
      return (
        <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
          <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            {/* 어두운 오라 */}
            <circle cx="8" cy="8" r="7" fill={colors.accent} opacity="0.15" />
            {/* 뿔 3개 */}
            <polygon points="5,0 4,3 6,3" fill={colors.accent} />
            <polygon points="8,0 7,2 9,2" fill={colors.accent} />
            <polygon points="11,0 10,3 12,3" fill={colors.accent} />
            {/* 머리 */}
            <rect x="2" y="2" width="12" height="7" rx="2" fill={colors.body} />
            {/* 빛나는 눈 */}
            <rect x="4" y="3" width="3" height="3" fill={colors.eye} />
            <rect x="9" y="3" width="3" height="3" fill={colors.eye} />
            <rect x="4" y="3" width="3" height="1" fill={colors.eye} opacity="0.5" />
            <rect x="9" y="3" width="3" height="1" fill={colors.eye} opacity="0.5" />
            <rect x="5" y="4" width="1" height="1" fill="#0f172a" />
            <rect x="10" y="4" width="1" height="1" fill="#0f172a" />
            {/* 불길 입 */}
            <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
            <rect x="7" y="8" width="2" height="1" fill="#f97316" opacity="0.8" />
            {/* 몸 */}
            <rect x="2" y="8" width="12" height="5" rx="1" fill={colors.body} />
            {/* 박쥐 날개 */}
            <polygon points="0,6 2,8 2,12 0,14" fill={colors.accent} opacity="0.7" />
            <polygon points="16,6 14,8 14,12 16,14" fill={colors.accent} opacity="0.7" />
            {/* 다리 */}
            <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
            <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          </svg>
        </div>
      )
    }

    if (evolutionType === 'balance') {
      // 균형형: 광배, 음양 문양, 평화로운 표정
      return (
        <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
          <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            {/* 광배(후광) */}
            <circle cx="8" cy="5" r="5" fill="#fef08a" opacity="0.3" />
            <circle cx="8" cy="5" r="5" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.8" />
            {/* 나뭇잎 장식 */}
            <ellipse cx="4" cy="1" rx="1.5" ry="1" fill={colors.accent} opacity="0.7" />
            <ellipse cx="12" cy="1" rx="1.5" ry="1" fill={colors.accent} opacity="0.7" />
            {/* 머리 */}
            <rect x="2" y="2" width="12" height="7" rx="3" fill={colors.body} />
            {/* 평화로운 눈 (초승달 모양) */}
            <rect x="4" y="4" width="3" height="1" fill={colors.eye} />
            <rect x="5" y="5" width="1" height="1" fill={colors.eye} />
            <rect x="9" y="4" width="3" height="1" fill={colors.eye} />
            <rect x="10" y="5" width="1" height="1" fill={colors.eye} />
            {/* 미소 */}
            <rect x="5" y="7" width="1" height="1" fill={colors.accent} />
            <rect x="6" y="8" width="4" height="1" fill={colors.accent} />
            <rect x="10" y="7" width="1" height="1" fill={colors.accent} />
            {/* 몸 - 둥근 */}
            <rect x="2" y="8" width="12" height="5" rx="2" fill={colors.body} />
            {/* 음양 문양 */}
            <circle cx="8" cy="11" r="2" fill={colors.accent} opacity="0.5" />
            <circle cx="8" cy="10" r="1" fill={colors.body} opacity="0.8" />
            <circle cx="8" cy="12" r="1" fill={colors.accent} />
            {/* 팔 (우아하게) */}
            <rect x="0" y="9" width="2" height="3" rx="1" fill={colors.body} />
            <rect x="14" y="9" width="2" height="3" rx="1" fill={colors.body} />
            {/* 다리 */}
            <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
            <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          </svg>
        </div>
      )
    }

    // default adult (진화 전)
    return (
      <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="7" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="11" y="0" width="2" height="2" fill={colors.accent} />
          <rect x="2" y="1" width="12" height="7" rx="2" fill={colors.body} />
          <rect x="4" y="3" width="3" height="2" fill={colors.eye} />
          <rect x="9" y="3" width="3" height="2" fill={colors.eye} />
          <rect x="5" y="4" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="4" width="1" height="1" fill="#1f2937" />
          <rect x="5" y="6" width="1" height="1" fill={colors.accent} />
          <rect x="6" y="7" width="4" height="1" fill={colors.accent} />
          <rect x="10" y="6" width="1" height="1" fill={colors.accent} />
          <rect x="2" y="8" width="12" height="5" rx="1" fill={colors.body} />
          <rect x="0" y="8" width="2" height="4" rx="1" fill={colors.body} />
          <rect x="14" y="8" width="2" height="4" rx="1" fill={colors.body} />
          <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
        </svg>
      </div>
    )
  }

  if (stage === 'ultimate') {
    return (
      <div className={`inline-block ${animate ? 'animate-pulse' : ''}`} style={{ imageRendering: 'pixelated', width: px, height: px }}>
        <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`@keyframes auraPulse{0%,100%{opacity:.08}50%{opacity:.3}}.aura-glow{animation:auraPulse 1.8s ease-in-out infinite}`}</style>
          </defs>
          <circle cx="8" cy="8" r="7.5" fill={colors.body} className="aura-glow" />
          <rect x="4" y="0" width="2" height="3" fill="#fbbf24" />
          <rect x="7" y="0" width="2" height="4" fill="#fef08a" />
          <rect x="10" y="0" width="2" height="3" fill="#fbbf24" />
          <rect x="3" y="2" width="10" height="2" fill="#fbbf24" opacity="0.7" />
          <rect x="2" y="2" width="12" height="7" rx="2" fill={colors.body} />
          <rect x="4" y="4" width="3" height="2" fill={colors.eye} />
          <rect x="9" y="4" width="3" height="2" fill={colors.eye} />
          <rect x="4" y="4" width="3" height="2" fill={colors.eye} opacity="0.5" />
          <rect x="9" y="4" width="3" height="2" fill={colors.eye} opacity="0.5" />
          <rect x="5" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="10" y="5" width="1" height="1" fill="#1f2937" />
          <rect x="2" y="9" width="12" height="4" rx="1" fill={colors.body} />
          <polygon points="0,9 2,7 2,13" fill={colors.accent} opacity="0.85" />
          <polygon points="16,9 14,7 14,13" fill={colors.accent} opacity="0.85" />
          <rect x="4" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          <rect x="9" y="13" width="3" height="3" rx="1" fill={colors.accent} />
          <rect x="1" y="2" width="1" height="1" fill="#fef08a" opacity="0.9" />
          <rect x="14" y="3" width="1" height="1" fill="#fef08a" opacity="0.9" />
          <rect x="0" y="6" width="1" height="1" fill="#fef08a" opacity="0.6" />
          <rect x="15" y="7" width="1" height="1" fill="#fef08a" opacity="0.6" />
        </svg>
      </div>
    )
  }

  // Elder
  return (
    <div className="inline-block" style={{ imageRendering: 'pixelated', width: px, height: px }}>
      <svg width={px} height={px} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="4" width="1" height="12" fill="#6b7280" />
        <rect x="10" y="4" width="3" height="1" rx="0.5" fill="#4b5563" />
        <rect x="3" y="2" width="8" height="6" rx="2" fill={colors.body} />
        <rect x="4" y="4" width="2" height="1" rx="0.5" fill={colors.eye} opacity="0.5" />
        <rect x="8" y="4" width="2" height="1" rx="0.5" fill={colors.eye} opacity="0.5" />
        <rect x="5" y="4" width="1" height="1" fill={colors.eye} />
        <rect x="9" y="4" width="1" height="1" fill={colors.eye} />
        <rect x="6" y="6" width="3" height="1" fill={colors.accent} />
        <rect x="3" y="8" width="8" height="4" rx="1" fill={colors.body} />
        <rect x="11" y="10" width="2" height="2" rx="1" fill={colors.body} />
        <rect x="1" y="10" width="2" height="2" rx="1" fill={colors.body} />
        <rect x="4" y="12" width="2" height="3" rx="1" fill={colors.accent} />
        <rect x="7" y="12" width="2" height="3" rx="1" fill={colors.accent} />
      </svg>
    </div>
  )
}
