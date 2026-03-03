import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const topic = searchParams.get('topic')

  if (!topic) {
    return NextResponse.json({ error: 'topic parameter is required' }, { status: 400 })
  }

  const googleTrendsEnabled = (process.env.GOOGLE_TRENDS_ENABLED || 'false') === 'true'

  if (!googleTrendsEnabled) {
    return NextResponse.json({
      available: false,
      message: 'Google Trends jest wyłączony. Ustaw GOOGLE_TRENDS_ENABLED=true w .env.local, aby włączyć.',
    })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const googleTrends = require('google-trends-api')
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000
    const startTime = new Date(Date.now() - NINETY_DAYS_MS)

    const result = await googleTrends.interestOverTime({
      keyword: topic,
      startTime,
    })

    const parsed = JSON.parse(result)
    const timelineData = parsed?.default?.timelineData ?? []

    const normalized = timelineData.map((item: { formattedTime?: string; time?: string; value?: number[] }) => ({
      date: item.formattedTime || item.time || '',
      value: Array.isArray(item.value) ? (item.value[0] ?? 0) : 0,
    }))

    return NextResponse.json({
      available: true,
      data: { timelineData: normalized },
    })
  } catch (error) {
    console.error('Google Trends error:', error)
    return NextResponse.json({
      available: false,
      message: 'Nie udało się pobrać danych trendów.',
    })
  }
}
