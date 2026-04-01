import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value = 0, ...props }, ref) => {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-white/10', className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-300"
        style={{ width: `${v}%` }}
      />
    </div>
  )
})
Progress.displayName = 'Progress'

export { Progress }
