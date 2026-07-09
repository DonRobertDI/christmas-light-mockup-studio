import { initializeDatabase } from "./db/database.js";
import { ensureUploadDirectories } from "./utils/file.js";

let initialized = false;

export function initializeRuntime() {
  if (initialized) {
    return;
  }

  initializeDatabase();
  ensureUploadDirectories();
  initialized = true;
}
