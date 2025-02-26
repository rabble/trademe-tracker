/**
 * Format a price number to a currency string
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0
  }).format(price);
}

/**
 * Format a number as currency (NZD)
 * 
 * @param amount - The number to format
 * @param abbreviated - Whether to abbreviate large numbers (e.g., $1.2M)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, abbreviated = false): string {
  if (abbreviated && amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (abbreviated && amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
