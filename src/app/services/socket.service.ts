import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { envVars } from "../config/env";
import { logger } from "../utils/logger";

export class SocketService {
  private static instance: SocketService;
  private io: Server;

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: envVars.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.io.on("connection", (socket: Socket) => {
      logger.info(`🔌 Client connected: ${socket.id}`);
      
      // Emit current status to the newly connected client
      // We use a lazy import to avoid circular dependency at module load time
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { WhatsAppService } = require("./whatsapp.service");
      try {
        const status = WhatsAppService.getInstance().getStatus();
        if (status.isReady) {
          socket.emit("ready", { status: "ready" });
        }
      } catch {
        // WhatsApp service not yet initialized, ignore
      }

      socket.on("disconnect", () => {
        logger.info(`🔌 Client disconnected: ${socket.id}`);
      });
    });
  }

  public static initialize(httpServer: HttpServer): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService(httpServer);
    }
    return SocketService.instance;
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      throw new Error("SocketService has not been initialized. Call initialize() first.");
    }
    return SocketService.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(event: string, data: any) {
    this.io.emit(event, data);
  }
}
