'use client'

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react'
import { StepBadge } from '@/components/ui/StepBadge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { cn } from '@/lib/utils'
import type { CreatorState } from '@/types'
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants'
import { useTranslation } from '@/lib/i18n'

interface Props {
  state: CreatorState
  onChange: (partial: Partial<CreatorState>) => void
  onNext: () => void
  onBack: () => void
}

interface Suggestion {
  emoji: string
  text: string
}

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { emoji: '📩', text: 'Napisz do nas i porozmawiajmy' },
  { emoji: '📅', text: 'Sprawdź nasze wolne terminy' },
  { emoji: '❓', text: 'A ty jak podchodzisz do tego tematu?' },
]

export function Step4Content({ state, onChange, onNext, onBack }: Props) {
  const [content, setContent] = useState(state.content || '')
  const [aiContent, setAiContent] = useState(state.content || '') // last AI-generated version
  const [generating, setGenerating] = useState(false)
  const [rephrasing, setRephrasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Local generation options (can differ from global state for this one post)
  const [tone, setTone] = useState(state.tone || 'Friendly')
  const [language, setLanguage] = useState(state.language || 'Polish')
  const [includeHashtags, setIncludeHashtags] = useState(state.includeHashtags)
  const [includeEmoji, setIncludeEmoji] = useState(state.includeEmoji)
  const { t } = useTranslation()

  // Dynamic suggestions
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const suggestionsLoadedRef = useRef(false)

  // ── Toolbar helpers ─────────────────────────────────────────────────────────
  const wrapSelection = (before: string, after: string = before) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const sel   = content.slice(start, end)
    const newText = content.slice(0, start) + before + sel + after + content.slice(end)
    update(newText)
    requestAnimationFrame(() => {
      ta.selectionStart = start + before.length
      ta.selectionEnd   = end   + before.length
      ta.focus()
    })
  }

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current
    if (!ta) return
    const pos = ta.selectionStart
    const newText = content.slice(0, pos) + text + content.slice(pos)
    update(newText)
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = pos + text.length
      ta.focus()
    })
  }

  const rephrase = useCallback(async (instruction: string) => {
    if (!content.trim()) return
    setRephrasing(true)
    setError(null)
    try {
      const res = await fetch('/api/rephrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, instruction, language }),
      })
      const data = await res.json()
      if (data.content) {
        update(data.content)
      } else {
        setError(data.error || 'Nie udało się przepisać treści.')
      }
    } catch {
      setError('Błąd połączenia podczas przepisywania.')
    } finally {
      setRephrasing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, language])

  const update = (v: string) => {
    setContent(v)
    onChange({ content: v })
  }

  const generate = useCallback(async () => {
    if (!state.topic && !content) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: state.platforms,
          description: state.topic || content,
          tone,
          language,
          includeHashtags,
          includeEmoji,
          brand: state.brand,
        }),
      })
      const data = await res.json()
      if (data.content) {
        setAiContent(data.content)
        update(data.content)
      } else {
        setError(data.error || 'Nie udało się wygenerować treści.')
      }
    } catch {
      setError('Błąd połączenia. Sprawdź klucz API w .env.local.')
    } finally {
      setGenerating(false)
    }
  // intentionally omit `content` from deps to avoid infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.topic, state.platforms, state.brand, tone, language, includeHashtags, includeEmoji])

  const fetchSuggestions = useCallback(async (currentContent?: string) => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: state.brand,
          content: currentContent ?? content,
          language,
        }),
      })
      const data = await res.json()
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions)
      }
    } catch {
      // Keep default suggestions on error
    } finally {
      setLoadingSuggestions(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.brand, language])

  // Auto-generate when entering step if topic is set and content is empty
  useEffect(() => {
    if (state.topic && !state.content) {
      generate()
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch brand-aware suggestions once on mount
  useEffect(() => {
    if (!suggestionsLoadedRef.current) {
      suggestionsLoadedRef.current = true
      fetchSuggestions(state.content || '')
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveOptions = () => {
    onChange({ tone, language, includeHashtags, includeEmoji })
  }

  return (
    <div>
      <StepBadge>✍️ Krok 4</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step4_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-6">
        {state.topic
          ? `Temat: „${state.topic}". ${t('step4_subheading_topic')}`
          : t('step4_subheading_manual')}
      </p>

      {/* ── Generation panel ── */}
      <div className="bg-surface border border-border rounded-[18px] p-5 mb-4">
        <div className="text-[0.72rem] uppercase tracking-[0.08em] text-muted mb-4 font-[500]">
          {t('step4_options_label')}
        </div>

        {/* Tone */}
        <div className="mb-4">
          <div className="text-[0.75rem] text-muted mb-2">{t('step4_tone_label')}</div>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                selected={tone === value}
                onClick={() => setTone(value)}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="mb-4">
          <div className="text-[0.75rem] text-muted mb-2">{t('step4_language_label')}</div>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <Chip
                key={value}
                selected={language === value}
                onClick={() => setLanguage(value)}
              >
                {label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-3 mb-5">
          <button
            onClick={() => setIncludeHashtags((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-full border text-[0.78rem] cursor-pointer transition-all',
              includeHashtags
                ? 'border-accent/30 bg-accent-dim text-accent'
                : 'border-border bg-surface2 text-muted hover:border-border-mid',
            )}
          >
            <span>{includeHashtags ? '☑' : '☐'}</span> {t('step4_hashtags')}
          </button>
          <button
            onClick={() => setIncludeEmoji((v) => !v)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-2 rounded-full border text-[0.78rem] cursor-pointer transition-all',
              includeEmoji
                ? 'border-accent/30 bg-accent-dim text-accent'
                : 'border-border bg-surface2 text-muted hover:border-border-mid',
            )}
          >
            <span>{includeEmoji ? '☑' : '☐'}</span> {t('step4_emoji')}
          </button>
        </div>

        {/* Generate button */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() => { saveOptions(); generate() }}
            disabled={generating}
            className="gap-2"
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-bg animate-spin" />
                {t('step4_generating')}
              </>
            ) : (
              t('step4_generate')
            )}
          </Button>
          {aiContent && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => update(aiContent)}
              disabled={generating}
            >
              {t('step4_reset_ai')}
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-3 px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
            {error}
          </div>
        )}
      </div>

      {/* ── Editor ── */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden mb-4">
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border flex-wrap">
          <button
            title="Pogrubienie zaznaczonego tekstu"
            onClick={() => wrapSelection('**')}
            className="px-2.5 py-1 text-[0.8rem] font-[700] text-muted bg-surface2 border border-border rounded-[6px] hover:border-border-active hover:text-ink transition-all cursor-pointer"
          >B</button>
          <button
            title="Kursywa zaznaczonego tekstu"
            onClick={() => wrapSelection('_')}
            className="px-2.5 py-1 text-[0.8rem] italic text-muted bg-surface2 border border-border rounded-[6px] hover:border-border-active hover:text-ink transition-all cursor-pointer"
          >I</button>
          <button
            title="Wstaw hashtag"
            onClick={() => insertAtCursor('#')}
            className="px-2.5 py-1 text-[0.8rem] text-muted bg-surface2 border border-border rounded-[6px] hover:border-border-active hover:text-ink transition-all cursor-pointer"
          >#️⃣</button>
          <button
            title="Wstaw emoji"
            onClick={() => insertAtCursor('✨ ')}
            className="px-2.5 py-1 text-[0.8rem] text-muted bg-surface2 border border-border rounded-[6px] hover:border-border-active hover:text-ink transition-all cursor-pointer"
          >😊</button>
          <div className="w-px h-4 bg-border mx-1" />
          {[
            { label: t('step4_shorter'),    instruction: 'Make this shorter and more concise while keeping the key message.' },
            { label: t('step4_longer'),     instruction: 'Expand this text with more detail, examples, and context.' },
            { label: t('step4_more_formal'),instruction: 'Rewrite this in a more formal, professional tone.' },
          ].map(({ label, instruction }) => (
            <button
              key={label}
              onClick={() => rephrase(instruction)}
              disabled={rephrasing || !content.trim()}
              className="px-2.5 py-1 text-[0.75rem] text-muted bg-surface2 border border-border rounded-[6px] hover:border-border-active hover:text-ink transition-all cursor-pointer disabled:opacity-40"
            >
              {rephrasing ? '…' : label}
            </button>
          ))}
        </div>

        {/* Text area */}
        <div className="relative">
          {(generating || rephrasing) && (
            <div className="absolute inset-0 flex items-center justify-center bg-bg/70 backdrop-blur-sm z-10 rounded-none">
              <div className="flex flex-col items-center gap-2">
                <span className="w-6 h-6 rounded-full border-2 border-t-transparent border-accent animate-spin" />
                <span className="text-[0.78rem] text-muted">{rephrasing ? 'AI przepisuje…' : 'AI pisze…'}</span>
              </div>
            </div>
          )}
          <textarea
            ref={textareaRef}
            className="w-full min-h-[180px] bg-transparent border-0 p-5 text-[0.9rem] leading-[1.7] outline-none resize-none !rounded-none"
            value={content}
            onChange={(e) => update(e.target.value)}
            placeholder={generating ? '' : 'Wpisz treść posta lub wygeneruj z AI…'}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface2">
          <div className="text-[0.75rem] text-muted">
            {t('step4_chars')}: <span className="text-accent font-[500]">{content.length}</span> / 2200
          </div>
        </div>
      </div>

      {/* AI suggestions — dynamic, brand-aware */}
      {content && (
        <div className="bg-surface border border-border rounded-[16px] p-5 mb-2">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2 text-[0.8rem] text-purple font-[500]">
              {t('step4_suggestions_label')}
            </div>
            <button
              onClick={() => fetchSuggestions(content)}
              disabled={loadingSuggestions}
              className="text-[0.72rem] text-muted hover:text-ink transition-colors cursor-pointer disabled:opacity-40"
            >
              {loadingSuggestions ? '…' : t('step4_suggestions_refresh')}
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {loadingSuggestions
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="inline-flex px-3.5 py-2 bg-surface2 border border-border rounded-full animate-pulse h-8 w-48"
                  />
                ))
              : suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => update(content + '\n\n' + s.emoji + ' ' + s.text)}
                    className={cn(
                      'inline-flex px-3.5 py-2 bg-surface2 border border-border rounded-full',
                      'text-[0.78rem] cursor-pointer hover:border-border-active hover:bg-surface transition-all',
                    )}
                  >
                    {s.emoji} „{s.text}"
                  </button>
                ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="secondary" onClick={onBack}>{t('btn_back')}</Button>
        <Button variant="primary" onClick={onNext} disabled={!content.trim()}>
          {t('step4_cta')}
        </Button>
        <Button variant="ghost">{t('step4_save_draft')}</Button>
      </div>
    </div>
  )
}
