import { NextResponse } from 'next/server'

/**
 * Edit / transform an existing image using Gemini's multimodal image generation.
 * Accepts: { imageBase64: string, mimeType?: string, prompt: string }
 * Returns: { resultImage: base64, mimeType }
 */
export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt } = await req.json() as {
      imageBase64: string
      mimeType?: string
      prompt: string
    }

    if (!imageBase64 || !prompt) {
      return NextResponse.json({ error: 'imageBase64 and prompt are required' }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured in .env.local' }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
              { text: prompt },
            ],
          }],
          generationConfig: {
            responseModalities: ['IMAGE'],
          },
        }),
      },
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.error?.message ?? 'Gemini API error')
    }

    const parts: Array<{ inline_data?: { mime_type: string; data: string } }> =
      data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p) => p.inline_data?.mime_type?.startsWith('image/'))

    if (!imagePart?.inline_data) {
      throw new Error('No image returned from Gemini')
    }

    return NextResponse.json({
      resultImage: imagePart.inline_data.data,
      mimeType: imagePart.inline_data.mime_type,
    })
  } catch (error: unknown) {
    console.error('Image edit error:', error)
    const message = error instanceof Error ? error.message : 'Failed to edit image'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
