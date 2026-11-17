# Doctor Tracker | Clinical Enterprise Admin Portal

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://mongoosejs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Swagger](https://img.shields.io/badge/OpenAPI-3.0.3-85ea2d.svg)](http://localhost:5001/api-docs)
[![Vitest](https://img.shields.io/badge/Tests-38%20Passing-success.svg)](https://vitest.dev/)

**Doctor Tracker** is an enterprise-grade administrative healthcare portal engineered for hospital clinical directors and supervisors to manage physician staffing rosters, oversee patient admissions, and track facility-wide operational throughput in real time.

Built according to production standards with a modular Monorepo structure, high-speed single-pipeline MongoDB aggregations, and a UI design system generated via Google Stitch MCP.

---

## Architecture Overview

```
doctor-tracker/
├── client/                        # Next.js 15 App Router, React 19, Tailwind CSS, TanStack Query
│   ├── src/
│   │   ├── app/                   # App Router (Login, Dashboard, Doctors, Patients)
│   │   ├── components/            # Stitch Clinical Layout, Bento Cards, Tables, Modals
│   │   ├── context/               # Authentication State & Session Persistence
│   │   ├── lib/                   # Axios Interceptors, Date & Badge Utilities
│   │   ├── providers/             # TanStack QueryClient Provider
│   │   └── types/                 # TypeScript Interfaces & API Response Envelopes
│   └── package.json
│
├── server/                        # Node.js + Express + TypeScript + Mongoose
│   ├── src/
│   │   ├── config/                # Mongoose Pool, Zod Env Validation, Swagger UI Setup
│   │   ├── controllers/           # Auth, Doctor, Patient, Analytics Controllers
│   │   ├── middlewares/           # JWT Auth Guard, Zod Validator, Global Error Handler
│   │   ├── models/                # User, Doctor (Compound Index), Patient Schemas
│   │   ├── routes/                # RESTful API Endpoints (/api/v1/...)
│   │   ├── services/              # Business Logic & Single-Pipeline $facet Aggregations
│   │   ├── utils/                 # ApiError, ApiResponse, QueryBuilder, Seeder
│   │   └── app.ts                 # Express Config (CORS, Helmet, Rate Limiter)
│   ├── tests/                     # Vitest + Supertest + MongoMemoryServer (38 Tests)
│   └── package.json
│
├── DESIGN.md                      # Detailed System Architecture & Indexing Strategy
├── PRD.md                         # Product Requirements Document & KPIs
└── tasks.md                       # Roadmap & Git Feature Tracking
```

---

## Key Features

### 1. Executive Analytics Dashboard
- **4 Real-Time KPI Cards:** Active Physician Roster, Census Volume, Density Ratio, and Critical Case Alert.
- **Encounter Velocity Area Chart:** Longitudinal patient intake volume rendered with Recharts.
- **Department Workload Allocation:** Multi-department distribution donut chart and staffing ratio indicators.
- **Live Encounter Feed:** Chronological table displaying active doctor-patient assignments.

### 2. Physician & Clinical Faculty Directory
- **Search & Filtering:** Multi-field regex search across physician names, specialties, and hospital affiliations.
- **Status & Workload Tracking:** Live patient-to-capacity gauges (`patientCount / maxCapacity`) and availability badges.
- **Physician Profile (`/doctors/[id]`):** Clinical bio, license credentials, and dedicated assigned patients roster with one-click intake.
- **CRUD Operations:** Modal dialogs for registering, editing, and deleting physicians.

### 3. Central Patient Registry
- **Triage Category Tabs:** Quick filters for *Critical / Acute*, *Under Observation*, *Stable*, and *Recovered*.
- **Attending Physician Linkage:** Foreign-key relational resolution linking patients to active doctors.
- **Full Intake Workflow:** Modal dialogs with age, gender, contact, diagnostic condition, and treatment notes.

### 4. Interactive OpenAPI / Swagger Documentation
- Fully documented OpenAPI 3.0.3 specification mounted at `http://localhost:5001/api-docs` and `http://localhost:5001/docs`.
- Includes schemas, authentication parameters, request bodies, and sample responses.

---

## Technical Decisions & Optimization

### 1. Database Indexing
- **Doctor Model:** Compound text index on `name`, `specialization`, and `hospital` for high-throughput regex search. Single-field indexes on `status` and `createdAt`.
- **Patient Model:** Foreign key index on `{ doctorId: 1, createdAt: -1 }` enabling instantaneous patient roster retrieval per physician. Secondary index on `condition`.

### 2. Single-Pipeline Analytics Aggregation
Rather than issuing multiple disparate queries (`countDocuments`, `find`, `distinct`), the analytics engine executes a unified MongoDB `$facet` aggregation pipeline:
- **Facet `kpis`:** Aggregates doctor count, patient count, average density, and critical cases.
- **Facet `workload`:** Groups patients by doctor's specialization.
- **Facet `conditionDistribution`:** Groups admissions by diagnostic category.
- **Facet `admissionTrends`:** Computes daily admissions over a rolling 30-day window.
- **Facet `recentAssignments`:** Performs `$lookup` and projects the latest 10 clinical assignments.

*Result:* Sub-40ms execution time even under high data volume.

---

## Quick Start Guide

### Prerequisites
- Node.js `v18.x` or `v20.x`
- npm `v9+` or `v10+`
- Local MongoDB instance or MongoDB Atlas URI

---

### Step 1: Clone Repository
```bash
git clone https://github.com/developersayem/Doctor-Tracker.git
cd Doctor-Tracker
```

---

### Step 2: Backend Setup & Seeding

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database seeder (generates Admin user, 15 doctors, 65 patients)
npm run seed

# Run the development server
npm run dev
```

Backend will be active at: `http://localhost:5001`  
Interactive Swagger Docs: `http://localhost:5001/api-docs`

---

### Step 3: Run Backend Test Suite

The backend contains a production-grade test suite using **Vitest**, **Supertest**, and **MongoMemoryServer** (isolated in-memory MongoDB):

```bash
cd server
npm test
```
*Output: 38 unit & integration tests passing across all routes, middleware, and services.*

---

### Step 4: Frontend Setup

```bash
# Navigate to client
cd ../client

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run the Next.js development server
npm run dev
```

Client will be active at: `http://localhost:3000`

---

## Default Demo Credentials

On the login page (`http://localhost:3000/login`), you can click the quick-fill pill button or use:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@doctortracker.com` | `Admin@123456` |
| **Medical Director** | `director@stjude.org` | `Admin@123456` |

---

## RESTful API Endpoints

### Authentication
- `POST /api/v1/auth/login`: Authenticate admin and issue JWT token + cookie.
- `GET /api/v1/auth/me`: Get current authenticated user profile.
- `POST /api/v1/auth/logout`: Invalidate session.

### Doctors
- `GET /api/v1/doctors`: List doctors with search, filters (`specialization`, `status`), and pagination.
- `GET /api/v1/doctors/:id`: Retrieve single doctor profile with computed `patientCount`.
- `POST /api/v1/doctors`: Register new physician (validated with Zod).
- `PUT /api/v1/doctors/:id`: Update physician credentials.
- `DELETE /api/v1/doctors/:id`: Remove physician from roster.

### Patients
- `GET /api/v1/patients`: List patients with search, condition filter, and doctor filter.
- `GET /api/v1/patients/:id`: Retrieve single patient details.
- `POST /api/v1/patients`: Clinical patient intake and physician assignment.
- `PUT /api/v1/patients/:id`: Update condition or treatment notes.
- `DELETE /api/v1/patients/:id`: Discharge / archive patient record.

### Analytics
- `GET /api/v1/analytics/dashboard`: Retrieve high-speed single-pipeline `$facet` aggregated metrics.

---

## License
MIT © 2025 Doctor Tracker Healthcare Systems.
