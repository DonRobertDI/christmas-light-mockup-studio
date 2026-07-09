import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";

const folders = ["originals", "references", "generated"] as const;
type UploadFolder = (typeof folders)[number];

export function ensureUploadDirectories() {
  fs.mkdirSync(config.uploadRoot, { recursive: true });

  for (const folder of folders) {
    fs.mkdirSync(uploadFolderPath(folder), { recursive: true });
  }
}

export function uploadFolderPath(folder: UploadFolder) {
  return path.join(config.uploadRoot, folder);
}

export function createStoredFilename(originalName: string, mimeType?: string) {
  const safeExtensions: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  const extension =
    (mimeType && safeExtensions[mimeType]) ||
    path.extname(originalName).toLowerCase() ||
    ".jpg";
  return `${Date.now()}-${randomUUID()}${extension}`;
}

export function toPublicUploadPath(folder: UploadFolder, filename: string) {
  return `/uploads/${folder}/${filename}`;
}

export function generatedFilePath(filename: string) {
  return path.join(uploadFolderPath("generated"), filename);
}

export function removeFileIfPresent(filePath?: string) {
  if (!filePath) return;
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Unable to clean up file", { filePath, error });
    }
  }
}
