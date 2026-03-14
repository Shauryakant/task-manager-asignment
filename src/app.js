import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(publicDir));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api", notFoundHandler);

app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.use(errorHandler);

export default app;
