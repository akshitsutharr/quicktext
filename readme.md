# QuickText - Instant Text Sharing Platform

<div align="center">
  <h3>🚀 Share your text or code instantly with a simple 5-digit code</h3>
  <p>The fastest way to share text snippets across multiple devices</p>
  
  ![QuickText Demo](https://quicktext.vercel.app)
  
  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a> •
    <a href="#api">API</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## ✨ Features

### 🔥 Core Features
- **🎯 5-Digit Code Sharing** - Generate unique codes for instant text sharing
- **⏰ Auto-Expiration** - Texts automatically delete after 1 hour for security
- **🌐 Cross-Device Access** - Share between phones, tablets, computers seamlessly  
- **🔗 Direct URL Sharing** - Share via direct links or QR codes
- **✏️ Collaborative Editing** - Multiple users can edit shared texts in real-time
- **📱 Responsive Design** - Works perfectly on all screen sizes

### 🛡️ Security & Privacy
- **🔒 Automatic Cleanup** - Expired texts are permanently deleted
- **🚫 No Registration Required** - Anonymous sharing without accounts
- **⚡ Real-time Expiration** - Live countdown timer shows remaining time
- **🗑️ Self-Destructing** - Texts disappear after 1 hour automatically

### 🎨 User Experience
- **🌙 Dark Theme** - Beautiful dark interface with subtle grid pattern
- **⚡ Lightning Fast** - Optimized for speed and performance
- **📋 One-Click Copy** - Copy codes and URLs with single click
- **🔄 Live Updates** - Real-time synchronization across devices

---

## 🎯 Demo

### Live Demo
🌐 **[Try QuickText Live](https://quicktext.vercel.app)**

### Quick Start Example
1. **Send Text**: Visit `/send` → Write your text → Get code `ABC12`
2. **Share**: Send code `ABC12` to anyone or share URL `yoursite.com/receive?code=ABC12`
3. **Receive**: Others visit `/receive` → Enter `ABC12` → Access your text
4. **Collaborate**: Edit and save changes in real-time

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Supabase Account** (free tier works perfectly)

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/yourusername/quicktext.git
cd quicktext
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup
Create \`.env.local\` file in root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Database Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy Project URL and Anon Key

#### Run Database Migration
Execute this SQL in Supabase SQL Editor:

\`\`\`sql
-- Create the shared_texts table
CREATE TABLE IF NOT EXISTS shared_texts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(5) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_texts_code ON shared_texts(code);
CREATE INDEX IF NOT EXISTS idx_shared_texts_expires_at ON shared_texts(expires_at);

-- Enable Row Level Security
ALTER TABLE shared_texts ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on shared_texts" ON shared_texts
FOR ALL USING (true);

-- Create cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_texts()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_texts 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
\`\`\`

### 5. Start Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) 🎉

---

## 📖 Usage

### Basic Text Sharing

#### 1. Send Text
\`\`\`
1. Visit /send
2. Write or paste your text
3. Click "Create Share"
4. Get 5-digit code (e.g., "ABC12")
5. Share code or direct URL
\`\`\`

#### 2. Receive Text
\`\`\`
1. Visit /receive
2. Enter 5-digit code
3. Access shared text instantly
4. Edit and collaborate if needed
\`\`\`

### Advanced Features

#### Direct URL Sharing
\`\`\`
Share: https://yoursite.com/receive?code=ABC12
Recipients automatically see the text
\`\`\`

#### Collaborative Editing
\`\`\`
1. Multiple users access same code
2. Click "Edit" to modify text
3. Changes save automatically
4. Real-time sync across devices
\`\`\`

#### Expiration Tracking
\`\`\`
- Live countdown timer
- Automatic cleanup after 1 hour
- Warning notifications
\`\`\`

---

## 🔧 API Reference

### Server Actions

#### \`shareText(text: string)\`
Creates new shared text with unique code.

\`\`\`typescript
const code = await shareText("Hello World!");
// Returns: "ABC12"
\`\`\`

#### \`getSharedText(code: string)\`
Retrieves shared text by code.

\`\`\`typescript
const text = await getSharedText("ABC12");
// Returns: "Hello World!" or null if expired/not found
\`\`\`

#### \`updateSharedText(code: string, text: string)\`
Updates existing shared text.

\`\`\`typescript
const success = await updateSharedText("ABC12", "Updated text");
// Returns: boolean
\`\`\`

#### \`getTextStats(code: string)\`
Gets expiration info for shared text.

\`\`\`typescript
const stats = await getTextStats("ABC12");
// Returns: { expiresAt: string | null, isExpired: boolean }
\`\`\`

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

### Project Structure
\`\`\`
quicktext/
├── app/
│   ├── page.tsx              # Home page
│   ├── send/page.tsx         # Text sending interface
│   ├── receive/page.tsx      # Text receiving interface
│   ├── actions.ts            # Server actions
│   └── layout.tsx            # Root layout
├── components/ui/            # UI components
├── lib/
│   └── supabase.ts          # Database client
├── scripts/
│   └── create-tables.sql    # Database schema
└── README.md
\`\`\`

### Database Schema
\`\`\`sql
shared_texts (
  id UUID PRIMARY KEY,
  code VARCHAR(5) UNIQUE,
  content TEXT,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)
\`\`\`

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

#### 1. Connect Repository
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
\`\`\`

#### 2. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

#### 3. Deploy
\`\`\`bash
vercel --prod
\`\`\`

### Other Platforms
- **Netlify**: Works with standard Next.js deployment
- **Railway**: Supports Next.js with environment variables
- **DigitalOcean**: Use App Platform for easy deployment

---

## 🔧 Configuration

### Environment Variables
\`\`\`env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional
NEXT_PUBLIC_APP_URL=https://yoursite.com  # For URL generation
\`\`\`

### Customization Options

#### Change Expiration Time
Edit \`app/actions.ts\`:
\`\`\`typescript
// Change from 1 hour to 24 hours
expiresAt.setHours(expiresAt.getHours() + 24);
\`\`\`

#### Modify Code Length
Edit \`generateCode()\` function:
\`\`\`typescript
// Change from 5 to 6 characters
for (let i = 0; i < 6; i++) {
\`\`\`

#### Custom Styling
Edit Tailwind classes in components or modify \`globals.css\`.

---

## 🧪 Testing

### Run Tests
\`\`\`bash
npm test
# or
yarn test
\`\`\`

### Manual Testing Checklist
- [ ] Create text share and get code
- [ ] Access text from different device/browser
- [ ] Edit shared text and verify sync
- [ ] Wait for expiration and confirm deletion
- [ ] Test direct URL sharing
- [ ] Verify responsive design

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone
\`\`\`bash
git clone https://github.com/yourusername/quicktext.git
cd quicktext
\`\`\`

### 2. Create Branch
\`\`\`bash
git checkout -b feature/amazing-feature
\`\`\`

### 3. Make Changes
- Follow existing code style
- Add tests for new features
- Update documentation

### 4. Submit PR
\`\`\`bash
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
\`\`\`

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Write clean, readable code
- Test across different devices
- Update README for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - For excellent database and real-time features
- **Vercel** - For seamless deployment platform
- **shadcn/ui** - For beautiful UI components
- **Tailwind CSS** - For utility-first styling
- **Next.js Team** - For the amazing React framework

---

## 📞 Support

### Get Help
- 📧 **Email**: itsmeakshit.005@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/akshitsutharr/quicktext/issues)

### FAQ

**Q: How long do shared texts last?**
A: Texts automatically expire and delete after 1 hour for security.

**Q: Is there a character limit?**
A: No hard limit, but very large texts may affect performance.

**Q: Can I use this commercially?**
A: Yes! MIT license allows commercial use.

**Q: How do I report bugs?**
A: Create an issue on GitHub with detailed reproduction steps.

---

## 🎯 Roadmap

### Upcoming Features
- [ ] **Custom Expiration Times** - Let users choose expiration duration
- [ ] **Password Protection** - Optional password for shared texts
- [ ] **Syntax Highlighting** - Code syntax highlighting
- [ ] **File Uploads** - Share files along with text
- [ ] **User Accounts** - Optional accounts for managing shares
- [ ] **Analytics Dashboard** - Usage statistics and insights
- [ ] **API Access** - REST API for developers
- [ ] **Mobile Apps** - Native iOS and Android apps

### Version History
- **v1.0.0** - Initial release with core sharing features
- **v1.1.0** - Added collaborative editing
- **v1.2.0** - Direct URL sharing and countdown timer
- **v1.3.0** - Enhanced UI and mobile optimization

---

<div align="center">
  <h3>Made with ❤️ by <a href="https://github.com/akshitsuthar">Akshit Suthar</a></h3>
  
  <p>
    <a href="https://github.com/akshitsuthar">GitHub</a> •
    <a href="https://www.linkedin.com/in/akshit-suthar-312407314">LinkedIn</a>
  </p>
  
  <p>
    <strong>⭐ Star this repo if you found it helpful!</strong>
  </p>
  
  <p>
    <img src="https://img.shields.io/github/stars/yourusername/quicktext?style=social" alt="GitHub stars">
    <img src="https://img.shields.io/github/forks/yourusername/quicktext?style=social" alt="GitHub forks">
    <img src="https://img.shields.io/github/watchers/yourusername/quicktext?style=social" alt="GitHub watchers">
  </p>
</div>

---

<div align="center">
  <p><strong>🚀 Ready to share text instantly? <a href="https://quicktext.vercel.app">Try QuickText Now!</a></strong></p>
</div>
\`\`\`
