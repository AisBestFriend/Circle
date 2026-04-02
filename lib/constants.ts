export const STAGE_LABELS: Record<string, string> = {
  egg: '알',
  baby: '유아기',
  teen: '성숙기',
  adult: '완전체',
  ultimate: '궁극체',
}

export const HUNGER_DECAY_PER_HOUR = 5
export const HAPPINESS_DECAY_PER_HOUR = 3
export const ENERGY_DECAY_PER_HOUR = 4
export const ULTIMATE_STAT_DECAY_PER_DAY = 10

export const STAGE_DURATION_DAYS: Record<string, number> = {
  egg: 1,
  baby: 2,
  teen: 4,
  adult: Infinity,
  ultimate: Infinity,
}
