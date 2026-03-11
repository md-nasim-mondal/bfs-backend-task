import request from "supertest";
import app from "../src/app";
import { WhatsAppService } from "../src/app/services/whatsapp.service";

// Mock the WhatsApp and Socket Services to avoid hitting APIs and hanging handles
jest.mock("../src/app/services/whatsapp.service");
jest.mock("../src/app/services/socket.service", () => ({
  SocketService: {
    initialize: jest.fn(),
    getInstance: jest.fn().mockReturnValue({ emit: jest.fn() }),
  }
}));

describe("Message API Endpoints", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/messages", () => {
    it("should return 400 if validation fails (missing phone)", async () => {
      const response = await request(app)
        .post("/api/v1/messages")
        .send({
          message: "Test message",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Validation Error");
    });

    it("should return 400 if validation fails (missing message)", async () => {
      const response = await request(app)
        .post("/api/v1/messages")
        .send({
          phone: "1234567890",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Validation Error");
    });

    it("should return 503 if WhatsApp client is not ready", async () => {
      // Mock the getStatus method to return isReady: false
      const mockWhatsAppService = {
        getStatus: jest.fn().mockReturnValue({ isReady: false }),
        sendMessage: jest.fn(),
      };
      (WhatsAppService.getInstance as jest.Mock).mockReturnValue(mockWhatsAppService);

      const response = await request(app)
        .post("/api/v1/messages")
        .send({
          phone: "1234567890",
          message: "Test message",
        });

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("WhatsApp Client is not ready yet. Please authenticate via QR code.");
    });

    it("should return 200 and send message successfully if client is ready", async () => {
      // Mock the getStatus method to return isReady: true
      const mockWhatsAppService = {
        getStatus: jest.fn().mockReturnValue({ isReady: true }),
        sendMessage: jest.fn().mockResolvedValue({
          id: { _serialized: "mock_id_123" },
          timestamp: 1629812938,
        }),
      };
      (WhatsAppService.getInstance as jest.Mock).mockReturnValue(mockWhatsAppService);

      const response = await request(app)
        .post("/api/v1/messages")
        .send({
          phone: "1234567890",
          message: "Test message",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Message sent successfully via WhatsApp");
      expect(response.body.data.messageId).toBe("mock_id_123");

      expect(mockWhatsAppService.sendMessage).toHaveBeenCalledWith("1234567890", "Test message");
    });
  });
});
