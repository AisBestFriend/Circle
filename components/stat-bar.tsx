interface StatBarProps {
  label: string
  value: number
  max?: number
  color?: string
}

export function StatBar({ label, value, max = 100, color = 'bg-green-400' }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const barColor = pct > 60 ? color : pct > 30 ? 'bg-yellow-400' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="w-16 text-gray-400">{label}</span>
      <div className="flex-1 h-3 bg-gray-800 border border-gray-700 rounded-sm overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-gray-300">{Math.round(value)}</span>
    </div>
  )
}
