/**
 * Utility functions for sales suspension management
 */

/**
 * Checks if sales are currently suspended
 * @returns boolean - true if sales are suspended, false otherwise
 */
export function isSalesSuspended(): boolean {
  return process.env.SALES_SUSPENDED === 'true';
}

/**
 * Gets the sales suspension message
 * @returns string - the message to display when sales are suspended
 */
export function getSalesSuspensionMessage(): string {
  return process.env.SALES_SUSPENSION_MESSAGE || 'Predaje sú dočasne pozastavené. Ďakujeme za pochopenie.';
}

/**
 * Client-side check for sales suspension
 * This should be used in client components where process.env is not available
 * @returns boolean - true if sales are suspended, false otherwise
 */
export function isSalesSuspendedClient(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check if there's a global flag set by the server
  return (window as Window & { __SALES_SUSPENDED__?: boolean }).__SALES_SUSPENDED__ === true;
}

/**
 * Client-side getter for sales suspension message
 * @returns string - the message to display when sales are suspended
 */
export function getSalesSuspensionMessageClient(): string {
  if (typeof window === 'undefined') return '';
  
  return (window as Window & { __SALES_SUSPENSION_MESSAGE__?: string }).__SALES_SUSPENSION_MESSAGE__ || 'Predaje sú dočasne pozastavené. Ďakujeme za pochopenie.';
}
