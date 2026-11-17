# Project Roadmap & Task Breakdown – Doctor Tracker

This document tracks all implementation phases and provides a **Human-like Git Commit Projection** to ensure a realistic, clean, and professional version control history.

---

## Progress Overview

- [x] Phase 0: Project Architecture, Documentation & Git Initialization
- [ ] Phase 1: Standalone Backend Foundation & Configuration
- [ ] Phase 2: Backend Database Models & Indexing Strategy
- [ ] Phase 3: Utilities, Middlewares & Validation Framework
- [ ] Phase 4: Authentication & Admin Controller / Service
- [ ] Phase 5: Doctor Management REST API (CRUD + Query Builder)
- [ ] Phase 6: Patient Management REST API & Relational Association
- [ ] Phase 7: Analytics Engine ($facet Aggregation Pipeline) & Data Seeder
- [ ] Phase 8: Frontend (Next.js 15) Monorepo Initialization & Setup
- [ ] Phase 9: Client Core Infrastructure (Axios, Auth State, Layout Shell)
- [ ] Phase 10: Doctor Management UI (Directory, Search, Modals, Details Page)
- [ ] Phase 11: Patient Management UI (Directory, Filters, Form Modals)
- [ ] Phase 12: Analytical Dashboard & Chart Visualizations
- [ ] Phase 13: End-to-End Integration, Polish & README Documentation

---

## Detailed Task Breakdown

### Phase 0: Documentation & Repository Initialization
- [x] Create comprehensive PRD (`PRD.md`) defining user stories, features, and non-functional requirements.
- [x] Create technical system design (`DESIGN.md`) detailing schemas, indexes, pipelines, and architecture.
- [x] Initialize Git repository with `main` branch and clean remote configuration.
- [x] Create project task tracking sheet (`tasks.md`).

