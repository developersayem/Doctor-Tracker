# Product Requirements Document (PRD) – Doctor Tracker

## 1. Executive Summary & Objective
**Doctor Tracker** is an enterprise-grade administrative healthcare web application built to streamline the management of medical professionals (doctors) and their assigned patients. The platform provides hospital administrators with secure authentication, rapid searchable records, relational data visualization, and an analytical dashboard powered by optimized database queries.

The primary design principle is **production-first modularity**, high-performance query patterns, intuitive UX, and clean, readable code structure with comprehensive type safety.

---

## 2. Target Persona & User Roles
- **Primary Persona:** Hospital Administrator / Clinical Operations Manager.
- **Responsibilities:**
  - Onboard and manage doctor profiles across clinical departments and affiliated hospitals.
  - Track patient intake under specific doctors, update conditions, and transfer or discharge records.
  - Review real-time operational analytics (workload distribution, patient-to-doctor ratios, historical registration trends).
- **Access Level:** Protected portal access via secure JWT authentication. Unauthenticated requests are blocked.

---

## 3. Core Functional Requirements

### 3.1 Authentication & Authorization
- **Admin Authentication:**
  - Secure email/password login.
  - Passwords hashed using `bcrypt` (minimum 10 salt rounds).
  - Stateless JSON Web Tokens (JWT) issued on login, transmitted securely via HTTP-Only Cookies or Authorization header.
  - Global route protection on both backend Express middlewares and frontend Next.js middleware guards.
  - Seedable initial Super Admin credentials for testing and evaluation.

### 3.2 Doctor Management
- **Doctor Creation:**
  - Required fields:
    - `name` (string, minimum 3 characters)
    - `specialization` (string, e.g., Cardiology, Neurology, Pediatrics, Orthopedics)
    - `hospital` (string, affiliated hospital/clinic name)
    - `phone` (valid phone format)
    - `email` (valid, unique email address)
    - `status` (active / on-leave)
- **Doctor Directory & Filtering:**
  - Paginated list view with configurable page size (default: 10 items).
  - Multi-field text search matching `name`, `specialization`, and `hospital`.
  - Date-wise filtering (`startDate`, `endDate` based on `createdAt`).
  - Sorting (by `name`, `createdAt`, `patientCount` ascending/descending).
- **Doctor Profile & Relationships:**
  - Dedicated doctor profile view showing complete details.
  - Embedded list of all patients currently assigned to this doctor.
  - Ability to directly assign a new patient to this doctor from their profile page.
  - Ability to delete / unassign a patient directly from the doctor's roster.
- **Doctor Modification & Deletion:**
  - Update doctor metadata.
  - Safe deletion with cascading check (warning if active patients exist).

### 3.3 Patient Management
- **Dedicated Patient Portal:**
  - Comprehensive view of all patients across all physicians.
  - Patient fields:
    - `name` (string)
    - `age` (number, positive integer)
    - `gender` (male / female / other)
    - `doctorId` (MongoDB ObjectId reference to Doctor model)
    - `condition` (e.g., Critical, Stable, Under Observation, Recovered)
    - `contactNumber` (valid phone format)
    - `admissionDate` (date)
- **Patient Operations:**
  - Add new patient with mandatory doctor association.
  - Edit existing patient information (condition, assigned doctor, vitals, contact).
  - Delete patient record with confirmation modal.
- **Patient Search & Filtering:**
  - Text search by patient name and contact number.
  - Filter by condition (Critical, Stable, etc.).
  - Filter by assigned doctor.
  - Date-range filtering on `createdAt` and `admissionDate`.
  - Server-side pagination and sorting.

### 3.4 Dashboard & Analytical Visualizations
- **Summary Metrics (KPI Cards):**
  - **Total Doctors:** Active count.
  - **Total Patients:** Active count.
  - **Average Patients Per Doctor:** Operational load indicator.
  - **Critical Cases Count:** High-priority patient tracking.
- **Data Visualizations:**
  - **Patients Per Doctor (Bar Chart):** Top doctors by assigned patient workload.
  - **Condition Breakdown (Donut/Pie Chart):** Percentage distribution of patient health conditions (Critical, Stable, Recovered, etc.).
  - **Registration Trends (Area / Line Chart):** Time-series analysis of patient admissions and doctor onboarding over the past 30 days.
  - **Department / Specialization Distribution (Radial / Bar Chart):** Doctors categorized by medical specialties.
- **Aggregation Optimization:**
  - Single MongoDB `$facet` aggregation pipeline to compute all metrics in one database round-trip.

---

## 4. Non-Functional Requirements & Performance Goals
1. **Response Time:** Sub-100ms API response time for paginated queries via proper indexing.
2. **Scalability:** Indexed compound queries capable of handling tens of thousands of records without full collection scans (`COLLSCAN`).
3. **UX / UI Consistency:** Clean, modern design with responsive layout, skeleton loaders, and zero jarring layout shifts.
4. **State Management:** URL search parameters as the single source of truth for table filters, enabling shareable URLs and seamless browser history.
5. **Debouncing:** 400ms debounce on search inputs to minimize unnecessary server requests.

---

## 5. Skills Required for Project Execution
To execute this architecture at production quality, the following technical skills and competencies are required:

| Competency Area | Technologies & Concepts |
| :--- | :--- |
| **Backend Development** | Node.js, Express.js, TypeScript, RESTful API Design, Middleware chaining, Zod validation |
| **Database Engineering** | MongoDB, Mongoose ODM, Compound & Text Indexing, `$facet`, `$lookup`, `$group` aggregation pipelines |
| **Authentication & Security** | JWT (JSON Web Tokens), bcrypt hashing, HTTP-Only Cookie strategy, CORS, Helmet, Rate Limiting |
| **Frontend Architecture** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Component Modularization |
| **Data Fetching & State** | TanStack Query v5 (React Query), Axios Interceptors, URL Search Params synchronization, Debounce hooks |
| **Data Visualization** | Recharts / Chart.js, Responsive container formatting, dynamic tooltip formatting |
| **DevOps & Clean Code** | Git branch management, Docker Compose, ESLint, Environment variable validation |
