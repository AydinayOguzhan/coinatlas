# CoinAtlas

CoinAtlas is an open-source, self-hosted coin collection web application built for personal cataloging and assisted identification. It is not a Numista clone. Instead, it helps collectors manage their own collection locally while using OCR, AI, and Numista as optional external catalog assistance.

## Features

- Personal coin CRUD with editable metadata
- Public showcase for published coins
- Shared admin login for the private management panel
- Local SQLite storage with Drizzle ORM
- Front and back image upload to local storage
- Mobile-friendly identify flow
- OCR and AI-assisted query generation through a provider interface
- Numista text search and details import through a server-side provider
- Local text search and image-assisted local search
- Identification session history storage for debugging and review
- JSON and CSV export endpoints
- Environment health page that never exposes secret values

## Stack

- Next.js App Router
- TypeScript
- SQLite
- Drizzle ORM
- Tailwind CSS
- Server Actions and Route Handlers

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Fill in your API keys if you want OCR, AI analysis, or Numista lookup.
   Also set your shared admin login credentials before exposing the app.

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

The SQLite database is created automatically from the runtime schema on first boot.

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

## Provider Architecture

The app uses provider interfaces so OCR, AI vision, and catalog integrations can be swapped later without rewriting the UI flow.

- `OcrProvider`
- `AiVisionProvider`
- `CatalogProvider`

Current implementations:

- Google Gemini for OCR and image analysis
- Numista for catalog search and type details

All provider calls happen server-side. API keys are read from environment variables only.

## Security Notes

- The public homepage only shows coins marked as published
- All admin routes require the shared login cookie
- `.env` is ignored by Git
- Secrets are never exposed to client-side code
- Secrets are never displayed in the settings UI
- Uploaded files are validated for type and size
- Uploaded files are stored locally under `UPLOAD_DIR`
- File serving uses path normalization to prevent traversal
- External provider errors are surfaced with user-friendly messages

## Identification Flow

1. User uploads an image or enters text
2. OCR extracts visible text
3. AI optionally summarizes visible coin details
4. The app builds a normalized search query
5. The app searches the local collection
6. The app searches Numista by text
7. The user reviews suggested matches
8. The user can import a candidate into an editable form
9. The user verifies and saves the coin locally

External data may be inaccurate. Users should always verify every field before saving.

## Admin And Public Access

- `/` is the public showcase page
- `/collection/[id]` shows public details for published coins only
- `/login` unlocks the private admin panel
- Admin routes such as `/dashboard`, `/coins`, `/identify`, `/search`, and `/settings` require the shared login
- This is intentionally a single shared admin login, not a multi-user account system

## Export

- JSON: `/api/export/json`
- CSV: `/api/export/csv`

## Contributing

Contributions are welcome. Please keep the project self-hosted, provider-based, and security-conscious.

- Do not hard-code credentials or secrets
- Keep external API calls server-side
- Preserve editable import flows so the user stays in control
- Prefer clear, small, documented changes

If you add a new provider, follow the existing provider interfaces and keep configuration environment-driven.

## Roadmap

Near-term improvements that fit the current architecture:

- SQLite FTS for stronger local search
- Better identification history browsing
- Camera-first phone capture flow
- Richer CSV import and export
- Additional OCR or AI providers

## Accuracy Warning

OCR, AI analysis, and external catalog data can all be wrong. CoinAtlas is designed to assist the user, not make final decisions.
