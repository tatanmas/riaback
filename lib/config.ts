/**
 * Global configuration constants for the application.
 * Keeping these in a dedicated module makes it easy to
 * change environments or plug in feature flags later.
 */

/**
 * External API Configuration
 */
export const DUMMYJSON_BASE_URL = "https://dummyjson.com";

/**
 * Pagination Configuration
 */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PRODUCTS_PAGE_SIZE = 100;

/**
 * Inventory/Stock Configuration
 * Threshold for considering a product as "low stock"
 */
export const LOW_STOCK_THRESHOLD = 10;

/**
 * Cache Configuration
 * Time in milliseconds for how long data is considered fresh
 */
export const CATEGORIES_CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutes
export const PRODUCTS_CACHE_TIME_MS = 30 * 1000; // 30 seconds
export const INSIGHTS_CACHE_TIME_MS = 60 * 1000; // 1 minute

