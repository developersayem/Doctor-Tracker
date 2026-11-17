# System Design & Architecture Document – Doctor Tracker

## 1. High-Level Architecture Overview
The Doctor Tracker application follows a **Decoupled Monorepo** architecture consisting of an independent **Node.js/Express REST API Server** and a **Next.js 15 (App Router) Client Application**.

```
┌─────────────────────────────────────────────────────────────┐
│                       Web Browser                           │
│      Next.js 15 Client (Tailwind CSS + TanStack Query)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON (REST API)
                               │ HTTP-Only Cookie (JWT)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express.js Standalone Server                │
│  Middlewares: Helmet, Cors, RateLimit, Auth, Zod Validation │
│  Controllers ─── Services ─── QueryBuilder ─── Models        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM (Connection Pool)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                       │
│      - Compound & Text Indexes                              │
│      - $facet Multi-Pipeline Analytics Aggregations          │
└─────────────────────────────────────────────────────────────┘
```

### Architectural Rationale
- **Separation of Concerns:** Backend business logic, indexing, and data security are completely decoupled from frontend rendering cycles.
- **Portability & Independent Deployment:** Backend can be deployed to AWS ECS / DigitalOcean / Render, while Frontend can be deployed to Vercel with zero cross-runtime lock-in.
- **Auditability:** Clear boundaries simplify automated testing, performance profiling, and code review.

---

## 2. Directory Structure (Monorepo)

```plaintext
doctor-tracker/
├── PRD.md                         # Product Requirements Document
├── DESIGN.md                      # System Design & Architecture
├── tasks.md                       # Task Breakdown & Git Commit Projection
├── README.md                      # Primary Technical Documentation
├── docker-compose.yml             # Local MongoDB & environment setup
│
├── server/                        # Standalone Express + TypeScript Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # MongoDB Mongoose connection with event listeners
│   │   │   └── env.ts             # Zod-validated environment configurations
│   │   ├── controllers/           # Request handlers (HTTP status codes, payload delivery)
│   │   │   ├── auth.controller.ts
│   │   │   ├── doctor.controller.ts
│   │   │   ├── patient.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── middlewares/           # Interceptors & guards
│   │   │   ├── auth.middleware.ts # JWT token extraction & verification
│   │   │   ├── validate.middleware.ts # Zod schema validation for body, query, and params
│   │   │   └── error.middleware.ts# Global structured error formatting (RFC 7807 inspired)
│   │   ├── models/                # Mongoose schemas with explicit indexing
│   │   │   ├── User.model.ts      # Admin accounts with bcrypt pre-save hooks
│   │   │   ├── Doctor.model.ts    # Doctor profiles with text & compound indexes
│   │   │   └── Patient.model.ts   # Patient records referencing Doctor ObjectId
│   │   ├── routes/                # Express router mount points
│   │   │   ├── index.ts           # Unified API router (/api/v1)
│   │   │   ├── auth.routes.ts
│   │   │   ├── doctor.routes.ts
│   │   │   ├── patient.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── services/              # Pure business logic and database aggregation queries
│   │   │   ├── auth.service.ts
│   │   │   ├── doctor.service.ts
│   │   │   ├── patient.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── utils/                 # Reusable helper utilities
│   │   │   ├── ApiError.ts        # Typed custom error class with HTTP status codes
│   │   │   ├── ApiResponse.ts     # Uniform JSON response structure
│   │   │   ├── queryBuilder.ts    # Generic search, filter, date-range, and pagination builder
│   │   │   └── seeder.ts          # Default admin & mock data seeder
│   │   ├── app.ts                 # Express application instantiation & middleware pipeline
│   │   └── server.ts              # Server startup and graceful shutdown handler
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
└── client/                        # Next.js 15 App Router Frontend
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   └── login/page.tsx # Clean Admin Login page
    │   │   ├── (dashboard)/
    │   │   │   ├── layout.tsx     # Dashboard shell (Sidebar, Navbar, Auth Guard)
    │   │   │   ├── page.tsx       # Analytics & visual charts overview
    │   │   │   ├── doctors/
    │   │   │   │   ├── page.tsx   # Doctor directory (Search, filter, table, pagination)
    │   │   │   │   └── [id]/page.tsx # Doctor detail view with assigned patients
    │   │   │   └── patients/
    │   │   │       └── page.tsx   # Patient directory with CRUD modals
    │   │   ├── layout.tsx         # Root layout with QueryClientProvider & Toaster
    │   │   └── globals.css        # Tailwind CSS and theme design tokens
    │   ├── components/
    │   │   ├── ui/                # Accessible primitives (Button, Modal, Input, Badge, Table)
    │   │   ├── charts/            # Responsive Recharts components
    │   │   ├── doctors/           # DoctorFormModal, DoctorTable, DoctorFilterBar
    │   │   ├── patients/          # PatientFormModal, PatientTable, PatientFilterBar
    │   │   └── layout/            # Sidebar, Header, Breadcrumbs, PaginationControls
    │   ├── hooks/                 # Custom React hooks (useDebounce, useUrlFilters)
    │   ├── lib/                   # API client and formatting utilities
    │   │   ├── axios.ts           # Axios instance with credentials & error handling
    │   │   └── utils.ts           # Class merging (clsx/tailwind-merge) & date formatters
    │   ├── schemas/               # Zod validation schemas for forms
    │   └── types/                 # Shared TypeScript interfaces
    ├── .env.example
    ├── next.config.ts
    └── package.json
```

