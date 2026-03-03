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

export async function POST(req: Request) {
  try {
    const { brand = {}, content = '', language } = await req.json()

    const finalLanguage: string = VALID_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE
    const langInstruction = LANGUAGE_INSTRUCTIONS[finalLanguage]

    const brandContext = [
      brand.name        ? `Brand name: ${brand.name}` : '',
      brand.description ? `Brand description: ${brand.description}` : '',
      brand.industry    ? `Industry: ${brand.industry}` : '',
      brand.audience    ? `Target audience: ${brand.audience}` : '',
      brand.website     ? `Website: ${brand.website}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const systemPrompt = `You are a social media content specialist. ${langInstruction.systemDirective}
Return ONLY a JSON array with exactly 3 objects, each with keys "emoji" (single emoji) and "text" (the CTA/ending phrase, 4–12 words, without leading emoji).
Example format: [{"emoji":"📩","text":"Write to us and book your session"},{"emoji":"📅","text":"Check our available dates on the website"},{"emoji":"❓","text":"Which option suits your needs best?"}]
No markdown, no code fences, no explanation — only the JSON array.`

    const userPrompt = `Generate 3 short call-to-action ending phrases for a social media post.
${brandContext ? `\nBrand context:\n${brandContext}\n` : ''}
${content ? `\nPost content (for context):\n${content.slice(0, 300)}\n` : ''}
Requirements:
- ${langInstruction.userDirective}
- Each phrase should be a natural, engaging CTA or conversation starter
- Tailor them specifically to this brand's industry and audience
- Keep each phrase concise (4–12 words)
- Make them diverse: one contact/booking CTA, one informational, one engagement question`

    const provider = getProvider()
    const raw = await provider.generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
    })

    const match = raw.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 })
    }

    const suggestions: { emoji: string; text: string }[] = JSON.parse(match[0])
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Suggestions error:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
