import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const projectRoot = path.resolve(serverDirectory, "..");
const runtimeWritableRoot = process.env.VERCEL
  ? path.join("/tmp", "christmas-light-mockup-studio")
  : projectRoot;

dotenv.config({ path: path.join(projectRoot, ".env") });

const resolveRuntimePath = (value: string) =>
  path.isAbsolute(value) ? value : path.resolve(runtimeWritableRoot, value);

const resolveDatabasePath = (value: string) => {
  const resolved = resolveRuntimePath(value);
  const extension = path.extname(resolved).toLowerCase();

  if (extension === ".sqlite" || extension === ".db") {
    return resolved.slice(0, -extension.length) + ".json";
  }

  return extension ? resolved : `${resolved}.json`;
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === "production",
  isVercel: Boolean(process.env.VERCEL),
  databasePath: resolveDatabasePath(
    process.env.DATABASE_PATH ?? "./server/data/database.json",
  ),
  uploadRoot: resolveRuntimePath("./uploads"),
  clientDistRoot: path.join(projectRoot, "client", "dist"),
  openAiApiKey: process.env.OPENAI_API_KEY?.trim() ?? "",
};
