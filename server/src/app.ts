import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

import apiRouter from "./routes/index.js";

const app: Application = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration for cross-origin frontend communication
app.use(
  cors({
    origin: [env.CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true, // Allow HTTP-Only cookies to pass through
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// 3. Request Logging (colorized in development)
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
}

// 4. Request Body & Cookie Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// 5. System Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// 6. Mount REST API v1 routes
app.use("/api/v1", apiRouter);

// 7. Error Handling Pipeline
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
