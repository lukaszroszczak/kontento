'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

// ─── Supported locales ─────────────────────────────────────────────────────
export type Locale = 'pl' | 'en-GB'

export const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: 'pl',    label: 'Polski',    flag: '🇵🇱' },
  { value: 'en-GB', label: 'English',   flag: '🇬🇧' },
]

const STORAGE_KEY = 'kontento_locale'

// ─── Translation dictionary type ────────────────────────────────────────────
export interface Translations {
  // Nav
  nav_posts: string
  nav_calendar: string
  nav_stats: string
  nav_new_post: string

  // Creator step labels (sidebar)
  step1_label: string
  step2_label: string
  step3_label: string
  step4_label: string
  step5_label: string
  step6_label: string

  // Step 1 — Profile
  step1_heading: string
  step1_subheading: string
  step1_brand_name: string
  step1_brand_name_placeholder: string
  step1_description: string
  step1_description_placeholder: string
  step1_industry: string
  step1_industry_placeholder: string
  step1_audience: string
  step1_audience_placeholder: string
  step1_website: string
  step1_website_placeholder: string
  step1_platforms: string
  step1_tone: string
  step1_cta: string
  step1_save_profile: string
  step1_profile_saved: string
  step1_load_profile: string
  step1_close_list: string
  step1_no_name_profile: string

  // Step 2 — Research
  step2_heading: string
  step2_subheading: string
  step2_task_industry: string
  step2_task_trends: string
  step2_task_timing: string
  step2_task_trends_loading: string
  step2_task_trends_available: string
  step2_task_trends_local: string
  step2_detail_trends: string
  step2_detail_timing: string
  step2_detail_trends_connecting: string
  step2_detail_trends_available: string
  step2_detail_trends_local: string
  step2_cta: string

  // Step 3 — Topics
  step3_heading: string
  step3_subheading: string
  step3_refine_placeholder: string
  step3_refresh: string
  step3_add_custom: string
  step3_custom_placeholder: string
  step3_use_topic: string
  step3_cancel: string
  step3_cta: string
  step3_skip: string

  // Step 4 — Content
  step4_heading: string
  step4_subheading_topic: string
  step4_subheading_manual: string
  step4_options_label: string
  step4_tone_label: string
  step4_language_label: string
  step4_hashtags: string
  step4_emoji: string
  step4_generate: string
  step4_generating: string
  step4_reset_ai: string
  step4_chars: string
  step4_suggestions_label: string
  step4_suggestions_refresh: string
  step4_shorter: string
  step4_longer: string
  step4_more_formal: string
  step4_cta: string
  step4_save_draft: string
  step4_error_connection: string

  // Step 5 — Image
  step5_heading: string
  step5_subheading: string
  step5_prompt_label: string
  step5_generate: string
  step5_generating: string
  step5_regenerate: string
  step5_upload_label: string
  step5_upload_hint: string
  step5_logo_label: string
  step5_logo_watermark: string
  step5_logo_frame: string
  step5_logo_corner: string
  step5_skip: string
  step5_cta: string

  // Step 6 — Publish
  step6_heading: string
  step6_subheading: string
  step6_publish_now: string
  step6_schedule: string
  step6_cta_publish: string
  step6_cta_schedule: string
  step6_save_draft: string

  // Buttons / general
  btn_back: string
  btn_next: string
  btn_skip: string
  error_api: string

  // Posts page
  posts_heading: string
  posts_search_placeholder: string
  posts_filter_all: string
  posts_filter_draft: string
  posts_filter_scheduled: string
  posts_filter_published: string

  // Result cards in Step 2
  research_trend_title: string
  research_trend_text: string
  research_timing_title: string
  research_timing_text: string
  research_hashtag_title: string
  research_hashtag_text: string
  research_tone_title: string
  research_tone_text: string
}

