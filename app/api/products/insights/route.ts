import { NextRequest } from "next/server";
import type { ProductFilters } from "@/lib/types/product";
import { getProductsInsights } from "@/lib/services/productInsightsService";
import { jsonWithCors, optionsPreflight } from "@/lib/utils/cors";
import { createLogger } from "@/lib/utils/logger";

/**
 * GET /api/products/insights
 *
 * Aggregated metrics for the current product set.
 * Accepts the same filters as /api/products (q, category, minPrice, maxPrice)
 * so that insights match the list the user is viewing.
 */

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, route: "/api/products/insights" });

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const filters: ProductFilters = {
    // Accept both "q" and "search" to align with various frontends
    search: searchParams.get("search") ?? searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    minPrice: parseOptionalNumber(searchParams.get("minPrice")),
    maxPrice: parseOptionalNumber(searchParams.get("maxPrice")),
    maxStock: parseOptionalNumber(searchParams.get("maxStock")),
  };

  logger.info("Computing product insights", { filters });

  const startTime = Date.now();

  try {
    const insights = await getProductsInsights(filters);

    const duration = Date.now() - startTime;
    logger.info("Insights computed successfully", {
      totalProducts: insights.totalProducts,
      durationMs: duration,
    });

    // Return the insights object directly so the response
    // matches the ProductInsights type expected on the frontend.
    return jsonWithCors(insights);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      "Failed to compute product insights",
      error instanceof Error ? error : new Error(String(error)),
      { durationMs: duration },
    );

    return jsonWithCors(
      { error: "Failed to compute product insights" },
      502,
    );
  }
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function OPTIONS() {
  return optionsPreflight();
}


