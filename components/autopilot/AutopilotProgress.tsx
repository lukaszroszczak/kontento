'use client'

interface AutopilotProgressProps {
  current: number
  total: number
}

export function AutopilotProgress({ current, total }: AutopilotProgressProps) {
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      {/* Animated icon */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
        <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">✦</div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div className="font-syne font-[700] text-[1.1rem] text-ink mb-1">
          Generuję posty…
        </div>
        {total > 1 && (
          <div className="text-[0.82rem] text-muted">
            Post {current} z {total}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-surface2 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.round((current / total) * 100)}%` }}
        />
      </div>

      <p className="text-[0.75rem] text-muted text-center max-w-[240px]">
        Tematy → Treść → Grafika → Zapisywanie
      </p>
    </div>
  )
}
