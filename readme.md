# QuickText - Instant Text Sharing Platform
## [QuickText Now](https://quicktextt.vercel.app)


---

## ✨ Features

### 🔥 Core Features

- **🎯 5-Digit Code Sharing** – Unique codes for instant text sharing
- **⏰ Auto-Expiration** – Self-destruct after 1 hour
- **🌐 Cross-Device Access** – Seamless sharing across devices
- **🔗 Direct URL Sharing** – Share via direct links or QR codes
- **✏️ Collaborative Editing** – Edit shared texts in real-time
- **📱 Responsive Design** – Works perfectly on all screens

### 🛡️ Security & Privacy

- **🔒 Automatic Cleanup** – Secure, time-based deletion
- **🚫 No Registration Required** – Full anonymity
- **⚡ Real-Time Expiration** – Countdown timer
- **🗑️ Self-Destructing Texts** – Completely gone after expiry

### 🎨 User Experience

- **🌙 Dark Theme** – Elegant interface with subtle grids
- **⚡ Fast & Optimized** – Speed-focused design
- **📋 One-Click Copy** – Copy code or URL in a click
- **🔄 Live Sync** – Instantly reflects updates

---

## 🎯 Demo

### 🔗 Live Demo

👉 [**Try QuickText Now**](https://quicktextt.vercel.app)

### 🧪 Quick Example

```text
1. Go to /send → Write your text → Get code `ABC12`
2. Share `ABC12` or use URL `https://yourdomain.com/receive?code=ABC12`
3. Others visit /receive and use code `ABC12` to access
4. Edit together in real-time
```

---

## 🚀 Installation

### ⚙️ Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier is fine)

### 📥 Clone Repository

```bash
git clone https://github.com/akshitsutharr/quicktext.git
cd quicktext
```

### 📦 Install Dependencies

```bash
npm install
# or
yarn install
```

### 🧾 Setup Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🗄️ Setup Database

In Supabase SQL Editor, run:

```sql
CREATE TABLE IF NOT EXISTS shared_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_texts_code ON shared_texts(code);
CREATE INDEX IF NOT EXISTS idx_shared_texts_expires_at ON shared_texts(expires_at);

ALTER TABLE shared_texts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON shared_texts FOR ALL USING (true);

CREATE OR REPLACE FUNCTION cleanup_expired_texts()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_texts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

### ▶️ Start Dev Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Usage

### ✍️ Send Text

1. Visit `/send`
2. Write or paste text
3. Click "Create Share"
4. Share the code or link

### 📥 Receive Text

1. Visit `/receive`
2. Enter 5-digit code
3. View, edit, and sync text

### 🔗 URL Example

```text
https://yourdomain.com/receive?code=ABC12
```

---

## 🔧 API Reference

### `shareText(text: string)`

```ts
const code = await shareText("Hello"); // returns "ABC12"
```

### `getSharedText(code: string)`

```ts
const text = await getSharedText("ABC12");
```

### `updateSharedText(code: string, text: string)`

```ts
await updateSharedText("ABC12", "Updated content");
```

### `getTextStats(code: string)`

```ts
const stats = await getTextStats("ABC12");
```

---

## 🏗️ Architecture

### 🧰 Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel

### 📁 Structure

```text
quicktext/
├── app/
│   ├── send/
│   ├── receive/
│   └── layout.tsx
├── components/ui/
├── lib/supabase.ts
├── scripts/create-tables.sql
└── README.md
```

---

## 🚀 Deployment

### 🧬 Vercel

```bash
npm i -g vercel
vercel
```

Set environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 🌐 Other Platforms

- **Netlify**
- **Railway**
- **DigitalOcean**

---

## ⚙️ Configuration

### 🔁 Change Expiration

```ts
expiresAt.setHours(expiresAt.getHours() + 24);
```

### 🔢 Code Length

```ts
for (let i = 0; i < 6; i++) { ... }
```

---

## 🧪 Testing

### ✅ Run Tests

```bash
npm test
```

### ✔️ Manual Checklist

-

---

## 🤝 Contributing

### 🛠 Steps

```bash
git clone https://github.com/akshitsuthar/quicktext.git
cd quicktext
git checkout -b feature/amazing-feature
```

- Make changes
- Add tests
- Commit & PR

---

## 📝 License

MIT - [LICENSE](LICENSE)

---

## 🙏 Acknowledgements

- Supabase
- Vercel
- TailwindCSS
- shadcn/ui

---

## MADE WITH ❤️ BY AKSHIT SUTHAR

