# QuickText - Instant Text, File, & URL Sharing Platform
## [QuickText DEMO](https://quicktextt.vercel.app)

## Screenshot
<table>
  <tr>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/scr1.png" width="250"/></td>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/scr2.png" width="250"/></td>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/scr3.png" width="250"/></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/src4.png" width="250"/></td>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/src5.png" width="250"/></td>
    <td><img src="https://raw.githubusercontent.com/akshitsutharr/quicktext/main/public/src6.png" width="250"/></td>
  </tr>
</table>

---

## ✨ Features

### 🔥 Core Features

- **🎯 Universal Code System** – Unique 5 or 6-digit codes for instant retrieval
- **📤 Heavy File Sharing** – Upload up to 100MB powered seamlessly by Cloudflare R2
- **🔗 Advanced URL Shortener** – Turn massive URLs into clean short links with downloadable QR Codes
- **⏰ Granular Auto-Expiration** – Time-bombed content (Text: 1hr, Files: 2hr, Links: 24hr)
- **✏️ Collaborative Editing** – Edit shared texts in real-time
- **🔍 Universal Global Search** – Input any QuickText access code right on the homepage

### 🛡️ Security & Privacy

- **🚨 Secure S3 Presigned URLs** – Downloads are individually cryptographically signed
- **🔒 Automatic Cleanups** – Physical R2 objects and DB metadata deleted on expiration
- **🚫 Anonymous by Default** – Full anonymity, zero tracking
- **⚡ Background Jobs** – Automated chronological sweeping

### 🎨 User Experience

- **🌙 Premium Glassmorphism** – Deep black aesthetic with dynamic blue and orange neon blurs
- **⚡ Fast & Optimized** – Uses Next.js 15 App Router Server Components & Actions
- **📋 Zero-Friction Copy** – One-click direct link distribution

---

## 🚀 Installation

### ⚙️ Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier is fine)
- Cloudflare R2 or Amazon S3 buckets (for file support)

### 📥 Clone Repository

```bash
git clone https://github.com/akshitsutharr/quicktext.git
cd quicktext
```

### 📦 Install Dependencies

```bash
npm install
```

### 🧾 Setup Environment

Create `.env` (or `.env.local`):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# R2/S3 Configuration
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=your_storage_endpoint
R2_PUBLIC_URL=your_public_domain
```

### 🗄️ Setup Database

In your Supabase SQL Editor, run the schema file completely to inject all three core environments and RLS overrides:

```sql
-- Texts Table
CREATE TABLE IF NOT EXISTS shared_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
ALTER TABLE shared_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON shared_texts FOR ALL USING (true);

-- Files Table
CREATE TABLE public.shared_files (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    size integer NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT shared_files_pkey PRIMARY KEY (id),
    CONSTRAINT shared_files_code_key UNIQUE (code)
);
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for shared_files" ON public.shared_files FOR ALL USING (true) WITH CHECK (true);

-- URL Shortener Table
CREATE TABLE public.shortened_urls (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    short_code text NOT NULL,
    original_url text NOT NULL,
    access_count integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT shortened_urls_pkey PRIMARY KEY (id),
    CONSTRAINT shortened_urls_short_code_key UNIQUE (short_code)
);
ALTER TABLE public.shortened_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all public operations for shortened_urls" ON public.shortened_urls FOR ALL USING (true) WITH CHECK (true);
```

### ▶️ Configure CORS for R2

Ensure your Cloudflare R2 bucket accepts client-side multipart presigned uploads by running the build-in script once:

```bash
node --env-file=.env scripts/setup-cors.mjs
```

### ▶️ Start Dev Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Feature Usage Guide

### ✍️ Send & Receive Text
1. Navigate to `/send` to generate a 5-digit code or URL for snippet sharing.
2. Navigate to `/receive` or input the text-code in the **Global Searchbar** to live-edit your note. 

### ☁️ Upload & Download Files
1. Navigate to `/file/send` to securely upload your files directly onto S3 infrastructure. (Enforced max payload limit defaults at 100MB).
2. Input the generated 5-digit code into the Global Search or go to `/file/receive`. Click "Download Securely" to generate your direct binary retrieval link.

### 🔗 Shorten Links & QR Codes
1. Navigate to `/url`, paste a long link securely to get a clean `/s/...` route.
2. Directly download the uniquely assigned `.png` QR code locally.

---

## 🏗️ Architecture

### 🧰 Stack

- **Frontend**: Next.js 15 (App Router) + React + TypeScript + Framer Motion
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend Auth & Meta**: Supabase (PostgreSQL)
- **Object Storage**: Cloudflare R2 (S3 Client presign APIs)

---

## 🚀 Deployment

### 🧬 Vercel

```bash
npm i -g vercel
vercel
```

Make sure to mount all standard `.env` variables cleanly!

---

## 📝 License

MIT - [LICENSE](LICENSE)

---

## MADE WITH ❤️ BY AKSHIT SUTHAR
