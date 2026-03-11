import { Router } from "express";
import { MessageController } from "./message.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { MessageValidation } from "./message.validation";

const route = Router();

route.get(
  "/status",
  MessageController.getStatus
);

route.post(
  "/",
  validateRequest(MessageValidation.sendMessageSchema),
  MessageController.sendMessage
);

route.post(
  "/logout",
  MessageController.logout
);

export const MessageRoutes = route;
