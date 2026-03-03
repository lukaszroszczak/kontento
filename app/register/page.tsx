'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Hasła nie są identyczne')
      return
    }
    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Błąd rejestracji')
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 2000)
      }
    } catch {
      setError('Błąd połączenia. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="text-[3rem] mb-4">🎉</div>
        <h2 className="font-syne text-[1.4rem] font-[700] mb-2">Konto utworzone!</h2>
        <p className="text-muted text-sm">Za chwilę zostaniesz przekierowany do logowania…</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="font-syne font-[800] text-[1.8rem] tracking-[-0.04em] mb-2">
          konte<span className="text-accent">n</span>to
        </div>
        <h1 className="font-syne text-[1.3rem] font-[700] tracking-[-0.02em]">Utwórz konto</h1>
        <p className="text-muted text-sm mt-1">Dołącz do Kontento i twórz lepsze posty</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[0.78rem] text-muted mb-1.5 font-[500]">
            Imię i nazwisko (opcjonalnie)
          </label>
          <input
            type="text"
            placeholder="np. Jan Kowalski"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] text-muted mb-1.5 font-[500]">
            Adres e-mail
          </label>
          <input
            type="email"
            placeholder="jan@firma.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] text-muted mb-1.5 font-[500]">
            Hasło
          </label>
          <input
            type="password"
            placeholder="Minimum 6 znaków"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        <div>
          <label className="block text-[0.78rem] text-muted mb-1.5 font-[500]">
            Potwierdź hasło
          </label>
          <input
            type="password"
            placeholder="Wpisz hasło ponownie"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-coral-dim border border-coral/20 rounded-[12px] text-coral text-[0.82rem]">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-bg font-syne font-[700] text-[0.9rem] rounded-[12px] hover:bg-accent/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-bg animate-spin" />
              Tworzenie konta…
            </span>
          ) : 'Utwórz konto →'}
        </button>
      </form>

      <p className="text-center text-[0.78rem] text-muted mt-6">
        Masz już konto?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Zaloguj się
        </Link>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[24px] p-10">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
