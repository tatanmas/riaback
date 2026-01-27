import { DUMMYJSON_BASE_URL, MAX_PRODUCTS_PAGE_SIZE } from "@/lib/config";
import { fetchJson } from "@/lib/utils/http";
import type { ProductDto, ProductsResponseDto } from "@/lib/types/product";

/**
 * Low-level HTTP client for interacting with the DummyJSON API.
 * This module should be the only place that knows the concrete
 * shape of DummyJSON endpoints.
 */

export interface FetchProductsParams {
  search?: string;
  limit?: number;
  skip?: number;
}

export async function fetchProductsFromDummyJson(
  params: FetchProductsParams = {},
): Promise<ProductsResponseDto> {
  const { search, limit = MAX_PRODUCTS_PAGE_SIZE, skip = 0 } = params;

  const url = new URL(
    search ? "/products/search" : "/products",
    DUMMYJSON_BASE_URL,
  );

  url.searchParams.set("limit", String(limit));
  url.searchParams.set("skip", String(skip));

  if (search) {
    url.searchParams.set("q", search);
  }

  return fetchJson<ProductsResponseDto>(url.toString());
}

export async function fetchProductByIdFromDummyJson(
  id: number,
): Promise<ProductDto> {
  const url = new URL(`/products/${id}`, DUMMYJSON_BASE_URL);
  return fetchJson<ProductDto>(url.toString());
}

