'use client'

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

interface PostRowProps {
  post: Post
  index?: number
  onDelete?: (id: string) => void
  onPostClick?: (post: Post) => void
}

export function PostRow({ post, index = 0, onDelete, onPostClick }: PostRowProps) {
  const { t } = useTranslation()
  const thumbEmoji = post.imageUrl ? null : '📝'

  const displayDate =
    post.status === 'PUBLISHED' && post.publishedAt
      ? formatDate(post.publishedAt)
      : post.status === 'SCHEDULED' && post.scheduledAt
      ? `📅 ${formatDate(post.scheduledAt)}`
      : formatDate(post.createdAt)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && confirm(t('posts_confirm_delete'))) onDelete(post.id)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-4 bg-surface border border-border rounded-[14px] px-[18px] py-3.5',
        'cursor-pointer transition-all duration-200 relative',
        'hover:border-border-mid hover:bg-surface2 animate-fade-up',
      )}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => onPostClick?.(post)}
    >
      <span className="text-dim cursor-grab text-base p-1 hidden sm:block">⠿</span>

      {/* Thumbnail */}
      <div className="w-[52px] h-[52px] rounded-[10px] bg-surface2 flex items-center justify-center text-[1.4rem] flex-shrink-0 overflow-hidden">
        {post.imageUrl ? (
          <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          thumbEmoji ?? '📝'
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="text-[0.88rem] font-[500] mb-0.5 truncate">{post.title}</div>
        <div className="text-[0.75rem] text-muted truncate">{post.content}</div>

        <div className="flex items-center gap-2.5 mt-1.5">
          <div className="flex gap-1">
            {post.platforms.map((p) => (
              <span
                key={p}
                className="w-[18px] h-[18px] rounded-[4px] flex items-center justify-center text-[10px] bg-surface3"
                title={p}
              >
                {PLATFORM_ICONS[p]}
              </span>
            ))}
          </div>
          <span className="text-[0.72rem] text-dim">{displayDate}</span>
        </div>
      </div>

      {/* Stats (published only) */}
      {post.stats && (
        <div className="hidden md:flex gap-3 ml-auto">
          <StatMini label="♥" value={post.stats.likes} />
          <StatMini label="💬" value={post.stats.comments} />
          <StatMini label="👁" value={post.stats.reach} />
        </div>
      )}

      {/* Source badge (autopilot only) */}
      {post.source === 'autopilot' && (
        <Badge variant="accent" className="flex-shrink-0 hidden sm:inline-flex">
          ✦ Autopilot
        </Badge>
      )}

      {/* Status badge */}
      <Badge
        variant={
          post.status === 'PUBLISHED' ? 'published'
          : post.status === 'SCHEDULED' ? 'scheduled'
          : 'draft'
        }
        className="flex-shrink-0 hidden sm:inline-flex"
      >
        {STATUS_LABELS[post.status]}
      </Badge>

      {/* Hover actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="icon" size="sm" title="Duplikuj">📋</Button>
        {onDelete && (
          <Button
            variant="icon"
            size="sm"
            title="Usuń"
            onClick={handleDelete}
            className="hover:text-coral hover:border-coral/30"
          >
            🗑
          </Button>
        )}
      </div>
    </div>
  )
}

function StatMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1 text-[0.75rem] text-muted">
      <span>{label}</span>
      <strong className="text-ink font-[500]">
        {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
      </strong>
    </div>
  )
}
