import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import cors from "cors";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

// ===== CONFIG =====
const isMainnet = process.env.NODE_ENV === "mainnet";
const PAY_TO = process.env.WALLET_ADDRESS || "0x0000000000000000000000000000000000000000";
const PORT = process.env.PORT || 4021;
const NET_ID = isMainnet ? "eip155:8453" : "eip155:84532";
const FACILITATOR_URL = isMainnet
  ? "https://api.cdp.coinbase.com/platform/v2/x402"
  : "https://x402.org/facilitator";

// ===== LOAD PROMPTS =====
const promptsDir = join(__dirname, "..", "ai-prompts-pack", "prompts");

function loadPrompt(filename) {
  try { return readFileSync(join(promptsDir, filename), "utf-8"); }
  catch { return null; }
}

function parsePrompts(markdown) {
  const sections = [];
  const regex = /### (\d+)\. (.+?)\n```([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    sections.push({
      id: parseInt(match[1]),
      name: match[2].trim(),
      template: match[3].trim(),
    });
  }
  return sections;
}

const contentPrompts = loadPrompt("03-content-creation.md");
const officePrompts = loadPrompt("01-office-automation.md");
const dataPrompts = loadPrompt("02-data-analysis.md");
const codePrompts = loadPrompt("04-code-development.md");
const browserPrompts = loadPrompt("05-browser-automation.md");

// ===== x402 PAYMENT MIDDLEWARE =====
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
const resourceServer = new x402ResourceServer(facilitatorClient)
  .register(NET_ID, new ExactEvmScheme());

const paymentConfig = {
  "POST /api/v1/content/generate": {
    accepts: [{ scheme: "exact", price: "$0.005", network: NET_ID, payTo: PAY_TO }],
    description: "Generate AI content for Xiaohongshu, WeChat, Zhihu, Douyin, SEO. 15 prompt templates for social media content creation.",
    mimeType: "application/json",
  },
  "POST /api/v1/office/automate": {
    accepts: [{ scheme: "exact", price: "$0.003", network: NET_ID, payTo: PAY_TO }],
    description: "AI office automation: meeting minutes, email drafts, weekly reports, schedule optimization. 10 battle-tested templates.",
    mimeType: "application/json",
  },
  "POST /api/v1/code/assist": {
    accepts: [{ scheme: "exact", price: "$0.01", network: NET_ID, payTo: PAY_TO }],
    description: "AI code development: code generation, unit tests, code review, refactoring, bug analysis. 10 developer templates.",
    mimeType: "application/json",
  },
  "POST /api/v1/data/analyze": {
    accepts: [{ scheme: "exact", price: "$0.005", network: NET_ID, payTo: PAY_TO }],
    description: "AI data analysis: data cleaning, visualization, statistical analysis, trend prediction. 10 analytical templates.",
    mimeType: "application/json",
  },
  "POST /api/v1/prompts/full-pack": {
    accepts: [{ scheme: "exact", price: "$0.05", network: NET_ID, payTo: PAY_TO }],
    description: "Full OpenClaw prompt library: 50+ curated prompts across content, office, code, data, browser automation.",
    mimeType: "application/json",
  },
};

app.use(paymentMiddleware(paymentConfig, resourceServer));

// ===== TEMPLATE MAPS =====
const contentTemplateMap = {
  xiaohongshu: 1, wechat: 2, zhihu: 3, "douyin-script": 4,
  "seo-article": 5, headline: 6, "copy-rewrite": 7, "email-copy": 8,
  "product-desc": 9, "ad-copy": 10, "press-release": 11, "brand-story": 12,
  "social-calendar": 13, "viral-hook": 14, "audience-analysis": 15,
};

const officeTemplateMap = {
  "meeting-minutes": 1, "email-draft": 2, "weekly-report": 3,
  "doc-conversion": 4, "schedule-optimize": 5, "data-summary": 6,
  presentation: 7, "task-priority": 8, "report-polish": 9, "workflow-design": 10,
};

const codeTemplateMap = {
  "code-generate": 1, "unit-test": 2, "code-review": 3,
  refactor: 4, "bug-fix": 5, "api-doc": 6,
  debug: 7, optimize: 8, architecture: 9, "security-audit": 10,
};

const dataTemplateMap = {
  "data-clean": 1, visualize: 2, statistical: 3,
  trend: 4, report: 5, "kpi-dashboard": 6,
  anomaly: 7, forecast: 8, benchmark: 9, "etl-design": 10,
};

