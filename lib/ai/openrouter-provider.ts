import OpenAI from 'openai'
import type { AIProvider } from './types'

export class OpenRouterProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey: string, appUrl: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': appUrl,
        'X-Title': 'Kontento',
      },
    })
  }

  async generateText(params: {
    systemPrompt: string
    userPrompt: string
    temperature?: number
    model?: string
  }): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.userPrompt },
      ],
      model: params.model ?? 'gpt-4o-mini',
      temperature: params.temperature ?? 0.7,
    })

    return completion.choices[0].message.content ?? ''
  }
}
