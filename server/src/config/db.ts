import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connects to MongoDB using Mongoose with enterprise connection pooling
 * and event-driven logging.
 */
export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 20, // Maintain up to 20 socket connections for high concurrency
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`✅ MongoDB connected successfully to: ${connection.connection.host}/${connection.connection.name}`);

    // Register runtime connection lifecycle listeners
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB connection disconnected. Retrying...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected successfully.");
    });

    return connection;
  } catch (error) {
    console.error("❌ Fatal error connecting to MongoDB:", error);
    process.exit(1);
  }
};

/**
 * Closes the active MongoDB connection cleanly (used for testing and graceful shutdowns).
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection cleanly terminated.");
  } catch (error) {
    console.error("❌ Error while closing MongoDB connection:", error);
  }
};