// ===== HELPER: Find prompt & customize =====
function getPrompt(promptsMd, templateMap, templateName, replacements) {
  if (!promptsMd) return { error: "Prompt library not loaded" };
  const prompts = parsePrompts(promptsMd);
  const id = templateMap[templateName] || 1;
  const prompt = prompts.find(p => p.id === id) || prompts[0];
  let text = prompt.template;
  for (const [pattern, value] of Object.entries(replacements)) {
    text = text.replace(new RegExp(pattern, "g"), value);
  }
  return { template_name: prompt.name, template_id: id, prompt: text };
}

// ===== ROUTE HANDLERS =====

app.post("/api/v1/content/generate", (req, res) => {
  const { template = "xiaohongshu", topic = "AI tools", style = "engaging", language = "zh", keywords = [], target_audience = "" } = req.body;
  const result = getPrompt(contentPrompts, contentTemplateMap, template, {
    "\\[主题\\]": topic, "\\[具体主题\\]": topic, "\\[风格\\]": style,
    "\\[语言\\]": language, "\\[关键词列表\\]": keywords.join(", "),
    "\\[用户画像\\]": target_audience,
  });
  if (result.error) return res.status(500).json(result);
  res.json({ ...result, category: "content-creation", metadata: { source: "OpenClaw Prompt Pack", version: "1.0.0" } });
});

app.post("/api/v1/office/automate", (req, res) => {
  const { template = "meeting-minutes", context = "", format = "markdown" } = req.body;
  const result = getPrompt(officePrompts, officeTemplateMap, template, {
    "\\[.*?会议.*?\\]": context, "\\[.*?内容.*?\\]": context, "\\[.*?数据.*?\\]": context,
  });
  if (result.error) return res.status(500).json(result);
  res.json({ ...result, category: "office-automation", format, metadata: { source: "OpenClaw Prompt Pack", version: "1.0.0" } });
});

app.post("/api/v1/code/assist", (req, res) => {
  const { template = "code-generate", description = "", language = "python", code_input = "" } = req.body;
  const result = getPrompt(codePrompts, codeTemplateMap, template, {
    "\\[.*?描述.*?\\]": description, "\\[.*?语言.*?\\]": language, "\\[.*?代码.*?\\]": code_input,
  });
  if (result.error) return res.status(500).json(result);
  res.json({ ...result, category: "code-development", language, metadata: { source: "OpenClaw Prompt Pack", version: "1.0.0" } });
});

app.post("/api/v1/data/analyze", (req, res) => {
  const { template = "data-insights", data_description = "", data_sample = "" } = req.body;
  const result = getPrompt(dataPrompts, dataTemplateMap, template, {
    "\\[.*?数据.*?\\]": data_description, "\\[.*?样本.*?\\]": data_sample,
  });
  if (result.error) return res.status(500).json(result);
  res.json({ ...result, category: "data-analysis", metadata: { source: "OpenClaw Prompt Pack", version: "1.0.0" } });
});

app.post("/api/v1/prompts/full-pack", (req, res) => {
  const { category = "all", query = "" } = req.body;
  const allCats = { content: contentPrompts, office: officePrompts, data: dataPrompts, code: codePrompts, browser: browserPrompts };
  let result = [];
  const cats = category === "all" ? Object.keys(allCats) : [category];
  for (const cat of cats) {
    if (allCats[cat]) result.push(...parsePrompts(allCats[cat]).map(p => ({ ...p, category: cat })));
  }
  if (query) {
    const q = query.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.template.toLowerCase().includes(q));
  }
  res.json({ prompts: result, total: result.length, categories: Object.keys(allCats), metadata: { source: "OpenClaw Prompt Pack", version: "1.0.0" } });
});

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    service: "OpenClaw Prompt Pack API",
    version: "1.0.0",
    network: isMainnet ? "Base Mainnet" : "Base Sepolia Testnet",
    wallet: PAY_TO,
    endpoints: [
      { path: "/api/v1/content/generate", method: "POST", price: "$0.005 USDC", description: "Content creation prompts (15 templates)" },
      { path: "/api/v1/office/automate", method: "POST", price: "$0.003 USDC", description: "Office automation prompts (10 templates)" },
      { path: "/api/v1/code/assist", method: "POST", price: "$0.01 USDC", description: "Code development prompts (10 templates)" },
      { path: "/api/v1/data/analyze", method: "POST", price: "$0.005 USDC", description: "Data analysis prompts (10 templates)" },
      { path: "/api/v1/prompts/full-pack", method: "POST", price: "$0.05 USDC", description: "Full 50+ prompt library access" },
    ],
  });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`\n🦞 OpenClaw x402 Prompt API Server`);
  console.log(`   Network: ${isMainnet ? "🔴 MAINNET (Base)" : "🟡 TESTNET (Base Sepolia)"}`);
  console.log(`   Wallet: ${PAY_TO}`);
  console.log(`   Port: ${PORT}\n`);
});
