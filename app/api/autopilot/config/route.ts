import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { Platform } from '@/types'

function parseArr(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}

function toAppConfig(c: {
  id: string; userId: string; postsPerBatch: number; tone: string; language: string;
  includeHashtags: boolean; includeEmoji: boolean; generateImages: boolean;
  platforms: string; lastRunAt: Date | null; createdAt: Date; updatedAt: Date
}) {
  return {
    id: c.id,
    userId: c.userId,
    postsPerBatch: c.postsPerBatch,
    tone: c.tone,
    language: c.language,
    includeHashtags: c.includeHashtags,
    includeEmoji: c.includeEmoji,
    generateImages: c.generateImages,
    platforms: parseArr(c.platforms) as Platform[],
    lastRunAt: c.lastRunAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

const DEFAULT_CONFIG = {
  postsPerBatch: 3,
  tone: 'Friendly',
  language: 'Polish',
  includeHashtags: true,
  includeEmoji: true,
  generateImages: true,
  platforms: ['instagram'] as Platform[],
  lastRunAt: null,
}

/** GET /api/autopilot/config — fetch config for logged-in user (auto-creates defaults) */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Upsert so the config always exists in DB — run endpoint can safely findUnique()
  const config = await db.autopilotConfig.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      postsPerBatch: DEFAULT_CONFIG.postsPerBatch,
      tone: DEFAULT_CONFIG.tone,
      language: DEFAULT_CONFIG.language,
      includeHashtags: DEFAULT_CONFIG.includeHashtags,
      includeEmoji: DEFAULT_CONFIG.includeEmoji,
      generateImages: DEFAULT_CONFIG.generateImages,
      platforms: JSON.stringify(DEFAULT_CONFIG.platforms),
    },
    update: {},
  })

  return NextResponse.json({ config: toAppConfig(config) })
}

/** PUT /api/autopilot/config — upsert config */
export async function PUT(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    postsPerBatch = 3,
    tone = 'Friendly',
    language = 'Polish',
    includeHashtags = true,
    includeEmoji = true,
    generateImages = true,
    platforms = ['instagram'],
  } = body

  // Validate
  const clampedBatch = Math.max(1, Math.min(7, Number(postsPerBatch)))
  const platformsArr = Array.isArray(platforms) && platforms.length > 0 ? platforms : ['instagram']

  const config = await db.autopilotConfig.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      postsPerBatch: clampedBatch,
      tone,
      language,
      includeHashtags: Boolean(includeHashtags),
      includeEmoji: Boolean(includeEmoji),
      generateImages: Boolean(generateImages),
      platforms: JSON.stringify(platformsArr),
    },
    update: {
      postsPerBatch: clampedBatch,
      tone,
      language,
      includeHashtags: Boolean(includeHashtags),
      includeEmoji: Boolean(includeEmoji),
      generateImages: Boolean(generateImages),
      platforms: JSON.stringify(platformsArr),
    },
  })

  return NextResponse.json({ config: toAppConfig(config) })
}
