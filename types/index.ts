export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED'

export type Platform = 'instagram' | 'linkedin' | 'facebook' | 'tiktok'

export interface Post {
  id: string
  userId: string
  title: string
  content: string
  platforms: Platform[]
  status: PostStatus
  scheduledAt: Date | null
  publishedAt: Date | null
  imageUrl: string | null
  hashtags: string[]
  stats?: PostStats | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface PostStats {
  id: string
  postId: string
  likes: number
  comments: number
  reach: number
  saves: number
  clicks: number
}

export interface Brand {
  id: string
  userId: string
  name: string | null
  description: string | null
  industry: string | null
  audience: string | null
  platforms: Platform[]
  tone: string | null
  website: string | null
}

// Creator wizard state
export interface CreatorState {
  step: number
  brand: Partial<Brand>
  topic: string
  content: string
  imageUrl: string | null
  platforms: Platform[]
  hashtags: string[]
  scheduledAt: Date | null
  publishNow: boolean
  // AI generation options
  tone: string        // English value: 'Friendly' | 'Professional' | 'Educational' | etc.
  language: string    // 'Polish' | 'English (UK)' | 'English (US)'
  includeHashtags: boolean
  includeEmoji: boolean
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  tiktok: 'TikTok',
}

export const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: '#e1306c',
  linkedin: '#0a66c2',
  facebook: '#1877f2',
  tiktok: '#000000',
}

export const STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: 'Szkic',
  SCHEDULED: 'Zaplanowany',
  PUBLISHED: 'Opublikowany',
}

// Mock posts for initial development (no DB yet)
export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Kulisy sesji rodzinnej — jak ją przygotować?',
    content: 'Zanim zaczniemy sesję, zawsze robię jedno: rozmawiam z tobą o tym, czego naprawdę szukasz...',
    platforms: ['instagram', 'facebook'],
    status: 'PUBLISHED',
    scheduledAt: null,
    publishedAt: new Date('2026-02-15T19:30:00'),
    imageUrl: null,
    hashtags: ['#fotografiarodzinna', '#sesjaplenerowa', '#fotografwroclaw'],
    stats: { id: 's1', postId: '1', likes: 847, comments: 32, reach: 4200, saves: 156, clicks: 89 },
    deletedAt: null,
    createdAt: new Date('2026-02-14T10:00:00'),
    updatedAt: new Date('2026-02-15T19:30:00'),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Złota godzina — dlaczego warto ją wybrać?',
    content: 'Złota godzina to magia, której nie da się odtworzyć w studio...',
    platforms: ['instagram'],
    status: 'SCHEDULED',
    scheduledAt: new Date('2026-03-05T19:30:00'),
    publishedAt: null,
    imageUrl: null,
    hashtags: ['#fotografialifestyle', '#goldenhour'],
    stats: null,
    deletedAt: null,
    createdAt: new Date('2026-02-20T14:00:00'),
    updatedAt: new Date('2026-02-20T14:00:00'),
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Historia klienta: rodzina Kowalskich',
    content: 'Kiedy Marta napisała do mnie przed świętami, nie spodziewałam się...',
    platforms: ['instagram', 'facebook'],
    status: 'PUBLISHED',
    scheduledAt: null,
    publishedAt: new Date('2026-02-10T20:00:00'),
    imageUrl: null,
    hashtags: ['#fotografiarodzinna', '#sesjaportretowa'],
    stats: { id: 's3', postId: '3', likes: 1243, comments: 67, reach: 8900, saves: 312, clicks: 145 },
    deletedAt: null,
    createdAt: new Date('2026-02-09T11:00:00'),
    updatedAt: new Date('2026-02-10T20:00:00'),
  },
  {
    id: '4',
    userId: 'user1',
    title: '5 rzeczy, których nie wiedzieliście o sesjach plenerowych',
    content: 'Myślisz, że sesja plenerowa to tylko wyjście na łąkę i kilka kliknięć?...',
    platforms: ['linkedin', 'facebook'],
    status: 'DRAFT',
    scheduledAt: null,
    publishedAt: null,
    imageUrl: null,
    hashtags: [],
    stats: null,
    deletedAt: null,
    createdAt: new Date('2026-02-25T09:00:00'),
    updatedAt: new Date('2026-02-25T09:00:00'),
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Kiedy zarezerwować sesję wielkanocną?',
    content: 'Marzec już za rogiem — a wraz z nim pierwsze wiosenne sesje...',
    platforms: ['instagram'],
    status: 'SCHEDULED',
    scheduledAt: new Date('2026-03-12T19:30:00'),
    publishedAt: null,
    imageUrl: null,
    hashtags: ['#wielkanoc2026', '#wiosennaakcja'],
    stats: null,
    deletedAt: null,
    createdAt: new Date('2026-02-26T16:00:00'),
    updatedAt: new Date('2026-02-26T16:00:00'),
  },
  {
    id: '6',
    userId: 'user1',
    title: 'Behind the scenes — mój sprzęt',
    content: 'Wielu z was pyta, czym fotografuję. Oto mój kompletny setup...',
    platforms: ['instagram', 'linkedin'],
    status: 'PUBLISHED',
    scheduledAt: null,
    publishedAt: new Date('2026-02-05T18:00:00'),
    imageUrl: null,
    hashtags: ['#fotografiabts', '#sprzet'],
    stats: { id: 's6', postId: '6', likes: 562, comments: 28, reach: 3100, saves: 203, clicks: 61 },
    deletedAt: null,
    createdAt: new Date('2026-02-04T12:00:00'),
    updatedAt: new Date('2026-02-05T18:00:00'),
  },
]
