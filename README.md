# TinyFish × Japan Post Demo

Real agents filling real Japanese forms. No theory, just working code.

## 🎯 What This Is

A live demonstration of TinyFish agents navigating and filling the Japan Post redelivery request form using natural language commands. Built for the **9 Techies × オークラ東京** event on February 18, 2026.

## 🚀 Features

- **Natural Language Control**: "Fill the Japan Post form" - that's it
- **Live Streaming**: Watch the agent work in real-time via SSE
- **Japanese Form Mastery**: Handles complex Japanese form structures
- **Safe Demo**: Uses dummy data, never submits
- **Stripe-Inspired UI**: Clean, minimal, professional

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS, HTML5, CSS3
- **Backend**: Vercel Serverless Functions
- **Agent**: TinyFish AI (Mino API)
- **Streaming**: Server-Sent Events (SSE)
- **Design**: TinyFish Brand Guide + Japanese Minimalism

## 📦 Local Development

\`\`\`bash
# Install dependencies
npm install

# Set environment variable
export TINYFISH_API_KEY="your_api_key_here"

# Run local dev server
npm run dev

# Visit http://localhost:3000
\`\`\`

## 🌐 Deploy to Vercel

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Set secret
vercel secrets add tinyfish-api-key "your_api_key_here"

# Deploy
vercel --prod
\`\`\`

Or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/japan-post-demo&env=TINYFISH_API_KEY)

## 🎨 Brand Colors

From TinyFish Brand Guide 1.0:

- **Orange Burst**: `#FF6700` (Primary)
- **Peachy Tan**: `#FECB8B` (Secondary)
- **Mellow Yellow**: `#E7FF84` (Accent)
- **Lagoon**: `#00343B` (Dark)

## 🗓️ Event Details

**9 Techies × オークラ東京**
- **Date**: February 18, 2026 (2月18日)
- **Venue**: Okura Tokyo (オークラ東京)
- **Registration**: [Click here](https://events.geodesiccap.com/2026devlab/10698450?ref=TinyFish&reg_type_id=1065460)

## ⚖️ Legal

This is a demonstration using randomly generated dummy data. No actual redelivery requests are submitted to Japan Post. All tracking numbers, names, and dates are fictional.

## 📄 License

MIT

## 🐟 Built with TinyFish

**TinyFish** - The most designed Enterprise Web Agent
[mino.ai](https://mino.ai) • [Docs](https://docs.mino.ai) • [GitHub](https://github.com/TinyFishAI)

---

日本のウェブサイトは世界で最も複雑です。私たちのエージェントはそれを理解します。
