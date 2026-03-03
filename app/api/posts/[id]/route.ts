import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { toAppPost } from '@/lib/postUtils'

type Params = { params: Promise<{ id: string }> }

/** PATCH /api/posts/[id] — update status, scheduledAt, content, etc. */
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await db.post.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const {
    title,
    content,
    platforms,
    status,
    scheduledAt,
    publishedAt,
    imageUrl,
    hashtags,
  } = body

  const updated = await db.post.update({
    where: { id },
    data: {
      ...(title       !== undefined && { title }),
      ...(content     !== undefined && { content }),
      ...(platforms   !== undefined && { platforms: JSON.stringify(platforms) }),
      ...(status      !== undefined && { status }),
      ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
      ...(imageUrl    !== undefined && { imageUrl }),
      ...(hashtags    !== undefined && { hashtags: JSON.stringify(hashtags) }),
    },
    include: { stats: true },
  })

  return NextResponse.json({ post: toAppPost(updated) })
}

/** DELETE /api/posts/[id] — soft-delete (sets deletedAt) */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const existing = await db.post.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.post.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
