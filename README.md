# OpenClaw x402 Prompt API

> 50+ AI prompt templates as pay-per-request API on the x402 protocol.
> No API keys. No registration. Pay with USDC per call.

## Overview

This service exposes the [OpenClaw AI Prompt Pack](https://github.com/hgw13533541357-ux/ai-prompts-pack) as x402-enabled API endpoints on [Agentic Market](https://agentic.market/). AI agents can autonomously discover and pay for prompt generation without accounts or API keys.

## Pricing

| Endpoint | Price | Description |
|----------|-------|-------------|
| `POST /api/v1/content/generate` | $0.005 USDC | 15 content creation templates (Xiaohongshu, WeChat, Zhihu, Douyin, SEO) |
| `POST /api/v1/office/automate` | $0.003 USDC | 10 office automation templates (meeting minutes, emails, reports) |
| `POST /api/v1/code/assist` | $0.01 USDC | 10 code development templates (generation, review, refactoring) |
| `POST /api/v1/data/analyze` | $0.005 USDC | 10 data analysis templates (cleaning, visualization, forecasting) |
| `POST /api/v1/prompts/full-pack` | $0.05 USDC | Full 50+ prompt library access |
| `GET /api/v1/health` | FREE | Service health check |

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set environment variables

```bash
# Required: Your wallet address to receive USDC
export WALLET_ADDRESS=0xYourWalletAddress

# Optional: Port (default 4021)
export PORT=4021

# Optional: Network (testnet or mainnet)
export NODE_ENV=testnet  # or "mainnet" for Base mainnet
```

### 3. Run the server

```bash
# Testnet (Base Sepolia)
npm run testnet

# Mainnet (Base)
npm run mainnet
```

### 4. Test with an x402 client

```bash
# Install agentic wallet
npx skills add coinbase/agentic-wallet-skills

# Call the content generation endpoint
curl -X POST http://localhost:4021/api/v1/content/generate \
  -H "Content-Type: application/json" \
  -d '{"template":"xiaohongshu","topic":"AI automation tools","style":"engaging"}'
```

## API Reference

### Content Generation

**POST** `/api/v1/content/generate`

```json
{
  "template": "xiaohongshu",      // Required: prompt template name
  "topic": "AI automation tools", // Required: content topic
  "style": "engaging",            // Optional: writing style
  "language": "zh",               // Optional: output language
  "keywords": ["AI", "效率工具"],  // Optional: SEO keywords
  "target_audience": "创业者"      // Optional: audience description
}
```

**Available templates**: xiaohongshu, wechat, zhihu, douyin-script, seo-article, headline, copy-rewrite, email-copy, product-desc, ad-copy, press-release, brand-story, social-calendar, viral-hook, audience-analysis

### Office Automation

**POST** `/api/v1/office/automate`

```json
{
  "template": "meeting-minutes",          // Required
  "context": "Product team weekly sync", // Required: raw input
  "format": "markdown"                   // Optional: markdown | html | plain
}
```

### Code Development

**POST** `/api/v1/code/assist`

```json
{
  "template": "code-generate",                        // Required
  "description": "Create a REST API for user auth",   // Required
  "language": "python",                                // Optional
  "code_input": ""                                     // Optional: existing code
}
```

### Data Analysis

**POST** `/api/v1/data/analyze`

```json
{
  "template": "data-insights",         // Required
  "data_description": "Monthly sales", // Required
  "data_sample": ""                    // Optional: sample data
}
```

### Full Pack Access

**POST** `/api/v1/prompts/full-pack`

```json
{
  "category": "all",               // Optional: all | content | office | code | data | browser
  "query": "automation workflow"   // Optional: search filter
}
```

## Deployment

### Deploy to Vercel

```bash
vercel deploy
```

### Deploy to Railway

```bash
railway up
```

### Deploy with Docker

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY server.js ./
EXPOSE 4021
CMD ["node", "server.js"]
```

## Revenue Projections

| Scenario | Calls/day | Daily Revenue | Monthly Revenue |
|----------|-----------|---------------|-----------------|
| Conservative | 100 | $0.50 | $15 |
| Moderate | 1,000 | $5.00 | $150 |
| Aggressive | 10,000 | $50.00 | $1,500 |
| Viral | 100,000 | $500.00 | $15,000 |

## License

MIT
