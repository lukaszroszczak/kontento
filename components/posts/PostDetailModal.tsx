'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Post, Platform } from '@/types'
import { STATUS_LABELS } from '@/types'
import { useTranslation } from '@/lib/i18n'

const PLATFORM_ICONS: Record<Platform, string> = {
  instagram: '📸',
  linkedin:  '💼',
  facebook:  '👥',
  tiktok:    '🎵',
}

const PLATFORM_LABELS_MAP: Record<Platform, string> = {
  instagram: 'Instagram',
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
  tiktok:    'TikTok',
}

type ImageMode = null | 'regenerate' | 'url' | 'file'

interface Props {
  post: Post
  onClose: () => void
  onPostUpdate?: (updated: Post) => void
}

export function PostDetailModal({ post, onClose, onPostUpdate }: Props) {
  const { t } = useTranslation()

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editing, setEditing]           = useState(false)
  const [content, setContent]           = useState(post.content)
  const [imageUrl, setImageUrl]         = useState(post.imageUrl ?? '')
  const [imageMode, setImageMode]       = useState<ImageMode>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [urlInput, setUrlInput]         = useState('')
  const [saving, setSaving]             = useState(false)
  const [generating, setGenerating]     = useState(false)
  const [genError, setGenError]         = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Reset when switching posts
  useEffect(() => {
    setContent(post.content)
    setImageUrl(post.imageUrl ?? '')
    setEditing(false)
    setImageMode(null)
    setCustomPrompt('')
    setUrlInput('')
    setGenError(null)
  }, [post.id])

  // Auto-resize textarea
  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [editing, content])

  // Keyboard: Escape → cancel edit first, then close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (imageMode) { setImageMode(null); return }
      if (editing)   { setEditing(false);  return }
      onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, editing, imageMode])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const enterEdit = () => {
    setContent(post.content)
    setImageUrl(post.imageUrl ?? '')
    setImageMode(null)
    setGenError(null)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setImageMode(null)
    setGenError(null)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const hashtags = content.match(/#[\w\u0100-\u017F]+/g) ?? []
      // Derive title from first non-empty line
      const newTitle =
        content.split('\n').map((l) => l.trim()).find(Boolean)?.slice(0, 80) || post.title

      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          title: newTitle,
          imageUrl: imageUrl || null,
          hashtags,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        onPostUpdate?.(data.post)
        setEditing(false)
        setImageMode(null)
      }
    } finally {
      setSaving(false)
    }
  }, [post.id, post.title, content, imageUrl, onPostUpdate])

  const handleRegenerate = useCallback(async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          customPrompt: customPrompt.trim() || undefined,
          platforms: post.platforms,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenError(data.error ?? 'Błąd generowania grafiki')
        return
      }
      setImageUrl(`data:${data.mimeType};base64,${data.imageBase64}`)
      setImageMode(null)
      setCustomPrompt('')
    } catch {
      setGenError('Błąd połączenia z serwerem')
    } finally {
      setGenerating(false)
    }
  }, [content, customPrompt, post.platforms])

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim())
      setUrlInput('')
      setImageMode(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string)
      setImageMode(null)
    }
    reader.readAsDataURL(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  // ── Derived ─────────────────────────────────────────────────────────────────

  const displayDate =
    post.status === 'PUBLISHED' && post.publishedAt
      ? `${t('posts_detail_published')}${formatDate(post.publishedAt)}`
      : post.status === 'SCHEDULED' && post.scheduledAt
      ? `${t('posts_detail_scheduled')}${formatDate(post.scheduledAt)}`
      : `${t('posts_detail_created')}${formatDate(post.createdAt)}`

  const hashtagMatches = (editing ? content : post.content).match(/#\w+/g) ?? []

  const currentImage = editing ? imageUrl : (post.imageUrl ?? '')

  // ── Shared styles ────────────────────────────────────────────────────────────
  const sectionLabel = 'text-[0.72rem] uppercase tracking-[0.08em] text-dim mb-2 font-[600]'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={() => { if (!editing) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative z-10 w-full max-w-[680px] max-h-[90vh] overflow-y-auto',
          'bg-surface border border-border rounded-[24px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]',
          'animate-scale-in flex flex-col',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-4 p-6 border-b border-border sticky top-0 bg-surface z-10 rounded-t-[24px]">
          <div className="flex-1 min-w-0">
            <h2 className="font-syne text-[1.2rem] font-[700] tracking-[-0.02em] truncate">
              {post.title}
            </h2>
            <p className="text-[0.75rem] text-muted mt-0.5">{displayDate}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge
              variant={
                post.status === 'PUBLISHED' ? 'published'
                : post.status === 'SCHEDULED' ? 'scheduled'
                : 'draft'
              }
            >
              {STATUS_LABELS[post.status]}
            </Badge>

            {/* Edit / Cancel toggle */}
            {!editing ? (
              <button
                onClick={enterEdit}
                className="px-3 py-1.5 rounded-full text-[0.75rem] font-[500] bg-surface2 border border-border text-muted hover:border-border-active hover:text-ink transition-all cursor-pointer"
              >
                ✏️ {t('post_edit_btn')}
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                className="px-3 py-1.5 rounded-full text-[0.75rem] font-[500] bg-surface2 border border-border text-muted hover:border-border-active hover:text-ink transition-all cursor-pointer"
              >
                {t('post_edit_cancel')}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface2 hover:bg-surface3 flex items-center justify-center text-muted hover:text-ink transition-all cursor-pointer text-[1.1rem]"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="p-6 flex flex-col gap-6">

          {/* ── Image section ─────────────────────────────────────────────────── */}
          {(currentImage || editing) && (
            <div>
              {editing && (
                <p className={sectionLabel}>{t('post_edit_image_label')}</p>
              )}

              {/* Current image preview — natural aspect ratio, no cropping */}
              {currentImage && (
                <div className="w-full rounded-[16px] overflow-hidden bg-surface2 mb-3">
                  <img
                    src={currentImage}
                    alt={t('posts_detail_image_alt')}
                    className="w-full h-auto block"
                  />
                </div>
              )}

              {/* Empty image placeholder in edit mode */}
              {editing && !currentImage && (
                <div className="w-full rounded-[16px] bg-surface2 border border-dashed border-border flex items-center justify-center py-12 mb-3">
                  <span className="text-muted text-[0.85rem]">Brak grafiki</span>
                </div>
              )}

              {/* Action row (edit mode only) */}
              {editing && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setImageMode(imageMode === 'regenerate' ? null : 'regenerate')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-[500] border cursor-pointer transition-all',
                      imageMode === 'regenerate'
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'bg-surface2 border-border text-muted hover:border-border-active hover:text-ink',
                    )}
                  >
                    🔄 {t('post_edit_image_regenerate')}
                  </button>
                  <button
                    onClick={() => setImageMode(imageMode === 'url' ? null : 'url')}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-[500] border cursor-pointer transition-all',
                      imageMode === 'url'
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'bg-surface2 border-border text-muted hover:border-border-active hover:text-ink',
                    )}
                  >
                    🔗 {t('post_edit_image_from_url')}
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-[500] border bg-surface2 border-border text-muted hover:border-border-active hover:text-ink cursor-pointer transition-all"
                  >
                    📁 {t('post_edit_image_from_file')}
                  </button>
                  {currentImage && (
                    <button
                      onClick={() => { setImageUrl(''); setImageMode(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-[500] border bg-surface2 border-border text-muted hover:border-coral/40 hover:text-coral cursor-pointer transition-all"
                    >
                      🗑 {t('post_edit_image_remove')}
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* ── Regenerate panel ──────────────────────────────────────────── */}
              {editing && imageMode === 'regenerate' && (
                <div className="mt-3 bg-surface2 border border-border rounded-[14px] p-4 flex flex-col gap-3">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={t('post_edit_image_prompt_placeholder')}
                    rows={2}
                    className="w-full bg-surface3 border border-border rounded-[10px] px-3 py-2 text-[0.82rem] text-ink placeholder:text-dim resize-none outline-none focus:border-border-active transition-colors"
                  />
                  {genError && (
                    <p className="text-[0.78rem] text-coral">{genError}</p>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={generating}
                    className="self-start"
                  >
                    {generating ? t('post_edit_image_generating') : `✨ ${t('post_edit_image_generate')}`}
                  </Button>
                </div>
              )}

              {/* ── URL panel ─────────────────────────────────────────────────── */}
              {editing && imageMode === 'url' && (
                <div className="mt-3 bg-surface2 border border-border rounded-[14px] p-4 flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={t('post_edit_image_url_placeholder')}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyUrl() }}
                    className="flex-1 bg-surface3 border border-border rounded-[10px] px-3 py-2 text-[0.82rem] text-ink placeholder:text-dim outline-none focus:border-border-active transition-colors"
                  />
                  <Button variant="secondary" size="sm" onClick={handleApplyUrl}>
                    {t('post_edit_image_apply_url')}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────────────────── */}
          <div>
            <p className={sectionLabel}>{t('posts_detail_content')}</p>

            {editing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value)
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                className={cn(
                  'w-full bg-surface2 border border-border-active rounded-[14px] p-4',
                  'text-[0.88rem] leading-relaxed text-ink resize-none outline-none',
                  'focus:border-accent/50 transition-colors min-h-[160px]',
                )}
              />
            ) : (
              <div className="bg-surface2 rounded-[14px] p-4 text-[0.88rem] leading-relaxed text-ink whitespace-pre-wrap border border-border">
                {post.content || <span className="text-muted italic">{t('posts_detail_no_content')}</span>}
              </div>
            )}
          </div>

          {/* ── Hashtags ────────────────────────────────────────────────────── */}
          {hashtagMatches.length > 0 && (
            <div>
              <p className={sectionLabel}>{t('posts_detail_hashtags')}</p>
              <div className="flex flex-wrap gap-1.5">
                {hashtagMatches.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-surface2 border border-border rounded-full text-[0.72rem] text-purple"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Platforms ────────────────────────────────────────────────────── */}
          {post.platforms.length > 0 && (
            <div>
              <p className={sectionLabel}>{t('posts_detail_platforms')}</p>
              <div className="flex gap-2 flex-wrap">
                {post.platforms.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface2 border border-border rounded-[8px] text-[0.78rem] text-muted"
                  >
                    <span>{PLATFORM_ICONS[p]}</span>
                    <span>{PLATFORM_LABELS_MAP[p]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stats (published only) ────────────────────────────────────────── */}
          {post.stats && post.status === 'PUBLISHED' && (
            <div>
              <p className={sectionLabel}>{t('posts_detail_stats')}</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: t('posts_stat_likes'),    value: post.stats.likes,    emoji: '❤️' },
                  { label: t('posts_stat_comments'), value: post.stats.comments, emoji: '💬' },
                  { label: t('posts_stat_reach'),    value: post.stats.reach,    emoji: '👁' },
                  { label: t('posts_stat_clicks'),   value: post.stats.clicks,   emoji: '🔗' },
                ].map(({ label, value, emoji }) => (
                  <div key={label} className="bg-surface2 border border-border rounded-[12px] p-3 text-center">
                    <div className="text-[1.2rem] mb-1">{emoji}</div>
                    <div className="font-syne font-[700] text-[1rem]">
                      {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
                    </div>
                    <div className="text-[0.65rem] text-muted mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Save footer (edit mode) ───────────────────────────────────────── */}
          {editing && (
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? t('post_edit_saving') : `💾 ${t('post_edit_save')}`}
              </Button>
              <Button variant="ghost" size="md" onClick={cancelEdit}>
                {t('post_edit_cancel')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
