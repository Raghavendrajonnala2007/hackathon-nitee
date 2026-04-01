import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`
}

export function formatCredits(n: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
}
