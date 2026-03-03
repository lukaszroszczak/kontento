import { CalendarView } from '@/components/calendar/CalendarView'

export default function CalendarPage() {
  return (
    <main className="px-12 py-10 max-w-[1200px] w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-syne text-[1.4rem] font-[700] tracking-[-0.02em]">
          Kalendarz publikacji
        </h2>
      </div>
      <CalendarView />
    </main>
  )
}
