import { OpenAIProvider } from './openai-provider'
import { OpenRouterProvider } from './openrouter-provider'
import type { AIProvider, ProviderName } from './types'

export function createAIProvider(
  provider: ProviderName,
  apiKey: string,
  options?: { model?: string; appUrl?: string },
): AIProvider {
  if (!apiKey) {
    throw new Error(`Missing API key for provider: ${provider}`)
  }

  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey)
    case 'openrouter':
      return new OpenRouterProvider(apiKey, options?.appUrl ?? 'http://localhost:3000')
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

export type { AIProvider, ProviderName } from './types'
