import { NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'

export async function POST(req: Request) {
  try {
    const { content, instruction, language = 'Polish' } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Brak treści do przepisania' }, { status: 400 })
    }

    const provider = (process.env.POSTS_PROVIDER || 'openai') as ProviderName
    const apiKey =
      provider === 'openrouter'
        ? (process.env.OPENROUTER_API_KEY || '')
        : (process.env.OPENAI_API_KEY || '')
    const model = process.env.POSTS_MODEL || 'gpt-4o-mini'
    const ai = createAIProvider(provider, apiKey, {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      model,
    })

    const langNote =
      language === 'Polish'
        ? 'Write in Polish with proper Polish diacritics.'
        : language === 'English (UK)'
        ? 'Write in British English.'
        : 'Write in American English.'

    const result = await ai.generateText({
      systemPrompt: `You are a social media copywriter. Rewrite the given text following the instruction.
${langNote}
Return ONLY the rewritten text — no explanations, no quotes, no prefixes.`,
      userPrompt: `Instruction: ${instruction}\n\nText to rewrite:\n${content}`,
      temperature: 0.7,
    })

    return NextResponse.json({ content: result })
  } catch (error: unknown) {
    console.error('Rephrase error:', error)
    const message = error instanceof Error ? error.message : 'Błąd przepisywania'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
