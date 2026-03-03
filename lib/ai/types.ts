export interface AIProvider {
  generateText(params: {
    systemPrompt: string
    userPrompt: string
    temperature?: number
    model?: string
  }): Promise<string>
}

export type ProviderName = 'openai' | 'openrouter'
