import { Router } from "express";
import { MessageController } from "./message.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { MessageValidation } from "./message.validation";

const route = Router();

route.post(
  "/",
  validateRequest(MessageValidation.sendMessageSchema),
  MessageController.sendMessage
);

export const MessageRoutes = route;
