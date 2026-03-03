import { NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'
import { LANGUAGE_INSTRUCTIONS, DEFAULT_LANGUAGE, VALID_LANGUAGES } from '@/lib/constants'

export async function POST(req: Request) {
  try {
    const {
      topic,
      keywords = '',
      brand = {},
      language = DEFAULT_LANGUAGE,
    } = await req.json()

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const providerName = (process.env.IDEAS_PROVIDER || 'openai') as ProviderName
    const modelName = process.env.IDEAS_MODEL || 'gpt-4o-mini'
    const apiKey =
      providerName === 'openrouter'
        ? (process.env.OPENROUTER_API_KEY || '')
        : (process.env.OPENAI_API_KEY || '')

    const provider = createAIProvider(providerName, apiKey, {
      model: modelName,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    })

    const validLang = VALID_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    const langInstruction = LANGUAGE_INSTRUCTIONS[validLang]

    const brandContext = [
      brand.description ? `Brand: ${brand.description}` : '',
      brand.industry    ? `Industry: ${brand.industry}` : '',
      brand.audience    ? `Target audience: ${brand.audience}` : '',
      brand.platforms?.length ? `Platforms: ${(brand.platforms as string[]).join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const systemPrompt = `You are a creative social media strategist generating post ideas. ${langInstruction.systemDirective}
Return your response as a valid JSON array only, with no additional text before or after it.`

    const userPrompt = `Generate 5 social media post ideas for topic: "${topic}"${keywords ? `, keywords: ${keywords}` : ''}.
${brandContext ? `\nBrand context:\n${brandContext}\n` : ''}
Requirements:
- Return exactly 5 ideas as a JSON array
- Each object: { "emoji": string, "title": string, "hint": string }
- "title": a compelling post title (max 80 chars)
- "hint": 1–2 sentences explaining why this idea works for the audience
- Ideas must be distinctly different from each other
- ${langInstruction.userDirective}`

    const raw = await provider.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.8,
      model: modelName,
    })

    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }
    const ideas = JSON.parse(jsonMatch[0])

    return NextResponse.json({ ideas, provider: providerName, model: modelName })
  } catch (error) {
    console.error('Ideas error:', error)
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}