// ─── Polish dictionary ───────────────────────────────────────────────────────
const pl: Translations = {
  nav_posts: 'Posty',
  nav_calendar: 'Kalendarz',
  nav_stats: 'Statystyki',
  nav_new_post: 'Nowy post',

  step1_label: 'Profil marki',
  step2_label: 'Research AI',
  step3_label: 'Temat',
  step4_label: 'Treść',
  step5_label: 'Grafika',
  step6_label: 'Publikacja',

  step1_heading: 'Opisz swoją markę',
  step1_subheading: 'Powiedz nam w kilku zdaniach, czym się zajmujesz. Na tej podstawie AI dobierze odpowiedni ton i tematy do twoich postów.',
  step1_brand_name: 'Nazwa marki / firmy',
  step1_brand_name_placeholder: 'np. Studio Foto Anna Kowalska',
  step1_description: 'Opis działalności',
  step1_description_placeholder: 'np. Prowadzę studio fotograficzne specjalizujące się w sesjach rodzinnych i biznesowych…',
  step1_industry: 'Branża',
  step1_industry_placeholder: 'np. Fotografia, Usługi kreatywne',
  step1_audience: 'Grupa docelowa',
  step1_audience_placeholder: 'np. Rodziny, Przedsiębiorcy, 25–45 lat',
  step1_website: 'Strona internetowa (opcjonalnie)',
  step1_website_placeholder: 'np. https://mojastrona.pl',
  step1_platforms: 'Platformy do publikacji',
  step1_tone: 'Ton komunikacji',
  step1_cta: 'Zapisz i uruchom research →',
  step1_save_profile: '💾 Zapisz profil',
  step1_profile_saved: 'Profil zapisany ✓',
  step1_load_profile: 'Wczytaj zapisany profil',
  step1_close_list: 'Zamknij listę',
  step1_no_name_profile: 'Profil bez nazwy',

  step2_heading: 'AI analizuje twój rynek',
  step2_subheading: 'Przeszukujemy trendy, konkurencję i najlepsze praktyki w twojej branży.',
  step2_task_industry: 'Analiza profilu branży',
  step2_task_trends: 'Trendy w branży',
  step2_task_timing: 'Analiza najlepszego czasu publikacji',
  step2_task_trends_loading: 'Pobieram dane trendów…',
  step2_task_trends_available: 'Dane trendów pobrane',
  step2_task_trends_local: 'Analiza na podstawie danych branżowych',
  step2_detail_trends: 'Znaleziono aktualne formaty treści',
  step2_detail_timing: 'Optymalne: wt–czw, godz. 19:00–21:00',
  step2_detail_trends_connecting: 'Łączę z Google Trends',
  step2_detail_trends_available: 'Dane dostępne',
  step2_detail_trends_local: 'Google Trends niedostępny — analiza lokalna',
  step2_cta: 'Przejdź do tematów →',

  step3_heading: 'Wybierz temat dla posta',
  step3_subheading: 'AI zaproponowało tematy dopasowane do twojej marki i aktualnych trendów. Wybierz jeden lub wpisz własny.',
  step3_refine_placeholder: 'Precyzuj temat: np. sesja rodzinna, wiosna, Wrocław…',
  step3_refresh: '↺ Odśwież',
  step3_add_custom: 'Dodaj własny temat',
  step3_custom_placeholder: 'Wpisz własny temat posta…',
  step3_use_topic: 'Użyj tematu',
  step3_cancel: 'Anuluj',
  step3_cta: 'Generuj post z tym tematem →',
  step3_skip: 'Pomiń, napiszę sam',

  step4_heading: 'Treść posta',
  step4_subheading_topic: 'Ustaw opcje i wygeneruj treść, lub edytuj od razu.',
  step4_subheading_manual: 'Wpisz treść ręcznie lub skonfiguruj AI i kliknij Generuj.',
  step4_options_label: '✦ Opcje generowania',
  step4_tone_label: 'Ton',
  step4_language_label: 'Język',
  step4_hashtags: 'Hashtagi',
  step4_emoji: 'Emoji',
  step4_generate: '✦ Generuj post z AI',
  step4_generating: 'Generuję…',
  step4_reset_ai: 'Resetuj do AI',
  step4_chars: 'Znaków',
  step4_suggestions_label: '✦ Szybkie warianty zakończenia',
  step4_suggestions_refresh: '↺ Odśwież',
  step4_shorter: 'Krótszy',
  step4_longer: 'Dłuższy',
  step4_more_formal: 'Bardziej formalny',
  step4_cta: 'Zatwierdź i przejdź do grafiki →',
  step4_save_draft: 'Zapisz szkic',
  step4_error_connection: 'Błąd połączenia. Sprawdź klucz API w .env.local.',

  step5_heading: 'Grafika do posta',
  step5_subheading: 'Wygeneruj grafikę z AI lub dodaj własną.',
  step5_prompt_label: 'Prompt grafiki',
  step5_generate: '✦ Generuj grafikę z AI',
  step5_generating: 'Generuję…',
  step5_regenerate: '↺ Regeneruj',
  step5_upload_label: 'lub dodaj własną grafikę',
  step5_upload_hint: 'Przeciągnij plik lub kliknij, aby wybrać',
  step5_logo_label: 'Logo / znak wodny',
  step5_logo_watermark: 'Znak wodny',
  step5_logo_frame: 'Ramka',
  step5_logo_corner: 'Narożnik',
  step5_skip: 'Pomiń, bez grafiki',
  step5_cta: 'Zatwierdź grafikę →',

  step6_heading: 'Opublikuj post',
  step6_subheading: 'Wybierz kiedy i gdzie opublikować.',
  step6_publish_now: 'Opublikuj teraz',
  step6_schedule: 'Zaplanuj publikację',
  step6_cta_publish: '✦ Opublikuj teraz',
  step6_cta_schedule: '✦ Zaplanuj publikację',
  step6_save_draft: 'Zapisz jako szkic',

  btn_back: '← Wróć',
  btn_next: 'Dalej →',
  btn_skip: 'Pomiń',
  error_api: 'Nie udało się wygenerować treści.',

  posts_heading: 'Twoje posty',
  posts_search_placeholder: 'Szukaj postów…',
  posts_filter_all: 'Wszystkie',
  posts_filter_draft: 'Szkice',
  posts_filter_scheduled: 'Zaplanowane',
  posts_filter_published: 'Opublikowane',

  research_trend_title: 'Behind the scenes zyska 40% więcej zasięgu',
  research_trend_text: 'Posty pokazujące kulisy pracy generują o 40% wyższe zaangażowanie w Q1 2026.',
  research_timing_title: 'Najlepszy czas: środy, 19:30–20:30',
  research_timing_text: 'Twoja grupa docelowa jest najbardziej aktywna wieczorami w środku tygodnia.',
  research_hashtag_title: 'Niszowe hashtagi > popularne',
  research_hashtag_text: 'Mniejsza konkurencja, wyższy zasięg organiczny. AI zaproponuje optymalne hashtagi w kroku 6.',
  research_tone_title: 'Opowiadanie historii zwiększa zasięg',
  research_tone_text: 'Posty z mini-narracją mają 2× wyższy wskaźnik zapisu do obserwowania.',
}

