import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/20 text-primary',
        secondary: 'border-secondary/30 bg-secondary/10 text-secondary',
        outline: 'text-slate-200 border-border',
        destructive: 'border-transparent bg-red-500/20 text-red-300',
        success: 'border-transparent bg-emerald-500/20 text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
