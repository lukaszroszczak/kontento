import { NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'

/**
 * Generate an image prompt from the post content using the text AI,
 * then generate the actual image using Gemini Imagen.
 */
function getTextProvider() {
  const provider = (process.env.POSTS_PROVIDER || 'openai') as ProviderName
  const apiKey =
    provider === 'openrouter'
      ? (process.env.OPENROUTER_API_KEY || '')
      : (process.env.OPENAI_API_KEY || '')
  const model = process.env.POSTS_MODEL || 'gpt-4o-mini'
  return createAIProvider(provider, apiKey, {
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    model,
  })
}

async function buildImagePrompt(
  content: string,
  brand: Record<string, string | null | undefined>,
  platforms: string[],
): Promise<string> {
  const textProvider = getTextProvider()

  const brandContext = [
    brand.name        ? `Brand: ${brand.name}` : '',
    brand.industry    ? `Industry: ${brand.industry}` : '',
    brand.description ? `Description: ${brand.description}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const platformHint = platforms.includes('instagram') || platforms.includes('tiktok')
    ? 'The image should be square (1:1) and visually striking for social media.'
    : 'The image should work well on LinkedIn or Facebook (landscape or square).'

  const systemPrompt = `You are an expert at writing image generation prompts for social media visuals.
Write concise, descriptive English prompts (50–100 words) that describe a professional photograph or illustration.
Focus on: lighting, composition, mood, style, colour palette, and subject matter.
Do NOT include text, logos, or watermarks in the description.
${platformHint}`

  const userPrompt = `Based on this social media post content and brand information, write an image generation prompt:

Post content:
${content.slice(0, 500)}

${brandContext ? `Brand context:\n${brandContext}` : ''}

Return ONLY the image prompt text, nothing else.`

  return textProvider.generateText({
    systemPrompt,
    userPrompt,
    temperature: 0.6,
  })
}

export async function POST(req: Request) {
  try {
    const { content = '', brand = {}, platforms = ['instagram'], customPrompt } = await req.json()

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured in .env.local' },
        { status: 500 },
      )
    }

    // Step 1: Build image prompt (either custom or AI-generated from content)
    let imagePrompt: string
    if (customPrompt?.trim()) {
      imagePrompt = customPrompt.trim()
    } else if (content.trim()) {
      imagePrompt = await buildImagePrompt(content, brand, platforms)
    } else {
      return NextResponse.json({ error: 'Post content or custom prompt is required' }, { status: 400 })
    }

    // Step 2: Generate image using Imagen 4 via the REST predict endpoint
    // Model confirmed available via GET /v1beta/models: imagen-4.0-generate-001 (method: predict)
    const predictRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: imagePrompt }],
          parameters: { sampleCount: 1 },
        }),
      },
    )

    const predictData = await predictRes.json()

    if (!predictRes.ok) {
      console.error('Imagen predict error:', predictData)
      return NextResponse.json(
        { error: predictData?.error?.message ?? 'Imagen API error' },
        { status: predictRes.status },
      )
    }

    const imageBase64: string | null = predictData.predictions?.[0]?.bytesBase64Encoded ?? null
    const mimeType: string = predictData.predictions?.[0]?.mimeType ?? 'image/png'

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image returned from Imagen' }, { status: 500 })
    }

    return NextResponse.json({
      imageBase64,
      prompt: imagePrompt,
      mimeType,
    })
  } catch (error: unknown) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
