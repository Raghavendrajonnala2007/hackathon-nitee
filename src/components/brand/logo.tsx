import { cn } from '@/lib/utils'

export function FlowSyncLogo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="#020617" />
      <path
        d="M6 18c2.5-4 5-6 10-6s7.5 2 10 6"
        stroke="#0EA5FF"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 22c2-2.5 4-4 8-4s6 1.5 8 4"
        stroke="#22D3EE"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="12" r="2" fill="#22D3EE" />
    </svg>
  )
}
