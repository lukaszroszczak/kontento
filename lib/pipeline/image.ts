import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'

export interface GenerateImageInput {
  content: string
  brand?: Record<string, unknown>
  platforms?: string[]
  customPrompt?: string
  /** Batch index — ensures each post in a batch uses a different visual approach */
  index?: number
}

/**
 * 8 distinct visual approaches that rotate across batch-generated images.
 * Each forces a genuinely different framing, lighting, and composition style.
 */
const VISUAL_APPROACHES = [
  'Bright natural daylight, outdoor or on-site setting, wide establishing shot showing scale and context, vivid realistic colours.',
  'Close-up detail / product photography, studio diffused lighting, clean minimal background, focus on texture and craftsmanship.',
  'People-focused candid scene — professionals collaborating or working, warm authentic atmosphere, natural light, genuine emotion.',
  'Bold graphic or flat-illustration style — strong geometric shapes, vibrant brand-appropriate colours, modern editorial look.',
  'Dramatic single-source lighting — one bright focal point against dark surroundings, cinematic editorial mood, high contrast.',
  'Aerial or elevated perspective — wide landscape or overhead view, shows bigger picture and environmental context.',
  'Lifestyle / aspirational scene — end-user benefit, satisfied client or happy crowd, warm inviting atmosphere, golden-hour light.',
  'Abstract / conceptual visual — metaphor, energy flow, light trails or motion blur, artistic and thought-provoking interpretation.',
]

export interface GenerateImageResult {
  imageBase64: string
  prompt: string
  mimeType: string
}

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
  index?: number,
): Promise<string> {
  const textProvider = getTextProvider()

  const platformHint =
    platforms.includes('instagram') || platforms.includes('tiktok')
      ? 'The image should be square (1:1) and visually striking for social media.'
      : 'The image should work well on LinkedIn or Facebook (landscape or square).'

  const brandTemplate = brand.imagePromptTemplate?.trim() || null

  // ── Path A: brand has a visual style template ─────────────────────────────
  // LLM generates only the post-specific content layer; the brand template
  // defines the overall visual identity (style, colours, layout, logo position).
  if (brandTemplate) {
    const brandName = brand.name ? `Brand: ${brand.name}` : ''
    const systemPrompt = `You are an expert at writing content descriptions for branded social media graphics.
The brand already has a fixed visual style template. Your task is to describe ONLY the post-specific content:
1. The main photo or scene to use — subject, action, environment, lighting mood (2–3 sentences)
2. The main headline — 2–5 words, UPPERCASE, impactful and relevant to the post
3. A subtitle — one short supporting sentence (max 10 words)
4. Any specific icons, badges, or visual details that reinforce the post message (optional)

Return a single concise paragraph (40–70 words). Be specific and concrete.
Do NOT describe colours, layouts, geometric overlays, or brand identity — those are already defined by the brand template.
${platformHint}`

    const userPrompt = `Post content:
${content.slice(0, 500)}

${brandName}

Generate ONLY the post-specific content description (scene + headline + subtitle).`

    const contentPart = await textProvider.generateText({ systemPrompt, userPrompt, temperature: 0.8 })
    return `${brandTemplate}. For this specific post: ${contentPart.trim()}`
  }

  // ── Path B: no brand template — full prompt generation (original behaviour) ─
  const approachIdx =
    index !== undefined
      ? index % VISUAL_APPROACHES.length
      : Math.floor(Math.random() * VISUAL_APPROACHES.length)
  const visualApproach = VISUAL_APPROACHES[approachIdx]

  const brandContext = [
    brand.name        ? `Brand: ${brand.name}` : '',
    brand.industry    ? `Industry: ${brand.industry}` : '',
    brand.description ? `Description: ${brand.description}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const systemPrompt = `You are an expert at writing image generation prompts for social media visuals.
Write concise, descriptive English prompts (50–100 words) that describe a professional photograph or illustration.
Focus on: lighting, composition, mood, style, colour palette, and subject matter.
Do NOT include text, logos, or watermarks in the description.
${platformHint}

REQUIRED VISUAL APPROACH FOR THIS IMAGE — you must follow this style:
${visualApproach}
Strictly apply this approach. Do not default to dark moody scenes unless the approach explicitly calls for it.`

  const userPrompt = `Based on this social media post content and brand information, write an image generation prompt using the required visual approach above:

Post content:
${content.slice(0, 500)}

${brandContext ? `Brand context:\n${brandContext}` : ''}

Return ONLY the image prompt text, nothing else.`

  return textProvider.generateText({ systemPrompt, userPrompt, temperature: 0.8 })
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  const { content = '', brand = {}, platforms = ['instagram'], customPrompt, index } = input

  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey) throw new Error('GEMINI_API_KEY not configured in .env.local')

  const brandRecord = brand as Record<string, string | null | undefined>

  let imagePrompt: string
  if (customPrompt?.trim()) {
    imagePrompt = customPrompt.trim()
  } else if (content.trim()) {
    imagePrompt = await buildImagePrompt(content, brandRecord, platforms, index)
  } else {
    throw new Error('Post content or custom prompt is required')
  }

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
    throw new Error(predictData?.error?.message ?? 'Imagen API error')
  }

  const imageBase64: string | null = predictData.predictions?.[0]?.bytesBase64Encoded ?? null
  const mimeType: string = predictData.predictions?.[0]?.mimeType ?? 'image/png'

  if (!imageBase64) throw new Error('No image returned from Imagen')

  return { imageBase64, prompt: imagePrompt, mimeType }
}
