import { cn } from '@/lib/utils'

interface StepBadgeProps {
  children: React.ReactNode
  className?: string
}

export function StepBadge({ children, className }: StepBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 bg-accent-dim border border-accent/[0.18] rounded-full px-3 py-1 text-[0.7rem] font-[500] text-accent tracking-[0.04em] mb-3.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
