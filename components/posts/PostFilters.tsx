'use client'

import { cn } from '@/lib/utils'
import type { PostStatus, Platform } from '@/types'

interface PostFiltersProps {
  filterStatus: PostStatus | 'ALL'
  filterPlatform: Platform | 'ALL'
  searchQuery: string
  sortAsc: boolean
  onFilterStatus: (v: PostStatus | 'ALL') => void
  onFilterPlatform: (v: Platform | 'ALL') => void
  onSearch: (v: string) => void
  onToggleSort: () => void
}

const selectBase = cn(
  'bg-surface2 border border-border rounded-lg text-muted font-dm text-[0.78rem]',
  'px-3 py-[7px] cursor-pointer outline-none appearance-none',
  'focus:border-border-active transition-colors',
)

export function PostFilters({
  filterStatus,
  filterPlatform,
  searchQuery,
  sortAsc,
  onFilterStatus,
  onFilterPlatform,
  onSearch,
  onToggleSort,
}: PostFiltersProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status */}
      <select
        value={filterStatus}
        onChange={(e) => onFilterStatus(e.target.value as PostStatus | 'ALL')}
        className={selectBase}
      >
        <option value="ALL">Wszystkie statusy</option>
        <option value="DRAFT">Szkice</option>
        <option value="SCHEDULED">Zaplanowane</option>
        <option value="PUBLISHED">Opublikowane</option>
      </select>

      {/* Platform */}
      <select
        value={filterPlatform}
        onChange={(e) => onFilterPlatform(e.target.value as Platform | 'ALL')}
        className={selectBase}
      >
        <option value="ALL">Wszystkie platformy</option>
        <option value="instagram">Instagram</option>
        <option value="linkedin">LinkedIn</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
      </select>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          placeholder="Szukaj postów…"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className={cn(selectBase, 'pl-8 w-[180px]')}
        />
      </div>

      {/* Sort */}
      <button
        onClick={onToggleSort}
        className={cn(
          'flex items-center gap-1.5 px-3 py-[7px] bg-surface2 border border-border rounded-lg',
          'text-[0.78rem] text-muted whitespace-nowrap font-dm cursor-pointer',
          'hover:border-border-active hover:text-ink transition-all duration-150',
        )}
      >
        {sortAsc ? '↑' : '↓'} Data
      </button>
    </div>
  )
}
