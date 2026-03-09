import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'
import { LANGUAGE_INSTRUCTIONS, VALID_LANGUAGES, DEFAULT_LANGUAGE } from '@/lib/constants'

export interface IdeaResult {
  emoji: string
  title: string
  hint: string
}

export interface GenerateIdeasInput {
  brand?: Record<string, unknown>
  language?: string
  topic?: string
  keywords?: string
  recentPostTitles?: string[]
}

function getProvider() {
  const providerName = (process.env.IDEAS_PROVIDER || 'openai') as ProviderName
  const modelName = process.env.IDEAS_MODEL || 'gpt-4o-mini'
  const apiKey =
    providerName === 'openrouter'
      ? (process.env.OPENROUTER_API_KEY || '')
      : (process.env.OPENAI_API_KEY || '')
  return {
    provider: createAIProvider(providerName, apiKey, {
      model: modelName,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    }),
    modelName,
  }
}

/** Simple sleep helper for retry backoff */
function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export async function generateIdeas(input: GenerateIdeasInput): Promise<IdeaResult[]> {
  const {
    brand = {},
    language = DEFAULT_LANGUAGE,
    topic = 'social media content',
    keywords = '',
    recentPostTitles = [],
  } = input

  const { provider, modelName } = getProvider()

  const validLang = VALID_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
  const langInstruction = LANGUAGE_INSTRUCTIONS[validLang]

  const brandRecord = brand as Record<string, string | null | undefined>
  const brandContext = [
    brandRecord.description ? `Brand: ${brandRecord.description}` : '',
    brandRecord.industry    ? `Industry: ${brandRecord.industry}` : '',
    brandRecord.audience    ? `Target audience: ${brandRecord.audience}` : '',
    Array.isArray(brandRecord.platforms) && (brandRecord.platforms as string[]).length
      ? `Platforms: ${(brandRecord.platforms as string[]).join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n')

  const avoidSection = recentPostTitles.length > 0
    ? `\nAvoid these topics that were already recently covered:\n${recentPostTitles.map((t) => `- ${t}`).join('\n')}\n`
    : ''

  const systemPrompt = `You are a creative social media strategist generating post ideas. ${langInstruction.systemDirective}
Return your response as a valid JSON array only, with no additional text before or after it.`

  const userPrompt = `Generate 5 social media post ideas for topic: "${topic}"${keywords ? `, keywords: ${keywords}` : ''}.
${brandContext ? `\nBrand context:\n${brandContext}\n` : ''}${avoidSection}
Requirements:
- Return exactly 5 ideas as a JSON array
- Each object: { "emoji": string, "title": string, "hint": string }
- "title": a compelling post title (max 80 chars)
- "hint": 1–2 sentences explaining why this idea works for the audience
- Ideas must be distinctly different from each other
- ${langInstruction.userDirective}`

  // Retry up to 2× with 3s / 8s backoff (handles transient rate limits)
  let raw = ''
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      raw = await provider.generateText({
        systemPrompt,
        userPrompt,
        temperature: 0.8,
        model: modelName,
      })
      break
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isRateLimit = msg.includes('429') || msg.toLowerCase().includes('rate limit')
      if (isRateLimit && attempt < 2) {
        const delay = attempt === 0 ? 3000 : 8000
        console.warn(`generateIdeas: rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1})`)
        await sleep(delay)
        continue
      }
      throw err
    }
  }

  // Extract JSON array from the response (model sometimes adds markdown fences or prose)
  const jsonMatch = raw.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error('generateIdeas: unexpected response format:', raw.slice(0, 300))
    throw new Error(`Nieoczekiwana odpowiedź modelu AI (brak tablicy JSON). Fragment: "${raw.slice(0, 120)}"`)
  }

  try {
    return JSON.parse(jsonMatch[0]) as IdeaResult[]
  } catch (parseErr) {
    throw new Error(`Błąd parsowania odpowiedzi AI: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`)
  }
}
