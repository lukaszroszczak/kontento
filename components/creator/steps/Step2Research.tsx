'use client'

import { useEffect, useState } from 'react'
import { StepBadge } from '@/components/ui/StepBadge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CreatorState } from '@/types'
import { useTranslation } from '@/lib/i18n'

interface ResearchInsight { tag: string; title: string; text: string }

const FALLBACK_INSIGHTS: ResearchInsight[] = [
  { tag: '📈 Trend',    title: 'Rosnące zaangażowanie',     text: 'Autentyczne treści i materiały zza kulis generują wyższe zaangażowanie niż materiały reklamowe.' },
  { tag: '⏱ Timing',   title: 'Środa–piątek 19:30',        text: 'Posty opublikowane między 18:00 a 21:00 osiągają średnio o 25% wyższy zasięg.' },
  { tag: '🏷 Hashtagi', title: '5–10 trafnych tagów',       text: 'Mieszanka niszowych i popularnych hashtagów zwiększa odkrywalność bez nadmiernej konkurencji.' },
  { tag: '💬 Ton',      title: 'Zaufanie przez ekspertyzę', text: 'Ton łączący wiedzę ekspercką z ludzkim ciepłem buduje lojalność odbiorców na dłuższą metę.' },
]

interface Props {
  state: CreatorState
  onNext: () => void
  onBack: () => void
}

export function Step2Research({ state, onNext, onBack }: Props) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<ResearchInsight[]>([])

  useEffect(() => {
    setLoading(true)
    fetch('/api/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brand: state.brand,
        platforms: state.platforms,
        language: state.language,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        setInsights(Array.isArray(data.insights) ? data.insights : FALLBACK_INSIGHTS)
      })
      .catch(() => setInsights(FALLBACK_INSIGHTS))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tasks = [
    { name: t('step2_task_industry'), detail: `${state.brand.industry || 'Twoja branża'} · 2026`, done: true },
    { name: t('step2_task_trends'),   detail: t('step2_detail_trends'),   done: !loading },
    { name: t('step2_task_timing'),   detail: t('step2_detail_timing'),   done: !loading },
    {
      name:   loading ? t('step2_task_trends_loading') : t('step2_task_trends_local'),
      detail: loading ? t('step2_detail_trends_connecting') : t('step2_detail_trends_local'),
      done: !loading,
    },
  ]

  return (
    <div>
      <StepBadge>⚡ Krok 2</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step2_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-8">
        {t('step2_subheading')}
      </p>

      {/* Task progress */}
      <div className="bg-surface border border-border rounded-[18px] p-6 mb-4">
        <div className="flex flex-col gap-3">
          {tasks.map((task, i) => (
            <div
              key={i}
              className="flex items-center gap-3"
              style={{ animation: `fadeUp 0.35s ease ${i * 80}ms both` }}
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-[0.7rem] flex-shrink-0',
                  task.done
                    ? 'bg-accent-dim border border-accent/30 text-accent font-[700]'
                    : 'border border-border bg-surface2',
                )}
              >
                {task.done ? '✓' : (
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-purple animate-spin block" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-[0.84rem] font-[400]">{task.name}</div>
                <div className="text-[0.72rem] text-muted">{task.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3 mb-2 max-[700px]:grid-cols-1">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[100px] bg-surface border border-border rounded-[14px] animate-pulse" />
            ))
          : insights.map((r, i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-[14px] p-4"
                style={{ animation: `fadeUp 0.35s ease ${400 + i * 80}ms both` }}
              >
                <div className="text-[0.7rem] font-[500] uppercase tracking-[0.06em] text-muted mb-2">{r.tag}</div>
                <div className="font-[500] text-[0.88rem] mb-1.5">{r.title}</div>
                <div className="text-[0.78rem] text-muted leading-relaxed">{r.text}</div>
              </div>
            ))}
      </div>

      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="secondary" onClick={onBack}>{t('btn_back')}</Button>
        <Button variant="primary" onClick={onNext} disabled={loading}>
          {t('step2_cta')}
        </Button>
      </div>
    </div>
  )
}
