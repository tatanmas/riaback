/**
 * Types that model product data and filters used across
 * the backend (API routes, repositories, services).
 */

/**
 * Shape of a single product as returned by DummyJSON.
 * We only model the fields we actually care about.
 */
export interface ProductDto {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating: number;
  stock: number;
  brand?: string;
  images?: string[];
  discountPercentage?: number;
}

export interface ProductsResponseDto {
  products: ProductDto[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Internal domain model used by the app.
 * This is what our API returns to the frontend.
 */
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  rating: number;
  stock: number;
  brand?: string;
  images?: string[];
  discountPercentage?: number;
}

/**
 * Lightweight representation optimized for list/table views.
 */
export interface ProductListItem {
  id: number;
  title: string;
  price: number;
  category: string;
  thumbnail: string;
  rating: number;
  stock: number;
}

/**
 * Filters accepted by our internal API.
 * All fields are optional; API handlers normalize them.
 */
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type ProductSort =
  | "price_asc"
  | "price_desc"
  | "rating_asc"
  | "rating_desc"
  | "title_asc"
  | "title_desc";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Aggregated metrics returned by the insights endpoint.
 */
export interface ProductsInsights {
  averagePriceGlobal: number;
  totalProducts: number;
  totalStock: number;
  mostCommonCategory: {
    name: string;
    count: number;
  } | null;
  lowStockCount: number;
  topRatedProducts: ProductListItem[];
  stockByCategory: Array<{
    category: string;
    totalStock: number;
  }>;
}