// ─── British English dictionary ──────────────────────────────────────────────
const enGB: Translations = {
  nav_posts: 'Posts',
  nav_calendar: 'Calendar',
  nav_stats: 'Statistics',
  nav_new_post: 'New post',

  step1_label: 'Brand profile',
  step2_label: 'AI Research',
  step3_label: 'Topic',
  step4_label: 'Content',
  step5_label: 'Graphic',
  step6_label: 'Publish',

  step1_heading: 'Describe your brand',
  step1_subheading: 'Tell us in a few sentences what you do. Based on this, AI will choose the right tone and topics for your posts.',
  step1_brand_name: 'Brand / company name',
  step1_brand_name_placeholder: 'e.g. Anna Kowalska Photography Studio',
  step1_description: 'Business description',
  step1_description_placeholder: 'e.g. I run a photography studio specialising in family and business portrait sessions…',
  step1_industry: 'Industry',
  step1_industry_placeholder: 'e.g. Photography, Creative services',
  step1_audience: 'Target audience',
  step1_audience_placeholder: 'e.g. Families, Entrepreneurs, aged 25–45',
  step1_website: 'Website (optional)',
  step1_website_placeholder: 'e.g. https://mywebsite.co.uk',
  step1_platforms: 'Publishing platforms',
  step1_tone: 'Communication tone',
  step1_cta: 'Save and start research →',
  step1_save_profile: '💾 Save profile',
  step1_profile_saved: 'Profile saved ✓',
  step1_load_profile: 'Load saved profile',
  step1_close_list: 'Close list',
  step1_no_name_profile: 'Untitled profile',

  step2_heading: 'AI is analysing your market',
  step2_subheading: 'We\'re scanning trends, competitors, and best practices in your industry.',
  step2_task_industry: 'Industry profile analysis',
  step2_task_trends: 'Industry trends',
  step2_task_timing: 'Best publication time analysis',
  step2_task_trends_loading: 'Fetching trend data…',
  step2_task_trends_available: 'Trend data retrieved',
  step2_task_trends_local: 'Analysis based on industry data',
  step2_detail_trends: 'Current content formats identified',
  step2_detail_timing: 'Optimal: Tue–Thu, 7:00–9:00 PM',
  step2_detail_trends_connecting: 'Connecting to Google Trends',
  step2_detail_trends_available: 'Data available',
  step2_detail_trends_local: 'Google Trends unavailable — local analysis',
  step2_cta: 'Go to topics →',

  step3_heading: 'Choose a topic for your post',
  step3_subheading: 'AI has suggested topics tailored to your brand and current trends. Choose one or enter your own.',
  step3_refine_placeholder: 'Refine topic: e.g. family session, spring, London…',
  step3_refresh: '↺ Refresh',
  step3_add_custom: 'Add custom topic',
  step3_custom_placeholder: 'Enter your own post topic…',
  step3_use_topic: 'Use this topic',
  step3_cancel: 'Cancel',
  step3_cta: 'Generate post with this topic →',
  step3_skip: 'Skip, I\'ll write it myself',

  step4_heading: 'Post content',
  step4_subheading_topic: 'Set options and generate content, or edit it directly.',
  step4_subheading_manual: 'Type content manually or configure AI and click Generate.',
  step4_options_label: '✦ Generation options',
  step4_tone_label: 'Tone',
  step4_language_label: 'Language',
  step4_hashtags: 'Hashtags',
  step4_emoji: 'Emoji',
  step4_generate: '✦ Generate post with AI',
  step4_generating: 'Generating…',
  step4_reset_ai: 'Reset to AI',
  step4_chars: 'Characters',
  step4_suggestions_label: '✦ Quick ending variants',
  step4_suggestions_refresh: '↺ Refresh',
  step4_shorter: 'Shorter',
  step4_longer: 'Longer',
  step4_more_formal: 'More formal',
  step4_cta: 'Confirm and go to graphic →',
  step4_save_draft: 'Save draft',
  step4_error_connection: 'Connection error. Check the API key in .env.local.',

  step5_heading: 'Post graphic',
  step5_subheading: 'Generate a graphic with AI or add your own.',
  step5_prompt_label: 'Image prompt',
  step5_generate: '✦ Generate graphic with AI',
  step5_generating: 'Generating…',
  step5_regenerate: '↺ Regenerate',
  step5_upload_label: 'or add your own graphic',
  step5_upload_hint: 'Drag a file here or click to select',
  step5_logo_label: 'Logo / watermark',
  step5_logo_watermark: 'Watermark',
  step5_logo_frame: 'Frame',
  step5_logo_corner: 'Corner',
  step5_skip: 'Skip, no graphic',
  step5_cta: 'Confirm graphic →',

  step6_heading: 'Publish post',
  step6_subheading: 'Choose when and where to publish.',
  step6_publish_now: 'Publish now',
  step6_schedule: 'Schedule publication',
  step6_cta_publish: '✦ Publish now',
  step6_cta_schedule: '✦ Schedule publication',
  step6_save_draft: 'Save as draft',

  btn_back: '← Back',
  btn_next: 'Next →',
  btn_skip: 'Skip',
  error_api: 'Failed to generate content.',

  posts_heading: 'Your posts',
  posts_search_placeholder: 'Search posts…',
  posts_filter_all: 'All',
  posts_filter_draft: 'Drafts',
  posts_filter_scheduled: 'Scheduled',
  posts_filter_published: 'Published',

  research_trend_title: 'Behind-the-scenes content gains 40% more reach',
  research_trend_text: 'Posts showing behind-the-scenes work generate 40% higher engagement in Q1 2026.',
  research_timing_title: 'Best time: Wednesdays, 7:30–8:30 PM',
  research_timing_text: 'Your target audience is most active on weekday evenings.',
  research_hashtag_title: 'Niche hashtags > popular ones',
  research_hashtag_text: 'Less competition, higher organic reach. AI will suggest optimal hashtags in step 6.',
  research_tone_title: 'Storytelling increases reach',
  research_tone_text: 'Posts with a mini-narrative have a 2× higher follow rate.',
}

// ─── Dictionaries map ────────────────────────────────────────────────────────
const DICTS: Record<Locale, Translations> = { pl, 'en-GB': enGB }

// ─── Context ─────────────────────────────────────────────────────────────────
interface I18nContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: keyof Translations) => string
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'pl',
  setLocale: () => {},
  t: (key) => pl[key],
})

// ─── Provider ────────────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('pl')

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored && (stored === 'pl' || stored === 'en-GB')) {
        setLocaleState(stored)
      }
    } catch {}
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {}
  }, [])

  const t = useCallback(
    (key: keyof Translations): string => DICTS[locale][key] ?? DICTS['pl'][key] ?? key,
    [locale],
  )

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTranslation() {
  return useContext(I18nContext)
}
