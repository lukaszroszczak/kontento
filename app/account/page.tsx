'use client'

import { useState, useTransition } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function AccountPage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()

  const [name, setName] = useState(session?.user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-t-transparent border-accent animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    startTransition(async () => {
      const body: Record<string, string> = { name }
      if (newPassword) {
        if (!currentPassword) {
          setError('Podaj aktualne hasło, aby ustawić nowe.')
          return
        }
        body.currentPassword = currentPassword
        body.newPassword = newPassword
      }

      const res = await fetch(`/api/users/${session?.user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Błąd aktualizacji.')
      } else {
        setSuccessMsg('Dane zaktualizowane.')
        await updateSession({ name })
        setCurrentPassword('')
        setNewPassword('')
      }
    })
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 bg-bg/90 backdrop-blur-xl border-b border-border">
        <Link href="/posts" className="font-syne font-[800] text-[1.25rem] tracking-[-0.03em]">
          konte<span className="text-accent">n</span>to
        </Link>
        <div className="flex items-center gap-3">
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

      <div className="pt-24 px-6 max-w-[500px] mx-auto pb-12">
        <h1 className="font-syne text-[1.8rem] font-[700] tracking-[-0.03em] mb-1">
          Moje konto
        </h1>
        <p className="text-muted text-[0.85rem] mb-8">
          Zarządzaj danymi swojego konta.
        </p>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple to-accent flex items-center justify-center text-[1.2rem] font-[600]">
            {(session?.user?.name || session?.user?.email || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-[500]">{session?.user?.name || session?.user?.email}</div>
            <div className="text-muted text-[0.78rem]">{session?.user?.email}</div>
            <div className={cn(
              'inline-block mt-1 px-2 py-0.5 rounded-full text-[0.65rem] uppercase tracking-[0.06em] font-[600]',
              session?.user?.role === 'admin' ? 'bg-purple/15 text-purple' : 'bg-surface2 text-muted',
            )}>
              {session?.user?.role}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-surface border border-border rounded-[20px] p-6">
          <h2 className="font-syne text-[1.05rem] font-[700] mb-4">Edytuj dane</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-[0.75rem] text-muted block mb-1.5">Imię i nazwisko</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Anna Kowalska"
              />
            </div>

            <div className="h-px bg-border" />
            <p className="text-[0.75rem] text-muted">
              Zmiana hasła (zostaw puste, jeśli nie chcesz zmieniać)
            </p>

            <div>
              <label className="text-[0.75rem] text-muted block mb-1.5">Aktualne hasło</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-[0.75rem] text-muted block mb-1.5">Nowe hasło</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="px-3 py-2.5 bg-accent-dim border border-accent/20 rounded-[10px] text-[0.78rem] text-accent">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'flex items-center justify-center gap-2 px-5 py-2.5 rounded-full',
                'bg-accent text-bg font-[500] text-[0.85rem] cursor-pointer transition-all hover:bg-[#d4f56a]',
                isPending && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isPending ? 'Zapisuję…' : 'Zapisz zmiany'}
            </button>
          </form>
        </div>

        {/* Admin link */}
        {session?.user?.role === 'admin' && (
          <div className="mt-4">
            <Link
              href="/admin"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] border border-border text-[0.82rem] text-muted hover:text-ink hover:border-border-mid transition-all"
            >
              🔧 Panel administratora
            </Link>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-[14px] border border-border text-[0.82rem] text-muted hover:text-coral hover:border-coral/30 transition-all cursor-pointer"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  )
}
