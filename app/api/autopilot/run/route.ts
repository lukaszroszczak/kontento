import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateIdeas, generateContent, generateImage } from '@/lib/pipeline'
import { toAppPost, titleFromContent } from '@/lib/postUtils'
import type { AutopilotRunResult } from '@/types'

function parseArr(json: string): string[] {
  try { return JSON.parse(json) } catch { return [] }
}


/** POST /api/autopilot/run — headless batch post generation */
export async function POST(req: Request) {
  try {
    return await runAutopilot(req)
  } catch (err) {
    console.error('Autopilot run: unhandled error', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Nieznany błąd serwera' },
      { status: 500 },
    )
  }
}

async function runAutopilot(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  // Parse brand sent by client (from localStorage brand profiles)
  const body = await req.json().catch(() => ({}))
  const brandCtx: Record<string, string | null | undefined> = body.brand ?? {}

  // 1. Load autopilot config (upsert ensures it always exists after first GET)
  const config = await db.autopilotConfig.upsert({
    where: { userId },
    create: {
      userId,
      postsPerBatch: 3,
      tone: 'Friendly',
      language: 'Polish',
      includeHashtags: true,
      includeEmoji: true,
      generateImages: true,
      platforms: JSON.stringify(['instagram']),
    },
    update: {},
  })

  const platforms = parseArr(config.platforms)

  // 3. Fetch recent post titles for deduplication
  const recentPosts = await db.post.findMany({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { title: true },
  })
  const recentPostTitles = recentPosts.map((p) => p.title)

  // 4. Generate topic ideas
  let ideas: { emoji: string; title: string; hint: string }[]
  try {
    ideas = await generateIdeas({
      brand: brandCtx,
      language: config.language,
      topic: (brandCtx.industry as string | undefined) || 'social media content',
      recentPostTitles,
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('Autopilot: ideas generation failed', err)
    return NextResponse.json(
      { error: `Nie udało się wygenerować tematów: ${detail}` },
      { status: 500 },
    )
  }

  // 5. Generate posts
  const result: AutopilotRunResult = {
    total: config.postsPerBatch,
    succeeded: 0,
    failed: 0,
    posts: [],
    errors: [],
  }

  const count = Math.min(ideas.length, config.postsPerBatch)

  for (let i = 0; i < count; i++) {
    const idea = ideas[i]

    try {
      // Step A: Generate content
      const content = await generateContent({
        topic: idea.title,
        platforms,
        tone: config.tone,
        language: config.language,
        includeHashtags: config.includeHashtags,
        includeEmoji: config.includeEmoji,
        brand: brandCtx,
      })

      // Step B: Generate image (non-fatal)
      let imageUrl: string | null = null
      if (config.generateImages) {
        try {
          const img = await generateImage({
            content,
            brand: brandCtx,
            platforms,
            index: i,
          })
          imageUrl = `data:${img.mimeType};base64,${img.imageBase64}`
        } catch (imgErr) {
          console.warn(`Autopilot: image generation failed for post ${i + 1}`, imgErr)
          result.errors.push({
            index: i,
            step: 'image',
            message: imgErr instanceof Error ? imgErr.message : 'Image generation failed',
          })
        }
      }

      // Step C: Extract hashtags from content
      const hashtagMatches = content.match(/#[\w\u0100-\u017F]+/g) ?? []

      // Step D: Save to database as DRAFT
      const post = await db.post.create({
        data: {
          userId,
          title: titleFromContent(content),
          content,
          platforms: JSON.stringify(platforms),
          status: 'DRAFT',
          source: 'autopilot',
          imageUrl,
          hashtags: JSON.stringify(hashtagMatches),
        },
        include: { stats: true },
      })

      result.posts.push(toAppPost(post))
      result.succeeded++
    } catch (err) {
      console.error(`Autopilot: post ${i + 1} generation failed`, err)
      result.failed++
      result.errors.push({
        index: i,
        step: 'content',
        message: err instanceof Error ? err.message : 'Generation failed',
      })
    }
  }

  // 6. Update lastRunAt
  await db.autopilotConfig.update({
    where: { userId },
    data: { lastRunAt: new Date() },
  })

  return NextResponse.json(result)
}
