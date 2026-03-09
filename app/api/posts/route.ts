import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAppPost, titleFromContent } from '@/lib/postUtils'

/** GET /api/posts — list all posts for the logged-in user (excluding soft-deleted) */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await db.post.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: { stats: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ posts: posts.map(toAppPost) })
}

/** POST /api/posts — create a new post */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    content,
    platforms = [],
    status,
    scheduledAt,
    imageUrl,
    hashtags = [],
    source = 'manual',
  } = body

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Treść posta jest wymagana' }, { status: 400 })
  }

  const derivedStatus = status ?? (scheduledAt ? 'SCHEDULED' : 'DRAFT')

  const post = await db.post.create({
    data: {
      userId: session.user.id,
      title: titleFromContent(content),
      content,
      platforms: JSON.stringify(platforms),
      status: derivedStatus,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      publishedAt: derivedStatus === 'PUBLISHED' ? new Date() : null,
      imageUrl: imageUrl ?? null,
      hashtags: JSON.stringify(hashtags),
      source: source === 'autopilot' ? 'autopilot' : 'manual',
    },
    include: { stats: true },
  })

  return NextResponse.json({ post: toAppPost(post) }, { status: 201 })
}
