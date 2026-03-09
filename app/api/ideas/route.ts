import { NextResponse } from 'next/server'
import { generateIdeas } from '@/lib/pipeline'

export async function POST(req: Request) {
  try {
    const { topic, keywords = '', brand = {}, language } = await req.json()
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }
    const ideas = await generateIdeas({ topic, keywords, brand, language })
    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('Ideas error:', error)
    return NextResponse.json({ error: 'Failed to generate ideas' }, { status: 500 })
  }
}
