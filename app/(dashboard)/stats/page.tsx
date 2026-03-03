import { StatsView } from '@/components/stats/StatsView'

export default function StatsPage() {
  return (
    <main className="px-12 py-10 max-w-[1100px] w-full mx-auto">
      <div className="mb-6">
        <h2 className="font-syne text-[1.4rem] font-[700] tracking-[-0.02em]">
          Statystyki
        </h2>
        <p className="text-muted text-sm mt-1">Ostatnie 30 dni — wszystkie platformy</p>
      </div>
      <StatsView />
    </main>
  )
}
