'use client'

import { useState, useTransition } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/posts'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (res?.error) {
        setError('Nieprawidłowy email lub hasło.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-syne font-[800] text-[2rem] tracking-[-0.04em] mb-1">
            konte<span className="text-accent">n</span>to
          </div>
          <p className="text-muted text-[0.85rem]">AI Content Studio</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-[20px] p-8">
          <h1 className="font-syne text-[1.4rem] font-[700] tracking-[-0.02em] mb-1">
            Zaloguj się
          </h1>
          <p className="text-muted text-[0.82rem] mb-6">
            Wprowadź swoje dane, aby kontynuować.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[0.75rem] text-muted block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="np. admin@kontento.pl"
                required
                autoFocus
                className="w-full"
              />
            </div>

            <div>
              <label className="text-[0.75rem] text-muted block mb-1.5">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>

            {error && (
              <div className="px-3 py-2.5 bg-coral-dim border border-coral/20 rounded-[10px] text-[0.78rem] text-coral">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={cn(
                'flex items-center justify-center gap-2 px-6 py-3 rounded-full mt-2',
                'bg-accent text-bg font-[500] text-[0.88rem] cursor-pointer transition-all',
                'hover:bg-[#d4f56a] hover:-translate-y-px',
                isPending && 'opacity-60 cursor-not-allowed',
              )}
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-t-transparent border-bg animate-spin" />
                  Logowanie…
                </>
              ) : (
                'Zaloguj się →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[0.75rem] text-muted mt-5">
          Nie masz konta?{' '}
          <a href="/register" className="text-accent hover:underline">Zarejestruj się</a>
        </p>
        <p className="text-center text-[0.72rem] text-dim mt-3">
          Kontento — AI Content Studio · Wersja 1.0
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
