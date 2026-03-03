'use client'

import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface CreatorSidebarProps {
  currentStep: number
  onStepClick: (n: number) => void
}

export function CreatorSidebar({ currentStep, onStepClick }: CreatorSidebarProps) {
  const { t } = useTranslation()

  const STEPS = [
    { n: 1, name: t('step1_label') },
    { n: 2, name: t('step2_label') },
    { n: 3, name: t('step3_label') },
    { n: 4, name: t('step4_label') },
    { n: 5, name: t('step5_label') },
    { n: 6, name: t('step6_label') },
  ]

  return (
    <aside
      className={cn(
        'w-[220px] flex-shrink-0 border-r border-border',
        'px-3.5 py-7 flex flex-col gap-0.5 overflow-y-auto',
      )}
    >
      <div className="text-[0.65rem] uppercase tracking-[0.14em] text-dim mx-2 mb-2">
        Sesja twórcza
      </div>

      {STEPS.map(({ n, name }) => {
        const isDone   = n < currentStep
        const isActive = n === currentStep
        const isLocked = n > currentStep

        return (
          <button
            key={n}
            onClick={() => !isLocked && onStepClick(n)}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2.5 rounded-[10px] text-left transition-all duration-[180ms] w-full',
              isActive && 'bg-accent-dim',
              isDone   && 'opacity-65 hover:opacity-100',
              isLocked && 'opacity-30 pointer-events-none',
              !isActive && !isLocked && 'hover:bg-surface2',
            )}
          >
            <div
              className={cn(
                'w-[26px] h-[26px] rounded-full border flex items-center justify-center text-[0.7rem] flex-shrink-0 transition-all',
                isActive && 'bg-accent border-accent text-bg font-[700]',
                isDone   && 'bg-accent/15 border-accent/30 text-accent',
                isLocked && 'bg-surface border-border',
              )}
            >
              {isDone ? '✓' : n}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[0.82rem] font-[400] truncate">{name}</div>
            </div>

            {isDone && (
              <span className="text-[0.7rem] text-accent ml-auto">✓</span>
            )}
          </button>
        )
      })}

      <div className="h-px bg-border my-3" />
      <div className="mx-2.5 p-3 bg-surface rounded-[10px] border border-border mt-auto">
        <div className="text-[0.7rem] text-dim mb-1.5">Bieżąca sesja</div>
        <div className="text-[0.85rem] font-[500]">Post #1 — Marzec 2026</div>
        <div className="text-[0.72rem] text-muted mt-0.5">Rozpoczęto dziś</div>
      </div>
    </aside>
  )
}
