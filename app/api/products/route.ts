import { NextRequest } from "next/server";
import { getProductsPaginated } from "@/lib/repositories/productRepository";
import type { ProductFilters, ProductSort } from "@/lib/types/product";
import { jsonWithCors, optionsPreflight } from "@/lib/utils/cors";
import { createLogger } from "@/lib/utils/logger";

/**
 * GET /api/products
 *
 * Query params:
 * - q: search term (name / description / category)
 * - category: string
 * - minPrice: number
 * - maxPrice: number
 * - sort: "price_asc" | "price_desc" | "rating_asc" | "rating_desc" | "title_asc" | "title_desc"
 * - page: number (1-based)
 * - pageSize: number
 */

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, route: "/api/products" });

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const filters: ProductFilters = {
    // Accept both "q" and "search" to be flexible with different frontends
    search: searchParams.get("search") ?? searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: parseOptionalNumber(searchParams.get("minPrice")),
    maxPrice: parseOptionalNumber(searchParams.get("maxPrice")),
    maxStock: parseOptionalNumber(searchParams.get("maxStock")),
  };

  const sort = (searchParams.get("sort") ?? undefined) as ProductSort | undefined;

  const page = parsePositiveInt(searchParams.get("page")) ?? 1;
  const pageSize = parsePositiveInt(searchParams.get("pageSize")) ?? undefined;

  logger.info("Fetching products", { filters, sort, page, pageSize });

  const startTime = Date.now();

  try {
    const result = await getProductsPaginated({
      filters,
      sort,
      page,
      pageSize,
    });

    const duration = Date.now() - startTime;
    logger.info("Products fetched successfully", {
      itemCount: result.items.length,
      total: result.total,
      durationMs: duration,
    });

    return jsonWithCors({
      items: result.items,
      // Top-level pagination fields for simpler clients
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      // Structured pagination object for richer consumers
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
      appliedFilters: filters,
      sort,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      "Failed to fetch products from external API",
      error instanceof Error ? error : new Error(String(error)),
      { durationMs: duration },
    );

    return jsonWithCors(
      {
        error: "Failed to fetch products from external API",
      },
      502,
    );
  }
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  return parsed;
}

export function OPTIONS() {
  return optionsPreflight();
}


