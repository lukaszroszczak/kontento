import { cn } from '@/lib/utils'

interface FieldLabelProps {
  children: React.ReactNode
  className?: string
}

export function FieldLabel({ children, className }: FieldLabelProps) {
  return (
    <div
      className={cn(
        'text-[0.7rem] font-[500] tracking-[0.08em] uppercase text-muted mb-2',
        className,
      )}
    >
      {children}
    </div>
  )
}
