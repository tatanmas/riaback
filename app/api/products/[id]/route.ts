import { NextRequest } from "next/server";
import { getProductById } from "@/lib/repositories/productRepository";
import { jsonWithCors, optionsPreflight } from "@/lib/utils/cors";
import { createLogger } from "@/lib/utils/logger";

/**
 * GET /api/products/:id
 *
 * Returns detailed information for a single product.
 */

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = crypto.randomUUID();
  const logger = createLogger({ requestId, route: "/api/products/[id]" });

  // In Next.js 16, `params` is a Promise in the type definition
  const { id: idParam } = await context.params;
  const id = Number.parseInt(idParam, 10);

  if (!Number.isFinite(id) || id <= 0) {
    logger.warn("Invalid product id provided", { id: idParam });
    return jsonWithCors(
      { error: "Invalid product id" },
      400,
    );
  }

  logger.info("Fetching product by id", { productId: id });

  const startTime = Date.now();

  try {
    const product = await getProductById(id);

    if (!product) {
      const duration = Date.now() - startTime;
      logger.warn("Product not found", { productId: id, durationMs: duration });
      return jsonWithCors(
        { error: "Product not found" },
        404,
      );
    }

    const duration = Date.now() - startTime;
    logger.info("Product fetched successfully", {
      productId: id,
      durationMs: duration,
    });

    return jsonWithCors(product);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      "Failed to fetch product from external API",
      error instanceof Error ? error : new Error(String(error)),
      { productId: id, durationMs: duration },
    );

    return jsonWithCors(
      { error: "Failed to fetch product from external API" },
      502,
    );
  }
}

export function OPTIONS() {
  return optionsPreflight();
}


