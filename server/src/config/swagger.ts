import { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

/**
 * Complete OpenAPI 3.0.3 Specification for Doctor Tracker REST API.
 * Provides interactive documentation and schema definitions.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Doctor Tracker REST API",
    version: "1.0.0",
    description: `
## Doctor Tracker Administrative API
Doctor Tracker is an enterprise-grade administrative healthcare platform designed for clinic supervisors to monitor physicians, organize patient rosters, and analyze clinical throughput in real time.

### Key Architectural Highlights
- **Sub-100ms Responses:** Compound text and relational indexes on MongoDB.
- **Single-Pipeline Analytics:** MongoDB \`$facet\` multi-pipeline aggregation.
- **Dual Authentication:** Supports both \`Authorization: Bearer <token>\` and secure \`HTTP-Only Cookies\`.
- **Standard Envelope:** Predictable JSON structure via \`ApiResponse\` and RFC-compliant \`ApiError\`.
    `,
    contact: {
      name: "API Support",
      email: "support@doctortracker.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: "Local Development Server",
    },
    {
      url: "/api/v1",
      description: "Direct API v1 Root",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "Administrator authentication, session verification, and token lifecycle",
    },
    {
      name: "Doctors",
      description: "Doctor directory, profile management, and relational patient roster lookups",
    },
    {
      name: "Patients",
      description: "Patient intake, condition management, and attending physician assignment",
    },
    {
      name: "Analytics",
      description: "Consolidated operational analytics, workload graphs, and admission trends",
    },
    {
      name: "System Health",
      description: "Runtime health checks, uptime monitoring, and diagnostics",
    },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System Health"],
        summary: "Root health check",
        description: "Returns process uptime, environment, and ISO timestamp",
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthCheckResponse" },
              },
            },
          },
        },
      },
    },
    "/api/health": {
      get: {
        tags: ["System Health"],
        summary: "API health check alias",
        responses: {
          200: {
            description: "API is operational",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthCheckResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Administrator login",
        description: "Authenticates an administrator using email & password. Issues a signed JWT and sets an HTTP-Only secure cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          400: {
            description: "Invalid request payload format",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
          401: {
            description: "Invalid email or password credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current authenticated user",
        description: "Returns the profile of the currently logged in administrator",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "User profile fetched successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserResponse" },
              },
            },
          },
          401: {
            description: "Unauthorized - missing or invalid token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/auth/logout": {
      post: {
        tags: ["Authentication"],
        summary: "Log out administrator",
        description: "Clears the HTTP-Only authentication cookie session",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Successfully logged out",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StandardResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/doctors": {
      get: {
        tags: ["Doctors"],
        summary: "List all doctors with search, filters, and pagination",
        description: "Retrieves a paginated list of doctors with live assigned patient counts computed via MongoDB aggregation.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
            description: "Page number (1-based)",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
            description: "Number of records per page (max: 100)",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search keyword matching name, specialization, or hospital",
          },
          {
            name: "specialization",
            in: "query",
            schema: { type: "string" },
            description: "Filter by exact specialization",
          },
          {
            name: "hospital",
            in: "query",
            schema: { type: "string" },
            description: "Filter by affiliated hospital",
          },
          {
            name: "status",
            in: "query",
            schema: { type: "string", enum: ["active", "on-leave"] },
            description: "Filter by availability status",
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Filter created on or after date (YYYY-MM-DD)",
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
            description: "Filter created on or before date (YYYY-MM-DD)",
          },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string", enum: ["name", "specialization", "hospital", "createdAt", "status"], default: "createdAt" },
            description: "Field to sort by",
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
            description: "Sort direction",
          },
        ],
        responses: {
          200: {
            description: "Paginated doctors list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Doctors"],
        summary: "Create a new doctor profile",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateDoctorRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Doctor created successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorSingleResponse" },
              },
            },
          },
          409: {
            description: "Doctor with this email already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/doctors/options/filters": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor filter dropdown options",
        description: "Returns distinct lists of all specializations and hospitals in the system",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Filter choices",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorFilterOptionsResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/doctors/{id}": {
      get: {
        tags: ["Doctors"],
        summary: "Get doctor by ID with assigned patients",
        description: "Fetches full doctor profile and their complete roster of assigned patients",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "24-character hex MongoDB ObjectId",
          },
        ],
        responses: {
          200: {
            description: "Doctor details with patients",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorDetailResponse" },
              },
            },
          },
          404: {
            description: "Doctor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Doctors"],
        summary: "Update doctor profile",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateDoctorRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Doctor updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorSingleResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Doctors"],
        summary: "Delete doctor profile",
        description: "Deletes a physician profile and cleans up dependent patient records to prevent orphaned documents",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Doctor deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DoctorDeleteResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/patients": {
      get: {
        tags: ["Patients"],
        summary: "List all patients with multi-field filters",
        description: "Retrieves patients with attending doctor metadata populated",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search keyword matching patient name or contact number",
          },
          {
            name: "doctorId",
            in: "query",
            schema: { type: "string" },
            description: "Filter by attending doctor ObjectId",
          },
          {
            name: "condition",
            in: "query",
            schema: { type: "string", enum: ["Critical", "Stable", "Under Observation", "Recovered"] },
            description: "Filter by clinical condition",
          },
          {
            name: "gender",
            in: "query",
            schema: { type: "string", enum: ["male", "female", "other"] },
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date" },
          },
          {
            name: "dateField",
            in: "query",
            schema: { type: "string", enum: ["createdAt", "admissionDate"], default: "createdAt" },
          },
          {
            name: "sortBy",
            in: "query",
            schema: { type: "string", enum: ["name", "age", "admissionDate", "createdAt", "condition"], default: "createdAt" },
          },
          {
            name: "sortOrder",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
          },
        ],
        responses: {
          200: {
            description: "Paginated patients list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Patients"],
        summary: "Register new patient",
        description: "Registers patient intake and links record to an existing attending doctor",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreatePatientRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Patient registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientSingleResponse" },
              },
            },
          },
          404: {
            description: "Attending doctor not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/patients/options/filters": {
      get: {
        tags: ["Patients"],
        summary: "Get patient filter choices",
        description: "Returns lists of allowed conditions and genders",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Patient options list",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientFilterOptionsResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/patients/{id}": {
      get: {
        tags: ["Patients"],
        summary: "Get patient by ID",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Patient details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientSingleResponse" },
              },
            },
          },
          404: {
            description: "Patient record not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ApiErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Patients"],
        summary: "Update patient record",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdatePatientRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Patient updated successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientSingleResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Patients"],
        summary: "Delete patient record",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Patient deleted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PatientDeleteResponse" },
              },
            },
          },
        },
      },
    },
    "/api/v1/analytics/dashboard": {
      get: {
        tags: ["Analytics"],
        summary: "Get consolidated dashboard metrics",
        description: "Executes a single-stage MongoDB $facet aggregation pipeline to retrieve KPI counts, doctor workload rankings, condition percentages, and historical admission trends in one round-trip.",
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        responses: {
          200: {
            description: "Consolidated analytics payload",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DashboardAnalyticsResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token obtained from `/api/v1/auth/login`",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "HTTP-Only session cookie automatically dispatched upon login",
      },
    },
    schemas: {
      StandardResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Operation completed successfully" },
        },
      },
      ApiErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          statusCode: { type: "integer", example: 400 },
          message: { type: "string", example: "Validation failed" },
          errors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Please provide a valid email" },
              },
            },
          },
        },
      },
      HealthCheckResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "healthy" },
          uptime: { type: "number", example: 124.5 },
          timestamp: { type: "string", format: "date-time" },
          environment: { type: "string", example: "development" },
        },
      },
      PaginationMeta: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalDocs: { type: "integer", example: 45 },
          totalPages: { type: "integer", example: 5 },
          hasNextPage: { type: "boolean", example: true },
          hasPrevPage: { type: "boolean", example: false },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "admin@doctortracker.com" },
          password: { type: "string", format: "password", example: "Admin@123456" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Authentication successful" },
          data: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", example: "65b9f1a23c4d5e6f7a8b9c0d" },
                  name: { type: "string", example: "Super Administrator" },
                  email: { type: "string", example: "admin@doctortracker.com" },
                  role: { type: "string", example: "admin" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
              token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            },
          },
        },
      },
      UserResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string", example: "Current user profile fetched successfully" },
          data: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  email: { type: "string" },
                  role: { type: "string" },
                  createdAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
        },
      },
      CreateDoctorRequest: {
        type: "object",
        required: ["name", "specialization", "hospital", "phone", "email"],
        properties: {
          name: { type: "string", example: "Dr. Sarah Jenkins", minLength: 3 },
          specialization: { type: "string", example: "Cardiology" },
          hospital: { type: "string", example: "City General Hospital" },
          phone: { type: "string", example: "+1-555-0101" },
          email: { type: "string", format: "email", example: "sarah.jenkins@cityhospital.org" },
          status: { type: "string", enum: ["active", "on-leave"], default: "active" },
        },
      },
      UpdateDoctorRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          specialization: { type: "string" },
          hospital: { type: "string" },
          phone: { type: "string" },
          email: { type: "string", format: "email" },
          status: { type: "string", enum: ["active", "on-leave"] },
        },
      },
      DoctorSingleResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string" },
          data: { $ref: "#/components/schemas/DoctorModel" },
        },
      },
      DoctorModel: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          specialization: { type: "string" },
          hospital: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          status: { type: "string", enum: ["active", "on-leave"] },
          patientCount: { type: "integer", example: 4 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DoctorListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          message: { type: "string" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/DoctorModel" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      DoctorDetailResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: {
            allOf: [
              { $ref: "#/components/schemas/DoctorModel" },
              {
                type: "object",
                properties: {
                  patients: {
                    type: "array",
                    items: { $ref: "#/components/schemas/PatientModel" },
                  },
                },
              },
            ],
          },
        },
      },
      DoctorDeleteResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              deletedDoctorId: { type: "string" },
              removedPatientsCount: { type: "integer" },
            },
          },
        },
      },
      DoctorFilterOptionsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              specializations: { type: "array", items: { type: "string" } },
              hospitals: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      CreatePatientRequest: {
        type: "object",
        required: ["name", "age", "gender", "doctorId", "condition", "contactNumber"],
        properties: {
          name: { type: "string", example: "John Doe", minLength: 2 },
          age: { type: "integer", minimum: 0, maximum: 150, example: 45 },
          gender: { type: "string", enum: ["male", "female", "other"], example: "male" },
          doctorId: { type: "string", example: "65b9f1a23c4d5e6f7a8b9c0d" },
          condition: { type: "string", enum: ["Critical", "Stable", "Under Observation", "Recovered"], example: "Stable" },
          contactNumber: { type: "string", example: "+1-555-4321" },
          admissionDate: { type: "string", format: "date-time" },
        },
      },
      UpdatePatientRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
          gender: { type: "string", enum: ["male", "female", "other"] },
          doctorId: { type: "string" },
          condition: { type: "string", enum: ["Critical", "Stable", "Under Observation", "Recovered"] },
          contactNumber: { type: "string" },
          admissionDate: { type: "string", format: "date-time" },
        },
      },
      PatientModel: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          age: { type: "integer" },
          gender: { type: "string", enum: ["male", "female", "other"] },
          doctorId: { type: "string" },
          condition: { type: "string", enum: ["Critical", "Stable", "Under Observation", "Recovered"] },
          contactNumber: { type: "string" },
          admissionDate: { type: "string", format: "date-time" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          doctor: {
            type: "object",
            properties: {
              name: { type: "string" },
              specialization: { type: "string" },
              hospital: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
            },
          },
        },
      },
      PatientSingleResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: { $ref: "#/components/schemas/PatientModel" },
        },
      },
      PatientListResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/PatientModel" },
          },
          meta: { $ref: "#/components/schemas/PaginationMeta" },
        },
      },
      PatientDeleteResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              deletedPatientId: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
      PatientFilterOptionsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: {
            type: "object",
            properties: {
              conditions: { type: "array", items: { type: "string" } },
              genders: { type: "array", items: { type: "string" } },
            },
          },
        },
      },
      DashboardAnalyticsResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          statusCode: { type: "integer", example: 200 },
          data: {
            type: "object",
            properties: {
              kpis: {
                type: "object",
                properties: {
                  totalDoctors: { type: "integer", example: 15 },
                  activeDoctors: { type: "integer", example: 14 },
                  totalPatients: { type: "integer", example: 65 },
                  criticalPatients: { type: "integer", example: 10 },
                  stablePatients: { type: "integer", example: 35 },
                  underObservationPatients: { type: "integer", example: 12 },
                  recoveredPatients: { type: "integer", example: 8 },
                  avgPatientsPerDoctor: { type: "number", example: 4.6 },
                },
              },
              patientsPerDoctor: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    doctorId: { type: "string" },
                    doctorName: { type: "string" },
                    specialization: { type: "string" },
                    hospital: { type: "string" },
                    patientCount: { type: "integer" },
                  },
                },
              },
              conditionDistribution: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    condition: { type: "string" },
                    count: { type: "integer" },
                    percentage: { type: "number" },
                  },
                },
              },
              specializationDistribution: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    specialization: { type: "string" },
                    doctorCount: { type: "integer" },
                  },
                },
              },
              admissionTrends: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    date: { type: "string", example: "2026-11-15" },
                    count: { type: "integer", example: 4 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

/**
 * Mounts interactive Swagger UI and OpenAPI JSON document endpoints on the Express app.
 */
export const setupSwagger = (app: Application): void => {
  const swaggerCustomOptions: swaggerUi.SwaggerUiOptions = {
    customSiteTitle: "Doctor Tracker API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  };

  // Serve raw OpenAPI JSON document
  app.get("/api-docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiSpec);
  });

  app.get("/docs/swagger.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(openApiSpec);
  });

  // Mount Swagger UI on /api-docs and /docs
  app.use("/api-docs", swaggerUi.serveFiles(openApiSpec, swaggerCustomOptions), swaggerUi.setup(openApiSpec, swaggerCustomOptions));
  app.use("/docs", swaggerUi.serveFiles(openApiSpec, swaggerCustomOptions), swaggerUi.setup(openApiSpec, swaggerCustomOptions));

  console.log("📑 Swagger API documentation initialized at /api-docs and /docs");
};
