import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import multer from "multer";
import { config } from "./config.js";
import { customerRouter } from "./routes/customer.routes.js";
import { mockupRouter } from "./routes/mockup.routes.js";
import { removeFileIfPresent } from "./utils/file.js";

export const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
const corsOrigin =
  config.clientUrl ||
  (config.nodeEnv !== "production" ? "http://localhost:5173" : undefined);

if (corsOrigin) {
  app.use(cors({ origin: corsOrigin }));
}
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    aiConfigured: Boolean(config.openAiApiKey),
  });
});
app.use("/api/customers", customerRouter);
app.use("/api/customers/:customerId/mockups", mockupRouter);

app.use(
  "/uploads",
  express.static(config.uploadRoot, {
    dotfiles: "deny",
    fallthrough: false,
    immutable: true,
    maxAge: "1d",
    index: false,
  }),
);

if (config.nodeEnv === "production" && fs.existsSync(config.clientDistPath)) {
  app.use(express.static(config.clientDistPath, { index: false }));

  app.use((request, response, next) => {
    if (
      request.method !== "GET" ||
      request.path === "/api" ||
      request.path.startsWith("/api/") ||
      request.path === "/uploads" ||
      request.path.startsWith("/uploads/") ||
      !request.accepts("html")
    ) {
      next();
      return;
    }

    response.sendFile(path.join(config.clientDistPath, "index.html"));
  });
}

app.use((_request, response) => {
  response.status(404).json({ message: "Route not found." });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    const uploadedFiles = _request.files as
      | Record<string, Express.Multer.File[]>
      | undefined;
    Object.values(uploadedFiles ?? {})
      .flat()
      .forEach((file) => removeFileIfPresent(file.path));

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Each image must be smaller than 15 MB."
          : "The image upload could not be processed.";
      response.status(400).json({ message });
      return;
    }

    if (error instanceof Error) {
      const status =
        "status" in error && typeof error.status === "number"
          ? error.status
          : "statusCode" in error && typeof error.statusCode === "number"
            ? error.statusCode
            : 400;
      response.status(status).json({ message: error.message });
      return;
    }

    response.status(500).json({ message: "An unexpected server error occurred." });
  },
);
