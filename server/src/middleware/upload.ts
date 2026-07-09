import fs from "node:fs";
import multer from "multer";
import { createStoredFilename, uploadFolderPath } from "../utils/file.js";

const storage = multer.diskStorage({
  destination: (_request, file, callback) => {
    const folder = file.fieldname === "original" ? "originals" : "references";
    const destination = uploadFolderPath(folder);
    fs.mkdirSync(destination, { recursive: true });
    callback(null, destination);
  },
  filename: (_request, file, callback) => {
    callback(null, createStoredFilename(file.originalname, file.mimetype));
  },
});

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const uploadMockupImages = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
    files: 2,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new Error("Only JPG, PNG, and WebP images are supported."));
      return;
    }
    callback(null, true);
  },
}).fields([
  { name: "original", maxCount: 1 },
  { name: "reference", maxCount: 1 },
]);
