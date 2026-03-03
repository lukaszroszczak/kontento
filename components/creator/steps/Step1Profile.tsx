'use client'

import { StepBadge } from '@/components/ui/StepBadge'
import { FieldLabel } from '@/components/ui/FieldLabel'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { CreatorState, Platform } from '@/types'
import { TONE_OPTIONS } from '@/lib/constants'
import { useTranslation } from '@/lib/i18n'
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  normaliseBrand,
  type SavedBrandProfile,
} from '@/lib/brandProfiles'

const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: 'instagram', label: 'Instagram', color: '#e1306c' },
  { id: 'linkedin',  label: 'LinkedIn',  color: '#0a66c2' },
  { id: 'facebook',  label: 'Facebook',  color: '#1877f2' },
  { id: 'tiktok',    label: 'TikTok',    color: '#000000' },
]

interface Props {
  state: CreatorState
  onChange: (partial: Partial<CreatorState>) => void
  onNext: () => void
}

export function Step1Profile({ state, onChange, onNext }: Props) {
  const { t } = useTranslation()
  const [platforms, setPlatforms] = useState<Platform[]>(state.platforms)
  const [tone, setTone] = useState(state.tone || state.brand.tone || TONE_OPTIONS[0].value)

  // Saved profiles
  const [profiles, setProfiles] = useState<SavedBrandProfile[]>([])
  const [showProfilesPanel, setShowProfilesPanel] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  useEffect(() => {
    setProfiles(loadProfiles())
  }, [])

  const togglePlatform = (id: Platform) => {
    const next = platforms.includes(id) ? platforms.filter((p) => p !== id) : [...platforms, id]
    setPlatforms(next)
    onChange({ platforms: next, brand: { ...state.brand, platforms: next } })
  }

  const selectTone = (value: string) => {
    setTone(value)
    onChange({ tone: value, brand: { ...state.brand, tone: value } })
  }

  const handleSaveProfile = () => {
    const brand = normaliseBrand({ ...state.brand, platforms })
    saveProfile(brand)
    setProfiles(loadProfiles())
    setShowProfilesPanel(true)   // ← otwórz listę od razu po zapisaniu
    setSavedMsg(t('step1_profile_saved'))
    setTimeout(() => setSavedMsg(null), 2500)
  }

  const handleLoadProfile = (profile: SavedBrandProfile) => {
    const b = profile.brand
    const loadedPlatforms = Array.isArray(b.platforms) ? (b.platforms as Platform[]) : []
    setPlatforms(loadedPlatforms)
    const loadedTone = b.tone || TONE_OPTIONS[0].value
    setTone(loadedTone)
    onChange({
      platforms: loadedPlatforms,
      tone: loadedTone,
      brand: { ...b, platforms: loadedPlatforms },
    })
    setShowProfilesPanel(false)
    setSavedMsg(`${b.name || t('step1_no_name_profile')}`)
    setTimeout(() => setSavedMsg(null), 2500)
  }

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteProfile(id)
    setProfiles(loadProfiles())
  }

  return (
    <div>
      <StepBadge>✦ Krok 1</StepBadge>
      <h1 className="font-syne text-[clamp(1.6rem,3vw,2.2rem)] font-[700] tracking-[-0.03em] leading-[1.15] mb-2.5">
        {t('step1_heading')}
      </h1>
      <p className="text-[0.9rem] text-muted max-w-[520px] leading-relaxed mb-6">
        {t('step1_subheading')}
      </p>

      {/* Saved profiles panel */}
      {profiles.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowProfilesPanel((v) => !v)}
            className={cn(
              'flex items-center gap-2 text-[0.8rem] px-3.5 py-2 rounded-[10px] border transition-all cursor-pointer',
              showProfilesPanel
                ? 'border-accent/30 bg-accent-dim text-accent'
                : 'border-border bg-surface text-muted hover:border-border-mid hover:text-ink',
            )}
          >
            <span>📂</span>
            {showProfilesPanel ? t('step1_close_list') : `${t('step1_load_profile')} (${profiles.length})`}
          </button>

          {showProfilesPanel && (
            <div className="mt-2 bg-surface border border-border rounded-[14px] p-3 flex flex-col gap-1.5">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProfile(p)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-[10px] bg-surface2 border border-border hover:border-border-mid hover:bg-surface3 cursor-pointer transition-all group"
                >
                  <div>
                    <div className="text-[0.85rem] font-[500]">{p.brand.name || t('step1_no_name_profile')}</div>
                    <div className="text-[0.72rem] text-muted">
                      {p.brand.industry || '—'} · zapisano {new Date(p.savedAt).toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProfile(p.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-[0.75rem] text-muted hover:text-coral transition-all px-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-surface border border-border rounded-[18px] p-6">
        {/* Brand name */}
        <FieldLabel>{t('step1_brand_name')}</FieldLabel>
        <input
          type="text"
          placeholder={t('step1_brand_name_placeholder')}
          value={state.brand.name ?? ''}
          onChange={(e) => onChange({ brand: { ...state.brand, name: e.target.value } })}
        />

        <FieldLabel className="mt-5">{t('step1_description')}</FieldLabel>
        <textarea
          rows={4}
          placeholder={t('step1_description_placeholder')}
          value={state.brand.description ?? ''}
          onChange={(e) => onChange({ brand: { ...state.brand, description: e.target.value } })}
        />

        <div className="grid grid-cols-2 gap-3.5 mt-4">
          <div>
            <FieldLabel className="mt-5">{t('step1_industry')}</FieldLabel>
            <input
              type="text"
              placeholder={t('step1_industry_placeholder')}
              value={state.brand.industry ?? ''}
              onChange={(e) => onChange({ brand: { ...state.brand, industry: e.target.value } })}
            />
          </div>
          <div>
            <FieldLabel className="mt-5">{t('step1_audience')}</FieldLabel>
            <input
              type="text"
              placeholder={t('step1_audience_placeholder')}
              value={state.brand.audience ?? ''}
              onChange={(e) => onChange({ brand: { ...state.brand, audience: e.target.value } })}
            />
          </div>
        </div>

        <FieldLabel className="mt-5">{t('step1_website')}</FieldLabel>
        <input
          type="url"
          placeholder={t('step1_website_placeholder')}
          value={state.brand.website ?? ''}
          onChange={(e) => onChange({ brand: { ...state.brand, website: e.target.value } })}
        />

        <FieldLabel className="mt-6">{t('step1_platforms')}</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {PLATFORMS.map(({ id, label, color }) => (
            <Chip
              key={id}
              selected={platforms.includes(id)}
              onClick={() => togglePlatform(id)}
              dot={color}
            >
              {label}
            </Chip>
          ))}
        </div>

        <FieldLabel className="mt-6">{t('step1_tone')}</FieldLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {TONE_OPTIONS.map(({ value, label }) => (
            <Chip key={value} selected={tone === value} onClick={() => selectTone(value)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2.5 pt-6 border-t border-border mt-7">
        <Button variant="primary" onClick={onNext}>
          {t('step1_cta')}
        </Button>
        <Button
          variant="secondary"
          onClick={handleSaveProfile}
          className="gap-1.5"
        >
          {t('step1_save_profile')}
        </Button>
        {savedMsg && (
          <span className="text-[0.78rem] text-accent ml-1">{savedMsg}</span>
        )}
      </div>
    </div>
  )
}
