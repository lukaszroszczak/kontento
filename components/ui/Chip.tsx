'use client'

import { cn } from '@/lib/utils'

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  dot?: string // optional color dot (hex or tailwind bg-* class)
}

export function Chip({ selected, onClick, children, className, dot }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full border text-[0.78rem] cursor-pointer transition-all duration-[180ms] select-none',
        selected
          ? 'border-accent bg-accent-dim text-accent'
          : 'border-border bg-surface2 text-ink hover:border-border-mid',
        className,
      )}
    >
      {dot && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: dot }}
        />
      )}
      {children}
    </button>
  )
}
