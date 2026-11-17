import { createServer } from "http";
import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";
import { ensureAdminAccount } from "./services/auth.service.js";
import { seedDataset } from "./utils/seeder.js";

/**
 * Boots the HTTP server and establishes persistent database connectivity.
 */
const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  // Ensure default administrator account is available
  await ensureAdminAccount();

  // Auto-populate dataset if database has 0 doctors
  await seedDataset(true);

  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`🚀 Doctor Tracker Server listening on http://localhost:${env.PORT}`);
    console.log(`🌐 Allowed CORS Client: ${env.CLIENT_URL}`);
    console.log(`⚙️  Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
    server.close(async () => {
      console.log("💤 HTTP server closed.");
      await disconnectDatabase();
      console.log("👋 Process exiting cleanly.");
      process.exit(0);
    });

    // Force exit after 10 seconds if hanging
    setTimeout(() => {
      console.error("⚠️ Forcefully shutting down after timeout.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection at:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("💥 Uncaught Exception:", error);
    process.exit(1);
  });
};

startServer();
