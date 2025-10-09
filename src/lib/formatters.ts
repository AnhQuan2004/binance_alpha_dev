/**
 * Format timestamp to HH:MM:SS
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Format price to 8 decimal places
 */
export function formatPrice(price: string | number): string {
  return Number(price).toFixed(6);
}

/**
 * Format quantity with K/M/B abbreviations
 */
export function formatQuantity(quantity: string | number): string {
  const num = Number(quantity);
  
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  }
  
  return num.toFixed(2);
}
