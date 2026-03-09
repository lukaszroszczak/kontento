'use client'

import { cn } from '@/lib/utils'
import type { PostStatus, Platform, PostSource } from '@/types'
import { useTranslation } from '@/lib/i18n'

interface PostFiltersProps {
  filterStatus: PostStatus | 'ALL'
  filterPlatform: Platform | 'ALL'
  filterSource: PostSource | 'ALL'
  searchQuery: string
  sortAsc: boolean
  onFilterStatus: (v: PostStatus | 'ALL') => void
  onFilterPlatform: (v: Platform | 'ALL') => void
  onFilterSource: (v: PostSource | 'ALL') => void
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
  filterSource,
  searchQuery,
  sortAsc,
  onFilterStatus,
  onFilterPlatform,
  onFilterSource,
  onSearch,
  onToggleSort,
}: PostFiltersProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status */}
      <select
        value={filterStatus}
        onChange={(e) => onFilterStatus(e.target.value as PostStatus | 'ALL')}
        className={selectBase}
      >
        <option value="ALL">{t('posts_filter_all_statuses')}</option>
        <option value="DRAFT">{t('posts_filter_draft')}</option>
        <option value="SCHEDULED">{t('posts_filter_scheduled')}</option>
        <option value="PUBLISHED">{t('posts_filter_published')}</option>
      </select>

      {/* Platform */}
      <select
        value={filterPlatform}
        onChange={(e) => onFilterPlatform(e.target.value as Platform | 'ALL')}
        className={selectBase}
      >
        <option value="ALL">{t('posts_filter_all_platforms')}</option>
        <option value="instagram">Instagram</option>
        <option value="linkedin">LinkedIn</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
      </select>

      {/* Source */}
      <select
        value={filterSource}
        onChange={(e) => onFilterSource(e.target.value as PostSource | 'ALL')}
        className={selectBase}
      >
        <option value="ALL">{t('posts_filter_all_sources')}</option>
        <option value="manual">{t('posts_filter_source_manual')}</option>
        <option value="autopilot">{t('posts_filter_source_autopilot')}</option>
      </select>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dim text-sm pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          placeholder={t('posts_search_placeholder')}
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
        {sortAsc ? '↑' : '↓'} {t('posts_sort_date')}
      </button>
    </div>
  )
}
