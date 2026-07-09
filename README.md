# Christmas Light Mockup Studio

An internal sales tool for Monster Pro Wash to organize prospective customers and create photorealistic Christmas light concepts from real property photos.

The studio is designed around a practical home-service workflow: create a customer using only a name and address, upload the customer’s house plus a lighting-style reference, add optional installer notes, and generate a proposal-ready image. Every source image, generated result, prompt, and timestamp is automatically retained with the customer.

## Product highlights

- Persistent customer records with searchable, responsive list and detail views
- Per-customer mockup galleries that remain available across sessions
- Side-by-side source image previews before generation
- Server-only OpenAI Image Edits integration with a structured preservation prompt
- SQLite migrations and relational `customers` / `mockups` tables
- Organized local file storage with unique filenames and guarded static serving
- Upload validation, helpful empty states, generation progress, and actionable errors
- No frontend API key, browser storage database, or third-party AI provider

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite with `better-sqlite3` |
| Uploads | Multer, local filesystem |
| AI | OpenAI Image Edits API using `gpt-image-2` |
| Quality | ESLint, strict TypeScript |

## Project structure

```text
.
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       │   ├── CustomerListPage.tsx
│       │   ├── CustomerDetailPage.tsx
│       │   └── GenerateMockupPage.tsx
│       ├── services/api.ts
│       └── types.ts
├── server/
│   ├── data/
│   └── src/
│       ├── controllers/
│       ├── db/database.ts
│       ├── middleware/upload.ts
│       ├── routes/
│       ├── services/openai.service.ts
│       ├── utils/file.ts
│       ├── app.ts
│       └── index.ts
└── uploads/
    ├── originals/
    ├── references/
    └── generated/
```

## Setup

### Prerequisites

- Node.js 20 or newer
- npm
- An OpenAI API key with access to GPT Image models

Some OpenAI organizations may need to complete organization verification before using GPT Image models. See the [official image generation guide](https://developers.openai.com/api/docs/guides/image-generation).

### Install and run

1. Install all workspace dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Add your OpenAI API key to `.env`.

4. Start the frontend and backend together:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173`.

The API runs at `http://localhost:3100`. Vite proxies `/api` and `/uploads` to it during development.

## Environment variables

```dotenv
OPENAI_API_KEY=
PORT=3000
DATABASE_PATH=./server/data/database.sqlite
```

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-side OpenAI credential. Never exposed to the client. |
| `PORT` | Express API port. Defaults to `3000`. |
| `DATABASE_PATH` | SQLite file location, resolved from the project root. |

Do not commit `.env`; it is ignored by Git.

## How AI generation works

The browser submits a multipart request containing:

1. The customer’s house photo, used as the primary preservation image
2. A reference image, used only for lighting style, color, spacing, and mood
3. Optional customer or installer instructions

The backend builds a detailed prompt containing the saved property address, the user’s notes, explicit input-image roles, installation guidance, and strict house-preservation constraints. It then sends both images to the OpenAI Image Edits endpoint using `gpt-image-2`.

The service requests a landscape JPEG at medium quality. When OpenAI returns the base64 result, the backend writes it to local storage and creates the database record in the same request. The browser never receives or stores the API key.

The prompt intentionally tells the model to preserve:

- Roof geometry and architectural structure
- Windows, doors, driveway, landscaping, perspective, and crop
- The identity of the original property

The reference image is explicitly limited to aesthetic lighting guidance so its architecture does not replace the customer’s home.

## Database and storage

The database initializes automatically on server startup. Migrations are tracked in `schema_migrations`.

### `customers`

- `id`
- `name`
- `address`
- `created_at`

### `mockups`

- `id`
- `customer_id`
- `original_image_path`
- `reference_image_path`
- `generated_image_path`
- `prompt`
- `created_at`

Mockups use a foreign key with cascade deletion and are indexed by customer and creation time.

Uploaded files are stored using randomized filenames:

- `uploads/originals`
- `uploads/references`
- `uploads/generated`

Only supported image types up to 15 MB are accepted. Express serves the upload root without directory indexes or dotfiles.

## Available scripts

```bash
npm run dev        # Run client and server with live reload
npm run build      # Compile both production bundles
npm run typecheck  # Strict TypeScript checks
npm run lint       # Lint frontend and backend source
npm start          # Run the compiled backend
```

## Known limitations

- Images are stored on the local application filesystem; multi-instance deployments need object storage.
- Generation is request/response based. A production deployment should use a background job queue for retries and long-running work.
- The MVP has no authentication or employee roles and should not be exposed publicly as-is.
- GPT Image can occasionally shift small property details despite strong preservation instructions. Every result should be reviewed before presenting it as an install plan.
- There is no delete/archive flow yet, so orphan cleanup and retention policies are not automated.
- The generated mockup is a sales visualization, not an exact engineering takeoff or guaranteed bulb count.

## Future improvements

- Staff authentication, roles, and audit history
- Cloud object storage with signed URLs and automatic retention rules
- Background generation jobs with live status updates and retry controls
- Multiple concepts per request and side-by-side customer approval
- Quote, linear-foot, and estimated bulb-count integration
- Address normalization and CRM synchronization
- Prompt/version tracking and image-generation cost telemetry
- Mask-based editing for installer-directed placement corrections
- Automated tests for API routes, migrations, and primary UI workflows
