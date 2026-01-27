import {
  type PaginatedResult,
  type Product,
  type ProductDto,
  type ProductFilters,
  type ProductListItem,
  type ProductSort,
} from "@/lib/types/product";
import {
  fetchProductByIdFromDummyJson,
  fetchProductsFromDummyJson,
} from "@/lib/services/dummyjsonClient";
import { DEFAULT_PAGE_SIZE } from "@/lib/config";

/**
 * Repository responsible for fetching and shaping product data.
 * It hides DummyJSON details and exposes higher-level operations.
 */

function mapDtoToDomain(dto: ProductDto): Product {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    price: dto.price,
    category: dto.category,
    thumbnail: dto.thumbnail,
    rating: dto.rating,
    stock: dto.stock,
    brand: dto.brand,
    images: dto.images,
    discountPercentage: dto.discountPercentage,
  };
}

export function toProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    category: product.category,
    thumbnail: product.thumbnail,
    rating: product.rating,
    stock: product.stock,
  };
}

// Exported for testing purposes
export function applyFilters(products: Product[], filters: ProductFilters): Product[] {
  const { search, category, minPrice, maxPrice, maxStock } = filters;

  return products.filter((product) => {
    if (category && product.category !== category) {
      return false;
    }

    if (typeof minPrice === "number" && product.price < minPrice) {
      return false;
    }

    if (typeof maxPrice === "number" && product.price > maxPrice) {
      return false;
    }

    if (typeof maxStock === "number" && product.stock > maxStock) {
      return false;
    }

    if (search) {
      const haystack =
        `${product.title} ${product.description} ${product.category}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}

// Exported for testing purposes
export function applySort(products: Product[], sort?: ProductSort): Product[] {
  // Always work on a copy to avoid mutating callers' arrays,
  // even when no sort is requested. This is slightly less
  // performant but much safer and more predictable.
  const sorted = [...products];

  if (!sort) {
    return sorted;
  }

  sorted.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "rating_asc":
        return a.rating - b.rating;
      case "rating_desc":
        return b.rating - a.rating;
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });

  return sorted;
}

export async function getAllProducts(): Promise<Product[]> {
  const response = await fetchProductsFromDummyJson();
  return response.products.map(mapDtoToDomain);
}

export async function getProductById(id: number): Promise<Product | null> {
  const dto = await fetchProductByIdFromDummyJson(id).catch(() => null);
  if (!dto) return null;
  return mapDtoToDomain(dto);
}

export interface GetProductsOptions {
  filters?: ProductFilters;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export async function getProductsPaginated(
  options: GetProductsOptions = {},
): Promise<PaginatedResult<ProductListItem>> {
  const {
    filters = {},
    sort,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = options;

  const allProducts = await getAllProducts();
  const filtered = applyFilters(allProducts, filters);
  const sorted = applySort(filtered, sort);

  const safePageSize = pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE;
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (clampedPage - 1) * safePageSize;
  const end = start + safePageSize;

  const pageItems = sorted.slice(start, end).map(toProductListItem);

  return {
    items: pageItems,
    total,
    page: clampedPage,
    pageSize: safePageSize,
    totalPages,
  };
}

export async function getProductsForInsights(
  filters: ProductFilters = {},
): Promise<Product[]> {
  const allProducts = await getAllProducts();
  return applyFilters(allProducts, filters);
}

