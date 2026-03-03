'use client'

import { useState, useEffect, useCallback } from 'react'
import { StepBadge } from '@/components/ui/StepBadge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CreatorState } from '@/types'
import { useTranslation } from '@/lib/i18n'

interface AiTopic {
  emoji: string
  title: string
  hint: string
}

interface Props {
  state: CreatorState
  onChange: (partial: Partial<CreatorState>) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export function Step3Topics({ state, onChange, onNext, onBack, onSkip }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState(state.topic)
  const [topics, setTopics] = useState<AiTopic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keywords, setKeywords] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customTopic, setCustomTopic] = useState('')

  const generateIdeas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: state.brand.industry || state.brand.description?.slice(0, 80) || 'social media marketing',
          keywords: keywords || '',
          brand: state.brand,
          language: state.language,
        }),
      })
      const data = await res.json()
      if (Array.isArray(data.ideas) && data.ideas.length > 0) {
        setTopics(data.ideas)
      } else {
        setError(data.error || 'Nie udało się wygenerować propozycji.')
      }
    } catch {
      setError('Błąd połączenia. Sprawdź klucz API w .env.local.')
    } finally {
      setLoading(false)
    }
  }, [state.brand, state.language, keywords])

  useEffect(() => {
    generateIdeas()
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const select = (title: string) => {
    setSelected(title)
    onChange({ topic: title })
  }

  const useCustomTopic = () => {
    if (!customTopic.trim()) return
    select(customTopic.trim())
    setShowCustomInput(false)
  }

  return (
    <div>
      <StepBadge>🎯 Krok 3</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step3_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-6">
        {t('step3_subheading')}
      </p>

      {/* Keywords refine row */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          placeholder={t('step3_refine_placeholder')}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="flex-1 !py-2 !px-3.5 text-[0.82rem]"
          onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={generateIdeas}
          disabled={loading}
          className="flex-shrink-0"
        >
          {loading ? '…' : t('step3_refresh')}
        </Button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="mb-4 px-4 py-3 bg-coral-dim border border-coral/20 rounded-[12px] text-[0.8rem] text-coral">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-2 max-[700px]:grid-cols-1">
        {/* Loading skeletons */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative p-5 rounded-[16px] border border-border bg-surface animate-pulse min-h-[120px]"
          >
            <div className="w-8 h-8 rounded-full bg-surface3 mb-3" />
            <div className="h-3 bg-surface3 rounded w-3/4 mb-2" />
            <div className="h-3 bg-surface3 rounded w-1/2" />
          </div>
        ))}

        {/* AI topics */}
        {!loading && topics.map((topic) => {
          const isSelected = selected === topic.title
          return (
            <button
              key={topic.title}
              onClick={() => select(topic.title)}
              className={cn(
                'relative text-left p-5 rounded-[16px] border transition-all duration-[180ms] cursor-pointer',
                isSelected
                  ? 'border-accent bg-accent-dim'
                  : 'border-border bg-surface hover:border-border-mid hover:bg-surface2',
              )}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center text-bg text-xs font-[700]">
                  ✓
                </div>
              )}
              <div className="text-[1.5rem] mb-2">{topic.emoji}</div>
              <div className="font-[500] text-[0.88rem] mb-1.5 leading-snug">{topic.title}</div>
              <div className="text-[0.75rem] text-muted leading-relaxed">{topic.hint}</div>
            </button>
          )
        })}

        {/* Custom topic — either button or input */}
        {!loading && !showCustomInput && (
          <button
            onClick={() => setShowCustomInput(true)}
            className={cn(
              'flex flex-col items-center justify-center min-h-[120px] gap-2',
              'border border-dashed border-border rounded-[16px] bg-surface',
              'text-muted hover:border-border-mid hover:text-ink transition-all cursor-pointer',
            )}
          >
            <span className="text-[1.4rem] opacity-40">＋</span>
            <span className="text-[0.8rem]">{t('step3_add_custom')}</span>
          </button>
        )}

        {!loading && showCustomInput && (
          <div
            className={cn(
              'flex flex-col gap-3 p-4 rounded-[16px] border',
              selected && customTopic && selected === customTopic.trim()
                ? 'border-accent bg-accent-dim'
                : 'border-border-mid bg-surface',
            )}
          >
            <textarea
              rows={3}
              placeholder={t('step3_custom_placeholder')}
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="!bg-surface2 !rounded-[10px] !text-[0.82rem]"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={useCustomTopic}
                disabled={!customTopic.trim()}
              >
                {t('step3_use_topic')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setShowCustomInput(false); setCustomTopic('') }}
              >
                {t('step3_cancel')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="secondary" onClick={onBack}>{t('btn_back')}</Button>
        <Button variant="primary" onClick={onNext} disabled={!selected || loading}>
          {t('step3_cta')}
        </Button>
        <Button variant="ghost" onClick={onSkip}>{t('step3_skip')}</Button>
      </div>
    </div>
  )
}
