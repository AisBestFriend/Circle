'use client'

import { Session } from 'next-auth'
import Link from 'next/link'
import { PixelPet } from '@/components/pixel-pet'
import { StatBar } from '@/components/stat-bar'
import { Badge } from '@/components/ui/badge'
import { STAGE_LABELS } from '@/lib/constants'
import { Pet } from '@/types/game'

interface GardenPet extends Omit<Pet, 'user_id'> {
  user_id: string
  users?: { name: string | null; image: string | null } | null
}

interface GardenClientProps {
  session: Session
  pets: GardenPet[]
}

export function GardenClient({ session, pets }: GardenClientProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white font-mono text-sm">
            ← 내 다마고치
          </Link>
          <h1 className="text-yellow-400 font-mono font-bold text-xl">🌸 가든</h1>
        </div>
        <p className="text-gray-500 text-xs font-mono">{pets.length}마리 활동 중</p>
      </header>

      {pets.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-gray-400 font-mono">아직 아무도 없어요...</p>
          <p className="text-gray-600 text-sm font-mono">첫 번째 다마고치를 만들어보세요!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} isOwn={pet.user_id === session.user.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function PetCard({ pet, isOwn }: { pet: GardenPet; isOwn: boolean }) {
  return (
    <div className={`bg-gray-900 border rounded-lg p-4 space-y-3 ${isOwn ? 'border-yellow-400/40' : 'border-gray-700'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-mono font-bold text-sm">{pet.name}</span>
          {isOwn && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs font-mono">
              내 펫
            </Badge>
          )}
        </div>
        <span className="text-gray-500 text-xs font-mono">{pet.age_days}일</span>
      </div>

      <div className="flex items-center gap-4">
        <PixelPet stage={pet.stage} evolutionType={pet.evolution_type} size="md" animate={false} />
        <div className="flex-1 space-y-1">
          <StatBar label="배고픔" value={pet.hunger} color="bg-orange-400" />
          <StatBar label="행복" value={pet.happiness} color="bg-pink-400" />
          <StatBar label="에너지" value={pet.energy} color="bg-cyan-400" />
        </div>
      </div>

      {pet.users && (
        <p className="text-gray-600 text-xs font-mono">by {pet.users.name ?? '알 수 없음'}</p>
      )}
    </div>
  )
}
