/**
 * Small HTTP utilities for calling external APIs in a safe,
 * reusable way. This keeps `fetch` usage consistent across
 * the backend and centralizes error handling.
 */

export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export interface FetchJsonOptions extends RequestInit {
  /**
   * Timeout in milliseconds. If reached, the request will be aborted.
   */
  timeoutMs?: number;
}

export async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions = {},
): Promise<T> {
  const { timeoutMs = 10_000, ...init } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new HttpError(
        response.status,
        text || `Request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HttpError(408, "Request to external API timed out");
    }

    if (error instanceof HttpError) {
      throw error;
    }

    // Fallback for network or unknown errors.
    throw new HttpError(
      502,
      error instanceof Error
        ? `Network error while calling external API: ${error.message}`
        : "Unknown network error while calling external API",
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

