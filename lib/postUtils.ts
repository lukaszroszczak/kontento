/**
 * Shared utilities for converting between Prisma DB records and app Post types.
 * Prisma/SQLite stores platform and hashtag arrays as JSON strings.
 */

import type { Post, PostStats, Platform, PostStatus } from '@/types'

function parseArr(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}

type PrismaPost = {
  id: string
  userId: string
  title: string
  content: string
  platforms: string
  status: string
  scheduledAt: Date | null
  publishedAt: Date | null
  imageUrl: string | null
  hashtags: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  stats: {
    id: string
    postId: string
    likes: number
    comments: number
    reach: number
    saves: number
    clicks: number
  } | null
}

export function toAppPost(p: PrismaPost): Post {
  return {
    id: p.id,
    userId: p.userId,
    title: p.title,
    content: p.content,
    platforms: parseArr(p.platforms) as Platform[],
    status: p.status as PostStatus,
    scheduledAt: p.scheduledAt,
    publishedAt: p.publishedAt,
    imageUrl: p.imageUrl,
    hashtags: parseArr(p.hashtags),
    stats: p.stats ?? null,
    deletedAt: p.deletedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

/** Derive a short post title from content — first non-empty line, max 80 chars */
export function titleFromContent(content: string): string {
  const first = content.split('\n').find((l) => l.trim()) ?? content
  return first.replace(/^#+\s*/, '').slice(0, 80).trim() || 'Bez tytułu'
}
