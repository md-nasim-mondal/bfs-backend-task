import { z } from "zod";

export const sendMessageSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message is required"),
});

export const MessageValidation = {
  sendMessageSchema,
};