---

## 3. Database Schema & Indexing Strategy

### 3.1 `users` Collection (Admin Accounts)
```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;      // Indexed: Unique, lowercase
  password: string;   // bcrypt hashed (12 rounds)
  role: 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```
- **Indexes:**
  - `{ email: 1 }` (Unique index for instantaneous login lookup).

### 3.2 `doctors` Collection
```typescript
interface IDoctor {
  _id: ObjectId;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;      // Indexed: Unique
  status: 'active' | 'on-leave';
  createdAt: Date;
  updatedAt: Date;
}
```
- **Indexes & Optimization:**
  - **Compound Text Index:** `{ name: 'text', specialization: 'text', hospital: 'text' }` for lightning-fast multi-attribute full-text search.
  - **Compound B-Tree Index:** `{ specialization: 1, hospital: 1, createdAt: -1 }` for optimized category and date filtering.
  - **Single Field Index:** `{ createdAt: -1 }` for default reverse-chronological pagination.

### 3.3 `patients` Collection
```typescript
interface IPatient {
  _id: ObjectId;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  doctorId: ObjectId; // References 'doctors' collection
  condition: 'Critical' | 'Stable' | 'Under Observation' | 'Recovered';
  contactNumber: string;
  admissionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```
- **Indexes & Optimization:**
  - **Foreign Key Index:** `{ doctorId: 1, createdAt: -1 }` allows instantaneous retrieval of all patients belonging to any doctor without full scans.
  - **Compound Filter Index:** `{ condition: 1, admissionDate: -1 }` for condition filtering combined with date sorting.
  - **Text Index:** `{ name: 'text', contactNumber: 'text' }` for search capability.

---

## 4. Query Optimization & Analytics Architecture ($facet Aggregation)

Instead of executing multiple round trips across network sockets to calculate dashboard statistics, the server executes a single MongoDB `$facet` aggregation pipeline in `analytics.service.ts`:

```typescript
const stats = await Doctor.aggregate([
  {
    $facet: {
      totalDoctors: [{ $count: "count" }],
      specializationDistribution: [
        { $group: { _id: "$specialization", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]
    }
  }
]);
```
Combined with a parallel `$lookup` on patients, this yields:
1. Total Doctor & Patient count.
2. Top doctors ranked by assigned patient load.
3. Health condition breakdown (Critical, Stable, etc.).
4. Admission trend timelines.

**Database Execution Profile:**
- Network overhead reduced by **75%** (1 round-trip vs 4+ independent queries).
- Memory footprint bounded with `$limit` stages on grouped sub-pipelines.

---

## 5. RESTful API Contract

All API responses follow a uniform JSON structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 85,
    "totalPages": 9,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Key Endpoints:
- `POST /api/v1/auth/login` - Admin login, returns JWT token and sets HTTP-Only cookie.
- `GET /api/v1/auth/me` - Validates session and returns admin profile.
- `POST /api/v1/auth/logout` - Clears authentication cookie.

- `GET /api/v1/doctors` - Paginated doctors with search, filters (date, specialization), and patient counts.
- `POST /api/v1/doctors` - Create a new doctor profile (validated with Zod).
- `GET /api/v1/doctors/:id` - Fetch doctor details and their assigned patients.
- `PUT /api/v1/doctors/:id` - Update doctor profile.
- `DELETE /api/v1/doctors/:id` - Delete doctor (guards against deleting doctors with active patients).

- `GET /api/v1/patients` - Paginated patients with search, condition filter, and doctor filter.
- `POST /api/v1/patients` - Register a patient under a doctor.
- `GET /api/v1/patients/:id` - Fetch single patient record.
- `PUT /api/v1/patients/:id` - Update patient information or condition.
- `DELETE /api/v1/patients/:id` - Delete patient record.

- `GET /api/v1/analytics/dashboard` - Single optimized call returning all dashboard metrics and chart payloads.

---

## 6. Frontend Architecture & State Management

1. **Routing:** Next.js App Router with Route Groups:
   - `(auth)` for public unauthenticated view (Login).
   - `(dashboard)` for protected admin portal with dynamic breadcrumbs, sidebar, and layout shell.
2. **Server State Management:** **TanStack Query (React Query v5)**
   - Automatic background refetching and window focus synchronization.
   - Cache invalidation on mutation (e.g., creating a patient automatically invalidates `['patients']` and `['analytics']`).
3. **URL-Driven Filters:**
   - Filters and pagination are kept in sync with Next.js `useSearchParams` and `useRouter`.
   - Refreshing or sharing a URL preserves exact table state (`?page=2&search=cardio&condition=Critical`).
4. **Debounced Search:** Custom `useDebounce` hook (400ms) prevents query spam.

---

## 7. Security & Production Hardening
- **Helmet:** Adds secure HTTP response headers (HSTS, Content-Security-Policy, X-Frame-Options).
- **CORS:** Restricts cross-origin requests exclusively to the Next.js client URL with credentials support.
- **Express Rate Limiter:** Protects auth endpoints against brute-force attacks (10 requests per 15 minutes).
- **Input Validation:** Strict Zod validation on incoming request bodies, queries, and URL params before hitting controllers.
- **Centralized Error Handling:** Custom `ApiError` class with standardized HTTP response formatting, preventing stack trace leakage in production.
