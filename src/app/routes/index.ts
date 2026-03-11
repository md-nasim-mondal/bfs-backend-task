/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from "express";
import { MessageRoutes } from "../modules/message/message.route";

export const router = Router();

const moduleRoutes: any[] = [
  {
    path: "/messages",
    route: MessageRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
