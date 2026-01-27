# Architecture & Product Decisions – Mini Product Insights Dashboard

## 1. Overview

This document captures the key product and technical decisions made while implementing the **Mini Product Insights Dashboard** for the Product Engineer assessment.

- **Backend**: Next.js (App Router) + TypeScript
- **Frontend**: React + Vite + TypeScript (separate `product-pulse` project)
- **Data source**: DummyJSON `/products` API
- **Goals**: Mobile-first dashboard, clear insights for stakeholders, enterprise-grade code structure

---

## 2. Product Decisions

### 2.1 Primary user needs

Stakeholders need to:

- Understand **overall catalog health** (pricing, stock, composition).
- Quickly **find products** by name/category/price.
- Inspect a **single product in depth** when required.

### 2.2 Prioritized layout

1. **Insights strip (KPIs)**
   - Average price across products
   - Total number of products
   - Total stock
   - Low-stock items count
   - Most common category

2. **Filters**
   - Search by name/description/category (`search`)
   - Category filter
   - Price range (`minPrice`, `maxPrice`)

3. **Product list**
   - Name, price, category, rating, stock, image
   - Sorting by price, rating, or title
   - Pagination to keep responses small and performant

4. **Product detail view**
   - Full description, rating, stock, optional extra fields (brand, images, discount)
   - Secondary view accessed when necessary

This ordering reflects what a stakeholder should see **first** (KPIs), then tools to refine the view (filters), then data to inspect (list + detail).

---

## 3. Backend Architecture Decisions

### 3.1 Layered design

The backend is intentionally structured into clear, composable layers:

- **API Routes (`app/api/`)**
  - Thin controllers: parse/validate query params, orchestrate services, return HTTP responses.
  - No business logic or external API knowledge.

- **Services (`lib/services/`)**
  - `productInsightsService.ts`: pure functions that compute aggregated metrics (average price, stock, category distribution, etc.).
  - `dummyjsonClient.ts`: encapsulates all HTTP calls to DummyJSON (base URL, endpoints, timeouts).

- **Repositories (`lib/repositories/`)**
  - `productRepository.ts`: data access layer that:
    - Maps raw DTOs to domain models.
    - Applies filters, sorting, and pagination.
    - Shields the rest of the app from DummyJSON-specific shapes.

- **Domain types (`lib/types/`)**
  - `product.ts`: central definition for domain models (`Product`, `ProductListItem`, `ProductsInsights`, `ProductFilters`, etc.).

- **Cross-cutting utils (`lib/utils/`)**
  - `http.ts`: `fetchJson` + `HttpError` for safe external API calls.
  - `cors.ts`: centralized CORS headers and helpers for JSON responses and preflight.
  - `logger.ts`: structured logging with levels, request IDs, and context.

This structure is meant to look and feel like a **small slice of a larger enterprise codebase**.

### 3.2 API contracts

- `GET /api/products`
  - Accepts filters (`search`, `category`, `minPrice`, `maxPrice`), sorting (`price_asc`, etc.), and pagination (`page`, `pageSize`).
  - Returns:
    - `items`: `ProductListItem[]`
    - `total`, `page`, `pageSize`
    - `pagination` object with `totalPages`
    - `appliedFilters` and `sort` for UI echoing

- `GET /api/products/:id`
  - Returns a single `Product` or appropriate errors (`400`, `404`).

- `GET /api/products/insights`
  - Accepts the same filters as `/api/products` so KPIs always match the current view.
  - Returns `ProductsInsights` directly.

### 3.3 Filtering & sorting strategy

- **Filtering**:
  - Implemented in-memory after fetching products from DummyJSON.
  - Supports:
    - `category` equality
    - `minPrice` / `maxPrice`
    - Full-text search over `title`, `description`, and `category`
  - Trade-off: simpler to implement and reason about, acceptable for the small dataset of DummyJSON.

- **Sorting**:
  - Done via `applySort`:
    - Always works on a **copied array** to avoid mutating callers.
    - Supports ascending/descending by price, rating, and title.

- **Pagination**:
  - Performed after filtering + sorting using `page` and `pageSize`.
  - Clamps page numbers to valid ranges.

---

## 4. Testing & Quality

### 4.1 Unit tests

Using Jest + ts-jest:

- `lib/services/__tests__/productInsightsService.test.ts`
  - Verifies all metrics:
    - Average price (including empty set)
    - Total stock
    - Most common category (and null when none)
    - Low stock count
    - Top rated products ordering
    - Stock by category
    - Respect for filters during insights computation

- `lib/repositories/__tests__/productRepository.test.ts`
  - Verifies:
    - `toProductListItem` mapping
    - Filtering by category, price range, and search term (case-insensitive)
    - Combination of multiple filters
    - Sorting semantics for all supported sort orders
    - No mutation of the original array when sorting

### 4.2 CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) that:

- Installs dependencies
- Runs ESLint
- Runs Jest tests + coverage
- Builds the Next.js application
- Builds the Docker image

This gives reviewers confidence that the project is **buildable and testable** on every push/PR.

---

## 5. Observability & Logging

- Centralized logger using JSON-formatted logs:
  - Includes:
    - `timestamp`
    - `level` (DEBUG, INFO, WARN, ERROR)
    - `message`
    - Optional `context` (route, requestId, filters, timings, etc.)
    - Optional error metadata (name, message, stack)
- API routes create a **per-request logger** via `createLogger({ requestId, route })`.
- Logged events:
  - Start/end of operations with `durationMs`
  - Validation issues (e.g., invalid product ID)
  - Failures when calling external APIs or computing insights

This design makes it easy to plug into centralized log aggregation if the project grows.

---

## 6. Frontend (Product Pulse) Collaboration

- Frontend is implemented as a separate Vite + React project (`product-pulse`).
- It consumes:
  - `/api/products` for lists
  - `/api/products/:id` for details
  - `/api/products/insights` for metrics
- Communication:
  - Via `VITE_API_BASE_URL` (default: `http://localhost:3000/api`)
  - Uses React Query hooks for data fetching and caching.

Initial scaffolding used **Lovable** to speed up UI creation, but:

- All Lovable-specific tooling (plugins, dependencies) has been removed.
- The codebase is now a standard, maintainable Vite + React project.
- Documentation clearly notes the origin without coupling implementation to Lovable.

---

## 7. Trade-offs & Future Improvements

### 7.1 Trade-offs

- In-memory filtering vs. database-backed queries:
  - Simpler and adequate for DummyJSON scale.
  - Would move to DB + indices for larger datasets.

- No persistent caching layer:
  - Every request goes to DummyJSON.
  - Could add Redis or in-memory cache with TTL if stability or performance became an issue.

- Minimal auth & security:
  - No authentication implemented for this assessment.
  - In a real setting, would add auth (JWT/session) and role-based access control for internal dashboards.

### 7.2 Improvements with more time

- Introduce a proper **data store** (PostgreSQL/MongoDB) and seed from DummyJSON.
- Add **caching** for products/insights.
- Add **OpenAPI** documentation for the REST API.
- Implement **E2E tests** (Playwright/Cypress) for the full dashboard flow.
- Add **feature flags** or configuration for which insights to show.

---

## 8. AI / LLM Usage

- AI (Cursor / LLM) was used to:
  - Brainstorm architecture and file structure.
  - Generate boilerplate code and tests.
  - Refine documentation and naming for clarity.
- All generated code and docs were:
  - Reviewed manually.
  - Adjusted to fit the assessment requirements.
  - Kept small and modular to match an enterprise coding style.

