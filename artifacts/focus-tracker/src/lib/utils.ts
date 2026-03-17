import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'HIGH_FOCUS': return 'text-success border-success/30 bg-success/10';
    case 'MEDIUM_FOCUS': return 'text-primary border-primary/30 bg-primary/10';
    case 'LOW_FOCUS': return 'text-warning border-warning/30 bg-warning/10';
    case 'DISTRACTED': return 'text-destructive border-destructive/30 bg-destructive/10';
    default: return 'text-muted-foreground border-border bg-muted';
  }
}
