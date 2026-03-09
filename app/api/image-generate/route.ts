import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/pipeline'

export async function POST(req: Request) {
  try {
    const { content = '', brand = {}, platforms = ['instagram'], customPrompt } = await req.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured in .env.local' },
        { status: 500 },
      )
    }

    const result = await generateImage({ content, brand, platforms, customPrompt })
    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
