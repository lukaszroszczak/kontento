import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}

const base =
  'inline-flex items-center gap-2 font-dm font-[400] cursor-pointer transition-all duration-200 whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-bg rounded-full hover:bg-[#d4f56a] hover:-translate-y-px active:translate-y-0',
  secondary:
    'bg-transparent text-muted border border-border rounded-full hover:border-border-active hover:text-ink',
  ghost:
    'bg-transparent border-none text-dim rounded-lg hover:text-muted',
  icon:
    'bg-surface3 border border-border rounded-[8px] w-[30px] h-[30px] justify-center hover:border-border-active',
}

const sizes: Record<'sm' | 'md' | 'lg', string> = {
  sm:  'text-xs   px-3   py-1.5',
  md:  'text-sm   px-5   py-[11px]',
  lg:  'text-base px-7   py-3',
}

const iconSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm:  'text-xs',
  md:  'text-sm',
  lg:  'text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const sizeClass = variant === 'icon' ? iconSizes[size] : sizes[size]
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizeClass, className)}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
