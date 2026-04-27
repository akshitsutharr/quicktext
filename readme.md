<div align="center">

<img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/favicon.png" alt="Quicktext logo" width="112" height="112" />

# Quicktext

**Fast, temporary sharing for text, files, links, and paired devices.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-f5c542?style=for-the-badge)](./LICENSE)

[Live demo](https://quicktextt.vercel.app) · [What it does](#-what-quicktext-does) · [Setup](#-setup) · [Tech stack](#-tech-stack)

</div>

---

## Overview

Quicktext is a clean, short-lived sharing app for moving content between devices without friction. It is designed for quick handoffs, temporary access, and simple links that do not need a full account flow.

Use it to:

- send text snippets or notes with a short code
- share files from one device to another
- shorten a URL and present it as a QR-friendly link
- pair two devices for instant transfer
- jump to content using the global search bar

It is intentionally account-free. The app favors short-lived records, public access patterns, and direct browser-to-browser flows over traditional sign-in driven sharing.

---

## How it works

Quicktext is built around four small flows that all follow the same pattern: create a temporary record, expose it through a short code, and resolve it from another device.

### 1. Text flow
Create a snippet in `/send`, generate a short code, and open it later from `/receive` or the homepage search bar.

### 2. File flow
Upload one or more files from `/file/send`, store the metadata in Supabase, and retrieve the file from the paired or receiving device.

### 3. URL flow
Paste a long URL into `/url`, create a compact short code, and optionally share the result as a scannable route.

### 4. Pairing flow
Start a pairing session from `/pair`, exchange the pairing code, and use the session to move data between devices with less manual copying.

---

## What Quicktext does

| Feature | Purpose | Entry point |
| --- | --- | --- |
| ✍️ Text share | Move notes, snippets, or short messages with a one-time code. | `/send` |
| 📁 File share | Upload one or more files and hand them off quickly. | `/file/send` |
| 🔗 URL shortener | Turn long links into compact shareable URLs. | `/url` |
| 📱 Pairing | Connect two devices for faster transfer flow. | `/pair` |
| 🔎 Global search | Find content by code from the homepage search bar. | Home |

---

## Feature highlights

### ✍️ Text share
Use text share when you want to send short drafts, code fragments, or temporary notes without opening a chat app.

### 📁 File share
Send files directly from the browser. The flow is built for quick transfers and simple retrieval on another device.

### 🔗 URL shortener
Generate short links that are easier to read, share, and scan in QR workflows.

### 📱 Pairing
Pair two devices through the app to reduce setup and make transfers feel instant.

### 🔎 Global search
Search by code from the homepage and jump straight into the matching content flow.

---

## Interface map

- `/` - homepage with feature cards and global search
- `/send` - text sharing flow
- `/receive` - receive text content
- `/file/send` - file upload and sharing flow
- `/file/receive` - receive shared files
- `/url` - link shortener
- `/pair` - pairing interface
- `/s/[code]` - code-based short route
- `/[code]` - dynamic code route

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) |
| UI | React 18 + Tailwind CSS 3.4 |
| Language | TypeScript |
| Database | Supabase |
| Storage | Cloudflare R2 / S3-compatible storage |
| Icons | Lucide React |
| Utilities | `date-fns`, `zod`, `react-hook-form`, `sonner`, `cmdk` |

---

## Data model

The app relies on a small set of Supabase tables that keep the data model simple and easy to expire.

| Table | What it stores | Notes |
| --- | --- | --- |
| `shared_texts` | Temporary text snippets | Stores a code, content, timestamps, and expiry time. |
| `shared_files` | Uploaded file metadata | Stores file name, file URL, size, code, and expiry time. |
| `shortened_urls` | Short links | Stores the original URL, short code, access count, and expiry time. |
| `pairing_sessions` | Pairing session state | Stores the pairing code, session ID, device tokens, and expiry time. |
| `session_shares` | Shared session payloads | Stores content exchanged during a pairing session. |

The schema is created through the SQL files in `scripts/` and `supabase-migration.sql`.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment variables

Create a `.env.local` file at the project root.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://your-public-bucket-domain.com
```

### 3. Set up the database

Run the SQL scripts in `scripts/` or apply the schema from `supabase-migration.sql`.

Recommended order:

1. create the base tables
2. enable row-level security policies
3. add cleanup and pairing logic
4. configure any storage or CORS rules required by your bucket

Helpful SQL files:

- `scripts/create-tables.sql` - creates the main text table and indexes
- `scripts/create-cleanup-function.sql` - adds the cleanup helper for expired text records
- `scripts/session-pairing.sql` - creates pairing session and session share tables
- `scripts/allow-multiple-files-per-code.sql` - supports file flows that can attach more than one file to a code

### 4. Configure storage CORS

If you are using direct browser uploads, run:

```bash
node --env-file=.env scripts/setup-cors.mjs
```

### 5. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### 6. Verify the core flows

After the app starts, check these paths in a browser:

- home page search bar for code lookup
- `/send` for text creation
- `/file/send` for file upload
- `/url` for short link creation
- `/pair` for device pairing

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Build the production app. |
| `npm run start` | Start the production server. |
| `npm run lint` | Run Next.js linting. |
| `npm run postbuild` | Generate the sitemap after build. |

## Maintenance scripts

The repository also includes a few direct SQL and Node helpers for local setup and maintenance.

| File | Purpose |
| --- | --- |
| `scripts/setup-cors.mjs` | Configures bucket CORS for direct browser uploads. |
| `scripts/test-url.mjs` | Exercises URL shortening behavior during local testing. |
| `scripts/create-cleanup-function.sql` | Adds the expired-text cleanup function. |
| `scripts/session-pairing.sql` | Adds pairing session tables and indexes. |

---

## Project structure

```text
app/               # Routes, actions, and page shells
components/        # Shared UI and feature components
hooks/             # Client hooks
lib/               # Supabase and utility helpers
public/            # Favicons, robots, sitemap assets
scripts/           # Setup and maintenance scripts
styles/            # Global CSS and design tokens
```

---

## Design notes

- dark, high-contrast visual language
- feature cards with stronger spacing and supporting copy
- subtle motion and hover feedback
- fast, code-first navigation with search and route shortcuts

---

## Deployment

Quicktext is ready for standard Next.js deployments. The current setup works well on Vercel, but any host that supports Node.js and environment variables should work.

Before deploying, confirm:

- production Supabase credentials are set
- storage CORS is enabled for the chosen bucket
- sitemap and robots files are being served from `public/`
- your public storage URL matches the environment variables used by the file flow
- cleanup behavior for expired records is working the way you expect in production

### Environment checklist

- `NEXT_PUBLIC_SUPABASE_URL` - public Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - public Supabase anon key
- `R2_ACCESS_KEY_ID` - R2 or S3 access key
- `R2_SECRET_ACCESS_KEY` - R2 or S3 secret key
- `R2_BUCKET_NAME` - target bucket name
- `R2_ENDPOINT` - S3-compatible endpoint
- `R2_PUBLIC_URL` - public asset URL for downloaded files

---

## Troubleshooting

- If text or file lookups fail, confirm the relevant row exists and the code has not expired.
- If file uploads fail in the browser, re-run the CORS setup script and verify the bucket endpoint.
- If pairing stops working, check the `pairing_sessions` and `session_shares` tables for expired rows or mismatched session IDs.
- If short links resolve but the counter does not change, confirm the access-count function is available in Supabase.

---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Test locally.
5. Open a pull request.

---

## License

Released under the [MIT License](./LICENSE).

---

<div align="center">

**Built for quick sharing, by Akshit Suthar**

</div>