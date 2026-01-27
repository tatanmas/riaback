import type { Product } from "@/lib/types/product";

/**
 * Service for extracting and managing product categories.
 * Separates business logic from API route handlers.
 */

/**
 * Extracts unique categories from a list of products.
 * Filters out empty/null categories and returns a sorted array.
 *
 * @param products - Array of products to extract categories from
 * @returns Sorted array of unique category names
 */
export function extractUniqueCategories(products: Product[]): string[] {
  if (!products || products.length === 0) {
    return [];
  }

  const categoriesSet = new Set<string>();

  for (const product of products) {
    // Validate and normalize category
    if (product.category && typeof product.category === "string") {
      const normalizedCategory = product.category.trim();
      if (normalizedCategory.length > 0) {
        categoriesSet.add(normalizedCategory);
      }
    }
  }

  // Return sorted array for consistent ordering
  return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b));
}

/**
 * Validates if a category name is valid.
 *
 * @param category - Category name to validate
 * @returns True if category is valid, false otherwise
 */
export function isValidCategory(category: unknown): category is string {
  return (
    typeof category === "string" &&
    category.trim().length > 0 &&
    category.trim().length <= 100 // Reasonable max length
  );
}
