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
  nav_my_account: string
  nav_admin_panel: string
  nav_logout: string

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
  step1_image_style_label: string
  step1_image_style_placeholder: string
  step1_image_style_hint: string

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
  step4_topic_prefix: string
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
  step4_toolbar_bold: string
  step4_toolbar_italic: string
  step4_toolbar_hashtag: string
  step4_toolbar_emoji: string
  step4_placeholder: string
  step4_ai_rephrasing: string
  step4_ai_writing: string
  step4_error_rephrase: string
  step4_error_rephrase_connection: string

  // Step 5 — Image
  step5_heading: string
  step5_subheading: string
  step5_prompt_label: string
  step5_generate: string
  step5_generating: string
  step5_regenerate: string
  step5_upload_label: string
  step5_upload_hint: string
  step5_upload_formats: string
  step5_logo_label: string
  step5_logo_watermark: string
  step5_logo_frame: string
  step5_logo_corner: string
  step5_logo_loaded: string
  step5_logo_add: string
  step5_logo_apply: string
  step5_logo_applying: string
  step5_logo_error: string
  step5_logo_error_connection: string
  step5_prompt_placeholder_content: string
  step5_prompt_placeholder_empty: string
  step5_prompt_used: string
  step5_generating_image: string
  step5_generate_click_hint: string
  step5_image_ready: string
  step5_image_with_logo: string
  step5_image_generated: string
  step5_image_uploaded: string
  step5_source_ai: string
  step5_source_upload: string
  step5_upload_change: string
  step5_logo_brand_linked: string
  step5_tab_ai: string
  step5_tab_upload: string
  step5_brand_template_active: string
  step5_ai_edit_label: string
  step5_ai_edit_placeholder: string
  step5_ai_edit_hint: string
  step5_ai_edit_btn: string
  step5_ai_editing: string
  step5_ai_edit_error: string
  step5_ai_edit_revert: string
  step5_image_ai_edited: string
  step5_skip: string
  step5_cta: string

  // Step 6 — Publish
  step6_heading: string
  step6_heading_full: string
  step6_subheading: string
  step6_subheading_full: string
  step6_brand_fallback: string
  step6_settings_heading: string
  step6_when_label: string
  step6_now_option: string
  step6_schedule_option: string
  step6_ai_recommend: string
  step6_best_reach: string
  step6_suggest_tuesday: string
  step6_suggest_wednesday: string
  step6_platforms_label: string
  step6_hashtags_label: string
  step6_hashtag_placeholder: string
  step6_saving: string
  step6_publish_btn: string
  step6_draft_btn: string
  step6_back: string
  step6_footer: string
  step6_error_default: string
  step6_error_save: string
  step6_success_published: string
  step6_success_published_desc: string
  step6_success_scheduled: string
  step6_success_scheduled_desc: string
  step6_success_draft: string
  step6_success_draft_desc: string
  step6_preview_no_image: string
  step6_preview_no_content: string
  step6_preview_more: string
  step6_preview_show_more: string
  step6_preview_see_more: string
  step6_preview_no_content_short: string
  step6_preview_now: string
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
  posts_filter_all_statuses: string
  posts_filter_all_platforms: string
  posts_sort_date: string
  posts_empty_create: string
  posts_empty_filters: string
  posts_error_fetch: string
  posts_error_load: string
  posts_confirm_delete: string

  // Post detail modal
  posts_detail_published: string
  posts_detail_scheduled: string
  posts_detail_created: string
  posts_detail_image_alt: string
  posts_detail_content: string
  posts_detail_no_content: string
  posts_detail_hashtags: string
  posts_detail_platforms: string
  posts_detail_stats: string
  // Post edit
  post_edit_btn: string
  post_edit_save: string
  post_edit_saving: string
  post_edit_cancel: string
  post_edit_image_label: string
  post_edit_image_regenerate: string
  post_edit_image_from_url: string
  post_edit_image_from_file: string
  post_edit_image_remove: string
  post_edit_image_prompt_placeholder: string
  post_edit_image_generate: string
  post_edit_image_generating: string
  post_edit_image_url_placeholder: string
  post_edit_image_apply_url: string
  posts_stat_likes: string
  posts_stat_comments: string
  posts_stat_reach: string
  posts_stat_clicks: string

  // Result cards in Step 2
  research_trend_title: string
  research_trend_text: string
  research_timing_title: string
  research_timing_text: string
  research_hashtag_title: string
  research_hashtag_text: string
  research_tone_title: string
  research_tone_text: string

  // Autopilot page
  nav_autopilot: string
  autopilot_heading: string
  autopilot_subheading: string
  autopilot_config_heading: string
  autopilot_posts_per_batch: string
  autopilot_tone_label: string
  autopilot_language_label: string
  autopilot_platforms_label: string
  autopilot_hashtags_toggle: string
  autopilot_emoji_toggle: string
  autopilot_images_toggle: string
  autopilot_save_config: string
  autopilot_config_saved: string
  autopilot_generate_btn: string
  autopilot_generating: string
  autopilot_last_run: string
  autopilot_never_run: string
  autopilot_result_heading: string
  autopilot_result_success: string
  autopilot_result_partial: string
  autopilot_result_failed: string
  autopilot_result_view_posts: string
  autopilot_brand_label: string
  autopilot_no_brand: string
  autopilot_setup_brand_hint: string

  // Post source filter
  posts_filter_all_sources: string
  posts_filter_source_manual: string
  posts_filter_source_autopilot: string
  posts_source_autopilot: string
}

