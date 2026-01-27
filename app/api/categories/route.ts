import { NextRequest } from "next/server";
import { getAllProducts } from "@/lib/repositories/productRepository";
import { extractUniqueCategories } from "@/lib/services/categoryService";
import { jsonWithCors, optionsPreflight } from "@/lib/utils/cors";
import { createLogger } from "@/lib/utils/logger";

/**
 * GET /api/categories
 *
 * Returns all unique categories available across all products.
 * Useful for populating category filter dropdowns.
 */

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, route: "/api/categories" });

  const startTime = Date.now();

  try {
    const allProducts = await getAllProducts();
    const categories = extractUniqueCategories(allProducts);

    const duration = Date.now() - startTime;
    logger.info("Categories fetched successfully", {
      categoryCount: categories.length,
      totalProducts: allProducts.length,
      durationMs: duration,
    });

    return jsonWithCors({
      categories,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      "Failed to fetch categories",
      error instanceof Error ? error : new Error(String(error)),
      { durationMs: duration },
    );

    return jsonWithCors(
      {
        error: "Failed to fetch categories",
      },
      502,
    );
  }
}

export function OPTIONS() {
  return optionsPreflight();
}
