'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn, fmt } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import type { Post } from '@/types'

interface StatCardProps {
  label: string
  value: number | string
  sub: string
  color?: 'accent' | 'purple' | 'coral' | 'blue'
}

const colorMap = {
  accent: 'text-accent',
  purple: 'text-purple',
  coral:  'text-coral',
  blue:   'text-blue',
}

function StatCard({ label, value, sub, color = 'accent' }: StatCardProps) {
  return (
    <Card padding="md" className="flex flex-col gap-1">
      <div className="text-[0.7rem] font-[500] tracking-[0.08em] uppercase text-muted">{label}</div>
      <div className={cn('font-syne text-[2rem] font-[700] tracking-[-0.03em]', colorMap[color])}>
        {typeof value === 'number' ? fmt(value) : value}
      </div>
      <div className="text-[0.75rem] text-dim">{sub}</div>
    </Card>
  )
}

const PLATFORM_META = [
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e1306c' },
  { id: 'linkedin',  name: 'LinkedIn',  icon: '💼', color: '#0a66c2' },
  { id: 'facebook',  name: 'Facebook',  icon: '👥', color: '#1877f2' },
  { id: 'tiktok',    name: 'TikTok',    icon: '🎵', color: '#000000' },
]

function parseDates(p: Post): Post {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
  }
}

export function StatsView() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => setPosts((data.posts as Post[]).map(parseDates)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const published = useMemo(() => posts.filter((p) => p.status === 'PUBLISHED' && !p.deletedAt), [posts])
  const scheduled = useMemo(() => posts.filter((p) => p.status === 'SCHEDULED' && !p.deletedAt), [posts])
  const totalReach = useMemo(() => published.reduce((s, p) => s + (p.stats?.reach ?? 0), 0), [published])
  const totalLikes = useMemo(() => published.reduce((s, p) => s + (p.stats?.likes ?? 0), 0), [published])

  const platformStats = useMemo(() =>
    PLATFORM_META.map((pl) => {
      const plPosts = posts.filter((p) => p.platforms.includes(pl.id as 'instagram' | 'linkedin' | 'facebook' | 'tiktok') && !p.deletedAt)
      const plPublished = plPosts.filter((p) => p.status === 'PUBLISHED')
      const reach = plPublished.reduce((s, p) => s + (p.stats?.reach ?? 0), 0)
      const likes = plPublished.reduce((s, p) => s + (p.stats?.likes ?? 0), 0)
      const engagement = reach > 0 ? ((likes / reach) * 100).toFixed(1) + '%' : '—'
      return { ...pl, posts: plPosts.length, reach, engagement }
    }).filter((pl) => pl.posts > 0),
  [posts])

  const topPosts = useMemo(() =>
    published
      .filter((p) => p.stats)
      .sort((a, b) => (b.stats?.reach ?? 0) - (a.stats?.reach ?? 0))
      .slice(0, 5),
  [published])

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[110px] rounded-[14px] bg-surface border border-border animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Łączny zasięg"     value={totalReach}       sub={`${published.length} opub. postów`}  color="accent" />
        <StatCard label="Polubień łącznie"   value={totalLikes}       sub="ze wszystkich platform"               color="purple" />
        <StatCard label="Opublikowane"       value={published.length} sub="postów"                               color="coral" />
        <StatCard label="Zaplanowane"        value={scheduled.length} sub="postów w kolejce"                     color="blue" />
      </div>

      {/* Platform breakdown */}
      {platformStats.length > 0 && (
        <div>
          <h3 className="font-syne text-[1.1rem] font-[700] tracking-[-0.02em] mb-4">
            Wyniki według platformy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platformStats.map((pl) => (
              <Card key={pl.name} padding="md">
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: pl.color + '22' }}
                  >
                    {pl.icon}
                  </div>
                  <div>
                    <div className="font-[500] text-sm">{pl.name}</div>
                    <div className="text-[0.7rem] text-muted">{pl.posts} postów</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <MiniStat label="Zasięg"     value={fmt(pl.reach)} />
                  <MiniStat label="Zaangażow." value={pl.engagement} />
                  <MiniStat label="Postów"     value={String(pl.posts)} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div>
          <h3 className="font-syne text-[1.1rem] font-[700] tracking-[-0.02em] mb-4">
            Najlepsze posty
          </h3>
          <div className="flex flex-col gap-3">
            {topPosts.map((post, i) => (
              <Card key={post.id} padding="md" className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full bg-accent-dim border border-accent/20 flex items-center justify-center font-syne font-[700] text-accent text-[0.8rem] flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-[500] text-[0.88rem] truncate">{post.title}</div>
                  <div className="text-[0.72rem] text-muted mt-0.5">
                    {post.platforms.join(', ')} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pl-PL') : '—'}
                  </div>
                </div>
                <div className="hidden md:flex gap-5 text-right flex-shrink-0">
                  <PostStat label="Zasięg" value={fmt(post.stats!.reach)} />
                  <PostStat label="Polub." value={fmt(post.stats!.likes)} />
                  <PostStat label="Zapis." value={fmt(post.stats!.saves)} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {published.length === 0 && !loading && (
        <div className="py-20 text-center text-muted text-sm">
          Brak opublikowanych postów z danymi statystyk.
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[0.68rem] text-dim uppercase tracking-[0.06em]">{label}</div>
      <div className="font-syne font-[700] text-[1rem] tracking-[-0.02em]">{value}</div>
    </div>
  )
}

function PostStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="text-[0.68rem] text-muted uppercase tracking-[0.06em]">{label}</div>
      <div className="font-[500] text-sm">{value}</div>
    </div>
  )
}