// ─── Polish dictionary ───────────────────────────────────────────────────────
const pl: Translations = {
  nav_posts: 'Posty',
  nav_calendar: 'Kalendarz',
  nav_stats: 'Statystyki',
  nav_new_post: 'Nowy post',
  nav_my_account: 'Moje konto',
  nav_admin_panel: 'Panel admin',
  nav_logout: 'Wyloguj się',

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
  step1_image_style_label: 'Styl grafik (szablon prompta)',
  step1_image_style_placeholder: 'Opisz wizualny styl grafik po angielsku — kolory marki, układ geometryczny, styl fotografii, pozycja logo, nastrój… Ten tekst będzie bazą każdego generowanego obrazu.',
  step1_image_style_hint: 'Szablon jest łączony z treścią posta przy każdym generowaniu grafiki.',

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
  step4_topic_prefix: 'Temat: „',
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
  step4_toolbar_bold: 'Pogrubienie zaznaczonego tekstu',
  step4_toolbar_italic: 'Kursywa zaznaczonego tekstu',
  step4_toolbar_hashtag: 'Wstaw hashtag',
  step4_toolbar_emoji: 'Wstaw emoji',
  step4_placeholder: 'Wpisz treść posta lub wygeneruj z AI…',
  step4_ai_rephrasing: 'AI przepisuje…',
  step4_ai_writing: 'AI pisze…',
  step4_error_rephrase: 'Nie udało się przepisać treści.',
  step4_error_rephrase_connection: 'Błąd połączenia podczas przepisywania.',

  step5_heading: 'Grafika do posta',
  step5_subheading: 'Wygeneruj grafikę z AI lub dodaj własną.',
  step5_prompt_label: 'Prompt grafiki',
  step5_generate: '✦ Generuj grafikę z AI',
  step5_generating: 'Generuję…',
  step5_regenerate: '↺ Regeneruj',
  step5_upload_label: 'lub dodaj własną grafikę',
  step5_upload_hint: 'Przeciągnij plik lub kliknij, aby wybrać',
  step5_upload_formats: 'JPG, PNG, WEBP · maks. 20 MB',
  step5_logo_label: 'Logo / znak wodny',
  step5_logo_watermark: 'Znak wodny',
  step5_logo_frame: 'Ramka',
  step5_logo_corner: 'Narożnik',
  step5_logo_loaded: '✓ Logo załadowane',
  step5_logo_add: '+ Dodaj logo',
  step5_logo_apply: '✦ Zastosuj logo',
  step5_logo_applying: 'Nakładam logo…',
  step5_logo_error: 'Błąd nakładania logo.',
  step5_logo_error_connection: 'Błąd połączenia przy nakładaniu logo.',
  step5_prompt_placeholder_content: 'Zostaw puste — AI wygeneruje prompt z treści posta',
  step5_prompt_placeholder_empty: 'Opisz grafikę po angielsku, np. „Warm family portrait in autumn park"…',
  step5_prompt_used: 'Użyty prompt:',
  step5_generating_image: 'Generuję obraz…',
  step5_generate_click_hint: 'Kliknij „Generuj" aby stworzyć grafikę',
  step5_image_ready: 'Grafika gotowa',
  step5_image_with_logo: 'Z logo (Sharp)',
  step5_image_generated: 'Wygenerowana przez Gemini Imagen',
  step5_image_uploaded: 'Własne zdjęcie',
  step5_source_ai: 'Wygeneruj z AI',
  step5_source_upload: 'Dodaj własną grafikę',
  step5_upload_change: 'Zmień grafikę',
  step5_logo_brand_linked: 'powiązane z profilem marki',
  step5_tab_ai: 'AI',
  step5_tab_upload: 'Własna grafika',
  step5_brand_template_active: 'Szablon stylu marki aktywny',
  step5_ai_edit_label: 'Edytuj z AI',
  step5_ai_edit_placeholder: 'Opisz jak AI ma zmienić to zdjęcie, np. „Dodaj profesjonalną ramkę korporacyjną w stylu czerwono-czarnym z miejscem na logo"…',
  step5_ai_edit_hint: 'AI użyje przesłanego zdjęcia jako bazy i wprowadzi opisane zmiany.',
  step5_ai_edit_btn: 'Przekształć z AI',
  step5_ai_editing: 'Przekształcam…',
  step5_ai_edit_error: 'Błąd edycji AI. Spróbuj ponownie.',
  step5_ai_edit_revert: 'Wróć do oryginału',
  step5_image_ai_edited: 'Edytowane przez AI',
  step5_skip: 'Pomiń, bez grafiki',
  step5_cta: 'Zatwierdź grafikę →',

  step6_heading: 'Opublikuj post',
  step6_heading_full: 'Gotowe do\npublikacji',
  step6_subheading: 'Wybierz kiedy i gdzie opublikować.',
  step6_subheading_full: 'Sprawdź podgląd posta, ustaw czas i opublikuj.',
  step6_brand_fallback: 'Twoja marka',
  step6_settings_heading: 'Ustawienia publikacji',
  step6_when_label: 'Kiedy opublikować?',
  step6_now_option: 'Teraz',
  step6_schedule_option: 'Zaplanuj',
  step6_ai_recommend: '💡 AI rekomenduje:',
  step6_best_reach: '— najwyższy zasięg',
  step6_suggest_tuesday: 'wtorek 12:00',
  step6_suggest_wednesday: 'środa 19:30',
  step6_platforms_label: 'Platforma',
  step6_hashtags_label: 'Hashtagi (kliknij aby usunąć)',
  step6_hashtag_placeholder: '#dodaj hashtag',
  step6_saving: 'Zapisywanie…',
  step6_publish_btn: '🚀 Opublikuj teraz',
  step6_draft_btn: '💾 Zapisz szkic na później',
  step6_back: '← Wróć do grafiki',
  step6_footer: 'Post zostanie opublikowany na @',
  step6_error_default: 'Nie udało się zapisać posta',
  step6_error_save: 'Błąd zapisu',
  step6_success_published: 'Post opublikowany!',
  step6_success_published_desc: 'Twój post jest widoczny na: ',
  step6_success_scheduled: 'Post zaplanowany!',
  step6_success_scheduled_desc: 'Post zostanie opublikowany ',
  step6_success_draft: 'Szkic zapisany!',
  step6_success_draft_desc: 'Post czeka na Ciebie na liście — możesz go zaplanować lub opublikować później.',
  step6_preview_no_image: 'Brak grafiki',
  step6_preview_no_content: 'Brak treści posta',
  step6_preview_more: 'więcej',
  step6_preview_show_more: '...pokaż więcej',
  step6_preview_see_more: 'Zobacz więcej',
  step6_preview_no_content_short: 'Brak treści',
  step6_preview_now: 'Teraz · 🌐',
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
  posts_filter_all_statuses: 'Wszystkie statusy',
  posts_filter_all_platforms: 'Wszystkie platformy',
  posts_sort_date: 'Data',
  posts_empty_create: 'Brak postów. Utwórz swój pierwszy post klikając „Nowy post" ↑',
  posts_empty_filters: 'Brak postów pasujących do filtrów.',
  posts_error_fetch: 'Błąd pobierania postów',
  posts_error_load: 'Nie udało się załadować postów.',
  posts_confirm_delete: 'Usunąć ten post?',

  posts_detail_published: 'Opublikowano ',
  posts_detail_scheduled: 'Zaplanowano na ',
  posts_detail_created: 'Utworzono ',
  posts_detail_image_alt: 'Grafika posta',
  posts_detail_content: 'Treść posta',
  posts_detail_no_content: 'Brak treści',
  posts_detail_hashtags: 'Hashtagi',
  posts_detail_platforms: 'Platformy',
  posts_detail_stats: 'Statystyki',
  post_edit_btn: 'Edytuj',
  post_edit_save: 'Zapisz zmiany',
  post_edit_saving: 'Zapisywanie…',
  post_edit_cancel: 'Anuluj',
  post_edit_image_label: 'Grafika',
  post_edit_image_regenerate: 'Regeneruj',
  post_edit_image_from_url: 'Z linku',
  post_edit_image_from_file: 'Z dysku',
  post_edit_image_remove: 'Usuń grafikę',
  post_edit_image_prompt_placeholder: 'Uwagi do generowania (opcjonalnie)…',
  post_edit_image_generate: 'Generuj',
  post_edit_image_generating: 'Generuję…',
  post_edit_image_url_placeholder: 'https://…',
  post_edit_image_apply_url: 'Zastosuj',
  posts_stat_likes: 'Polubienia',
  posts_stat_comments: 'Komentarze',
  posts_stat_reach: 'Zasięg',
  posts_stat_clicks: 'Kliknięcia',

  research_trend_title: 'Behind the scenes zyska 40% więcej zasięgu',
  research_trend_text: 'Posty pokazujące kulisy pracy generują o 40% wyższe zaangażowanie w Q1 2026.',
  research_timing_title: 'Najlepszy czas: środy, 19:30–20:30',
  research_timing_text: 'Twoja grupa docelowa jest najbardziej aktywna wieczorami w środku tygodnia.',
  research_hashtag_title: 'Niszowe hashtagi > popularne',
  research_hashtag_text: 'Mniejsza konkurencja, wyższy zasięg organiczny. AI zaproponuje optymalne hashtagi w kroku 6.',
  research_tone_title: 'Opowiadanie historii zwiększa zasięg',
  research_tone_text: 'Posty z mini-narracją mają 2× wyższy wskaźnik zapisu do obserwowania.',

  nav_autopilot: 'Autopilot',
  autopilot_heading: 'Autopilot',
  autopilot_subheading: 'Generuj posty automatycznie na podstawie profilu marki. Posty trafiają do szkiców — możesz je przejrzeć i zaplanować publikację.',
  autopilot_config_heading: 'Konfiguracja',
  autopilot_posts_per_batch: 'Liczba postów na serię',
  autopilot_tone_label: 'Ton komunikacji',
  autopilot_language_label: 'Język',
  autopilot_platforms_label: 'Platformy',
  autopilot_hashtags_toggle: 'Hashtagi',
  autopilot_emoji_toggle: 'Emoji',
  autopilot_images_toggle: 'Generuj grafiki',
  autopilot_save_config: 'Zapisz konfigurację',
  autopilot_config_saved: 'Zapisano ✓',
  autopilot_generate_btn: '✦ Generuj posty',
  autopilot_generating: 'Generuję posty…',
  autopilot_last_run: 'Ostatnie uruchomienie:',
  autopilot_never_run: 'Jeszcze nie uruchamiano',
  autopilot_result_heading: 'Wynik generowania',
  autopilot_result_success: 'Posty wygenerowane pomyślnie!',
  autopilot_result_partial: 'Część postów wygenerowana.',
  autopilot_result_failed: 'Nie udało się wygenerować postów.',
  autopilot_result_view_posts: 'Zobacz wygenerowane posty →',
  autopilot_brand_label: 'Profil marki',
  autopilot_no_brand: 'Brak profilu marki',
  autopilot_setup_brand_hint: 'Autopilot wymaga profilu marki. Utwórz go tworząc nowy post (krok 1).',

  posts_filter_all_sources: 'Wszystkie źródła',
  posts_filter_source_manual: 'Ręczne',
  posts_filter_source_autopilot: 'Autopilot',
  posts_source_autopilot: 'Autopilot',
}

