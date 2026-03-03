# Kontento — AI Content Studio

## Project Overview

Kontento is a Polish-language social media content management and creation tool. It supports creating posts, scheduling publications, and collecting performance statistics across platforms (Instagram, LinkedIn, Facebook).

The current repo contains an **HTML prototype** (`kontento.html`, `social-creator-app.html`). The target implementation is a full-stack Next.js application described below.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | SQLite via Prisma ORM |
| API | Next.js Route Handlers (`app/api/`) + Server Actions |
| Auth | Auth.js (NextAuth v5) |
| Runtime | Node.js |

---

## Project Structure (target)

```
kontento/
├── app/
│   ├── (auth)/               # Login / register pages
│   ├── (dashboard)/
│   │   ├── posts/            # Post list + filters
│   │   ├── calendar/         # Scheduling calendar
│   │   ├── stats/            # Analytics dashboard
│   │   └── creator/          # Multi-step post creator
│   ├── api/
│   │   ├── posts/            # CRUD for posts
│   │   ├── platforms/        # Platform integrations
│   │   └── stats/            # Statistics endpoints
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Shared UI components
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   ├── auth.ts               # Auth.js config
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── .env.local
└── CLAUDE.md
```

---

## Design System

Carry over from the HTML prototype — keep the same visual identity.

```css
/* Core palette */
--bg:           #0a0a0d   /* Page background */
--surface:      #111116   /* Card background */
--surface2:     #18181f   /* Input / chip background */
--surface3:     #1e1e28   /* Deeper surface */
--accent:       #c8f060   /* Lime green — primary CTA */
--purple:       #a78bfa
--coral:        #fb7185
--blue:         #60a5fa
--text:         #ededf5
--text-muted:   #7a7990
--text-dim:     #3e3d52
```

Fonts: **Syne** (headings, 700–800) · **DM Sans** (body, 300–400)
→ Load via `next/font/google` in `app/layout.tsx`.

---

## Key Conventions

### Language
- All UI text in **Polish** (`lang="pl"`)
- Database fields, code identifiers, and API keys in **English**

### TypeScript
- Strict mode enabled
- Prefer `type` over `interface` for data shapes
- All Server Actions and Route Handlers must be typed end-to-end

### Tailwind
- Use Tailwind utility classes; extend `tailwind.config.ts` with the design tokens above (as CSS variables or direct values)
- No inline styles unless dynamically computed
- Component-level `cn()` helper for conditional classes (clsx + tailwind-merge)

### Prisma
- Client instantiated as a singleton in `lib/db.ts` (guard against hot-reload duplication in dev)
- Migrations committed to the repo — never edit the database manually in production
- Soft-deletes preferred over hard-deletes for posts

### Auth
- Auth.js (NextAuth v5) handles sessions
- Protect dashboard routes via middleware (`middleware.ts`)
- User ID always available via `auth()` in Server Components / Route Handlers

### Components
- Server Components by default; add `"use client"` only when needed (interactivity, hooks)
- Keep client components small — lift data fetching up to server
- Shared primitives in `components/ui/` (Button, Card, Badge, Chip, etc.)

---

## Data Model (draft)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  title       String
  content     String
  platforms   String     // JSON array: ["instagram","linkedin"]
  status      PostStatus @default(DRAFT)
  scheduledAt DateTime?
  publishedAt DateTime?
  stats       PostStats?
  deletedAt   DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model PostStats {
  id        String @id @default(cuid())
  postId    String @unique
  post      Post   @relation(fields: [postId], references: [id])
  likes     Int    @default(0)
  comments  Int    @default(0)
  reach     Int    @default(0)
  clicks    Int    @default(0)
}

enum PostStatus {
  DRAFT
  SCHEDULED
  PUBLISHED
}
```

---

## App Features

| Feature | Status |
|---------|--------|
| Post list (filter / sort / search) | To build |
| Calendar scheduling (drag-drop) | To build |
| Multi-step post creator (6 steps) | To build |
| AI research & topic suggestions | Mocked initially |
| Image generation | Mocked initially |
| Social media publishing API | Mocked initially |
| Analytics / stats dashboard | To build |
| Authentication | To build |

---

## Prototype Reference

The original HTML prototypes in the repo root document the full intended UX:

- `kontento.html` — dashboard (posts, calendar, stats) + creator modal
- `social-creator-app.html` — standalone 6-step wizard

Use them as a **visual spec**. Do not delete them until the Next.js implementation reaches parity.
