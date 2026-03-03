import { cn } from '@/lib/utils'

type BadgeVariant = 'draft' | 'scheduled' | 'published' | 'accent'

interface BadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  draft:
    'bg-surface3 text-muted border border-border',
  scheduled:
    'bg-blue-dim text-blue border border-blue/20',
  published:
    'bg-accent-dim text-accent border border-accent/20',
  accent:
    'bg-accent-dim text-accent border border-accent/[0.18]',
}

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.7rem] font-[500]',
        variants[variant],
        className,
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
