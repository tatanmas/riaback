import type {
  Product,
  ProductFilters,
  ProductListItem,
  ProductsInsights,
} from "@/lib/types/product";
import { LOW_STOCK_THRESHOLD } from "@/lib/config";
import { getProductsForInsights, toProductListItem } from "@/lib/repositories/productRepository";

/**
 * Pure/stateless functions to compute aggregate product metrics.
 * Exposed via a small service API for the API routes.
 */

function computeAveragePrice(products: Product[]): number {
  if (!products.length) return 0;
  const sum = products.reduce((acc, p) => acc + p.price, 0);
  return sum / products.length;
}

function computeTotalStock(products: Product[]): number {
  return products.reduce((acc, p) => acc + p.stock, 0);
}

function computeAverageRating(products: Product[]): number {
  if (!products.length) return 0;
  const sum = products.reduce((acc, p) => acc + p.rating, 0);
  return sum / products.length;
}

function computeAverageStock(products: Product[]): number {
  if (!products.length) return 0;
  const sum = products.reduce((acc, p) => acc + p.stock, 0);
  return sum / products.length;
}

function computeMostCommonCategory(
  products: Product[],
): { name: string; count: number } | null {
  if (!products.length) return null;

  const counts = new Map<string, number>();

  for (const product of products) {
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }

  let maxCategory: string | null = null;
  let maxCount = 0;

  for (const [category, count] of counts.entries()) {
    if (count > maxCount) {
      maxCategory = category;
      maxCount = count;
    }
  }

  if (!maxCategory) return null;

  return { name: maxCategory, count: maxCount };
}

/**
 * Computes the count of products with low stock
 * Uses the centralized LOW_STOCK_THRESHOLD constant for consistency
 * 
 * @param products - Array of products to check
 * @param threshold - Low stock threshold (defaults to LOW_STOCK_THRESHOLD)
 * @returns Number of products with stock below threshold
 */
function computeLowStockCount(products: Product[], threshold = LOW_STOCK_THRESHOLD): number {
  return products.filter((p) => p.stock < threshold).length;
}

function computeTopRatedProducts(
  products: Product[],
  limit = 5,
): ProductListItem[] {
  const sorted = [...products].sort((a, b) => b.rating - a.rating);
  return sorted.slice(0, limit).map(toProductListItem);
}

function computeStockByCategory(products: Product[]): ProductsInsights["stockByCategory"] {
  const totals = new Map<string, number>();

  for (const product of products) {
    totals.set(product.category, (totals.get(product.category) ?? 0) + product.stock);
  }

  return Array.from(totals.entries()).map(([category, totalStock]) => ({
    category,
    totalStock,
  }));
}

export async function getProductsInsights(
  filters: ProductFilters = {},
): Promise<ProductsInsights> {
  const products = await getProductsForInsights(filters);

  const averagePriceGlobal = computeAveragePrice(products);
  const averageRatingGlobal = computeAverageRating(products);
  const averageStockGlobal = computeAverageStock(products);
  const totalProducts = products.length;
  const totalStock = computeTotalStock(products);
  const mostCommonCategory = computeMostCommonCategory(products);
  const lowStockCount = computeLowStockCount(products);
  const topRatedProducts = computeTopRatedProducts(products);
  const stockByCategory = computeStockByCategory(products);

  return {
    averagePriceGlobal,
    averageRatingGlobal,
    averageStockGlobal,
    totalProducts,
    totalStock,
    mostCommonCategory,
    lowStockCount,
    topRatedProducts,
    stockByCategory,
  };
}