// ─── British English dictionary ──────────────────────────────────────────────
const enGB: Translations = {
  nav_posts: 'Posts',
  nav_calendar: 'Calendar',
  nav_stats: 'Statistics',
  nav_new_post: 'New post',
  nav_my_account: 'My account',
  nav_admin_panel: 'Admin panel',
  nav_logout: 'Log out',

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
  step1_image_style_label: 'Graphic style (prompt template)',
  step1_image_style_placeholder: 'Describe your brand\'s visual style in English — brand colours, geometric layout, photography style, logo position, mood… This text will be used as the foundation for every generated image.',
  step1_image_style_hint: 'The template is combined with post content each time a graphic is generated.',

  step2_heading: 'AI is analysing your market',
  step2_subheading: "We're scanning trends, competitors, and best practices in your industry.",
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
  step3_skip: "Skip, I'll write it myself",

  step4_heading: 'Post content',
  step4_subheading_topic: 'Set options and generate content, or edit it directly.',
  step4_subheading_manual: 'Type content manually or configure AI and click Generate.',
  step4_topic_prefix: 'Topic: "',
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
  step4_toolbar_bold: 'Bold selected text',
  step4_toolbar_italic: 'Italic selected text',
  step4_toolbar_hashtag: 'Insert hashtag',
  step4_toolbar_emoji: 'Insert emoji',
  step4_placeholder: 'Type post content or generate with AI…',
  step4_ai_rephrasing: 'AI is rephrasing…',
  step4_ai_writing: 'AI is writing…',
  step4_error_rephrase: 'Failed to rephrase content.',
  step4_error_rephrase_connection: 'Connection error while rephrasing.',

  step5_heading: 'Post graphic',
  step5_subheading: 'Generate a graphic with AI or add your own.',
  step5_prompt_label: 'Image prompt',
  step5_generate: '✦ Generate graphic with AI',
  step5_generating: 'Generating…',
  step5_regenerate: '↺ Regenerate',
  step5_upload_label: 'or add your own graphic',
  step5_upload_hint: 'Drag a file here or click to select',
  step5_upload_formats: 'JPG, PNG, WEBP · max 20 MB',
  step5_logo_label: 'Logo / watermark',
  step5_logo_watermark: 'Watermark',
  step5_logo_frame: 'Frame',
  step5_logo_corner: 'Corner',
  step5_logo_loaded: '✓ Logo loaded',
  step5_logo_add: '+ Add logo',
  step5_logo_apply: '✦ Apply logo',
  step5_logo_applying: 'Applying logo…',
  step5_logo_error: 'Logo overlay error.',
  step5_logo_error_connection: 'Connection error while applying logo.',
  step5_prompt_placeholder_content: 'Leave blank — AI will generate a prompt from post content',
  step5_prompt_placeholder_empty: 'Describe the graphic in English, e.g. "Warm family portrait in autumn park"…',
  step5_prompt_used: 'Used prompt:',
  step5_generating_image: 'Generating image…',
  step5_generate_click_hint: 'Click "Generate" to create a graphic',
  step5_image_ready: 'Graphic ready',
  step5_image_with_logo: 'With logo (Sharp)',
  step5_image_generated: 'Generated by Gemini Imagen',
  step5_image_uploaded: 'Own photo',
  step5_source_ai: 'Generate with AI',
  step5_source_upload: 'Add your own graphic',
  step5_upload_change: 'Change graphic',
  step5_logo_brand_linked: 'linked to brand profile',
  step5_tab_ai: 'AI',
  step5_tab_upload: 'Own graphic',
  step5_brand_template_active: 'Brand style template active',
  step5_ai_edit_label: 'Edit with AI',
  step5_ai_edit_placeholder: 'Describe how AI should transform this photo, e.g. "Add a professional corporate frame in red and black with logo placement"…',
  step5_ai_edit_hint: 'AI will use the uploaded photo as a base and apply the described changes.',
  step5_ai_edit_btn: 'Transform with AI',
  step5_ai_editing: 'Transforming…',
  step5_ai_edit_error: 'AI edit error. Please try again.',
  step5_ai_edit_revert: 'Revert to original',
  step5_image_ai_edited: 'AI edited',
  step5_skip: 'Skip, no graphic',
  step5_cta: 'Confirm graphic →',

  step6_heading: 'Publish post',
  step6_heading_full: 'Ready to\npublish',
  step6_subheading: 'Choose when and where to publish.',
  step6_subheading_full: 'Check the post preview, set the time, and publish.',
  step6_brand_fallback: 'Your brand',
  step6_settings_heading: 'Publish settings',
  step6_when_label: 'When to publish?',
  step6_now_option: 'Now',
  step6_schedule_option: 'Schedule',
  step6_ai_recommend: '💡 AI recommends:',
  step6_best_reach: '— best reach',
  step6_suggest_tuesday: 'Tuesday 12:00',
  step6_suggest_wednesday: 'Wednesday 19:30',
  step6_platforms_label: 'Platform',
  step6_hashtags_label: 'Hashtags (click to remove)',
  step6_hashtag_placeholder: '#add hashtag',
  step6_saving: 'Saving…',
  step6_publish_btn: '🚀 Publish now',
  step6_draft_btn: '💾 Save draft for later',
  step6_back: '← Back to graphic',
  step6_footer: 'Post will be published on @',
  step6_error_default: 'Failed to save post',
  step6_error_save: 'Save error',
  step6_success_published: 'Post published!',
  step6_success_published_desc: 'Your post is visible on: ',
  step6_success_scheduled: 'Post scheduled!',
  step6_success_scheduled_desc: 'Post will be published on ',
  step6_success_draft: 'Draft saved!',
  step6_success_draft_desc: 'The post is waiting for you in the list — you can schedule or publish it later.',
  step6_preview_no_image: 'No graphic',
  step6_preview_no_content: 'No post content',
  step6_preview_more: 'more',
  step6_preview_show_more: '...show more',
  step6_preview_see_more: 'See more',
  step6_preview_no_content_short: 'No content',
  step6_preview_now: 'Now · 🌐',
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
  posts_filter_all_statuses: 'All statuses',
  posts_filter_all_platforms: 'All platforms',
  posts_sort_date: 'Date',
  posts_empty_create: 'No posts yet. Create your first post by clicking "New post" ↑',
  posts_empty_filters: 'No posts matching the filters.',
  posts_error_fetch: 'Error loading posts',
  posts_error_load: 'Failed to load posts.',
  posts_confirm_delete: 'Delete this post?',

  posts_detail_published: 'Published ',
  posts_detail_scheduled: 'Scheduled for ',
  posts_detail_created: 'Created ',
  posts_detail_image_alt: 'Post graphic',
  posts_detail_content: 'Post content',
  posts_detail_no_content: 'No content',
  posts_detail_hashtags: 'Hashtags',
  posts_detail_platforms: 'Platforms',
  posts_detail_stats: 'Statistics',
  post_edit_btn: 'Edit',
  post_edit_save: 'Save changes',
  post_edit_saving: 'Saving…',
  post_edit_cancel: 'Cancel',
  post_edit_image_label: 'Image',
  post_edit_image_regenerate: 'Regenerate',
  post_edit_image_from_url: 'From URL',
  post_edit_image_from_file: 'From file',
  post_edit_image_remove: 'Remove image',
  post_edit_image_prompt_placeholder: 'Generation notes (optional)…',
  post_edit_image_generate: 'Generate',
  post_edit_image_generating: 'Generating…',
  post_edit_image_url_placeholder: 'https://…',
  post_edit_image_apply_url: 'Apply',
  posts_stat_likes: 'Likes',
  posts_stat_comments: 'Comments',
  posts_stat_reach: 'Reach',
  posts_stat_clicks: 'Clicks',

  research_trend_title: 'Behind-the-scenes content gains 40% more reach',
  research_trend_text: 'Posts showing behind-the-scenes work generate 40% higher engagement in Q1 2026.',
  research_timing_title: 'Best time: Wednesdays, 7:30–8:30 PM',
  research_timing_text: 'Your target audience is most active on weekday evenings.',
  research_hashtag_title: 'Niche hashtags > popular ones',
  research_hashtag_text: 'Less competition, higher organic reach. AI will suggest optimal hashtags in step 6.',
  research_tone_title: 'Storytelling increases reach',
  research_tone_text: 'Posts with a mini-narrative have a 2× higher follow rate.',

  nav_autopilot: 'Autopilot',
  autopilot_heading: 'Autopilot',
  autopilot_subheading: 'Generate posts automatically based on your brand profile. Posts go to drafts — review and schedule them at your own pace.',
  autopilot_config_heading: 'Configuration',
  autopilot_posts_per_batch: 'Posts per batch',
  autopilot_tone_label: 'Tone',
  autopilot_language_label: 'Language',
  autopilot_platforms_label: 'Platforms',
  autopilot_hashtags_toggle: 'Hashtags',
  autopilot_emoji_toggle: 'Emoji',
  autopilot_images_toggle: 'Generate graphics',
  autopilot_save_config: 'Save configuration',
  autopilot_config_saved: 'Saved ✓',
  autopilot_generate_btn: '✦ Generate posts',
  autopilot_generating: 'Generating posts…',
  autopilot_last_run: 'Last run:',
  autopilot_never_run: 'Never run yet',
  autopilot_result_heading: 'Generation results',
  autopilot_result_success: 'Posts generated successfully!',
  autopilot_result_partial: 'Some posts were generated.',
  autopilot_result_failed: 'Failed to generate posts.',
  autopilot_result_view_posts: 'View generated posts →',
  autopilot_brand_label: 'Brand profile',
  autopilot_no_brand: 'No brand profile',
  autopilot_setup_brand_hint: 'Autopilot requires a brand profile. Create one by starting a new post (step 1).',

  posts_filter_all_sources: 'All sources',
  posts_filter_source_manual: 'Manual',
  posts_filter_source_autopilot: 'Autopilot',
  posts_source_autopilot: 'Autopilot',
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
