import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { WhatsAppService } from "../../services/whatsapp.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const { phone, message } = req.body;

  const whatsappService = WhatsAppService.getInstance();
  
  if (!whatsappService.getStatus().isReady) {
    return sendResponse(res, {
      statusCode: httpStatus.SERVICE_UNAVAILABLE,
      success: false,
      message: "WhatsApp Client is not ready yet. Please authenticate via QR code.",
      data: null,
    });
  }

  // Handle message sending (queue implicitly handled by WA Web JS)
  const result = await whatsappService.sendMessage(phone, message);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent successfully via WhatsApp",
    data: {
      messageId: result.id._serialized,
      timestamp: result.timestamp,
    },
  });
});

const getStatus = catchAsync(async (req: Request, res: Response) => {
  const whatsappService = WhatsAppService.getInstance();
  const status = whatsappService.getStatus();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: status.isReady ? "WhatsApp Client is connected and ready." : "WhatsApp Client is not connected.",
    data: status,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const whatsappService = WhatsAppService.getInstance();

  if (!whatsappService.getStatus().isReady) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "WhatsApp Client is not connected. Nothing to logout.",
      data: null,
    });
  }

  await whatsappService.logout();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "WhatsApp Client logged out successfully.",
    data: null,
  });
});

export const MessageController = {
  sendMessage,
  getStatus,
  logout,
};
