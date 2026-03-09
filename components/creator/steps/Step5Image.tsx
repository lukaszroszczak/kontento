'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { StepBadge } from '@/components/ui/StepBadge'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { cn } from '@/lib/utils'
import type { CreatorState } from '@/types'
import { useTranslation } from '@/lib/i18n'

interface Props {
  state: CreatorState
  onChange: (partial: Partial<CreatorState>) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

type LogoMode = 'watermark' | 'frame' | 'corner'
type ImageSource = 'ai' | 'upload'

const LOGO_STORAGE_KEY = 'kontento_logo_base64'

function loadStoredLogo(): string | null {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(LOGO_STORAGE_KEY) } catch { return null }
}
function storeLogoLocally(base64: string) {
  try { localStorage.setItem(LOGO_STORAGE_KEY, base64) } catch {}
}

export function Step5Image({ state, onChange, onNext, onBack, onSkip }: Props) {
  const { t } = useTranslation()

  const [source, setSource] = useState<ImageSource>('ai')

  // AI generation
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    state.imageUrl?.startsWith('data:') ? state.imageUrl.split(',')[1] : null,
  )
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  // Upload
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedMime, setUploadedMime] = useState('image/jpeg')
  const uploadRef = useRef<HTMLInputElement>(null)

  // AI edit (upload mode)
  const [aiEditPrompt, setAiEditPrompt] = useState('')
  const [aiEditing, setAiEditing] = useState(false)
  const [aiEditError, setAiEditError] = useState<string | null>(null)
  const [aiEditResult, setAiEditResult] = useState<string | null>(null)

  // Logo
  const [logoBase64, setLogoBase64] = useState<string | null>(() => {
    if (state.brand?.logoBase64) return state.brand.logoBase64
    return loadStoredLogo()
  })
  const [logoMode, setLogoMode] = useState<LogoMode>('corner')
  const [applyingLogo, setApplyingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.brand?.logoBase64 && state.brand.logoBase64 !== logoBase64) {
      setLogoBase64(state.brand.logoBase64)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.brand?.logoBase64])

  // Base image before logo: for upload mode prefer AI-edited version if available
  const sourceBase64 = source === 'ai'
    ? generatedImage
    : (aiEditResult ?? uploadedImage)

  // Final display: logo result > source image
  const displayBase64 = resultImage ?? sourceBase64

  const switchSource = (s: ImageSource) => {
    setSource(s)
    setResultImage(null)
    setAiEditResult(null)
    setAiEditError(null)
  }

  const generate = useCallback(async () => {
    setGenerating(true)
    setGenError(null)
    setResultImage(null)
    try {
      const res = await fetch('/api/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: state.content || '',
          brand: state.brand,
          platforms: state.platforms,
          customPrompt: customPrompt || undefined,
        }),
      })
      const data = await res.json()
      if (data.imageBase64) {
        setGeneratedImage(data.imageBase64)
        setGeneratedPrompt(data.prompt || '')
        onChange({ imageUrl: `data:image/png;base64,${data.imageBase64}` })
      } else {
        setGenError(data.error || t('error_api'))
      }
    } catch {
      setGenError(t('step4_error_connection'))
    } finally {
      setGenerating(false)
    }
  }, [state.content, state.brand, state.platforms, customPrompt, onChange, t])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setUploadedImage(base64)
      setUploadedMime(file.type || 'image/jpeg')
      setResultImage(null)
      setAiEditResult(null)
      onChange({ imageUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const applyAiEdit = useCallback(async () => {
    if (!uploadedImage || !aiEditPrompt.trim()) return
    setAiEditing(true)
    setAiEditError(null)
    try {
      const res = await fetch('/api/image-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedImage,
          mimeType: uploadedMime,
          prompt: aiEditPrompt.trim(),
        }),
      })
      const data = await res.json()
      if (data.resultImage) {
        setAiEditResult(data.resultImage)
        setResultImage(null)
        onChange({ imageUrl: `data:${data.mimeType ?? 'image/png'};base64,${data.resultImage}` })
      } else {
        setAiEditError(data.error || t('step5_ai_edit_error'))
      }
    } catch {
      setAiEditError(t('step5_ai_edit_error'))
    } finally {
      setAiEditing(false)
    }
  }, [uploadedImage, uploadedMime, aiEditPrompt, onChange, t])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setLogoBase64(base64)
      storeLogoLocally(base64)
      onChange({ brand: { ...state.brand, logoBase64: base64 } })
    }
    reader.readAsDataURL(file)
  }

  const applyLogo = useCallback(async () => {
    if (!sourceBase64 || !logoBase64) return
    setApplyingLogo(true)
    setLogoError(null)
    try {
      const res = await fetch('/api/image-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseImage: sourceBase64, logoImage: logoBase64, mode: logoMode }),
      })
      const data = await res.json()
      if (data.resultImage) {
        setResultImage(data.resultImage)
        onChange({ imageUrl: `data:image/png;base64,${data.resultImage}` })
      } else {
        setLogoError(data.error || t('step5_logo_error'))
      }
    } catch {
      setLogoError(t('step5_logo_error_connection'))
    } finally {
      setApplyingLogo(false)
    }
  }, [sourceBase64, logoBase64, logoMode, onChange, t])

  const isLogoLinkedToBrand = !!logoBase64 && state.brand?.logoBase64 === logoBase64

  return (
    <div>
      <StepBadge>🖼 {t('step5_label')}</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step5_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-6">
        {t('step5_subheading')}
      </p>

      <div className="bg-surface border border-border rounded-[20px] p-6 flex flex-col gap-4">

        {/* ── Source tabs — segmented control ── */}
        <div className="flex bg-surface2 border border-border rounded-[12px] p-1 gap-1">
          <button
            onClick={() => switchSource('ai')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-[9px] text-[0.8rem] font-[500] transition-all cursor-pointer',
              source === 'ai'
                ? 'bg-surface3 border border-border-mid text-ink shadow-sm'
                : 'text-muted hover:text-ink',
            )}
          >
            ✦ {t('step5_tab_ai')}
          </button>
          <button
            onClick={() => switchSource('upload')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-[9px] text-[0.8rem] font-[500] transition-all cursor-pointer',
              source === 'upload'
                ? 'bg-surface3 border border-border-mid text-ink shadow-sm'
                : 'text-muted hover:text-ink',
            )}
          >
            📁 {t('step5_tab_upload')}
          </button>
        </div>

        {/* ── AI mode: prompt + single generate button ── */}
        {source === 'ai' && (
          <div className="flex flex-col gap-2.5">
            {state.brand?.imagePromptTemplate && (
              <div className="flex items-start gap-2 px-3 py-2 bg-accent-dim border border-accent/20 rounded-[10px]">
                <span className="text-accent text-[0.8rem] flex-shrink-0">✦</span>
                <div>
                  <div className="text-[0.72rem] font-[500] text-accent">{t('step5_brand_template_active')}</div>
                  <div className="text-[0.68rem] text-muted mt-0.5 line-clamp-2">{state.brand.imagePromptTemplate}</div>
                </div>
              </div>
            )}

            <div>
              <div className="text-[0.72rem] text-muted mb-1">{t('step5_prompt_label')}</div>
              <textarea
                rows={2}
                placeholder={
                  state.content
                    ? t('step5_prompt_placeholder_content')
                    : t('step5_prompt_placeholder_empty')
                }
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="text-[0.82rem] w-full"
              />
              {generatedPrompt && !customPrompt && (
                <div className="mt-1 text-[0.7rem] text-muted italic line-clamp-2">
                  {t('step5_prompt_used')} {generatedPrompt}
                </div>
              )}
            </div>

            {/* Single generate button — full width */}
            <button
              onClick={generate}
              disabled={generating}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] text-[0.88rem] font-[500] cursor-pointer transition-all',
                'bg-purple/10 border border-purple/25 text-purple hover:bg-purple/20',
                generating && 'opacity-60 cursor-not-allowed',
              )}
            >
              {generating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                  {t('step5_generating')}
                </>
              ) : generatedImage ? (
                `↺ ${t('step5_regenerate')}`
              ) : (
                `✦ ${t('step5_generate')}`
              )}
            </button>

            {genError && (
              <div className="px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
                {genError}
              </div>
            )}
          </div>
        )}

        {/* ── Shared image preview — max-height so it never blocks scroll ── */}
        <div
          className={cn(
            'relative bg-surface2 rounded-xl overflow-hidden flex items-center justify-center',
            source === 'upload' && !displayBase64 &&
              'border-[1.5px] border-dashed border-border cursor-pointer hover:border-border-active hover:bg-surface3 transition-all',
          )}
          style={{ minHeight: '160px', maxHeight: '380px', aspectRatio: displayBase64 ? 'auto' : '1/1' }}
          onClick={source === 'upload' && !displayBase64 ? () => uploadRef.current?.click() : undefined}
        >
          {generating ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <span className="w-8 h-8 rounded-full border-2 border-t-transparent border-purple animate-spin" />
              <span className="text-dim text-[0.78rem]">{t('step5_generating_image')}</span>
            </div>
          ) : displayBase64 ? (
            <>
              <img
                src={`data:image/png;base64,${displayBase64}`}
                alt="Preview"
                className="w-full h-full object-contain"
                style={{ maxHeight: '380px' }}
              />
              {source === 'upload' && (
                <button
                  onClick={(e) => { e.stopPropagation(); uploadRef.current?.click() }}
                  className="absolute bottom-3 right-3 bg-surface/90 border border-border rounded-[8px] px-3 py-1.5 text-[0.72rem] text-muted hover:text-ink hover:border-border-mid transition-all cursor-pointer backdrop-blur-sm"
                >
                  ↺ {t('step5_upload_change')}
                </button>
              )}
            </>
          ) : source === 'ai' ? (
            <div className="text-center p-8">
              <div className="text-[2rem] mb-2 opacity-30">✦</div>
              <div className="text-dim text-[0.78rem]">{t('step5_generate_click_hint')}</div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-[2rem] mb-2 opacity-40">⬆</div>
              <div className="text-[0.78rem] text-muted text-center leading-relaxed">{t('step5_upload_hint')}</div>
              <div className="text-[0.68rem] text-dim mt-1">{t('step5_upload_formats')}</div>
            </div>
          )}
        </div>

        <input
          ref={uploadRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleUpload}
        />

        {/* ── AI edit — only in upload mode with an uploaded image ── */}
        {source === 'upload' && uploadedImage && (
          <div className="border border-purple/20 bg-purple/5 rounded-[14px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[0.75rem] font-[600] uppercase tracking-[0.07em] text-purple">
              ✦ {t('step5_ai_edit_label')}
            </div>
            <div>
              <textarea
                rows={2}
                placeholder={t('step5_ai_edit_placeholder')}
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                className="text-[0.82rem] w-full"
              />
              <div className="text-[0.68rem] text-muted mt-1">{t('step5_ai_edit_hint')}</div>
            </div>
            <button
              onClick={applyAiEdit}
              disabled={aiEditing || !aiEditPrompt.trim()}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[0.82rem] font-[500] cursor-pointer transition-all',
                'bg-purple/10 border border-purple/25 text-purple hover:bg-purple/20',
                (aiEditing || !aiEditPrompt.trim()) && 'opacity-50 cursor-not-allowed',
              )}
            >
              {aiEditing ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                  {t('step5_ai_editing')}
                </>
              ) : (
                `✦ ${t('step5_ai_edit_btn')}`
              )}
            </button>
            {aiEditResult && (
              <button
                onClick={() => {
                  setAiEditResult(null)
                  onChange({ imageUrl: `data:${uploadedMime};base64,${uploadedImage}` })
                }}
                className="text-[0.72rem] text-muted hover:text-coral cursor-pointer transition-all text-center"
              >
                ↩ {t('step5_ai_edit_revert')}
              </button>
            )}
            {aiEditError && (
              <div className="text-[0.72rem] text-coral">{aiEditError}</div>
            )}
          </div>
        )}

        {/* ── Logo / watermark ── */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[0.72rem] font-[500] uppercase tracking-[0.08em] text-muted">
              {t('step5_logo_label')}
            </div>
            {isLogoLinkedToBrand && (
              <div className="text-[0.68rem] text-accent">✓ {t('step5_logo_brand_linked')}</div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => logoRef.current?.click()}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[10px] border text-[0.78rem] cursor-pointer transition-all',
                logoBase64
                  ? 'border-accent/30 bg-accent-dim text-accent'
                  : 'border-border text-muted hover:border-border-mid',
              )}
            >
              {logoBase64 ? t('step5_logo_loaded') : t('step5_logo_add')}
            </button>
            {logoBase64 && (
              <button
                onClick={() => {
                  setLogoBase64(null)
                  setResultImage(null)
                  try { localStorage.removeItem(LOGO_STORAGE_KEY) } catch {}
                  onChange({ brand: { ...state.brand, logoBase64: null } })
                }}
                className="text-[0.72rem] text-muted hover:text-coral transition-all cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <input
            ref={logoRef}
            type="file"
            accept="image/png,image/svg+xml,image/jpeg"
            className="hidden"
            onChange={handleLogoUpload}
          />

          {logoBase64 && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {(['watermark', 'frame', 'corner'] as LogoMode[]).map((m) => (
                  <Chip key={m} selected={logoMode === m} onClick={() => setLogoMode(m)}>
                    {m === 'watermark' ? t('step5_logo_watermark') : m === 'frame' ? t('step5_logo_frame') : t('step5_logo_corner')}
                  </Chip>
                ))}
              </div>
              <button
                onClick={applyLogo}
                disabled={applyingLogo || !sourceBase64}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] border text-[0.8rem] cursor-pointer transition-all',
                  'border-purple/25 bg-purple/10 text-purple hover:bg-purple/20',
                  (applyingLogo || !sourceBase64) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {applyingLogo ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                    {t('step5_logo_applying')}
                  </>
                ) : (
                  t('step5_logo_apply')
                )}
              </button>
              {logoError && <div className="mt-2 text-[0.72rem] text-coral">{logoError}</div>}
            </>
          )}
        </div>
      </div>

      {/* Status strip */}
      {displayBase64 && (
        <div className="mt-3 bg-surface border border-border rounded-[12px] px-4 py-2.5 flex items-center gap-3">
          <img
            src={`data:image/png;base64,${displayBase64}`}
            alt="Thumb"
            className="w-10 h-10 rounded-[6px] object-cover flex-shrink-0"
          />
          <div>
            <div className="text-[0.82rem] font-[500]">{t('step5_image_ready')}</div>
            <div className="text-[0.72rem] text-muted">
              {resultImage
                ? t('step5_image_with_logo')
                : source === 'ai'
                  ? t('step5_image_generated')
                  : aiEditResult
                    ? t('step5_image_ai_edited')
                    : t('step5_image_uploaded')}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="secondary" onClick={onBack}>{t('btn_back')}</Button>
        <Button variant="primary" onClick={onNext}>{t('step5_cta')}</Button>
        <Button variant="ghost" onClick={onSkip}>{t('step5_skip')}</Button>
      </div>
    </div>
  )
}
