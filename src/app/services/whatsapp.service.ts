import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode";
import { SocketService } from "./socket.service";
import { logger } from "../utils/logger";

export class WhatsAppService {
  private static instance: WhatsAppService;
  private client: Client;
  private isReady = false;
  
  // Explicit queueing for processing concurrent requests sequentially
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: { phone: string; message: string; resolve: (val: any) => void; reject: (err: any) => void }[] = [];
  private isProcessingQueue = false;

  private constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        executablePath: "/usr/bin/google-chrome-stable",
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.initialize();
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  private initialize() {
    this.client.on("qr", async (qr) => {
      logger.info("QR Code received, scan it with WhatsApp!");
      try {
        // Print QR code in terminal for easy scanning
        const terminalQR = await qrcode.toString(qr, { type: "terminal", small: true });
        console.log("\n" + terminalQR + "\n");

        // Also send as image to browser clients via Socket.IO
        const qrImage = await qrcode.toDataURL(qr);
        SocketService.getInstance().emit("qr", qrImage);
      } catch (err) {
        logger.error("Failed to generate QR code image", err);
      }
    });

    this.client.on("ready", () => {
      logger.info("WhatsApp Client is ready!");
      this.isReady = true;
      SocketService.getInstance().emit("ready", { status: "ready" });
    });

    this.client.on("authenticated", () => {
      logger.info("WhatsApp Authentication successful!");
      SocketService.getInstance().emit("authenticated", { status: "authenticated" });
    });

    this.client.on("auth_failure", (msg) => {
      logger.error("WhatsApp Authentication failure", msg);
      this.isReady = false;
      SocketService.getInstance().emit("auth_failure", { message: msg });
    });

    this.client.on("disconnected", (reason) => {
      logger.info("WhatsApp Client was disconnected", reason);
      this.isReady = false;
      SocketService.getInstance().emit("disconnected", { reason });
      
      // Auto reconnect
      setTimeout(() => {
        logger.info("Attempting to reconnect...");
        this.client.initialize();
      }, 5000);
    });

    this.client.initialize().catch((err) => {
      logger.error("Failed to initialize WhatsApp client:", err);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async sendMessage(phone: string, message: string): Promise<any> {
    if (!this.isReady) {
      throw new Error("WhatsApp client is not ready. Please scan the QR code.");
    }

    const formattedPhone = phone.includes("@c.us") ? phone : `${phone}@c.us`;
    
    return new Promise((resolve, reject) => {
      this.queue.push({ phone: formattedPhone, message, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    const task = this.queue.shift();

    if (task) {
      try {
        const response = await this.client.sendMessage(task.phone, task.message);
        logger.info(`Message delivered implicitly to ${task.phone}`);
        task.resolve(response);
      } catch (error) {
        logger.error(`Failed to send message to ${task.phone}:`, error);
        task.reject(error);
      }
    }

    this.isProcessingQueue = false;
    this.processQueue();
  }

  public getStatus() {
    return {
      isReady: this.isReady,
    };
  }

  public async logout(): Promise<void> {
    if (this.isReady) {
      await this.client.logout();
      this.isReady = false;
      logger.info("WhatsApp Client logged out successfully.");
      
      // Destroy old client and create a fresh one for re-authentication
      await this.client.destroy();
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          executablePath: "/usr/bin/google-chrome-stable",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      });
      this.initialize();
    }
  }
}
