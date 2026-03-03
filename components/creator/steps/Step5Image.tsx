'use client'

import { useRef, useState, useCallback } from 'react'
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

  // AI generation state
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(
    state.imageUrl?.startsWith('data:') ? state.imageUrl.split(',')[1] : null,
  )
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  // Upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<'generated' | 'uploaded'>('generated')
  const uploadRef = useRef<HTMLInputElement>(null)

  // Logo / watermark state
  const [logoBase64, setLogoBase64] = useState<string | null>(loadStoredLogo)
  const [logoMode, setLogoMode] = useState<LogoMode>('corner')
  const [applyingLogo, setApplyingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)

  const currentBase64 = resultImage ?? (activeImage === 'uploaded' ? uploadedImage : generatedImage)

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
        setActiveImage('generated')
        const dataUrl = `data:image/png;base64,${data.imageBase64}`
        onChange({ imageUrl: dataUrl })
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
      setActiveImage('uploaded')
      setResultImage(null)
      onChange({ imageUrl: result })
    }
    reader.readAsDataURL(file)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      const base64 = result.split(',')[1]
      setLogoBase64(base64)
      storeLogoLocally(base64)
    }
    reader.readAsDataURL(file)
  }

  const applyLogo = useCallback(async () => {
    if (!currentBase64 || !logoBase64) return
    setApplyingLogo(true)
    setLogoError(null)
    try {
      const res = await fetch('/api/image-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseImage: currentBase64,
          logoImage: logoBase64,
          mode: logoMode,
        }),
      })
      const data = await res.json()
      if (data.resultImage) {
        setResultImage(data.resultImage)
        onChange({ imageUrl: `data:image/png;base64,${data.resultImage}` })
      } else {
        setLogoError(data.error || 'Błąd nakładania logo.')
      }
    } catch {
      setLogoError('Błąd połączenia przy nakładaniu logo.')
    } finally {
      setApplyingLogo(false)
    }
  }, [currentBase64, logoBase64, logoMode, onChange])

  const displayBase64 = currentBase64

  return (
    <div>
      <StepBadge>🖼 Krok 5</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step5_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-6">
        {t('step5_subheading')}
      </p>

      <div className="grid grid-cols-2 gap-5 mb-4 max-[700px]:grid-cols-1">

        {/* ── AI Generation panel ── */}
        <div className="bg-surface border border-border rounded-[20px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[0.75rem] font-[600] uppercase tracking-[0.08em] text-muted">
            ✦ Gemini Imagen
            <span className="px-2 py-0.5 rounded-full bg-purple/10 text-purple text-[0.65rem] uppercase tracking-[0.06em]">
              AI
            </span>
          </div>

          {/* Prompt field */}
          <div>
            <div className="text-[0.72rem] text-muted mb-1">{t('step5_prompt_label')}</div>
            <textarea
              rows={2}
              placeholder={
                state.content
                  ? 'Zostaw puste — AI wygeneruje prompt z treści posta'
                  : 'Opisz grafikę po angielsku, np. "Warm family portrait in autumn park"…'
              }
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="text-[0.82rem] w-full"
            />
            {generatedPrompt && !customPrompt && (
              <div className="mt-1.5 text-[0.7rem] text-muted italic line-clamp-2">
                Użyty prompt: {generatedPrompt}
              </div>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={generate}
            disabled={generating}
            className={cn(
              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[0.82rem] cursor-pointer transition-all',
              'bg-purple/10 border border-purple/25 text-purple hover:bg-purple/20',
              generating && 'opacity-60 cursor-not-allowed',
            )}
          >
            {generating ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                {t('step5_generating')}
              </>
            ) : generatedImage ? (
              t('step5_regenerate')
            ) : (
              t('step5_generate')
            )}
          </button>

          {genError && (
            <div className="px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
              {genError}
            </div>
          )}

          {/* Image preview */}
          <div className="aspect-square bg-surface2 rounded-xl overflow-hidden flex items-center justify-center">
            {generating ? (
              <div className="flex flex-col items-center gap-3">
                <span className="w-8 h-8 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                <span className="text-dim text-[0.78rem]">Generuję obraz…</span>
              </div>
            ) : generatedImage ? (
              <img
                src={`data:image/png;base64,${resultImage && activeImage === 'generated' ? resultImage : generatedImage}`}
                alt="Generated"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-5">
                <div className="text-[2rem] mb-2 opacity-30">🖼</div>
                <div className="text-dim text-[0.78rem]">
                  Kliknij &bdquo;Generuj&rdquo; aby<br />stworzyć grafikę
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Upload panel ── */}
        <div className="bg-surface border border-border rounded-[20px] p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[0.75rem] font-[600] uppercase tracking-[0.08em] text-muted">
            📁 {t('step5_upload_label')}
            <span className="px-2 py-0.5 rounded-full bg-coral/10 text-coral text-[0.65rem] uppercase tracking-[0.06em]">
              Upload
            </span>
          </div>

          {/* Drop zone */}
          <div
            onClick={() => uploadRef.current?.click()}
            className={cn(
              'aspect-square border-[1.5px] border-dashed border-border rounded-xl',
              'flex flex-col items-center justify-center gap-2.5 overflow-hidden',
              'cursor-pointer hover:border-border-active hover:bg-surface2 transition-all',
            )}
          >
            {uploadedImage ? (
              <img
                src={`data:image/jpeg;base64,${resultImage && activeImage === 'uploaded' ? resultImage : uploadedImage}`}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <div className="text-[2rem] opacity-40">⬆</div>
                <div className="text-[0.78rem] text-muted text-center leading-relaxed">
                  {t('step5_upload_hint')}
                </div>
                <div className="text-[0.68rem] text-dim mt-1">JPG, PNG, WEBP · maks. 20 MB</div>
              </>
            )}
          </div>
          <input
            ref={uploadRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />

          {/* Logo / watermark section */}
          <div className="border-t border-border pt-4">
            <div className="text-[0.72rem] font-[500] uppercase tracking-[0.08em] text-muted mb-3">
              {t('step5_logo_label')}
            </div>

            {/* Logo upload */}
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
                {logoBase64 ? '✓ Logo załadowane' : '+ Dodaj logo'}
              </button>
              {logoBase64 && (
                <button
                  onClick={() => { setLogoBase64(null); try { localStorage.removeItem(LOGO_STORAGE_KEY) } catch {} }}
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

            {/* Logo mode selection */}
            {logoBase64 && (
              <>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['watermark', 'frame', 'corner'] as LogoMode[]).map((m) => (
                    <Chip
                      key={m}
                      selected={logoMode === m}
                      onClick={() => setLogoMode(m)}
                    >
                      {m === 'watermark' ? t('step5_logo_watermark') : m === 'frame' ? t('step5_logo_frame') : t('step5_logo_corner')}
                    </Chip>
                  ))}
                </div>
                <button
                  onClick={applyLogo}
                  disabled={applyingLogo || !currentBase64}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] border text-[0.8rem] cursor-pointer transition-all',
                    'border-purple/25 bg-purple/10 text-purple hover:bg-purple/20',
                    (applyingLogo || !currentBase64) && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {applyingLogo ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-purple animate-spin" />
                      Nakładam logo…
                    </>
                  ) : (
                    '✦ Zastosuj logo'
                  )}
                </button>
                {logoError && (
                  <div className="mt-2 text-[0.72rem] text-coral">{logoError}</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Final preview strip */}
      {displayBase64 && (
        <div className="bg-surface border border-border rounded-[14px] p-4 mb-4 flex items-center gap-4">
          <img
            src={`data:image/png;base64,${displayBase64}`}
            alt="Preview"
            className="w-16 h-16 rounded-[8px] object-cover flex-shrink-0"
          />
          <div>
            <div className="text-[0.82rem] font-[500]">Grafika gotowa</div>
            <div className="text-[0.72rem] text-muted">
              {resultImage ? 'Z logo (Sharp)' : activeImage === 'generated' ? 'Wygenerowana przez Gemini Imagen' : 'Własne zdjęcie'}
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
