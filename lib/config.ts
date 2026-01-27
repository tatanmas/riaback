/**
 * Global configuration constants for the application.
 * Keeping these in a dedicated module makes it easy to
 * change environments or plug in feature flags later.
 */
export const DUMMYJSON_BASE_URL = "https://dummyjson.com";

/**
 * Default page size for paginated endpoints.
 * Frontend can override via query params when needed.
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Maximum number of products we will request from DummyJSON
 * in a single call. This keeps memory usage bounded while
 * still being more than enough for this exercise.
 */
export const MAX_PRODUCTS_PAGE_SIZE = 100;

