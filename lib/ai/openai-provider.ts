import OpenAI from 'openai'
import type { AIProvider } from './types'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
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
