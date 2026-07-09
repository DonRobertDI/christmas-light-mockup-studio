import { Router } from "express";
import { createMockup } from "../controllers/mockup.controller.js";
import { uploadMockupImages } from "../middleware/upload.js";

export const mockupRouter = Router({ mergeParams: true });

mockupRouter.post("/", uploadMockupImages, createMockup);
