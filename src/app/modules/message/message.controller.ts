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

export const MessageController = {
  sendMessage,
};
