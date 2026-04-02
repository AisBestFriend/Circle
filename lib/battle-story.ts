interface BattleParticipant {
  name: string
  strength: number
  wisdom: number
  dark: number
  harmony: number
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateBattleStory(
  attacker: BattleParticipant,
  defender: BattleParticipant,
  attackerWon: boolean
): string {
  const winner = attackerWon ? attacker : defender
  const loser = attackerWon ? defender : attacker

  const strDiff = Math.abs(attacker.strength - defender.strength)
  const winnerWisdomAdvantage = winner.wisdom - loser.wisdom
  const w = winner.name
  const l = loser.name

  if (strDiff > 20) {
    return pick([
      `${w}이(가) ${l}에게 달려들었어요. ${l}은(는) 저항조차 못하고 일방적으로 두들겨 맞았어요. 처참한 패배였어요. 💪`,
      `${w}의 첫 번째 공격만으로 결판이 났어요. ${l}은(는) 눈도 못 뜨고 나가떨어졌어요. 💪`,
      `${w}이(가) 압도적인 힘으로 ${l}을(를) 몰아붙였어요. 상대가 되지 않았어요. 💪`,
      `${l}은(는) 용감하게 맞섰지만, ${w}의 힘 앞에서는 무의미했어요. 완벽한 패배였어요. 💪`,
    ])
  }

  if (winner.dark > 70) {
    return pick([
      `${w}의 몸이 어두운 기운으로 뒤덮였어요. 예측 불가능한 움직임에 ${l}은(는) 혼란에 빠졌고, 그 틈을 놓치지 않았어요. 😈`,
      `${w}에서 뿜어져 나오는 어둠의 기운이 ${l}의 의지를 꺾었어요. 정신적으로 무너진 ${l}은(는) 싸울 수가 없었어요. 😈`,
      `${w}의 공격은 불규칙하고 잔인했어요. 어둠의 힘에 압도된 ${l}은(는) 결국 쓰러졌어요. 😈`,
      `${l}은(는) 상대의 실체를 파악하기도 전에 당했어요. ${w}의 어둠의 기운은 예측 불가능했어요. 😈`,
    ])
  }

  if (winner.harmony > 70) {
    return pick([
      `${w}의 움직임은 물 흐르듯 자연스러웠어요. ${l}의 모든 공격을 흘려보내며 완벽한 타이밍에 반격했어요. ☯️`,
      `${w}은(는) 싸우는 내내 흔들림이 없었어요. 균형 잡힌 전투 끝에 ${l}을(를) 제압했어요. ☯️`,
      `${w}의 완벽한 균형이 빛을 발했어요. 어떤 공격도 통하지 않았고, ${l}은(는) 결국 지쳤어요. ☯️`,
      `우아하고 완벽한 싸움이었어요. ${w}의 조화로운 전투 앞에 ${l}은(는) 무릎을 꿇었어요. ☯️`,
    ])
  }

  if (winnerWisdomAdvantage > 15) {
    return pick([
      `${w}은(는) 침착하게 상대의 패턴을 분석했어요. 세 번째 공격이 왔을 때, 정확히 옆으로 피하며 카운터를 날렸어요. ${l}은(는) 허를 찔려 나가떨어졌어요. 🎯`,
      `${w}은(는) 처음부터 끝까지 전략적이었어요. ${l}의 허점을 정확히 파고든 한 방으로 승부를 결정지었어요. 🎯`,
      `힘이 아닌 지략으로 이긴 싸움이었어요. ${w}의 치밀한 작전 앞에 ${l}은(는) 속수무책이었어요. 🎯`,
      `${w}은(는) 싸우면서도 항상 두 수 앞을 내다봤어요. 결국 ${l}은(는) ${w}의 덫에 걸려들고 말았어요. 🎯`,
    ])
  }

  if (strDiff < 5) {
    return pick([
      `숨막히는 접전이었어요. 서로 쓰러질 듯 버티다가, 마지막 순간 ${w}의 주먹이 ${l}의 턱에 꽂혔어요. ${l}은(는) 그대로 쓰러졌어요. ⚔️`,
      `막상막하의 싸움이었어요. 두 번이나 역전이 되는 접전 끝에, 간신히 ${w}이(가) 승리를 가져갔어요. ⚔️`,
      `보는 사람도 손에 땀을 쥐는 접전이었어요. 마지막까지 누가 이길지 몰랐지만, 결국 ${w}이(가) 해냈어요. ⚔️`,
      `두 배틀러는 오랫동안 팽팽하게 맞섰어요. 지쳐 쓰러지기 직전, ${w}이(가) 마지막 힘을 짜냈어요. ⚔️`,
    ])
  }

  return pick([
    `${w}이(가) 강하게 밀어붙였어요. ${l}은(는) 용감하게 맞섰지만 역부족이었어요. ${w}의 공격에 결국 무릎을 꿇었어요. ⚔️`,
    `처음에는 팽팽했지만, 시간이 지날수록 ${w}의 우세가 드러났어요. ${l}은(는) 결국 패배를 인정했어요. ⚔️`,
    `${w}이(가) 주도권을 잡고 싸움을 이끌었어요. ${l}은(는) 반격의 기회를 잡지 못한 채 쓰러졌어요. ⚔️`,
  ])
}
