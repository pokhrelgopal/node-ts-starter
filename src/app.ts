import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { frontendUrl } from "./config";
import { loggerMiddleware, limiter } from "./middleware";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);

app.use("/api", limiter);
app.use(loggerMiddleware);
app.use("/api/users", routes.userRoutes);

export default app;
