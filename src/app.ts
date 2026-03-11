import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { envVars } from "./app/config/env";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: envVars.FRONTEND_URL,
    credentials: true,
  })
);

app.use("/api", limiter);

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to WhatsApp Web Integration API!",
  });
});

app.use(globalErrorHandler);

app.use(notFound);

export default app;
