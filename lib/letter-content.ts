export type LetterType = 'mock' | 'apologize' | 'love' | 'encourage'

const LETTER_TEMPLATES: Record<LetterType, { label: string; emoji: string; generate: (from: string, to: string) => string }> = {
  mock: {
    label: '조롱하기',
    emoji: '😈',
    generate: (from, to) => {
      const picks = [
        `${to}에게\n\n요즘 네 꼴 좀 봐. 솔직히 좀 웃기지 않냐? 내가 보기엔 그냥... 별로야. 앞으로도 크게 기대는 안 해.\n\n안부를 담아, ${from} 올림`,
        `${to}에게\n\n오늘 네가 생각나서 편지를 쓰는 게 아니야. 그냥 네가 얼마나 나랑 차이가 나는지 알려주고 싶었어. 기분 나쁘면 강해지든지.\n\n${from} 씀`,
        `${to}에게\n\n나 요즘 많이 컸다. 너는 어때? 아, 물어보나 마나 알겠다.\n\n${from} 씀`,
        `${to}에게\n\n솔직히 말할게. 네가 최선을 다하는 거 알아. 근데 그 최선이... 이 정도야? 아무튼 파이팅은 해.\n\n${from} 드림`,
      ]
      return picks[Math.floor(Math.random() * picks.length)]
    },
  },
  apologize: {
    label: '사과하기',
    emoji: '🙏',
    generate: (from, to) => {
      const picks = [
        `${to}에게\n\n그동안 미안했어. 내가 너한테 좋지 않게 굴었던 것 같아. 변명하고 싶지 않아. 그냥 진심으로 사과하고 싶었어.\n\n${from} 올림`,
        `${to}에게\n\n오래 고민했어. 이 편지를 써야 할지 말지. 근데 그냥 솔직하게 말하고 싶어 — 미안해. 정말로.\n\n${from} 드림`,
        `${to}에게\n\n나 요즘 우리 사이가 자꾸 마음에 걸려. 혹시 내가 상처준 게 있다면 사과할게. 앞으로 더 잘할게.\n\n${from} 씀`,
        `${to}에게\n\n편지로 이런 말을 전하는 게 좀 부끄럽지만... 미안해. 더 좋은 친구가 되고 싶어.\n\n${from} 올림`,
      ]
      return picks[Math.floor(Math.random() * picks.length)]
    },
  },
  love: {
    label: '사랑을 속삭임',
    emoji: '💕',
    generate: (from, to) => {
      const picks = [
        `${to}에게\n\n이 편지를 쓰면서 자꾸 웃음이 나. 네가 생각나거든. 네 이름을 떠올리면 이상하게 마음이 따뜻해져. 좋아해, ${to}.\n\n${from} 드림`,
        `${to}에게\n\n하루에도 몇 번씩 네 생각을 해. 잘 지내고 있어? 나는 네가 행복했으면 좋겠어. 그게 다야. 그게 전부야.\n\n${from} 씀`,
        `${to}에게\n\n사실 오래전부터 이 말을 하고 싶었어. 네가 있어서 내 세상이 훨씬 더 예쁜 것 같아. 고마워, 그리고 사랑해.\n\n${from} 올림`,
        `${to}에게\n\n너한테 편지 쓰려고 몇 번이나 다시 시작했는지 몰라. 그냥 솔직하게 — 너 정말 좋아. 많이.\n\n${from} 드림`,
      ]
      return picks[Math.floor(Math.random() * picks.length)]
    },
  },
  encourage: {
    label: '격려하기',
    emoji: '🌟',
    generate: (from, to) => {
      const picks = [
        `${to}에게\n\n요즘 잘 지내고 있어? 네가 열심히 살고 있다는 거 알아. 멀리서 응원하고 있어. 힘내, ${to}!\n\n${from} 드림`,
        `${to}에게\n\n힘들 때도 있겠지만, 넌 분명히 잘 해낼 거야. 네가 얼마나 강한지 나는 알거든. 포기하지 마!\n\n${from} 씀`,
        `${to}에게\n\n오늘 하루도 수고했어. 사실 별것 아닌 말이지만 — 잘하고 있어. 앞으로도 그렇게 해줘.\n\n${from} 올림`,
        `${to}에게\n\n네가 최선을 다하는 거 보고 있어. 그거면 충분해. 항상 응원해, ${to}.\n\n${from} 드림`,
      ]
      return picks[Math.floor(Math.random() * picks.length)]
    },
  },
}

export function generateLetterContent(type: LetterType, fromName: string, toName: string): string {
  return LETTER_TEMPLATES[type].generate(fromName, toName)
}

export function getLetterTypeInfo(type: LetterType) {
  const { label, emoji } = LETTER_TEMPLATES[type]
  return { label, emoji }
}

export const LETTER_TYPES: LetterType[] = ['mock', 'apologize', 'love', 'encourage']
