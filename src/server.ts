import { Server } from "http";
import app from "./app";
import { envVars } from "./app/config/env";
import { SocketService } from "./app/services/socket.service";
import { WhatsAppService } from "./app/services/whatsapp.service";
import { logger } from "./app/utils/logger";

let server: Server;

const startServer = async () => {
  try {
    server = app.listen(envVars.PORT, () => {
      logger.info(`Server is listening to port ${envVars.PORT}`);
    });

    // Initialize Socket.io
    SocketService.initialize(server);
    logger.info("Socket.IO initialized");

    // Initialize WhatsApp Client after Socket.io
    WhatsAppService.getInstance();
    logger.info("WhatsApp Service initialized");
  } catch (error) {
    logger.error("Error during server startup:", error);
  }
};

(async () => {
  await startServer();
})();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  logger.error("Unhandled Error / Exception detected... Server shutting down..", error);
  exitHandler();
};

process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received...");
  exitHandler();
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received...");
  exitHandler();
});

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);