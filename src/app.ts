import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes";
import { loggerMiddleware } from "./middleware.ts/logger.middleware";
import { frontendUrl } from "./config";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use(loggerMiddleware);
app.use("/api/users", routes.userRoutes);

export default app;
