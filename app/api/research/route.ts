import { NextResponse } from 'next/server'
import { createAIProvider } from '@/lib/ai'
import type { ProviderName } from '@/lib/ai'

export interface ResearchInsight {
  tag: string
  title: string
  text: string
}

export async function POST(req: Request) {
  try {
    const { brand = {}, platforms = [], language = 'Polish' } = await req.json()

    const provider = (process.env.IDEAS_PROVIDER || process.env.POSTS_PROVIDER || 'openai') as ProviderName
    const apiKey =
      provider === 'openrouter'
        ? (process.env.OPENROUTER_API_KEY || '')
        : (process.env.OPENAI_API_KEY || '')
    const model = process.env.IDEAS_MODEL || 'gpt-4o-mini'
    const ai = createAIProvider(provider, apiKey, {
      appUrl: process.env.APP_URL || 'http://localhost:3000',
      model,
    })

    const langNote = language === 'Polish' ? 'Respond in Polish.' : 'Respond in English.'

    const brandContext = [
      brand.name        ? `Brand: ${brand.name}` : '',
      brand.industry    ? `Industry: ${brand.industry}` : '',
      brand.description ? `Description: ${brand.description}` : '',
      brand.audience    ? `Target audience: ${brand.audience}` : '',
      platforms.length  ? `Platforms: ${platforms.join(', ')}` : '',
    ].filter(Boolean).join('\n')

    const prompt = `You are a social media strategy expert.
${langNote}
Based on the brand context below, provide 4 short insights to help create a social media post.
Return a JSON array with exactly 4 objects, each having: tag, title, text.
Tags should be: "📈 Trend", "⏱ Timing", "🏷 Hashtagi", "💬 Ton".
Keep each "text" field under 60 words and make it specific to this brand.

Brand context:
${brandContext || 'No specific brand context provided.'}

Return ONLY valid JSON array, no markdown, no explanation.`

    const raw = await ai.generateText({
      systemPrompt: 'You are a social media strategy analyst. Always return valid JSON.',
      userPrompt: prompt,
      temperature: 0.6,
    })

    // Parse JSON — strip markdown fences if present
    const cleaned = raw.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()
    const insights: ResearchInsight[] = JSON.parse(cleaned)

    if (!Array.isArray(insights) || insights.length === 0) throw new Error('Invalid response')

    return NextResponse.json({ insights })
  } catch (error: unknown) {
    console.error('Research error:', error)
    // Return generic fallback on parse/AI error
    return NextResponse.json({
      insights: [
        { tag: '📈 Trend', title: 'Rosnące zaangażowanie', text: 'Autentyczne treści i materiały zza kulis generują wyższe zaangażowanie niż materiały reklamowe.' },
        { tag: '⏱ Timing', title: 'Środa–piątek 19:30', text: 'Posty opublikowane między 18:00 a 21:00 osiągają średnio o 25% wyższy zasięg.' },
        { tag: '🏷 Hashtagi', title: '5–10 trafnych tagów', text: 'Mieszanka niszowych i popularnych hashtagów zwiększa odkrywalność bez nadmiernej konkurencji.' },
        { tag: '💬 Ton', title: 'Zaufanie przez ekspertyzę', text: 'Ton łączący wiedzę ekspercką z ludzkim ciepłem buduje lojalność odbiorców na dłuższą metę.' },
      ],
    })
  }
}
