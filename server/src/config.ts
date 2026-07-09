import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const projectRoot = path.resolve(serverDirectory, "..");

dotenv.config({ path: path.join(projectRoot, ".env") });

const resolveProjectPath = (value: string) =>
  path.isAbsolute(value) ? value : path.resolve(projectRoot, value);

export const config = {
  port: Number(process.env.PORT) || 3000,
  databasePath: resolveProjectPath(
    process.env.DATABASE_PATH ?? "./server/data/database.sqlite",
  ),
  uploadRoot: path.join(projectRoot, "uploads"),
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
};