### Phase 1: Standalone Backend Foundation & Configuration
- [ ] Setup `server/` directory with `package.json`, `tsconfig.json`, and ESLint configuration.
- [ ] Install backend dependencies: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `morgan`, `zod`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`.
- [ ] Install development dependencies: `typescript`, `@types/node`, `@types/express`, `@types/cors`, `@types/bcryptjs`, `@types/jsonwebtoken`, `tsx`, `nodemon`.
- [ ] Implement `src/config/env.ts` with Zod schema to guarantee environment variable integrity.
- [ ] Implement `src/config/db.ts` for robust MongoDB connection with reconnection hooks.
- [ ] Configure `docker-compose.yml` for local MongoDB instance.

### Phase 2: Database Models & Indexing Strategy
- [ ] Implement `User.model.ts` with pre-save password hash hooks and email index.
- [ ] Implement `Doctor.model.ts` with compound text index (`name`, `specialization`, `hospital`) and single-field indexes (`createdAt`).
- [ ] Implement `Patient.model.ts` with foreign key index (`doctorId: 1, createdAt: -1`), condition filter index, and text search index.

### Phase 3: Utilities, Middlewares & Validation Framework
- [ ] Implement `ApiError.ts` custom error class with HTTP status code handling.
- [ ] Implement `ApiResponse.ts` helper for consistent standard JSON responses.
- [ ] Implement `queryBuilder.ts` supporting full-text search, multi-field filtering, date ranges, and pagination.
- [ ] Implement global error handling middleware (`error.middleware.ts`).
- [ ] Implement generic Zod validation middleware (`validate.middleware.ts`).
- [ ] Implement JWT authentication guard middleware (`auth.middleware.ts`).

### Phase 4: Authentication Module
- [ ] Implement `auth.schema.ts` (Zod schemas for login and registration).
- [ ] Implement `auth.service.ts` (credential verification, JWT token generation, secure cookie dispatch).
- [ ] Implement `auth.controller.ts` (login, me, logout handlers).
- [ ] Implement `auth.routes.ts` mounted under `/api/v1/auth`.

### Phase 5: Doctor Management REST API
- [ ] Implement `doctor.schema.ts` with Zod validation.
- [ ] Implement `doctor.service.ts` (list with pagination & filters, getById with patient lookup, create, update, delete).
- [ ] Implement `doctor.controller.ts` with clean async request handling.
- [ ] Mount doctor routes (`/api/v1/doctors`) with auth protection.

### Phase 6: Patient Management REST API
- [ ] Implement `patient.schema.ts` with Zod validation.
- [ ] Implement `patient.service.ts` (list with doctor population, create, update, delete with doctor validation).
- [ ] Implement `patient.controller.ts`.
- [ ] Mount patient routes (`/api/v1/patients`) with auth protection.

### Phase 7: Analytics Engine & Data Seeding
- [ ] Implement `analytics.service.ts` using MongoDB `$facet` aggregation pipeline to compute:
  - Total doctors, total patients, average patients per doctor.
  - Patients per doctor distribution.
  - Patient condition breakdown.
  - Date-based admission trends.
- [ ] Implement `analytics.controller.ts` and route (`/api/v1/analytics/dashboard`).
- [ ] Implement `src/utils/seeder.ts` to automatically populate admin user, sample doctors, and sample patients.

### Phase 8: Frontend (Next.js 15) Monorepo Setup
- [ ] Initialize Next.js 15 App Router app in `client/` directory with TypeScript and Tailwind CSS.
- [ ] Configure Tailwind CSS styling, color tokens, and Lucide React icons.
- [ ] Install TanStack Query, Axios, Zod, React Hook Form, Recharts, and Sonner (toast notifications).

### Phase 9: Client Infrastructure & Shell
- [ ] Setup Axios client instance with base URL, timeout, and JWT interceptors.
- [ ] Configure React Query Client provider with optimal stale time and retry configs.
- [ ] Build Authentication context / custom hook (`useAuth`) with persistent state.
- [ ] Build reusable UI primitives: `Button`, `Input`, `Select`, `Badge`, `Card`, `Modal`, `Table`, `Pagination`.
- [ ] Implement Dashboard Layout shell (`(dashboard)/layout.tsx`) with Sidebar, Topbar, and responsive mobile drawer.

### Phase 10: Doctor Management UI
- [ ] Build Doctors directory page with search input, specialization filter, and date-range filter.
- [ ] Implement `DoctorTable` with sortable columns and status badges.
- [ ] Implement `DoctorFormModal` for creating and editing doctors.
- [ ] Implement Doctor Detail view (`/doctors/[id]`) showing doctor overview and embedded patient list.
- [ ] Add ability to add and remove patients directly from the doctor detail view.

### Phase 11: Patient Management UI
- [ ] Build Patients directory page with condition filter and search.
- [ ] Implement `PatientTable` showing assigned doctor and condition badges.
- [ ] Implement `PatientFormModal` with dynamic doctor select dropdown.
- [ ] Implement Patient edit and delete workflows with confirmation dialogs.

### Phase 12: Analytics Dashboard Visualizations
- [ ] Implement KPI summary cards (Total Doctors, Total Patients, Avg Ratio, Critical Patients).
- [ ] Implement `PatientsPerDoctorChart` (Bar Chart).
- [ ] Implement `ConditionDistributionChart` (Donut Chart).
- [ ] Implement `AdmissionTrendChart` (Area Chart).
- [ ] Implement Doctor Specialization breakdown.

### Phase 13: Final Polish, Verification & Technical Documentation
- [ ] Verify complete end-to-end user journeys (login, create doctor, assign patient, view analytics).
- [ ] Finalize `README.md` per project requirements (Elevator Pitch, Architecture, Technical Decisions, Setup Guide).
- [ ] Review code quality, comments, and remove any leftover debugging statements.

---

## Human-like Git Commit Projection

A realistic commit log follows standard human conventions (lowercase imperative verbs, clear concise subject lines, atomic changes):

| Commit # | Proposed Commit Message | Description |
| :--- | :--- | :--- |
| **01** | `chore: initial repository setup and project specification` | Initial project setup with README |
| **02** | `docs: add product requirements, system design, and implementation roadmap` | Add PRD, DESIGN, and tasks documents |
| **03** | `chore(server): scaffold express typescript environment with dependencies` | Configure server package.json, tsconfig, and env validation |
| **04** | `feat(server): setup mongodb connection and database models with indexes` | Add User, Doctor, and Patient models with compound text indexes |
| **05** | `feat(server): add error handling, api response wrapper, and query builder` | Add ApiError, ApiResponse, and reusable queryBuilder utility |
| **06** | `feat(server): implement jwt authentication and route protection middleware` | Add auth service, controller, and auth guard middleware |
| **07** | `feat(server): implement doctor management crud with pagination and text search` | Add doctor service, controller, routes, and validation schemas |
| **08** | `feat(server): implement patient management crud and doctor association` | Add patient service, controller, routes, and validation schemas |
| **09** | `feat(server): implement high-performance dashboard analytics using mongo facet aggregation` | Add single-pipeline aggregation for statistics and chart data |
| **10** | `feat(server): add comprehensive database seeder for admin and mock clinical records` | Add seed script for fast local evaluation |
| **11** | `chore(client): initialize next.js app router with typescript and tailwind css` | Scaffold client workspace with configuration |
| **12** | `feat(client): setup api client, query provider, and dashboard layout shell` | Add Axios interceptors, TanStack Query, Sidebar, and Topbar |
| **13** | `feat(client): implement authentication flow and protected route middleware` | Add admin login screen, token persistence, and route guard |
| **14** | `feat(client): build doctor management pages, search filters, and detail view` | Add doctors directory, form modal, and detail page with assigned patients |
| **15** | `feat(client): build patient management directory, condition filters, and crud modals` | Add patients page, modal dialogs, and deletion confirmations |
| **16** | `feat(client): implement visual analytics dashboard with recharts components` | Add KPI cards, workload bar charts, condition distribution, and trends |
| **17** | `refactor: optimize search debouncing and url sync for seamless navigation` | Add useDebounce hook and URL search param state synchronization |
| **18** | `docs: complete standardized readme with system architecture and technical decisions` | Add comprehensive README with elevator pitch and decision deep dives |
