import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const projectRoot = path.resolve(serverDirectory, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

const resolveProjectPath = (value: string) =>
  path.isAbsolute(value) ? value : path.resolve(projectRoot, value);

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3000,
  databasePath: resolveProjectPath(
    process.env.DATABASE_PATH ?? "./server/data/database.sqlite",
  ),
  uploadRoot: resolveProjectPath(process.env.UPLOAD_ROOT ?? "./uploads"),
  clientUrl: process.env.CLIENT_URL?.trim() || "",
  clientDistPath: path.join(projectRoot, "client", "dist"),
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
};
