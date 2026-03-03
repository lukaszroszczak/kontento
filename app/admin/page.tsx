'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface UserRecord {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New user form
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createMsg, setCreateMsg] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (status === 'authenticated' && session?.user?.role !== 'admin') {
      router.push('/posts')
    }
  }, [status, session, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchUsers()
    }
  }, [status, session])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setError('Nie udało się załadować użytkowników.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    setCreateMsg(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Błąd tworzenia użytkownika.')
      } else {
        setCreateMsg(`Użytkownik ${data.user.email} utworzony.`)
        setForm({ name: '', email: '', password: '', role: 'user' })
        fetchUsers()
      }
    } catch {
      setCreateError('Błąd połączenia.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Usunąć użytkownika ${email}?`)) return
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchUsers()
      } else {
        const data = await res.json()
        alert(data.error || 'Błąd usuwania.')
      }
    } catch {
      alert('Błąd połączenia.')
    }
  }

  const handleRoleToggle = async (id: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) fetchUsers()
    } catch {}
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-t-transparent border-accent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-bg/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/posts" className="font-syne font-[800] text-[1.25rem] tracking-[-0.03em]">
            konte<span className="text-accent">n</span>to
          </Link>
          <span className="px-2 py-0.5 rounded-full bg-purple/10 text-purple text-[0.7rem] uppercase tracking-[0.08em]">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/account" className="text-[0.8rem] text-muted hover:text-ink transition-colors">
            {session?.user?.email}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="px-3.5 py-1.5 rounded-full border border-border text-[0.78rem] text-muted hover:text-coral hover:border-coral/30 transition-all cursor-pointer"
          >
            Wyloguj
          </button>
          <Link
            href="/posts"
            className="px-3.5 py-1.5 rounded-full bg-accent text-bg text-[0.78rem] font-[500] hover:bg-[#d4f56a] transition-all"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="pt-24 px-6 max-w-[900px] mx-auto pb-12">
        <h1 className="font-syne text-[1.8rem] font-[700] tracking-[-0.03em] mb-1">
          Panel administratora
        </h1>
        <p className="text-muted text-[0.85rem] mb-8">Zarządzaj użytkownikami i ich uprawnieniami.</p>

        {/* Create user form */}
        <div className="bg-surface border border-border rounded-[20px] p-6 mb-6">
          <h2 className="font-syne text-[1.1rem] font-[700] mb-4">Dodaj użytkownika</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
            <input
              type="text"
              placeholder="Imię i nazwisko (opcjonalnie)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email *"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Hasło *"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="!py-2.5 !px-3.5"
            >
              <option value="user">Użytkownik</option>
              <option value="admin">Administrator</option>
            </select>

            {createError && (
              <div className="col-span-2 px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
                {createError}
              </div>
            )}
            {createMsg && (
              <div className="col-span-2 px-3 py-2.5 bg-accent-dim border border-accent/20 rounded-[10px] text-[0.78rem] text-accent">
                {createMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className={cn(
                'col-span-2 flex items-center justify-center gap-2 px-5 py-2.5 rounded-full',
                'bg-accent text-bg font-[500] text-[0.85rem] cursor-pointer transition-all hover:bg-[#d4f56a]',
                creating && 'opacity-60 cursor-not-allowed',
              )}
            >
              {creating ? 'Tworzę…' : '+ Utwórz użytkownika'}
            </button>
          </form>
        </div>

        {/* Users table */}
        <div className="bg-surface border border-border rounded-[20px] overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-syne text-[1.1rem] font-[700]">
              Użytkownicy ({users.length})
            </h2>
            <button
              onClick={fetchUsers}
              className="text-[0.75rem] text-muted hover:text-ink transition-colors cursor-pointer"
            >
              ↺ Odśwież
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="w-6 h-6 rounded-full border-2 border-t-transparent border-accent animate-spin" />
            </div>
          ) : error ? (
            <div className="px-6 py-4 text-coral text-[0.82rem]">{error}</div>
          ) : users.length === 0 ? (
            <div className="px-6 py-8 text-center text-muted text-[0.82rem]">Brak użytkowników.</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center text-[0.72rem] font-[600] flex-shrink-0">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[0.85rem] font-[500] truncate">{u.name || u.email}</div>
                    <div className="text-[0.72rem] text-muted truncate">{u.email}</div>
                  </div>

                  {/* Role badge */}
                  <span
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[0.68rem] font-[600] uppercase tracking-[0.06em] cursor-pointer transition-all',
                      u.role === 'admin'
                        ? 'bg-purple/15 text-purple hover:bg-purple/25'
                        : 'bg-surface3 text-muted hover:bg-surface2',
                    )}
                    onClick={() => handleRoleToggle(u.id, u.role)}
                    title="Kliknij, aby zmienić rolę"
                  >
                    {u.role}
                  </span>

                  {/* Date */}
                  <span className="text-[0.72rem] text-dim hidden sm:block">
                    {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  </span>

                  {/* Delete */}
                  {u.id !== session?.user?.id && (
                    <button
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-[0.75rem] text-muted hover:text-coral transition-all cursor-pointer px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
