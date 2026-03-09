import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'
import { LANGUAGE_INSTRUCTIONS, VALID_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/constants'

export interface GenerateContentInput {
  topic: string
  platforms?: string[]
  tone?: string
  language?: string
  includeHashtags?: boolean
  includeEmoji?: boolean
  brand?: Record<string, unknown>
}

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

export async function generateContent(input: GenerateContentInput): Promise<string> {
  const {
    topic,
    platforms = ['instagram'],
    tone = 'Friendly',
    language,
    includeHashtags = true,
    includeEmoji = true,
    brand = {},
  } = input

  if (!topic?.trim()) throw new Error('Topic is required')

  const finalLanguage = VALID_LANGUAGES.includes(language ?? '') ? (language as string) : DEFAULT_LANGUAGE
  const langInstruction = LANGUAGE_INSTRUCTIONS[finalLanguage]

  const primaryPlatform = Array.isArray(platforms) && platforms.length > 0 ? platforms[0] : 'instagram'
  const allPlatforms = Array.isArray(platforms) ? platforms.join(', ') : primaryPlatform
  const platNote = platformInstructions(primaryPlatform, includeHashtags)

  const brandRecord = brand as Record<string, string | null | undefined>
  const brandContext = [
    brandRecord.description ? `Brand: ${brandRecord.description}` : '',
    brandRecord.industry    ? `Industry: ${brandRecord.industry}` : '',
    brandRecord.audience    ? `Target audience: ${brandRecord.audience}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const systemPrompt = `You are a skilled social media writer creating content for ${allPlatforms}. ${langInstruction.systemDirective} Maintain a consistent ${tone} tone throughout. Use natural, concise, impactful language.
${includeEmoji ? 'Use emojis thoughtfully and sparingly.' : 'Do not use any emojis.'}
${includeHashtags ? 'Include relevant hashtags that add value.' : 'Do not include any hashtags.'}
${primaryPlatform === 'linkedin' ? 'For LinkedIn, maintain professionalism while being approachable and authentic.' : ''}`

  const userPrompt = `Write a ${primaryPlatform} post about: ${topic}
${brandContext ? `\nBrand context:\n${brandContext}\n` : ''}
Guidelines:
- ${langInstruction.userDirective}
- Write in a ${tone} tone
- Write in a natural, conversational style
${includeEmoji ? '- Include relevant emojis where appropriate' : '- Do not use any emojis'}
${includeHashtags ? '- Add relevant hashtags at the end' : '- Do not include any hashtags'}
${platNote ? `- ${platNote}` : ''}`

  const provider = getProvider()
  return provider.generateText({
    systemPrompt,
    userPrompt,
    temperature: 0.7,
  })
}
