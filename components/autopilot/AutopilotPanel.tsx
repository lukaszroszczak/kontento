'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'
import { TONE_OPTIONS, LANGUAGE_OPTIONS } from '@/lib/constants'
import { PLATFORM_LABELS, PLATFORM_COLORS } from '@/types'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { AutopilotProgress } from './AutopilotProgress'
import { cn } from '@/lib/utils'
import {
  loadProfiles,
  getLastUsedProfileId,
  setLastUsedProfileId,
  type SavedBrandProfile,
} from '@/lib/brandProfiles'
import type { AutopilotConfig, AutopilotRunResult, Platform } from '@/types'

const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'facebook', 'tiktok']
const BATCH_OPTIONS = [1, 2, 3, 5, 7]

const fieldLabel = 'block text-[0.72rem] font-[500] text-muted uppercase tracking-[0.07em] mb-2'
const card = 'bg-surface border border-border rounded-[18px] p-6'

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full group cursor-pointer"
    >
      <span className="text-[0.85rem] text-ink">{label}</span>
      <span
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
          checked ? 'bg-accent' : 'bg-surface3 border border-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200',
            checked ? 'bg-bg left-5' : 'bg-muted left-0.5',
          )}
        />
      </span>
    </button>
  )
}

export function AutopilotPanel() {
  const { t } = useTranslation()

  const [config, setConfig] = useState<Partial<AutopilotConfig>>({
    postsPerBatch: 3,
    tone: 'Friendly',
    language: 'Polish',
    includeHashtags: true,
    includeEmoji: true,
    generateImages: true,
    platforms: ['instagram'],
    lastRunAt: null,
  })

  const [profiles, setProfiles] = useState<SavedBrandProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AutopilotRunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Load config + brand profiles on mount
  useEffect(() => {
    // Brand profiles from localStorage
    const savedProfiles = loadProfiles()
    setProfiles(savedProfiles)
    const lastId = getLastUsedProfileId()
    if (lastId && savedProfiles.find((p) => p.id === lastId)) {
      setSelectedProfileId(lastId)
    } else if (savedProfiles.length > 0) {
      setSelectedProfileId(savedProfiles[0].id)
    }

    // Autopilot config from API
    fetch('/api/autopilot/config')
      .then(async (r) => {
        if (!r.ok) return null
        const text = await r.text()
        return text ? (JSON.parse(text) as { config?: Partial<AutopilotConfig> }) : null
      })
      .then((data) => {
        if (data?.config) setConfig(data.config)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveConfig = useCallback(async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/autopilot/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        const data = await res.json()
        setConfig(data.config)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }, [config])

  const runAutopilot = useCallback(async () => {
    setRunning(true)
    setResult(null)
    setError(null)
    setProgress(1)

    // Resolve selected brand to pass to the API
    const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

    // Simulate progress ticks while waiting
    const tick = setInterval(() => {
      setProgress((p) => Math.min(p + 1, (config.postsPerBatch ?? 3) - 0.5))
    }, 3000)

    try {
      const res = await fetch('/api/autopilot/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand: selectedProfile?.brand ?? {} }),
      })

      // Safely parse JSON — server might return HTML on unhandled errors
      let data: AutopilotRunResult & { error?: string }
      try {
        data = await res.json()
      } catch {
        const text = await res.text().catch(() => '')
        console.error('Autopilot run: invalid JSON response', text.slice(0, 300))
        setError(`Błąd serwera (${res.status}). Sprawdź konsolę po szczegóły.`)
        return
      }

      if (!res.ok) {
        setError(data.error ?? 'Błąd generowania')
      } else {
        setResult(data)
        setConfig((prev) => ({ ...prev, lastRunAt: new Date() }))
        // Trigger PostList refresh
        window.dispatchEvent(new Event('post-created'))
      }
    } catch (err) {
      console.error('Autopilot run fetch error:', err)
      setError('Błąd połączenia z serwerem.')
    } finally {
      clearInterval(tick)
      setProgress(config.postsPerBatch ?? 3)
      setRunning(false)
    }
  }, [config.postsPerBatch, profiles, selectedProfileId])

  const togglePlatform = (p: Platform) => {
    setConfig((prev) => {
      const current = prev.platforms ?? []
      const next = current.includes(p)
        ? current.filter((x) => x !== p)
        : [...current, p]
      return { ...prev, platforms: next.length > 0 ? next : [p] }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-muted text-[0.85rem]">
        Ładowanie…
      </div>
    )
  }

  const total = config.postsPerBatch ?? 3

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      {/* Header */}
      <div>
        <h1 className="font-syne font-[800] text-[clamp(1.8rem,3vw,2.4rem)] tracking-[-0.03em] text-ink mb-2">
          {t('autopilot_heading')}
          <span className="ml-2 text-accent">✦</span>
        </h1>
        <p className="text-[0.88rem] text-muted leading-relaxed max-w-[540px]">
          {t('autopilot_subheading')}
        </p>
      </div>

      {/* Config card */}
      <div className={card}>
        <h2 className="font-syne font-[700] text-[1rem] mb-5 text-ink">
          {t('autopilot_config_heading')}
        </h2>

        <div className="flex flex-col gap-6">
          {/* Brand profile selector */}
          <div>
            <span className={fieldLabel}>{t('autopilot_brand_label')}</span>
            {profiles.length === 0 ? (
              <div className="bg-surface2 border border-border rounded-[12px] px-4 py-3">
                <p className="text-[0.82rem] text-muted mb-1">{t('autopilot_no_brand')}</p>
                <Link href="/creator" className="text-[0.78rem] text-accent hover:underline">
                  {t('autopilot_setup_brand_hint')}
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => (
                  <Chip
                    key={p.id}
                    selected={selectedProfileId === p.id}
                    onClick={() => {
                      setSelectedProfileId(p.id)
                      setLastUsedProfileId(p.id)
                    }}
                  >
                    {p.brand.name || p.id}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          {/* Posts per batch */}
          <div>
            <span className={fieldLabel}>{t('autopilot_posts_per_batch')}</span>
            <div className="flex flex-wrap gap-2">
              {BATCH_OPTIONS.map((n) => (
                <Chip
                  key={n}
                  selected={config.postsPerBatch === n}
                  onClick={() => setConfig((prev) => ({ ...prev, postsPerBatch: n }))}
                >
                  {n}
                </Chip>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <span className={fieldLabel}>{t('autopilot_platforms_label')}</span>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <Chip
                  key={p}
                  selected={(config.platforms ?? []).includes(p)}
                  onClick={() => togglePlatform(p)}
                  dot={PLATFORM_COLORS[p]}
                >
                  {PLATFORM_LABELS[p]}
                </Chip>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <span className={fieldLabel}>{t('autopilot_tone_label')}</span>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map(({ value, label }) => (
                <Chip
                  key={value}
                  selected={config.tone === value}
                  onClick={() => setConfig((prev) => ({ ...prev, tone: value }))}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <span className={fieldLabel}>{t('autopilot_language_label')}</span>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map(({ value, label }) => (
                <Chip
                  key={value}
                  selected={config.language === value}
                  onClick={() => setConfig((prev) => ({ ...prev, language: value }))}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 bg-surface2 rounded-[12px] p-4 border border-border">
            <Toggle
              checked={config.includeHashtags ?? true}
              onChange={(v) => setConfig((prev) => ({ ...prev, includeHashtags: v }))}
              label={t('autopilot_hashtags_toggle')}
            />
            <div className="h-px bg-border" />
            <Toggle
              checked={config.includeEmoji ?? true}
              onChange={(v) => setConfig((prev) => ({ ...prev, includeEmoji: v }))}
              label={t('autopilot_emoji_toggle')}
            />
            <div className="h-px bg-border" />
            <Toggle
              checked={config.generateImages ?? true}
              onChange={(v) => setConfig((prev) => ({ ...prev, generateImages: v }))}
              label={t('autopilot_images_toggle')}
            />
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={saveConfig}
              disabled={saving}
              className={cn(
                'px-5 py-2.5 rounded-full text-[0.8rem] font-[500] border border-border-mid',
                'bg-surface2 text-ink cursor-pointer transition-all hover:border-border-active hover:text-accent',
                saving && 'opacity-50 cursor-not-allowed',
              )}
            >
              {saving ? 'Zapisywanie…' : t('autopilot_save_config')}
            </button>
            {saved && (
              <span className="text-[0.78rem] text-accent animate-fade-up">
                {t('autopilot_config_saved')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Generate card */}
      <div className={card}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="font-syne font-[700] text-[1rem] text-ink">Generowanie</h2>
            <p className="text-[0.78rem] text-muted mt-0.5">
              {config.lastRunAt
                ? `${t('autopilot_last_run')} ${new Date(config.lastRunAt).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' })}`
                : t('autopilot_never_run')}
            </p>
          </div>
          <button
            onClick={runAutopilot}
            disabled={running}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-full flex-shrink-0',
              'bg-accent text-bg text-[0.85rem] font-[500] cursor-pointer',
              'transition-all duration-200 hover:bg-[#d4f56a] hover:-translate-y-px',
              running && 'opacity-60 cursor-not-allowed hover:translate-y-0',
            )}
          >
            {running ? t('autopilot_generating') : `${t('autopilot_generate_btn')} (${total})`}
          </button>
        </div>

        {/* Progress */}
        {running && (
          <div className="mt-4 border-t border-border pt-4">
            <AutopilotProgress current={Math.ceil(progress)} total={total} />
          </div>
        )}

        {/* Error */}
        {error && !running && (
          <div className="mt-4 flex items-start gap-2 bg-coral/10 border border-coral/20 rounded-[12px] p-3">
            <span className="text-coral">✕</span>
            <span className="text-[0.82rem] text-coral">{error}</span>
          </div>
        )}
      </div>

      {/* Results card */}
      {result && !running && (
        <div className={cn(card, 'animate-fade-up')}>
          <h2 className="font-syne font-[700] text-[1rem] text-ink mb-4">
            {t('autopilot_result_heading')}
          </h2>

          {/* Summary badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="published">
              {result.succeeded} wygenerowanych
            </Badge>
            {result.failed > 0 && (
              <Badge variant="draft">
                {result.failed} nieudanych
              </Badge>
            )}
          </div>

          {/* Status message */}
          <p className="text-[0.85rem] text-muted mb-5">
            {result.failed === 0
              ? t('autopilot_result_success')
              : result.succeeded > 0
              ? t('autopilot_result_partial')
              : t('autopilot_result_failed')}
          </p>

          {/* Error details */}
          {result.errors.filter((e) => e.step !== 'image').length > 0 && (
            <div className="mb-4 bg-surface2 rounded-[10px] p-3 border border-border text-[0.75rem] text-muted font-mono">
              {result.errors
                .filter((e) => e.step !== 'image')
                .map((e, i) => (
                  <div key={i}>
                    Post {e.index + 1} ({e.step}): {e.message}
                  </div>
                ))}
            </div>
          )}

          {result.succeeded > 0 && (
            <Link
              href="/posts"
              className="inline-flex items-center gap-1.5 text-[0.85rem] text-accent hover:underline"
            >
              {t('autopilot_result_view_posts')}
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
