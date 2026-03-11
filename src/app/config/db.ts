import mongoose from "mongoose";
import { envVars } from "./env";
import { logger } from "../utils/logger";

const DB_NAME = "whatsapp-backend-logs";

export const connectDB = async () => {
  try {
    await mongoose.connect(envVars.DB_URL, {
      dbName: DB_NAME,
    });
    logger.info(`MongoDB connected successfully to database: ${DB_NAME}`);
  } catch (error) {
    logger.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
