'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { PostRow } from './PostRow'
import { PostFilters } from './PostFilters'
import { PostDetailModal } from './PostDetailModal'
import type { Post, PostStatus, Platform, PostSource } from '@/types'
import { useTranslation } from '@/lib/i18n'

function parseDates(p: Post): Post {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
  }
}

export function PostList() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [filterStatus, setFilterStatus] = useState<PostStatus | 'ALL'>('ALL')
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'ALL'>('ALL')
  const [filterSource, setFilterSource] = useState<PostSource | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortAsc, setSortAsc] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error(t('posts_error_fetch'))
      const data = await res.json()
      setPosts((data.posts as Post[]).map(parseDates))
    } catch {
      setFetchError(t('posts_error_load'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    const handler = () => fetchPosts()
    window.addEventListener('post-created', handler)
    return () => window.removeEventListener('post-created', handler)
  }, [fetchPosts])

  const handleDelete = useCallback(async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    } catch {
      fetchPosts()
    }
  }, [fetchPosts])

  const handlePostUpdate = useCallback((updated: Post) => {
    setPosts((prev) => prev.map((p) => p.id === updated.id ? parseDates(updated) : p))
    setSelectedPost(parseDates(updated))
  }, [])

  const filtered = useMemo(() => {
    return posts
      .filter((p) => !p.deletedAt)
      .filter((p) => filterStatus === 'ALL' || p.status === filterStatus)
      .filter((p) => filterPlatform === 'ALL' || p.platforms.includes(filterPlatform as Platform))
      .filter((p) => filterSource === 'ALL' || (p.source ?? 'manual') === filterSource)
      .filter((p) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const da = new Date(a.createdAt).getTime()
        const db = new Date(b.createdAt).getTime()
        return sortAsc ? da - db : db - da
      })
  }, [posts, filterStatus, filterPlatform, filterSource, searchQuery, sortAsc])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h2 className="font-syne text-[1.4rem] font-[700] tracking-[-0.02em] flex-1 min-w-[140px]">
          {t('posts_heading')}
          {!loading && (
            <span className="text-muted font-[400] text-[1rem] ml-2">({filtered.length})</span>
          )}
        </h2>
        <PostFilters
          filterStatus={filterStatus}
          filterPlatform={filterPlatform}
          filterSource={filterSource}
          searchQuery={searchQuery}
          sortAsc={sortAsc}
          onFilterStatus={setFilterStatus}
          onFilterPlatform={setFilterPlatform}
          onFilterSource={setFilterSource}
          onSearch={setSearchQuery}
          onToggleSort={() => setSortAsc((v) => !v)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[76px] rounded-[14px] bg-surface border border-border animate-pulse" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="py-16 text-center text-coral text-sm">{fetchError}</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-muted text-sm">
              {posts.length === 0
                ? t('posts_empty_create')
                : t('posts_empty_filters')}
            </div>
          ) : (
            filtered.map((post, i) => (
              <PostRow
                key={post.id}
                post={post}
                index={i}
                onDelete={handleDelete}
                onPostClick={setSelectedPost}
              />
            ))
          )}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onPostUpdate={handlePostUpdate}
        />
      )}
    </div>
  )
}
