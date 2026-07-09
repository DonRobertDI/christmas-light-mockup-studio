import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import { database } from "../db/database.js";
import { generateChristmasMockup } from "../services/openai.service.js";
import {
  generatedFilePath,
  removeFileIfPresent,
  toPublicUploadPath,
} from "../utils/file.js";

const instructionsSchema = z.string().trim().max(1500).optional();

interface CustomerRow {
  id: string;
  address: string;
}

function uploadedFiles(request: Request) {
  const files = request.files as
    | Record<string, Express.Multer.File[]>
    | undefined;
  return {
    original: files?.original?.[0],
    reference: files?.reference?.[0],
  };
}

export async function createMockup(request: Request, response: Response) {
  const { original, reference } = uploadedFiles(request);
  const cleanUpUploads = () => {
    removeFileIfPresent(original?.path);
    removeFileIfPresent(reference?.path);
  };

  if (!original || !reference) {
    cleanUpUploads();
    response.status(400).json({
      message: "Upload both the customer house photo and a style reference image.",
    });
    return;
  }

  const instructions = instructionsSchema.safeParse(request.body.instructions);
  if (!instructions.success) {
    cleanUpUploads();
    response.status(400).json({
      message: "Instructions must be 1,500 characters or fewer.",
    });
    return;
  }

  const customer = database
    .prepare("SELECT id, address FROM customers WHERE id = ?")
    .get(request.params.customerId) as CustomerRow | undefined;

  if (!customer) {
    cleanUpUploads();
    response.status(404).json({ message: "Customer not found." });
    return;
  }

  let generatedFilename: string | undefined;
  try {
    const generated = await generateChristmasMockup({
      customerAddress: customer.address,
      userInstructions: instructions.data,
      originalImage: original,
      referenceImage: reference,
    });
    generatedFilename = generated.filename;

    const mockup = {
      id: randomUUID(),
      customerId: customer.id,
      originalImagePath: toPublicUploadPath("originals", original.filename),
      referenceImagePath: toPublicUploadPath("references", reference.filename),
      generatedMockupImagePath: toPublicUploadPath(
        "generated",
        generated.filename,
      ),
      prompt: generated.prompt,
      createdAt: new Date().toISOString(),
    };

    database
      .prepare(
        `INSERT INTO mockups (
          id, customer_id, original_image_path, reference_image_path,
          generated_image_path, prompt, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        mockup.id,
        mockup.customerId,
        mockup.originalImagePath,
        mockup.referenceImagePath,
        mockup.generatedMockupImagePath,
        mockup.prompt,
        mockup.createdAt,
      );

    response.status(201).json(mockup);
  } catch (error) {
    cleanUpUploads();
    if (generatedFilename) {
      removeFileIfPresent(generatedFilePath(generatedFilename));
    }
    console.error("Mockup generation failed", error);
    response.status(502).json({
      message:
        error instanceof Error
          ? error.message
          : "The mockup could not be generated.",
    });
  }
}
