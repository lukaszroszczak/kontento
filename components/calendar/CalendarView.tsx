'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { cn, MONTHS_PL, DAYS_PL, formatDate } from '@/lib/utils'
import type { Post, Platform } from '@/types'
import { PLATFORM_LABELS } from '@/types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

interface TimeModalState {
  postId: string
  date: string
  isReschedule?: boolean
}

const localKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const TIME_OPTIONS = [
  { time: '09:00', label: '9:00',  sub: 'Poranek' },
  { time: '12:00', label: '12:00', sub: 'Południe' },
  { time: '17:00', label: '17:00', sub: 'Popołudnie' },
  { time: '19:30', label: '19:30', sub: '⭐ Rekomendowane' },
  { time: '20:30', label: '20:30', sub: 'Wieczór' },
  { time: '21:30', label: '21:30', sub: 'Późny wieczór' },
]

function parseDates(p: Post): Post {
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
    scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
    publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
  }
}

export function CalendarView() {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const didDragRef = useRef(false)

  const [timeModal, setTimeModal] = useState<TimeModalState | null>(null)
  const [selectedTime, setSelectedTime] = useState('19:30')
  const [selectedDate, setSelectedDate] = useState('')

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/posts')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPosts((data.posts as Post[]).map(parseDates))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    const handler = () => fetchPosts()
    window.addEventListener('post-created', handler)
    return () => window.removeEventListener('post-created', handler)
  }, [fetchPosts])

  // ── Grid ──────────────────────────────────────────────────────────
  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const changeMonth = (dir: number) => {
    const d = new Date(year, month + dir, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedPostId(null)
  }

  const postsForDate = useCallback((date: Date | null): Post[] => {
    if (!date) return []
    const key = localKey(date)
    return posts.filter((p) => {
      const d = p.scheduledAt ?? p.publishedAt
      return d && localKey(new Date(d)) === key
    })
  }, [posts])

  const unscheduled = posts.filter(
    (p) => p.status === 'DRAFT' && !p.scheduledAt && !p.deletedAt,
  )

  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null

  // ── Drag ──────────────────────────────────────────────────────────
  const onDragStart = (postId: string) => {
    didDragRef.current = true
    setDragging(postId)
    setSelectedPostId(null)
  }
  const onDragEnd = () => {
    setDragging(null)
    setDragOver(null)
    setTimeout(() => { didDragRef.current = false }, 50)
  }
  const onDragOver = (dateKey: string, e: React.DragEvent) => {
    e.preventDefault(); setDragOver(dateKey)
  }
  const onDrop = (date: Date, e: React.DragEvent) => {
    e.preventDefault()
    if (!dragging) return
    setDragOver(null)
    setDragging(null)
    const dateKey = localKey(date)
    setSelectedDate(dateKey)
    setTimeModal({ postId: dragging, date: dateKey })
  }

  // ── Schedule / Reschedule ─────────────────────────────────────────
  const confirmSchedule = async () => {
    if (!timeModal) return
    const dt = new Date(`${timeModal.date}T${selectedTime}:00`)

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === timeModal.postId
          ? { ...p, status: 'SCHEDULED' as const, scheduledAt: dt }
          : p,
      ),
    )
    setTimeModal(null)
    setSelectedPostId(timeModal.postId)

    // Persist to DB
    try {
      await fetch(`/api/posts/${timeModal.postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SCHEDULED', scheduledAt: dt.toISOString() }),
      })
    } catch {
      fetchPosts() // revert
    }
  }

  const openReschedule = (postId: string) => {
    const p = posts.find((x) => x.id === postId)
    const currentDate = p?.scheduledAt
      ? new Date(p.scheduledAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
    const currentTime = p?.scheduledAt
      ? new Date(p.scheduledAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      : '19:30'
    setSelectedDate(currentDate)
    setSelectedTime(currentTime.replace(':', ':').slice(0, 5))
    setTimeModal({ postId, date: currentDate, isReschedule: true })
  }

  const unschedulePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, status: 'DRAFT' as const, scheduledAt: null }
          : p,
      ),
    )
    setSelectedPostId(null)
    try {
      await fetch(`/api/posts/${postId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT', scheduledAt: null }),
      })
    } catch {
      fetchPosts()
    }
  }

  const isToday = (d: Date | null) =>
    d ? d.toDateString() === today.toDateString() : false

  const chipTime = (p: Post) => {
    const d = p.scheduledAt ?? p.publishedAt
    return d
      ? new Date(d).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
      : '—'
  }

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-[1fr_320px] gap-6 items-start max-[900px]:grid-cols-1">

        {/* Calendar grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 rounded-lg bg-surface2 border border-border text-muted hover:border-border-active hover:text-ink transition-all flex items-center justify-center"
              >‹</button>
              <button
                onClick={() => changeMonth(1)}
                className="w-8 h-8 rounded-lg bg-surface2 border border-border text-muted hover:border-border-active hover:text-ink transition-all flex items-center justify-center"
              >›</button>
            </div>
            <h2 className="font-syne text-[1.1rem] font-[700]">
              {MONTHS_PL[month]} {year}
            </h2>
            <div className="w-20" />
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_PL.map((d) => (
              <div key={d} className="text-center text-[0.68rem] uppercase tracking-[0.08em] text-dim py-2">
                {d}
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="min-h-[80px] rounded-[10px] bg-surface border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((date, idx) => {
                const dateKey = date?.toISOString().slice(0, 10) ?? `empty-${idx}`
                const cellPosts = postsForDate(date)
                const todayCell = isToday(date)

                return (
                  <div
                    key={dateKey}
                    onDragOver={date ? (e) => onDragOver(dateKey, e) : undefined}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={date ? (e) => onDrop(date, e) : undefined}
                    className={cn(
                      'min-h-[80px] rounded-[10px] border p-2 transition-all duration-[180ms] relative',
                      !date && 'opacity-0 pointer-events-none',
                      todayCell
                        ? 'border-accent/30 bg-accent-dim'
                        : 'border-border bg-surface hover:border-border-mid hover:bg-surface2',
                      dragOver === dateKey && 'border-accent bg-accent-dim scale-[1.02]',
                    )}
                  >
                    {date && (
                      <>
                        <div className={cn(
                          'text-[0.75rem] font-[500] mb-1.5',
                          todayCell ? 'text-accent font-[700]' : 'text-muted',
                        )}>
                          {date.getDate()}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          {cellPosts.map((p) => {
                            const isSelected = p.id === selectedPostId
                            return (
                              <div
                                key={p.id}
                                draggable
                                onDragStart={() => onDragStart(p.id)}
                                onDragEnd={onDragEnd}
                                className={cn(
                                  'rounded-[6px] text-[0.65rem] leading-tight',
                                  'border overflow-hidden transition-all select-none',
                                  p.status === 'SCHEDULED'
                                    ? 'bg-blue-dim border-blue/20 text-blue'
                                    : p.status === 'PUBLISHED'
                                    ? 'bg-accent-dim border-accent/20 text-accent'
                                    : 'bg-surface3 border-border text-muted',
                                  isSelected && 'ring-2 ring-offset-1 ring-offset-bg ring-white/30 scale-[1.03]',
                                )}
                              >
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPostId(isSelected ? null : p.id)
                                  }}
                                  className={cn(
                                    'flex items-center gap-1 px-1.5 py-0.5 w-full cursor-pointer',
                                    p.status === 'SCHEDULED'
                                      ? 'hover:bg-blue/10'
                                      : p.status === 'PUBLISHED'
                                      ? 'hover:bg-accent/10'
                                      : 'hover:bg-white/5',
                                  )}
                                >
                                  <span className="font-[500] flex-shrink-0">{chipTime(p)}</span>
                                  <span className="truncate opacity-80">{p.title}</span>
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Sidebar: unscheduled */}
        <Card padding="md">
          <h3 className="font-syne text-[0.95rem] font-[700] mb-2">Niezaplanowane posty</h3>
          <p className="text-[0.78rem] text-muted mb-4 leading-relaxed">
            Przeciągnij post na wybrany dzień w kalendarzu, aby go zaplanować.
          </p>
          <div className="flex flex-col gap-2">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-[60px] rounded-[10px] bg-surface border border-border animate-pulse" />
              ))
            ) : unscheduled.length === 0 ? (
              <p className="text-[0.78rem] text-dim text-center py-6">Wszystkie posty są zaplanowane 🎉</p>
            ) : (
              unscheduled.map((post) => (
                <div
                  key={post.id}
                  draggable
                  onDragStart={() => onDragStart(post.id)}
                  onDragEnd={onDragEnd}
                  className={cn(
                    'flex items-center gap-2.5 bg-surface border border-border rounded-[10px] px-3 py-2.5',
                    'cursor-grab hover:border-border-mid hover:bg-surface2 transition-all',
                    dragging === post.id && 'opacity-40',
                  )}
                >
                  <div className="w-9 h-9 rounded-[8px] bg-surface2 flex items-center justify-center text-base flex-shrink-0">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.78rem] font-[500] truncate">{post.title}</div>
                    <div className="text-[0.68rem] text-muted mt-0.5">Szkic · brak daty</div>
                  </div>
                  <span className="text-dim text-base">⠿</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Post detail panel */}
      {selectedPost && (
        <div className="animate-fade-up border border-border-mid bg-surface rounded-[18px] overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-surface2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-syne font-[700] text-[1rem] tracking-[-0.02em] truncate">
                  {selectedPost.title}
                </span>
                <Badge
                  variant={
                    selectedPost.status === 'PUBLISHED' ? 'published'
                    : selectedPost.status === 'SCHEDULED' ? 'scheduled'
                    : 'draft'
                  }
                >
                  {selectedPost.status === 'PUBLISHED' ? 'Opublikowany'
                    : selectedPost.status === 'SCHEDULED' ? 'Zaplanowany'
                    : 'Szkic'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                {(selectedPost.scheduledAt ?? selectedPost.publishedAt) && (
                  <span className="text-[0.78rem] text-muted flex items-center gap-1.5">
                    <span className="text-dim">📅</span>
                    {formatDate(selectedPost.scheduledAt ?? selectedPost.publishedAt)}
                    <span className="text-dim">
                      {' · '}
                      {new Date(selectedPost.scheduledAt ?? selectedPost.publishedAt!).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                )}
                <span className="text-[0.78rem] text-muted flex items-center gap-1">
                  {selectedPost.platforms.map((pl: Platform) => (
                    <span key={pl} className="text-dim">{PLATFORM_LABELS[pl]}</span>
                  )).reduce<React.ReactNode[]>((acc, el, i) => [...acc, i > 0 ? <span key={`sep-${i}`} className="text-dim/40"> · </span> : null, el], [])}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedPost.status !== 'PUBLISHED' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => openReschedule(selectedPost.id)}>
                    📅 Przeplanuj
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-coral border-coral/20 hover:border-coral/50 hover:text-coral"
                    onClick={() => unschedulePost(selectedPost.id)}
                  >
                    ↩ Cofnij na listę
                  </Button>
                </>
              )}
              <button
                onClick={() => setSelectedPostId(null)}
                className="w-7 h-7 rounded-lg bg-surface3 border border-border text-dim hover:text-muted hover:border-border-active transition-all flex items-center justify-center text-sm ml-1"
                title="Zamknij"
              >
                ×
              </button>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-[1fr_auto] gap-8 items-start max-[700px]:grid-cols-1">
            <div>
              <div className="text-[0.7rem] uppercase tracking-[0.08em] text-dim mb-2 font-[500]">
                Treść posta
              </div>
              <p className="text-[0.875rem] text-muted leading-relaxed whitespace-pre-line line-clamp-4">
                {selectedPost.content}
              </p>
            </div>

            {selectedPost.stats && (
              <div className="flex gap-6 flex-shrink-0">
                {[
                  { label: 'Zasięg',    value: selectedPost.stats.reach },
                  { label: 'Polubień',  value: selectedPost.stats.likes },
                  { label: 'Komentarzy', value: selectedPost.stats.comments },
                  { label: 'Zapisano',  value: selectedPost.stats.saves },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <div className="font-syne font-[700] text-[1.1rem] tracking-[-0.02em]">
                      {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
                    </div>
                    <div className="text-[0.68rem] text-dim uppercase tracking-[0.06em] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Time/date picker modal */}
      {timeModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[500] flex items-center justify-center backdrop-blur-lg animate-fade-in"
          onClick={() => setTimeModal(null)}
        >
          <div
            className="bg-surface border border-border-mid rounded-[20px] p-8 w-[400px] max-w-[90vw] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-syne text-[1.2rem] font-[700] mb-1.5">
              {timeModal.isReschedule ? 'Przeplanuj publikację' : 'Wybierz termin'}
            </h3>
            <p className="text-[0.82rem] text-muted mb-6">
              {timeModal.isReschedule
                ? 'Wybierz nową datę i godzinę publikacji.'
                : `Kiedy opublikować post w dniu ${timeModal.date}?`}
            </p>

            {timeModal.isReschedule && (
              <div className="mb-5">
                <div className="text-[0.7rem] uppercase tracking-[0.08em] text-muted mb-2 font-[500]">Data</div>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setTimeModal((m) => m ? { ...m, date: e.target.value } : m)
                  }}
                  className="w-full"
                />
              </div>
            )}

            <div className="text-[0.7rem] uppercase tracking-[0.08em] text-muted mb-2 font-[500]">Godzina</div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {TIME_OPTIONS.map(({ time, label, sub }) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    'px-3.5 py-2.5 bg-surface2 border rounded-[10px] text-[0.8rem] cursor-pointer transition-all text-left',
                    selectedTime === time
                      ? 'bg-accent-dim border-accent/30 text-accent'
                      : 'border-border hover:border-border-active',
                  )}
                >
                  <div className="font-[500]">{label}</div>
                  <div className="text-[0.68rem] text-muted mt-0.5">{sub}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={confirmSchedule}
                disabled={timeModal.isReschedule && !selectedDate}
              >
                {timeModal.isReschedule ? 'Zapisz nowy termin →' : 'Zaplanuj →'}
              </Button>
              <Button variant="secondary" onClick={() => setTimeModal(null)}>
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
