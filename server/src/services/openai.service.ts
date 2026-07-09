import fs from "node:fs";
import path from "node:path";
import OpenAI, { toFile } from "openai";
import { config } from "../config.js";
import { createStoredFilename, generatedFilePath } from "../utils/file.js";

interface GenerateMockupInput {
  customerAddress: string;
  userInstructions?: string;
  originalImage: Express.Multer.File;
  referenceImage: Express.Multer.File;
}

export function buildMockupPrompt(
  customerAddress: string,
  userInstructions?: string,
) {
  const instructions = userInstructions?.trim() || "No additional customer preferences were provided.";

  return `Create a photorealistic Christmas light installation sales mockup for the home at ${customerAddress}.

INPUT IMAGE ROLES
- Image 1 is the customer's real house and is the primary composition. Preserve it faithfully.
- Image 2 is style inspiration only. Transfer the lighting style, color temperature, bulb spacing, density, and overall holiday mood from this reference without copying its building, landscaping, camera angle, or architecture.

INSTALLATION BRIEF
- Add professionally installed, realistic exterior Christmas lights to the customer's house.
- Follow this customer/design note: ${instructions}
- Favor clean, serviceable installation lines on rooflines, eaves, gutters, peaks, columns, porch edges, and suitable landscaping visible in Image 1.
- Make bulb scale, wire routing, spacing, brightness, reflections, and shadows physically believable.
- Keep the result polished enough to present in a home-service estimate.

STRICT PRESERVATION RULES
- Keep the exact house structure, roof geometry, windows, doors, driveway, landscaping, perspective, crop, and camera position from Image 1.
- Do not redesign, rebuild, widen, remove, or invent architectural features.
- Do not replace the house with the house from Image 2.
- Do not add people, vehicles, signs, logos, text, watermarks, snow, or decorations not requested.
- Preserve daytime/twilight conditions unless a subtle exposure adjustment is needed to make the lights visible.
- The finished image must still be immediately recognizable as the same property in Image 1.

Return one landscape-oriented, high-quality, photorealistic edited image.`;
}

function friendlyOpenAiError(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    if (error.status === 401) {
      return new Error("OpenAI authentication failed. Check the server API key.");
    }
    if (error.status === 429) {
      return new Error("OpenAI is currently rate-limited. Please wait a moment and try again.");
    }
    if (error.code === "moderation_blocked") {
      return new Error(
        "This request could not be generated. Try revising the instructions or input images.",
      );
    }
    if (error.status >= 500) {
      return new Error("OpenAI is temporarily unavailable. Please try again shortly.");
    }
  }
  return error instanceof Error ? error : new Error("Image generation failed.");
}

export async function generateChristmasMockup(input: GenerateMockupInput) {
  if (!config.openAiApiKey) {
    throw new Error(
      "OpenAI is not configured. Add OPENAI_API_KEY to the server environment.",
    );
  }

  const prompt = buildMockupPrompt(input.customerAddress, input.userInstructions);
  const client = new OpenAI({ apiKey: config.openAiApiKey });

  try {
    const images = await Promise.all([
      toFile(fs.createReadStream(input.originalImage.path), input.originalImage.originalname, {
        type: input.originalImage.mimetype,
      }),
      toFile(fs.createReadStream(input.referenceImage.path), input.referenceImage.originalname, {
        type: input.referenceImage.mimetype,
      }),
    ]);

    const response = await client.images.edit({
      model: "gpt-image-2",
      image: images,
      prompt,
      quality: "medium",
      size: "1536x1024",
      output_format: "jpeg",
    });

    const imageData = response.data?.[0]?.b64_json;
    if (!imageData) {
      throw new Error("OpenAI returned no image data.");
    }

    const filename = createStoredFilename("mockup.jpg");
    fs.writeFileSync(generatedFilePath(filename), Buffer.from(imageData, "base64"));

    return { filename: path.basename(filename), prompt };
  } catch (error) {
    throw friendlyOpenAiError(error);
  }
}
