import { NextResponse } from 'next/server'
import { generateContent } from '@/lib/pipeline'

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

    const content = await generateContent({
      topic: description,
      platforms,
      tone,
      language,
      includeHashtags,
      includeEmoji,
      brand,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
