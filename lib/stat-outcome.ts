/**
 * 스탯이 최대치의 50% 초과 시 성공/유지/실패 확률 적용
 * @returns 'success' | 'neutral' | 'fail'
 */
export function calcStatOutcome(current: number, cap: number): 'success' | 'neutral' | 'fail' {
  const pct = (current / cap) * 100

  let successRate: number
  let failRate: number

  if (pct <= 50) return 'success'
  else if (pct <= 60) { successRate = 35; failRate = 20 }
  else if (pct <= 80) { successRate = 20; failRate = 30 }
  else if (pct <= 90) { successRate = 10; failRate = 30 }
  else               { successRate = 5;  failRate = 30 }

  const roll = Math.random() * 100
  if (roll < successRate) return 'success'
  if (roll < successRate + failRate) return 'fail'
  return 'neutral'
}
