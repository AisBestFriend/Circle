import { PixelPet } from '@/components/pixel-pet'
import type { PetStage, EvolutionType } from '@/types/game'

const STAGES: PetStage[] = ['egg', 'baby', 'teen', 'adult', 'ultimate', 'elder']
const EVOLUTIONS: (EvolutionType | null)[] = [null, 'warrior', 'sage', 'dark', 'balance']

const STAGE_LABELS: Record<PetStage, string> = {
  egg: '알',
  baby: '유아기',
  teen: '청소년기',
  adult: '성체',
  ultimate: '궁극체',
  elder: '장로',
}

const EVO_LABELS: Record<string, string> = {
  warrior: '전사형 ⚔️',
  sage: '현자형 ✨',
  dark: '다크형 🌑',
  balance: '균형형 ☯️',
}

export default function PetPreviewPage() {
  return (
    <main className="min-h-screen pixel-bg p-6">
      <h1 className="text-green-300 font-mono font-bold text-2xl mb-8 text-center">
        ── 펫 외형 미리보기 ──
      </h1>

      {/* Base stages (no evolution) */}
      <section className="mb-10">
        <h2 className="text-green-600 font-mono text-sm mb-4 text-center uppercase tracking-widest">
          기본 성장 단계
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {STAGES.filter(s => !['ultimate', 'elder'].includes(s)).map(stage => (
            <div key={stage} className="pixel-card p-4 flex flex-col items-center gap-3 w-28">
              <PixelPet stage={stage} evolutionType={null} size="lg" animate={false} />
              <span className="text-green-400 font-mono text-xs">{STAGE_LABELS[stage]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Adult evolutions */}
      <section className="mb-10">
        <h2 className="text-green-600 font-mono text-sm mb-4 text-center uppercase tracking-widest">
          성체 진화 타입
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {(['warrior', 'sage', 'dark', 'balance'] as EvolutionType[]).map(evo => (
            <div key={evo} className="pixel-card p-4 flex flex-col items-center gap-3 w-32">
              <PixelPet stage="adult" evolutionType={evo} size="lg" animate={false} />
              <span className="text-green-400 font-mono text-xs text-center">{EVO_LABELS[evo]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Ultimate evolutions */}
      <section className="mb-10">
        <h2 className="text-green-600 font-mono text-sm mb-4 text-center uppercase tracking-widest">
          궁극체 진화 타입
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {(['warrior', 'sage', 'dark', 'balance'] as EvolutionType[]).map(evo => (
            <div key={evo} className="pixel-card p-4 flex flex-col items-center gap-3 w-32">
              <PixelPet stage="ultimate" evolutionType={evo} size="lg" animate={false} />
              <span className="text-green-400 font-mono text-xs text-center">{EVO_LABELS[evo]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Elder evolutions */}
      <section className="mb-10">
        <h2 className="text-green-600 font-mono text-sm mb-4 text-center uppercase tracking-widest">
          장로 진화 타입
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {(['warrior', 'sage', 'dark', 'balance'] as EvolutionType[]).map(evo => (
            <div key={evo} className="pixel-card p-4 flex flex-col items-center gap-3 w-32">
              <PixelPet stage="elder" evolutionType={evo} size="lg" animate={false} />
              <span className="text-green-400 font-mono text-xs text-center">{EVO_LABELS[evo]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Full grid */}
      <section>
        <h2 className="text-green-600 font-mono text-sm mb-4 text-center uppercase tracking-widest">
          전체 조합 그리드
        </h2>
        <div className="overflow-x-auto">
          <table className="mx-auto border-collapse">
            <thead>
              <tr>
                <th className="text-green-700 font-mono text-xs p-3 text-left">단계 \\ 진화</th>
                <th className="text-green-500 font-mono text-xs p-3">없음</th>
                {(['warrior', 'sage', 'dark', 'balance'] as EvolutionType[]).map(evo => (
                  <th key={evo} className="text-green-500 font-mono text-xs p-3">{EVO_LABELS[evo]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAGES.map(stage => (
                <tr key={stage} className="border-t border-green-950">
                  <td className="text-green-600 font-mono text-xs p-3 pr-6">{STAGE_LABELS[stage]}</td>
                  {EVOLUTIONS.map(evo => (
                    <td key={String(evo)} className="p-3 text-center">
                      <div className="flex justify-center">
                        <PixelPet stage={stage} evolutionType={evo} size="md" animate={false} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
