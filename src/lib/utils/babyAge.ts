/**
 * Utility functions for precise and consistent baby age calculations across Moncradle.
 */

/**
 * Calculates the exact age in completed months from a baby's date of birth.
 * Accurately takes into account the current day of the month.
 */
export function calculateBabyAgeMonths(
  dobStr?: string | Date,
  fallbackAgeInMonths?: number
): number {
  if (dobStr) {
    const dob = new Date(dobStr);
    if (!isNaN(dob.getTime())) {
      const now = new Date();
      let months = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      // If current day is before birth day of month, subtract 1 completed month
      if (now.getDate() < dob.getDate()) {
        months--;
      }
      return Math.max(0, months);
    }
  }

  if (typeof fallbackAgeInMonths === "number" && !isNaN(fallbackAgeInMonths) && fallbackAgeInMonths >= 0) {
    return fallbackAgeInMonths;
  }

  return 6;
}

/**
 * Returns a clean, consistent human-friendly age string (e.g., "2 Months Old", "1 Month Old", "2 Weeks Old").
 */
export function formatBabyAge(
  dobStr?: string | Date,
  fallbackAgeInMonths?: number
): string {
  if (dobStr) {
    const dob = new Date(dobStr);
    if (!isNaN(dob.getTime())) {
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - dob.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 7) {
        return `${diffDays} Day${diffDays === 1 ? '' : 's'} Old`;
      }
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} Week${weeks === 1 ? '' : 's'} Old`;
      }
    }
  }

  const months = calculateBabyAgeMonths(dobStr, fallbackAgeInMonths);
  return `${months} Month${months === 1 ? '' : 's'} Old`;
}
