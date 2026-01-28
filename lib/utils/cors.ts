import { NextResponse } from "next/server";

/**
 * Centralised CORS configuration for API routes.
 * This allows the Vite frontend on port 8080 to call the Next.js API on 3000.
 *
 * In development we default to the local Vite origin.
 * In production we default to the DuckDNS origin used in the assessment deployment.
 * Both can be overridden via the ALLOWED_ORIGIN env var.
 */

const DEFAULT_ALLOWED_ORIGIN =
  process.env.NODE_ENV === "production"
    ? "http://tukitickets.duckdns.org:8080"
    : "http://localhost:8080";

export const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin":
    process.env.ALLOWED_ORIGIN ?? DEFAULT_ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export function jsonWithCors<T>(
  data: T,
  init?: number | ResponseInit,
): NextResponse<T> {
  const baseInit: ResponseInit =
    typeof init === "number" ? { status: init } : init ?? {};

  return NextResponse.json(data, {
    ...baseInit,
    headers: {
      ...(baseInit.headers ?? {}),
      ...CORS_HEADERS,
    },
  });
}

export function optionsPreflight(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

