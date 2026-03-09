'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation, LOCALES, type Locale } from '@/lib/i18n'

interface TopNavProps {
  onNewPost?: () => void
}

export function TopNav({ onNewPost }: TopNavProps) {
  const pathname = usePathname()
  const { t, locale, setLocale } = useTranslation()
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const NAV_TABS = [
    { href: '/posts',     label: t('nav_posts') },
    { href: '/autopilot', label: t('nav_autopilot') },
    { href: '/calendar',  label: t('nav_calendar') },
    { href: '/stats',     label: t('nav_stats') },
  ]

  const initials = session?.user?.name
    ? session.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : session?.user?.email?.charAt(0).toUpperCase() ?? 'MK'

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-[200] h-16',
        'flex items-center justify-between px-6',
        'bg-bg/90 backdrop-blur-xl border-b border-border',
      )}
    >
      {/* Logo */}
      <Link href="/posts" className="font-syne font-[800] text-[1.25rem] tracking-[-0.03em]">
        konte<span className="text-accent">n</span>to
      </Link>

      {/* Page tabs */}
      <div className="flex gap-1 bg-surface2 border border-border rounded-xl p-1">
        {NAV_TABS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-[18px] py-[7px] rounded-[9px] text-[0.8rem] font-[400] cursor-pointer transition-all duration-200',
              pathname === href || (href !== '/posts' && pathname?.startsWith(href))
                ? 'bg-surface3 text-ink border border-border-mid'
                : 'text-muted hover:text-ink',
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex gap-0.5 bg-surface2 border border-border rounded-[10px] p-0.5">
          {LOCALES.map(({ value, flag }) => (
            <button
              key={value}
              onClick={() => setLocale(value as Locale)}
              title={value === 'pl' ? 'Polski' : 'English (UK)'}
              className={cn(
                'flex items-center justify-center w-8 h-7 rounded-[8px] text-[0.95rem] cursor-pointer transition-all',
                locale === value
                  ? 'bg-surface3 border border-border-mid'
                  : 'text-muted hover:text-ink',
              )}
            >
              {flag}
            </button>
          ))}
        </div>

        {/* New post button */}
        <button
          onClick={onNewPost}
          className={cn(
            'flex items-center gap-1.5 px-[18px] py-2 rounded-full',
            'bg-accent text-bg text-[0.8rem] font-[500] border-none cursor-pointer',
            'transition-all duration-200 hover:bg-[#d4f56a] hover:-translate-y-px',
          )}
        >
          <span className="text-base leading-none">+</span>
          {t('nav_new_post')}
        </button>

        {/* User avatar + dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            className={cn(
              'w-[34px] h-[34px] rounded-full flex-shrink-0',
              'bg-gradient-to-br from-purple to-accent',
              'flex items-center justify-center text-[0.72rem] font-[500] cursor-pointer',
              'transition-all hover:scale-105',
            )}
            title={session?.user?.email ?? ''}
          >
            {initials}
          </button>

          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-[199]"
                onClick={() => setShowUserMenu(false)}
              />
              {/* Dropdown */}
              <div className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[200px] bg-surface border border-border rounded-[14px] p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                {/* User info */}
                <div className="px-3 py-2 mb-1">
                  <div className="text-[0.82rem] font-[500] truncate">
                    {session?.user?.name || session?.user?.email}
                  </div>
                  <div className="text-[0.7rem] text-muted truncate">
                    {session?.user?.email}
                  </div>
                  {session?.user?.role === 'admin' && (
                    <span className="mt-1 inline-block px-1.5 py-0.5 rounded-full bg-purple/15 text-purple text-[0.6rem] uppercase tracking-[0.06em]">
                      Admin
                    </span>
                  )}
                </div>

                <div className="h-px bg-border mb-1" />

                <Link
                  href="/account"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-[9px] text-[0.8rem] text-muted hover:text-ink hover:bg-surface2 transition-all"
                >
                  👤 {t('nav_my_account')}
                </Link>

                {session?.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-[9px] text-[0.8rem] text-muted hover:text-ink hover:bg-surface2 transition-all"
                  >
                    🔧 {t('nav_admin_panel')}
                  </Link>
                )}

                <div className="h-px bg-border my-1" />

                <button
                  onClick={() => { setShowUserMenu(false); signOut({ callbackUrl: '/login' }) }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[9px] text-[0.8rem] text-muted hover:text-coral hover:bg-surface2 transition-all cursor-pointer text-left"
                >
                  ↩ {t('nav_logout')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
