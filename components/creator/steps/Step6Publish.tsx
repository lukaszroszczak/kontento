'use client'

import { useState } from 'react'
import { StepBadge } from '@/components/ui/StepBadge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { cn } from '@/lib/utils'
import type { CreatorState, Platform } from '@/types'
import { useTranslation } from '@/lib/i18n'

const ALL_PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0a66c2' },
  { id: 'tiktok',    label: 'TikTok',    color: '#000000' },
]

function suggestTimeKey(platforms: Platform[]): 'step6_suggest_tuesday' | 'step6_suggest_wednesday' {
  if (platforms.includes('linkedin')) return 'step6_suggest_tuesday'
  return 'step6_suggest_wednesday'
}

/** Next occurrence of a given weekday (0=Sun…6=Sat) at given hour:min */
function nextWeekday(weekday: number, hour: number, minute: number): string {
  const d = new Date()
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7 || 7))
  d.setHours(hour, minute, 0, 0)
  return d.toISOString().slice(0, 16)
}

function formatScheduled(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pl-PL', {
      weekday: 'short', day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

interface Props {
  state: CreatorState
  onChange: (partial: Partial<CreatorState>) => void
  onBack: () => void
  onClose: () => void
}

export function Step6Publish({ state, onChange, onBack, onClose }: Props) {
  const { t } = useTranslation()
  const [publishNow, setPublishNow] = useState(state.publishNow)
  const [scheduledAt, setScheduledAt] = useState<string>(() => {
    if (state.scheduledAt) return new Date(state.scheduledAt).toISOString().slice(0, 16)
    return nextWeekday(3, 19, 30) // Wednesday 19:30
  })
  const [hashtags, setHashtags] = useState<string[]>(state.hashtags)
  const [newHashtag, setNewHashtag] = useState('')
  const [platforms, setPlatforms] = useState<Platform[]>(
    state.platforms.length ? state.platforms : ['instagram'],
  )
  const [done, setDone] = useState<'published' | 'scheduled' | 'draft' | false>(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [previewTab, setPreviewTab] = useState<'instagram' | 'linkedin' | 'facebook'>('instagram')

  // ── Brand display ────────────────────────────────────────────────────────────
  const brandName = state.brand.name?.trim() || t('step6_brand_fallback')
  const brandHandle = brandName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  const brandSubtitle =
    [state.brand.industry, state.brand.description?.slice(0, 30)]
      .filter(Boolean)
      .join(' · ') || null

  // ── Caption preview ──────────────────────────────────────────────────────────
  const captionFull = [state.content, hashtags.join(' ')].filter(Boolean).join('\n\n')
  const captionPreview = captionFull.slice(0, 120)
  const hasMore = captionFull.length > 120

  // ── Hashtag helpers ───────────────────────────────────────────────────────────
  const removeHashtag = (tag: string) => setHashtags((h) => h.filter((t) => t !== tag))

  const addHashtag = () => {
    const raw = newHashtag.trim()
    if (!raw) return
    const tag = raw.startsWith('#') ? raw : `#${raw}`
    if (!hashtags.includes(tag)) setHashtags((h) => [...h, tag])
    setNewHashtag('')
  }

  // ── Save post to DB ───────────────────────────────────────────────────────────
  const saveToDb = async (status: 'PUBLISHED' | 'SCHEDULED' | 'DRAFT', schedAt: string | null) => {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content,
          platforms,
          hashtags,
          status,
          scheduledAt: schedAt,
          imageUrl: state.imageUrl,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? t('step6_error_save'))
      }
      // Notify post list to refresh
      window.dispatchEvent(new CustomEvent('post-created'))
      return true
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : t('step6_error_default'))
      return false
    } finally {
      setSaving(false)
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    onChange({ publishNow: true, scheduledAt: null, hashtags, platforms })
    const ok = await saveToDb('PUBLISHED', null)
    if (ok) { setDone('published'); setTimeout(onClose, 1800) }
  }

  const handleSchedule = async () => {
    onChange({ publishNow: false, scheduledAt: new Date(scheduledAt), hashtags, platforms })
    const ok = await saveToDb('SCHEDULED', new Date(scheduledAt).toISOString())
    if (ok) { setDone('scheduled'); setTimeout(onClose, 1800) }
  }

  const handleSaveDraft = async () => {
    onChange({ hashtags, platforms })
    const ok = await saveToDb('DRAFT', null)
    if (ok) { setDone('draft'); setTimeout(onClose, 1800) }
  }

  const schedLabel = formatScheduled(scheduledAt)

  // ── Success screen ────────────────────────────────────────────────────────────
  if (done) {
    const successMap = {
      published: { emoji: '🚀', title: t('step6_success_published'), desc: `${t('step6_success_published_desc')}${platforms.join(', ')}.` },
      scheduled:  { emoji: '📅', title: t('step6_success_scheduled'),  desc: `${t('step6_success_scheduled_desc')}${schedLabel}.` },
      draft:      { emoji: '💾', title: t('step6_success_draft'),    desc: t('step6_success_draft_desc') },
    }
    const { emoji, title, desc } = successMap[done]
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] gap-5 text-center">
        <div className="text-[4rem]">{emoji}</div>
        <h2 className="font-syne text-[2rem] font-[700] tracking-[-0.03em]">{title}</h2>
        <p className="text-muted text-[0.9rem] max-w-[360px]">{desc}</p>
      </div>
    )
  }

  return (
    <div>
      <StepBadge>🚀 {t('step6_label')}</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step6_heading_full').split('\n').map((line, i) => (
          <span key={i}>{line}{i === 0 && <br />}</span>
        ))}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-8">
        {t('step6_subheading_full')}
      </p>

      <div className="bg-surface border border-border rounded-[20px] p-8 grid grid-cols-[1fr_300px] gap-10 mb-4 max-[800px]:grid-cols-1">

        {/* ── Preview tabs + mockup ── */}
        <div className="flex flex-col items-center gap-4">
          {/* Tab switcher */}
          <div className="flex gap-1 bg-surface2 border border-border rounded-[12px] p-1">
            {(['instagram', 'linkedin', 'facebook'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setPreviewTab(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-[8px] text-[0.72rem] font-[500] transition-all cursor-pointer capitalize',
                  previewTab === tab
                    ? 'bg-surface text-ink border border-border-mid shadow-sm'
                    : 'text-muted hover:text-ink',
                )}
              >
                {tab === 'instagram' ? '📸 Instagram' : tab === 'linkedin' ? '💼 LinkedIn' : '👥 Facebook'}
              </button>
            ))}
          </div>

          {/* Instagram mockup */}
          {previewTab === 'instagram' && (
            <div className="w-[240px] bg-[#1c1c1e] rounded-[32px] p-3.5 border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
              <div className="bg-white rounded-[22px] overflow-hidden text-black">
                <div className="flex items-center gap-2.5 p-3 border-b border-black/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[0.75rem] font-[700] truncate">{brandHandle}</div>
                    {brandSubtitle && <div className="text-[0.6rem] text-gray-500 truncate">{brandSubtitle}</div>}
                  </div>
                </div>
                <div className="w-full aspect-square bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center overflow-hidden">
                  {state.imageUrl
                    ? <img src={state.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="flex flex-col items-center gap-2 opacity-40"><span className="text-[2.5rem]">🖼️</span><span className="text-[0.6rem] text-white">{t('step6_preview_no_image')}</span></div>
                  }
                </div>
                <div className="p-3 text-[0.68rem] leading-relaxed text-gray-700">
                  {captionFull
                    ? <><strong className="text-black font-[700]">{brandHandle}</strong>{' '}{captionPreview}{hasMore && <span className="text-[#0095f6]"> {t('step6_preview_more')}</span>}</>
                    : <span className="text-gray-400 italic">{t('step6_preview_no_content')}</span>}
                </div>
                <div className="flex gap-3 px-3 py-2 border-t border-black/10 text-[0.65rem] text-gray-400">
                  <span>❤ —</span><span>💬 —</span><span>📤</span>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn mockup */}
          {previewTab === 'linkedin' && (
            <div className="w-[280px] bg-white rounded-[12px] border border-gray-200 overflow-hidden text-black shadow-lg">
              <div className="flex items-center gap-2.5 p-3">
                <div className="w-10 h-10 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-[700] text-sm flex-shrink-0">
                  {brandName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-[0.78rem] font-[700] truncate">{brandName}</div>
                  {brandSubtitle && <div className="text-[0.63rem] text-gray-500 truncate">{brandSubtitle}</div>}
                  <div className="text-[0.6rem] text-gray-400">{t('step6_preview_now')}</div>
                </div>
              </div>
              <div className="px-3 pb-2 text-[0.72rem] leading-relaxed text-gray-800">
                {captionFull
                  ? <>{captionPreview}{hasMore && <span className="text-[#0a66c2]"> {t('step6_preview_show_more')}</span>}</>
                  : <span className="text-gray-400 italic">{t('step6_preview_no_content_short')}</span>}
              </div>
              {state.imageUrl && (
                <div className="w-full aspect-video overflow-hidden">
                  <img src={state.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-4 px-3 py-2 border-t border-gray-100 text-[0.63rem] text-gray-400">
                <span>👍 Lubię</span><span>💬 Komentarz</span><span>🔁 Udostępnij</span>
              </div>
            </div>
          )}

          {/* Facebook mockup */}
          {previewTab === 'facebook' && (
            <div className="w-[280px] bg-white rounded-[12px] border border-gray-200 overflow-hidden text-black shadow-lg">
              <div className="flex items-center gap-2.5 p-3">
                <div className="w-10 h-10 rounded-full bg-[#1877f2] flex items-center justify-center text-white font-[700] text-sm flex-shrink-0">
                  {brandName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-[0.78rem] font-[700]">{brandName}</div>
                  <div className="text-[0.6rem] text-gray-400">{t('step6_preview_now')}</div>
                </div>
              </div>
              <div className="px-3 pb-3 text-[0.75rem] leading-relaxed text-gray-800">
                {captionFull
                  ? <>{captionPreview}{hasMore && <span className="text-[#1877f2]"> {t('step6_preview_see_more')}</span>}</>
                  : <span className="text-gray-400 italic">{t('step6_preview_no_content_short')}</span>}
              </div>
              {state.imageUrl && (
                <div className="w-full aspect-video overflow-hidden">
                  <img src={state.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-4 px-3 py-2.5 border-t border-gray-100 text-[0.63rem] text-gray-400">
                <span>👍 Lubię to</span><span>💬 Komentuj</span><span>↗ Udostępnij</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Settings panel ── */}
        <div className="flex flex-col gap-5">
          <h3 className="font-syne text-[1.2rem] font-[700] tracking-[-0.02em]">
            {t('step6_settings_heading')}
          </h3>

          {/* When */}
          <div>
            <FieldLabel>{t('step6_when_label')}</FieldLabel>
            <div className="flex gap-2">
              {[
                { label: t('step6_now_option'), val: true },
                { label: t('step6_schedule_option'), val: false },
              ].map(({ label, val }) => (
                <button
                  key={label}
                  onClick={() => setPublishNow(val)}
                  className={cn(
                    'flex-1 px-2.5 py-2.5 rounded-[10px] border text-[0.8rem] cursor-pointer transition-all font-dm',
                    publishNow === val
                      ? 'bg-accent-dim border-accent/30 text-accent'
                      : 'bg-transparent border-border text-muted hover:border-border-active',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {!publishNow && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 w-full !text-[0.8rem]"
              />
            )}
          </div>

          {/* AI recommendation */}
          <div className="flex items-center gap-1.5 px-3 py-3 bg-surface2 rounded-[10px] text-[0.78rem] text-muted">
            {t('step6_ai_recommend')}
            <strong className="text-accent">{t(suggestTimeKey(platforms))}</strong>
            {t('step6_best_reach')}
          </div>

          {/* Platforms */}
          <div>
            <FieldLabel>{t('step6_platforms_label')}</FieldLabel>
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_PLATFORMS.map(({ id, label, color }) => (
                <Chip
                  key={id}
                  selected={platforms.includes(id)}
                  onClick={() =>
                    setPlatforms((prev) =>
                      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
                    )
                  }
                  dot={color}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div>
              <FieldLabel>{t('step6_hashtags_label')}</FieldLabel>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {hashtags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeHashtag(tag)}
                    className="px-2.5 py-1 bg-surface2 border border-border rounded-full text-[0.72rem] text-purple cursor-pointer hover:border-coral hover:text-coral transition-all"
                  >
                    {tag} ×
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add hashtag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t('step6_hashtag_placeholder')}
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHashtag() } }}
              className="flex-1 !py-2 !text-[0.8rem]"
            />
            <button
              onClick={addHashtag}
              className="px-3 rounded-[10px] bg-surface2 border border-border text-[1rem] text-muted hover:text-ink hover:border-border-active transition-all cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Error */}
          {saveError && (
            <div className="px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
              {saveError}
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-col gap-2">
            {publishNow ? (
              <Button
                variant="primary"
                onClick={handlePublish}
                disabled={saving}
                className="w-full justify-center !rounded-[14px] !py-3.5 !text-base"
              >
                {saving ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-t-transparent border-bg animate-spin" /> {t('step6_saving')}</>
                ) : t('step6_publish_btn')}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={saving}
                className="w-full justify-center !rounded-[14px] !py-3.5 !text-base"
              >
                {saving ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-t-transparent border-bg animate-spin" /> {t('step6_saving')}</>
                ) : `📅 ${t('step6_schedule_option')} ${schedLabel}`}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={saving}
              className="w-full justify-center !rounded-[14px] !py-2.5"
            >
              {t('step6_draft_btn')}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="secondary" onClick={onBack}>{t('step6_back')}</Button>
        <span className="text-[0.75rem] text-dim ml-auto">
          {t('step6_footer')}@{brandHandle}
        </span>
      </div>
    </div>
  )
}
