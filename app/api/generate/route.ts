import { NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'
import { LANGUAGE_INSTRUCTIONS, VALID_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/constants'

function getProvider() {
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

function platformInstructions(platform: string, includeHashtags: boolean): string {
  switch (platform) {
    case 'instagram':
      return `Focus on visual storytelling. Keep the tone engaging and authentic.${includeHashtags ? ' Add 3–5 relevant hashtags at the end.' : ''}`
    case 'facebook':
      return `Write in a personal, engaging style. Share insights or experiences naturally. Add a subtle call-to-action if relevant.${includeHashtags ? ' Add 1–2 hashtags if helpful.' : ''}`
    case 'linkedin':
      return `Maintain a professional tone. Include industry insights if relevant. Keep paragraphs short and scannable.${includeHashtags ? ' Add 2–3 professional hashtags at the end.' : ''}`
    case 'tiktok':
      return 'Be energetic, punchy, and direct. Hook the reader in the first line. Use short sentences.'
    default:
      return ''
  }
}

export async function POST(req: Request) {
  try {
    const {
      platforms = ['instagram'],
      description,
      tone = 'Friendly',
      language,
      includeHashtags = true,
      includeEmoji = true,
      brand = {},
    } = await req.json()

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const finalLanguage: string = VALID_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    const langInstruction = LANGUAGE_INSTRUCTIONS[finalLanguage]

    const primaryPlatform: string = Array.isArray(platforms) && platforms.length > 0 ? platforms[0] : 'instagram'
    const allPlatforms = Array.isArray(platforms) ? platforms.join(', ') : primaryPlatform
    const platNote = platformInstructions(primaryPlatform, includeHashtags)

    const brandContext = [
      brand.description ? `Brand: ${brand.description}` : '',
      brand.industry    ? `Industry: ${brand.industry}` : '',
      brand.audience    ? `Target audience: ${brand.audience}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const systemPrompt = `You are a skilled social media writer creating content for ${allPlatforms}. ${langInstruction.systemDirective} Maintain a consistent ${tone} tone throughout. Use natural, concise, impactful language.
${includeEmoji ? 'Use emojis thoughtfully and sparingly.' : 'Do not use any emojis.'}
${includeHashtags ? 'Include relevant hashtags that add value.' : 'Do not include any hashtags.'}
${primaryPlatform === 'linkedin' ? 'For LinkedIn, maintain professionalism while being approachable and authentic.' : ''}`

    const userPrompt = `Write a ${primaryPlatform} post about: ${description}
${brandContext ? `\nBrand context:\n${brandContext}\n` : ''}
Guidelines:
- ${langInstruction.userDirective}
- Write in a ${tone} tone
- Write in a natural, conversational style
${includeEmoji ? '- Include relevant emojis where appropriate' : '- Do not use any emojis'}
${includeHashtags ? '- Add relevant hashtags at the end' : '- Do not include any hashtags'}
${platNote ? `- ${platNote}` : ''}`

    const provider = getProvider()
    const content = await provider.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
