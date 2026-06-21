# CoinAtlas

CoinAtlas is an open-source, self-hosted collection manager for coins, banknotes, medals, and similar numismatic objects. It is built for private cataloging first, with an optional public showcase for the items you choose to publish.

The app is designed for personal collections. OCR, AI, and Numista support identification and cataloging, but the collector stays in control of the final data.

## What It Does

- Keep a private catalog with editable metadata
- Upload obverse and reverse images to local storage
- Search your collection by text or image-assisted OCR
- Run an identification flow with OCR, AI, and Numista matches
- Import external match data into an editable coin form
- Publish selected items to a public showcase
- Export the collection as JSON or CSV

## Public And Admin Surfaces

CoinAtlas has two surfaces:

- Public site: `/`
- Admin panel: everything behind `/login`

Public visitors can only see records that are marked as published.

Admin users can:

- manage the full collection
- create and edit records
- upload images
- identify coins from images or text
- search the local collection
- review provider configuration
- export data
- control which items appear publicly

This is intentionally a shared-login system, not a multi-user account system.

## Main Features

- Shared admin login using env-based credentials
- Cookie-based admin session
- Public showcase homepage for published items
- Public detail pages for published items only
- Coin CRUD with editable metadata
- Publish/private toggle in both edit flow and collection list
- Local SQLite database with Drizzle ORM
- Local image uploads
- OCR and AI-assisted identification
- Numista text search and type import
- Local search with optional image-assisted query extraction
- Provider health view without exposing secret values
- JSON and CSV export routes

## Stack

- Next.js App Router
- TypeScript
- SQLite
- Drizzle ORM
- Tailwind CSS
- Server Actions
- Route Handlers

## Routes

### Public

- `/` public showcase
- `/collection/[id]` public detail page for a published item

### Admin

- `/login`
- `/dashboard`
- `/coins`
- `/coins/new`
- `/coins/[id]`
- `/coins/[id]/edit`
- `/identify`
- `/search`
- `/settings`

### Export

- `/api/export/json`
- `/api/export/csv`

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create a local env file

```bash
cp .env.example .env
```

3. Fill in the values you need

- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `AUTH_SECRET` are required for admin login
- `NUMISTA_API_KEY` is required for Numista search and import
- `GOOGLE_API_KEY` is required for Gemini OCR and image analysis

4. Start the dev server

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

The SQLite database is created automatically. If an older local database is missing the `is_published` column, CoinAtlas adds it on boot.

## Environment Variables

```env
DATABASE_URL="file:./dev.db"

ADMIN_USERNAME=""
ADMIN_PASSWORD=""
AUTH_SECRET=""

NUMISTA_API_KEY=""
NUMISTA_API_BASE_URL="https://api.numista.com/v3"

GOOGLE_API_KEY=""
GOOGLE_OCR_PROVIDER="gemini"
AI_PROVIDER="gemini"

UPLOAD_DIR="./uploads"
MAX_UPLOAD_SIZE_MB="10"
```

### Notes

- `AUTH_SECRET` should be a strong random value
- `UPLOAD_DIR` is local storage for uploaded images
- `DATABASE_URL` defaults to a local SQLite file

Example secret generation:

```bash
openssl rand -hex 32
```

## Publish Workflow

Items are private by default.

To make an item public:

1. Create or edit the record
2. Enable `Publish publicly`
3. Save the record

You can also toggle publish status directly from the collection list.

Published records appear on:

- `/`
- `/collection/[id]`

Unpublished records stay admin-only.

## Identification Flow

1. Upload images or enter text clues
2. OCR extracts visible text
3. AI summarizes what is visible
4. The app builds a normalized query
5. The app searches the local collection
6. The app searches Numista
7. You review candidates
8. You import a match or create a manual record
9. You verify and save the final data

External results can be wrong. Always review imported fields before saving.

## Provider Architecture

Providers are separated so OCR, AI, and catalog integrations can be replaced later without rewriting the app flow.

Current provider setup:

- Google Gemini for OCR and image analysis
- Numista for catalog search and type details

All provider calls happen server-side.

## Security Notes

- Secrets are read from environment variables only
- `.env` is ignored by git
- No secret values are shown in the UI
- The settings screen only shows whether a value is configured
- Admin routes require a signed cookie session
- Uploaded files are validated for size and type
- Uploaded files are stored locally under `UPLOAD_DIR`
- Public image serving is restricted to published items unless the admin is logged in
- Do not hard-code keys, passwords, or tokens in the repo

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
npm run lint
npm run db:generate
npm run db:studio
```

## Contributing

Contributions are welcome.

Please keep the project:

- self-hosted
- env-driven
- server-side for external API calls
- editable after import
- security-conscious

If you add a new provider, follow the existing provider interfaces and keep secret configuration out of the client.

## Roadmap

- Better identification history browsing
- Stronger local search
- Improved mobile capture flow
- Richer import and export options
- Additional OCR and catalog providers

## Accuracy Warning

CoinAtlas assists the cataloging process. It does not guarantee that OCR, AI output, or external catalog matches are correct.
