import winston from "winston";
import "winston-mongodb";
import { envVars } from "../config/env";

const DB_NAME = "whatsapp-backend-logs";

const { combine, timestamp, printf, colorize } = winston.format;

const myFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: envVars.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    myFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), myFormat),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.MongoDB({
      db: `${envVars.DB_URL}/${DB_NAME}`,
      collection: "logs",
      level: "info",
      options: { useUnifiedTopology: true },
      metaKey: "meta",
    }),
  ],
});
