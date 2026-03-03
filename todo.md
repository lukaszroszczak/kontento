# Kontento — Lista zadań

---

## ✅ Zrobione

- [x] Tone of Voice: 8 opcji po angielsku (Professional, Casual, Friendly, Humorous, Formal, Inspirational, Educational, Conversational)
- [x] Wersja angielska British English (język aplikacji + język generowanych treści)
- [x] Poprawiony kolor przycisku „Hasztagi" (z fioletowego na accent)
- [x] Konten sprofilowany na podstawie profilu firmy (sugestie zakończeń)
- [x] Zapis i wczytywanie profilu firmy (localStorage)
- [x] Logowanie, zarządzanie użytkownikami, panel admina (admin@kontento.pl / admin)
- [x] Prompt do grafiki generowany dynamicznie z treści posta
- [x] Generowanie grafiki przez Gemini Imagen 4 (REST predict endpoint)
- [x] Przycisk „Dodaj logo" — Sharp (ramka, znak wodny, narożnik)
- [x] Krok 6 — podgląd pokazuje prawdziwe dane z kreatora
- [x] Zapisywanie profilu firmy — lista otwiera się automatycznie po zapisaniu
- [x] Pola formularza (Step 1) jako kontrolowane inputy (value zamiast defaultValue)
- [x] **Kreator zapisuje post do bazy danych** — endpoint `POST /api/posts` + zapis do Prisma
- [x] **PostList, CalendarView, StatsView z prawdziwymi danymi z DB** — zastąpiono `MOCK_POSTS`
- [x] **API `GET/POST /api/posts` + `PATCH/DELETE /api/posts/[id]`** — pełne CRUD z soft-delete
- [x] **Funkcjonalny toolbar edytora w Step 4** — B, I, #, emoji działają; AI Rephrasing (Shorter/Longer/Formal) via `/api/rephrase`
- [x] **Step 2 (Research) z dynamicznymi insights** — generowane przez AI na podstawie branży i platform z Step 1
- [x] **Obsługa błędów w kreatorze** — komunikaty błędów przy nieudanych wywołaniach AI API
- [x] **Rejestracja użytkowników** — publiczna strona `/register` + endpoint `/api/register`
- [x] **Podgląd posta w Step 6 zależny od platformy** — zakładki Instagram | LinkedIn | Facebook z różnymi layoutami
- [x] **CalendarView podłączony do DB** — drag & drop persystuje zmiany przez `PATCH /api/posts/[id]`
- [x] **Soft-delete postów** — przycisk usunięcia ustawia `deletedAt`, posty znikają z list

---

## 🔴 Do naprawy

*(wszystkie naprawione — sekcja pusta)*

---

## 💡 Ficzery do zrobienia

### Core (uzupełniają podstawowy flow)

- [ ] **Autosave szkicu** — co 30 sekund (lub przy każdej zmianie kroku) zapisywać stan kreatora jako `DRAFT` w DB; przy ponownym otwarciu pytanie „Masz niezapisany szkic — kontynuować?"
- [ ] **Biblioteka mediów** — galeria wygenerowanych i uploadowanych grafik przypisanych do konta; możliwość ponownego użycia w kreatorze zamiast generowania od nowa
- [ ] **Historia postów w kreatorze** — panel boczny z ostatnimi postami; kliknięcie otwiera post do edycji lub duplikacji
- [ ] **Rate limiting na endpointach AI** — zabezpieczenie `/api/generate`, `/api/image-generate` przed nadmiernym zużyciem API (np. `upstash/ratelimit` lub prosty in-memory limit)

### Quality of Life

- [x] **Podgląd posta zależny od platformy (Step 6)** — zakładki Instagram | LinkedIn | Facebook z różnymi layoutami mockupa
- [x] **AI Rephrasing w edytorze (Step 4)** — przyciski Shorter / Longer / Formal przepisują tekst przez `/api/rephrase`
- [ ] **Eksport treści i grafiki** — przycisk „Kopiuj do schowka" przy tekście posta + opcja pobierania grafiki jako PNG/JPG bezpośrednio z Step 5
- [ ] **Szablony treści** — biblioteka ~20 pre-promptów pogrupowanych branżowo (fotograf, restauracja, fitness, e-commerce) dostępna w Step 3 obok AI topics
- [ ] **Podgląd hashtagów z popularnością** — w Step 6 przy każdym hashtagu badge z oceną popularności (szary = niszowy, zielony = dobry zasięg, czerwony = zbyt popularny)
- [ ] **Tone of Voice na poziomie konta** — zapisywanie domyślnego tonu w profilu firmy; automatyczne wypełnianie w Step 1 i Step 4 z możliwością nadpisania per post
- [ ] **Toast notifications** — globalne powiadomienia o sukcesie/błędzie (zamiast inline messages); np. po zapisaniu posta, błędzie API, wygenerowaniu grafiki

### Produkcja i skalowalność

- [ ] **Bulk scheduling — „Zaplanuj tydzień"** — wygeneruj 5 postów naraz z różnymi tematami, automatycznie rozłóż w kalendarzu; jeden przycisk w dashboardzie
- [ ] **AI Scoring posta** — po wygenerowaniu treści ocena 0–100 (czytelność, długość, liczba hashtagów, CTA, emoji balance) z konkretnymi sugestiami poprawy
- [ ] **Workspace / Team** — wiele marek przypisanych do jednego konta, zapraszanie współpracowników z rolami: viewer, editor, publisher
- [ ] **Integracja z platformami** — OAuth z Instagram Business API, LinkedIn API, Meta Graph API; prawdziwe publishowanie (wymaga approval od platform)
- [ ] **Powiadomienia e-mail** — e-mail gdy zaplanowany post zostaje opublikowany lub osiągnie próg zasięgu (np. Resend lub Nodemailer)
- [ ] **Error tracking** — integracja Sentry lub podobnego narzędzia do monitorowania błędów w produkcji

---

## 🗺️ Sugerowana kolejność prac

```
✅ 1. POST /api/posts + GET /api/posts → podłączenie DB
✅ 2. PostList / Calendar / Stats z prawdziwymi danymi z DB
✅ 3. Podgląd platformy w Step 6 (IG/LI/FB zakładki)
✅ 4. AI Rephrasing w edytorze (Step 4 toolbar)
✅ 5. Strona /register + aktywacja konta

   6. Toast notifications (globalny error/success handler)          ~1h
   7. Autosave draftu w kreatorze                                   ~2h
   8. Rate limiting na /api/generate i /api/image-generate          ~1h
   9. Biblioteka mediów                                             ~3h
  10. Bulk scheduling                                               ~3h
```
