import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates the exact days remaining until the next renewal date.
 * If the date is in the past, it automatically rolls forward based on the billing cycle.
 */
export function calculateDaysRemaining(dateStr?: string | null, cycle: string = 'monthly'): number {
  if (!dateStr || dateStr.trim() === '') return 7;

  // Handle strings like "10 days", "3d", "5 days left"
  const daysMatch = dateStr.match(/^(\d+)\s*(days?|d|दिन)?$/i);
  if (daysMatch) {
    return parseInt(daysMatch[1], 10);
  }

  // Handle standard dates (e.g., '2026-09-28', '28 Sep 2026', 'September 28, 2026')
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());

    // If target date is in the past and it's a recurring cycle, roll it forward to next renewal!
    while (target < today) {
      if (cycle === 'monthly') {
        target.setMonth(target.getMonth() + 1);
      } else if (cycle === 'quarterly') {
        target.setMonth(target.getMonth() + 3);
      } else if (cycle === 'yearly') {
        target.setFullYear(target.getFullYear() + 1);
      } else if (cycle === 'weekly') {
        target.setDate(target.getDate() + 7);
      } else {
        break;
      }
    }

    const diffTime = target.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return 10;
}
