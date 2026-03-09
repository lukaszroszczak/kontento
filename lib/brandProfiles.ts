/**
 * Brand profile persistence using localStorage.
 * When auth is implemented, this can be complemented by a server-side API.
 */

import type { Brand, Platform } from '@/types'

export interface SavedBrandProfile {
  id: string
  savedAt: string
  brand: Partial<Brand>
}

const STORAGE_KEY = 'kontento_brand_profiles'
const LAST_USED_KEY = 'kontento_last_brand_id'

export function loadProfiles(): SavedBrandProfile[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SavedBrandProfile[]
  } catch {
    return []
  }
}

export function saveProfile(brand: Partial<Brand>): SavedBrandProfile {
  const profiles = loadProfiles()
  const id = brand.name
    ? brand.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now()
    : `profile-${Date.now()}`

  const entry: SavedBrandProfile = {
    id,
    savedAt: new Date().toISOString(),
    brand,
  }

  // Replace existing if same name
  const idx = brand.name ? profiles.findIndex((p) => p.brand.name === brand.name) : -1
  if (idx >= 0) {
    profiles[idx] = entry
  } else {
    profiles.push(entry)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  localStorage.setItem(LAST_USED_KEY, id)
  return entry
}

export function deleteProfile(id: string): void {
  const profiles = loadProfiles().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function getLastUsedProfileId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LAST_USED_KEY)
}

export function setLastUsedProfileId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_USED_KEY, id)
}

/**
 * Serialise brand to a storable partial (strips undefined, converts platform arrays).
 */
export function normaliseBrand(b: Partial<Brand>): Partial<Brand> {
  return {
    name:        b.name        ?? null,
    description: b.description ?? null,
    industry:    b.industry    ?? null,
    audience:    b.audience    ?? null,
    platforms:   Array.isArray(b.platforms) ? (b.platforms as Platform[]) : [],
    tone:                b.tone                ?? null,
    website:             b.website             ?? null,
    logoBase64:          b.logoBase64          ?? null,
    imagePromptTemplate: b.imagePromptTemplate ?? null,
  }
}
