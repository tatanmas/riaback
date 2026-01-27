# Mini Product Insights Dashboard

A production-ready product dashboard built with Next.js, TypeScript, and Docker. This application provides stakeholders with visibility into a product catalog with aggregated insights, filtering, and detailed product views.

> 📖 **New to this project?** Start with [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) for a high-level summary of architecture decisions, development process, and key choices.

## 🚀 Features

### Core Requirements ✅

- **Backend API (Next.js API Routes)**
  - Fetches product data from [DummyJSON](https://dummyjson.com) API
  - Exposes processed/aggregated endpoints for insights
  - Full filtering, sorting, and pagination support

- **Frontend Dashboard**
  - Product list/table view with name, price, category, image, rating, and stock
  - Detailed product view with full information
  - Insights visualization with KPIs and metrics

- **Product Thinking**
  - Prioritized layout: KPIs first, then filters, then product list
  - Insights match filtered views for contextual decision-making

- **Design & Usability**
  - Mobile-first, responsive design
  - Clean, modern UI with proper loading/error/empty states

### Bonus Features ⭐

- ✅ **Search & Filter**: Full-text search, category filtering, price range filtering
- ✅ **Testing**: Unit tests with Jest for insights and repository logic
- ✅ **Dockerization**: Multi-stage Dockerfile for production-ready containers
- ✅ **CI/CD**: GitHub Actions workflow for linting, testing, and building
- ✅ **Observability**: Structured logging with request IDs and timing
- ✅ **Deployment Ready**: Vercel configuration included

## 📋 Prerequisites

- Node.js 20.x or higher
- Docker (optional, for containerized deployment)
- npm or yarn

## 🛠️ Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-product-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

The project includes a **multi-stage Dockerfile** for production-ready containerization. This approach:
- Builds the Next.js app in a separate stage
- Creates a minimal production image (only runtime dependencies)
- Reduces final image size significantly

#### Quick Start

1. **Build the Docker image**
   ```bash
   docker build -t mini-product-dashboard .
   ```
   
   This will:
   - Install dependencies
   - Build the Next.js application
   - Create an optimized production image

2. **Run the container**
   ```bash
   docker run --rm -p 3000:3000 mini-product-dashboard
   ```
   
   Flags explained:
   - `--rm`: Automatically remove container when it stops
   - `-p 3000:3000`: Map container port 3000 to host port 3000

3. **Verify it's working**
   ```bash
   # In another terminal, test the API
   curl http://localhost:3000/api/products
   ```

The API will be available at `http://localhost:3000/api/products`

#### Docker Commands Reference

**Build with a specific tag:**
```bash
docker build -t mini-product-dashboard:latest .
```

**Run in detached mode (background):**
```bash
docker run -d --name mini-product-dashboard -p 3000:3000 mini-product-dashboard
```

**View logs:**
```bash
docker logs mini-product-dashboard
```

**Stop the container:**
```bash
docker stop mini-product-dashboard
```

**Remove the container:**
```bash
docker rm mini-product-dashboard
```

**Remove the image:**
```bash
docker rmi mini-product-dashboard
```

#### Dockerfile Structure

The Dockerfile uses a **multi-stage build**:

1. **Builder stage** (`node:20-alpine`):
   - Installs all dependencies (including devDependencies)
   - Builds the Next.js application
   - Produces optimized production artifacts

2. **Runner stage** (`node:20-alpine`):
   - Only copies built artifacts and production dependencies
   - Sets `NODE_ENV=production`
   - Exposes port 3000
   - Runs `npm start` to serve the application

This results in a smaller final image (~150MB vs ~500MB+ with all dev dependencies).

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📡 API Endpoints

### `GET /api/products`

Returns a paginated list of products with optional filtering and sorting.

**Query Parameters:**
- `search` or `q` (string): Search term for name, description, or category
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sort` (string): Sort order (`price_asc`, `price_desc`, `rating_asc`, `rating_desc`, `title_asc`, `title_desc`)
- `page` (number): Page number (1-based, default: 1)
- `pageSize` (number): Items per page (default: 20)

**Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "appliedFilters": {...},
  "sort": "price_asc"
}
```

### `GET /api/products/:id`

Returns detailed information for a single product.

**Response:**
```json
{
  "id": 1,
  "title": "iPhone 15",
  "description": "...",
  "price": 999,
  "category": "smartphones",
  "rating": 4.8,
  "stock": 50,
  ...
}
```

### `GET /api/products/insights`

Returns aggregated metrics for the current product set (respects filters).

**Query Parameters:** Same as `/api/products` (filters apply to insights)

**Response:**
```json
{
  "averagePriceGlobal": 1274.5,
  "totalProducts": 100,
  "totalStock": 5000,
  "mostCommonCategory": {
    "name": "smartphones",
    "count": 25
  },
  "lowStockCount": 5,
  "topRatedProducts": [...],
  "stockByCategory": [...]
}
```

## 🏗️ Architecture & Technical Decisions

### Backend Architecture

The backend follows a **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│      API Routes (app/api/)         │  ← Request handling, validation
├─────────────────────────────────────┤
│   Services (lib/services/)         │  ← Business logic, insights
├─────────────────────────────────────┤
│  Repositories (lib/repositories/)  │  ← Data access, filtering
├─────────────────────────────────────┤
│   HTTP Client (lib/services/)      │  ← External API communication
└─────────────────────────────────────┘
```

**Key Design Decisions:**

1. **Modular Structure**: Each layer has a single responsibility
   - `dummyjsonClient.ts`: Only knows about DummyJSON API
   - `productRepository.ts`: Handles data mapping and filtering
   - `productInsightsService.ts`: Pure functions for metric computation
   - API routes: Thin controllers that orchestrate services

2. **Type Safety**: Strict TypeScript with domain types (`Product`, `ProductFilters`, `ProductsInsights`) shared across layers

3. **Error Handling**: Centralized HTTP error handling with `HttpError` class and consistent error responses

4. **CORS Support**: Configurable CORS headers for cross-origin requests (frontend on different port)

5. **Structured Logging**: JSON-formatted logs with request IDs, timing, and context for observability

### Product Decisions

**Why these insights?**
- **Average Price**: Quick indicator of catalog pricing strategy
- **Total Stock**: Inventory health at a glance
- **Most Common Category**: Understanding catalog composition
- **Low Stock Count**: Actionable metric for inventory management
- **Top Rated Products**: Identify best performers
- **Stock by Category**: Distribution visibility

**Why this layout priority?**
1. **KPIs First**: Stakeholders need high-level metrics immediately
2. **Filters Second**: Enable quick data exploration
3. **Product List Third**: Detailed view for deeper analysis
4. **Detail View**: Secondary, accessed on demand

### Trade-offs & Limitations

**Current Limitations:**

1. **In-Memory Filtering**: All products are fetched from DummyJSON, then filtered in-memory. This works for ~100 products but won't scale to millions.
   - **Why**: DummyJSON doesn't support complex query parameters
   - **With more time**: Implement server-side filtering with a real database

2. **No Caching**: Every request hits DummyJSON API
   - **With more time**: Add Redis caching layer with TTL

3. **No Authentication**: API is open
   - **With more time**: Add API keys or OAuth

4. **Limited Error Recovery**: Basic retry logic
   - **With more time**: Exponential backoff, circuit breaker pattern

5. **No Real-Time Updates**: Data is static until refresh
   - **With more time**: WebSocket support for live updates

**Technical Trade-offs:**

- **No Heavy Chart Libraries**: Used simple CSS-based visualizations to keep bundle size small
- **TypeScript Strict Mode**: Chose type safety over faster development
- **Docker Multi-Stage**: Larger build time but smaller production image
- **Jest over Vitest**: Standard choice for Next.js projects

## 🧪 Testing

Tests are located in `lib/**/__tests__/` directories.

**Test Coverage:**
- `productInsightsService`: Tests for all metric calculations
- `productRepository`: Tests for filtering, sorting, and pagination logic

**Running Tests:**
```bash
npm test              # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js and deploy

The `vercel.json` file is included for configuration.

### Docker

The project includes a production-ready Dockerfile. See the [Docker Deployment](#docker-deployment) section above for detailed instructions.

**Quick commands:**
```bash
# Build
docker build -t mini-product-dashboard .

# Run
docker run --rm -p 3000:3000 mini-product-dashboard
```

The Dockerfile uses a multi-stage build for optimal image size and security.

### Environment Variables

- `ALLOWED_ORIGIN`: CORS allowed origin (default: `http://localhost:8080`)
- `NODE_ENV`: Environment mode (`development` | `production`)

## 📝 What I Would Improve With More Time

1. **Database Integration**: Replace in-memory filtering with PostgreSQL/MongoDB
2. **Caching Layer**: Redis for API response caching
3. **Authentication**: API keys or OAuth for protected endpoints
4. **Rate Limiting**: Protect against abuse
5. **API Versioning**: `/api/v1/products` for future compatibility
6. **GraphQL Option**: Alternative to REST for flexible queries
7. **E2E Tests**: Playwright/Cypress for full user flows
8. **Performance Monitoring**: APM integration (Datadog, New Relic)
9. **Documentation**: OpenAPI/Swagger spec for API
10. **Internationalization**: Multi-language support

## 🤖 AI/LLM Usage

This project was developed with assistance from AI tools (Cursor AI). The development process involved:
- Initial architecture planning
- Code generation for boilerplate
- Code review and refactoring suggestions
- Test case generation

All AI-generated code was reviewed, tested, and integrated following best practices.

---

## 📄 Additional Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**: High-level summary of architecture decisions, development process (including Lovable usage), and key choices
- **[docs/DECISIONS.md](./docs/DECISIONS.md)**: Detailed technical and product decisions with rationale

## 📄 License

This project is part of a technical assessment and is not intended for production use.

## 👤 Author

Built as part of a Product Engineer assessment demonstrating:
- Clean, modular code architecture
- Enterprise-level best practices
- Thoughtful product decisions
- Full-stack development skills
