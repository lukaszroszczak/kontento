// Tone options — value and label both in English (as per screenshot)
export const TONE_OPTIONS = [
  { value: 'Professional',   label: 'Professional' },
  { value: 'Casual',         label: 'Casual' },
  { value: 'Friendly',       label: 'Friendly' },
  { value: 'Humorous',       label: 'Humorous' },
  { value: 'Formal',         label: 'Formal' },
  { value: 'Inspirational',  label: 'Inspirational' },
  { value: 'Educational',    label: 'Educational' },
  { value: 'Conversational', label: 'Conversational' },
] as const

export type ToneValue = typeof TONE_OPTIONS[number]['value']
export type ToneLabel = typeof TONE_OPTIONS[number]['label']

// Language options
export const LANGUAGE_OPTIONS = [
  { value: 'Polish',        label: 'Polski' },
  { value: 'English (UK)',  label: 'English (UK)' },
  { value: 'English (US)',  label: 'English (US)' },
] as const

export type LanguageValue = typeof LANGUAGE_OPTIONS[number]['value']

export const VALID_LANGUAGES = LANGUAGE_OPTIONS.map((l) => l.value) as string[]
export const DEFAULT_LANGUAGE = 'Polish'

// Language-specific instructions passed to the AI
export const LANGUAGE_INSTRUCTIONS: Record<string, { userDirective: string; systemDirective: string }> = {
  Polish: {
    userDirective:
      'You MUST write entirely in Polish. Every word, sentence, and hashtag must be in Polish. ' +
      'Use proper Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż) throughout.',
    systemDirective:
      'You MUST write all content entirely in Polish. Do not mix in English words or phrases. ' +
      'Always use correct Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż).',
  },
  'English (UK)': {
    userDirective:
      'Use British English spelling and phrasing (e.g. colour, organise, favourite, centre, analyse, programme).',
    systemDirective:
      'Write in British English. Use British spelling conventions: colour (not color), ' +
      'organise (not organize), favourite (not favorite), centre (not center).',
  },
  'English (US)': {
    userDirective:
      'Use American English spelling and international style (e.g. color, organize, favorite, center, analyze, program).',
    systemDirective:
      'Write in American English with standard international style. Use American spelling conventions: ' +
      'color (not colour), organize (not organise), favorite (not favourite), center (not centre).',
  },
}
