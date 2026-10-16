// AlchemyAgent for Claude. (c) AlchemyLeads. https://alchemyagent.ai
import {
  JSONRPCMessageSchema,
  McpServer
} from "./chunks/chunk-OVF2AMSK.mjs";
import {
  external_exports
} from "./chunks/chunk-O6KJZWMG.mjs";
import "./chunks/chunk-P3IKL3NC.mjs";
import "./chunks/chunk-ZEQZWUVA.mjs";
import "./chunks/chunk-FHDNALRU.mjs";
import "./chunks/chunk-S4OJXXND.mjs";
import "./chunks/chunk-QKLWDJCW.mjs";
import "./chunks/chunk-FGTUXEPY.mjs";
import "./chunks/chunk-DWR27GYP.mjs";
import "./chunks/chunk-6MUYBQIH.mjs";
import "./chunks/chunk-UPBUYWNZ.mjs";

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
import process2 from "node:process";

// node_modules/@modelcontextprotocol/sdk/dist/esm/shared/stdio.js
var STDIO_DEFAULT_MAX_BUFFER_SIZE = 10 * 1024 * 1024;
var ReadBuffer = class {
  constructor(options) {
    this._maxBufferSize = options?.maxBufferSize ?? STDIO_DEFAULT_MAX_BUFFER_SIZE;
  }
  append(chunk) {
    const newSize = (this._buffer?.length ?? 0) + chunk.length;
    if (newSize > this._maxBufferSize) {
      this.clear();
      throw new Error(`ReadBuffer exceeded maximum size of ${this._maxBufferSize} bytes`);
    }
    this._buffer = this._buffer ? Buffer.concat([this._buffer, chunk]) : chunk;
  }
  readMessage() {
    if (!this._buffer) {
      return null;
    }
    const index = this._buffer.indexOf("\n");
    if (index === -1) {
      return null;
    }
    const line = this._buffer.toString("utf8", 0, index).replace(/\r$/, "");
    this._buffer = this._buffer.subarray(index + 1);
    return deserializeMessage(line);
  }
  clear() {
    this._buffer = void 0;
  }
};
function deserializeMessage(line) {
  return JSONRPCMessageSchema.parse(JSON.parse(line));
}
function serializeMessage(message) {
  return JSON.stringify(message) + "\n";
}

// node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
var StdioServerTransport = class {
  constructor(_stdin = process2.stdin, _stdout = process2.stdout, options) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._started = false;
    this._ondata = (chunk) => {
      try {
        this._readBuffer.append(chunk);
        this.processReadBuffer();
      } catch (error) {
        this.onerror?.(error);
        this.close().catch(() => {
        });
      }
    };
    this._onerror = (error) => {
      this.onerror?.(error);
    };
    this._readBuffer = new ReadBuffer({ maxBufferSize: options?.maxBufferSize });
  }
  /**
   * Starts listening for messages on stdin.
   */
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error) {
        this.onerror?.(error);
      }
    }
  }
  async close() {
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const remainingDataListeners = this._stdin.listenerCount("data");
    if (remainingDataListeners === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    this.onclose?.();
  }
  send(message) {
    return new Promise((resolve2) => {
      const json4 = serializeMessage(message);
      if (this._stdout.write(json4)) {
        resolve2();
      } else {
        this._stdout.once("drain", resolve2);
      }
    });
  }
};

// src/pagespeed.ts
var GOOGLE_PSI = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
var FIELD_METRICS = {
  LARGEST_CONTENTFUL_PAINT_MS: ["LCP", (v) => `${(v / 1e3).toFixed(1)}s`],
  INTERACTION_TO_NEXT_PAINT: ["INP", (v) => `${v}ms`],
  CUMULATIVE_LAYOUT_SHIFT_SCORE: ["CLS", (v) => (v / 100).toFixed(2)],
  FIRST_CONTENTFUL_PAINT_MS: ["FCP", (v) => `${(v / 1e3).toFixed(1)}s`],
  EXPERIMENTAL_TIME_TO_FIRST_BYTE: ["TTFB", (v) => `${(v / 1e3).toFixed(1)}s`]
};
var LAB_METRICS = ["largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift", "first-contentful-paint", "speed-index"];
function normalizeUrl(input) {
  const s = input.trim();
  const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  if (!/^https?:$/.test(u.protocol)) throw new Error("Only http(s) URLs can be checked.");
  if (/^(localhost|127\.|10\.|192\.168\.|\[?::1)/.test(u.hostname)) throw new Error("PageSpeed can only test public URLs.");
  return u.toString();
}
var CACHE_TTL_MS = 30 * 60 * 1e3;
var cache = /* @__PURE__ */ new Map();
async function runPsi(url, strategy, opts = {}) {
  const ck = `${strategy}|${url}`;
  const hit = cache.get(ck);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.body;
  const q = new URLSearchParams({ url, strategy });
  let endpoint = `${opts.apiBase ?? ""}/api/psi`;
  if (opts.apiKey || !opts.apiBase) {
    q.set("category", "performance");
    if (opts.apiKey) q.set("key", opts.apiKey);
    endpoint = GOOGLE_PSI;
  }
  const f = opts.fetchFn ?? fetch;
  const res = await f(`${endpoint}?${q}`, { headers: { accept: "application/json" } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg2 = body?.error?.message ?? `HTTP ${res.status}`;
    if (res.status === 429) throw new Error(`PageSpeed quota reached (${msg2}). Try again later, or add your own free PageSpeed Insights API key in the extension settings.`);
    throw new Error(`PageSpeed Insights failed: ${msg2}`);
  }
  if (cache.size > 200) cache.clear();
  cache.set(ck, { at: Date.now(), body });
  return body;
}
function summarize(raw, strategy) {
  const lh = raw?.lighthouseResult ?? {};
  const page = raw?.loadingExperience;
  const origin = raw?.originLoadingExperience;
  const hasMetrics = (x) => x?.metrics && Object.keys(x.metrics).length > 0 && x.origin_fallback !== true;
  const src = hasMetrics(page) ? page : origin?.metrics ? origin : null;
  const scope = src === page && src ? "page" : src ? "origin" : "none";
  const metrics = src ? Object.entries(FIELD_METRICS).filter(([k]) => src.metrics[k]).map(([k, [name, fmt4]]) => ({ name, value: fmt4(src.metrics[k].percentile), rating: String(src.metrics[k].category ?? "").replace("_", " ").toLowerCase() })) : [];
  const audits = lh.audits ?? {};
  const lab = LAB_METRICS.filter((k) => audits[k]?.displayValue).map((k) => ({ name: audits[k].title, value: audits[k].displayValue }));
  const opportunities = Object.values(audits).filter((a) => a?.details?.type === "opportunity" && (a.details.overallSavingsMs ?? 0) >= 100 && (a.score ?? 1) < 0.9).sort((a, b) => b.details.overallSavingsMs - a.details.overallSavingsMs).slice(0, 5).map((a) => ({ title: a.title, savings: `~${(a.details.overallSavingsMs / 1e3).toFixed(1)}s` }));
  const score = lh.categories?.performance?.score;
  return {
    url: lh.finalDisplayedUrl ?? lh.finalUrl ?? raw?.id ?? "",
    strategy,
    performanceScore: typeof score === "number" ? Math.round(score * 100) : null,
    field: { scope, overall: src?.overall_category ? String(src.overall_category).replace("_", " ").toLowerCase() : null, metrics },
    lab,
    opportunities
  };
}
function toMarkdown(results) {
  const out = [];
  for (const r of results) {
    out.push(`## ${r.strategy === "mobile" ? "Mobile" : "Desktop"}: ${r.url}`);
    out.push(`Lighthouse performance score: **${r.performanceScore ?? "n/a"}/100** (lab test, one run)`);
    if (r.field.scope === "none") {
      out.push("Real-user Core Web Vitals: not enough Chrome UX Report traffic for this page or origin yet.");
    } else {
      out.push(`Real-user Core Web Vitals (${r.field.scope === "page" ? "this URL" : "whole origin"}, 28-day p75): **${r.field.overall ?? "n/a"}**`);
      for (const m of r.field.metrics) out.push(`- ${m.name}: ${m.value} (${m.rating})`);
    }
    if (r.lab.length) {
      out.push("Lab metrics:");
      for (const m of r.lab) out.push(`- ${m.name}: ${m.value}`);
    }
    if (r.opportunities.length) {
      out.push("Biggest opportunities:");
      for (const o of r.opportunities) out.push(`- ${o.title} (${o.savings})`);
    }
    out.push("");
  }
  out.push("Field data rates real users; Google uses it for the page experience signal. The lab score is a single simulated run and moves between tests.");
  out.push("AlchemyAgent Pro tracks this weekly per template and turns it into a ranked fix list: https://alchemyagent.ai");
  out.push("Data: Google PageSpeed Insights and the Chrome UX Report.");
  return out.join("\n");
}

// src/crux.ts
var METRICS = {
  largest_contentful_paint: { name: "LCP", good: 2500, poor: 4e3, fmt: (v) => `${(v / 1e3).toFixed(2)}s` },
  interaction_to_next_paint: { name: "INP", good: 200, poor: 500, fmt: (v) => `${Math.round(v)}ms` },
  cumulative_layout_shift: { name: "CLS", good: 0.1, poor: 0.25, fmt: (v) => v.toFixed(2) },
  first_contentful_paint: { name: "FCP", good: 1800, poor: 3e3, fmt: (v) => `${(v / 1e3).toFixed(2)}s` },
  experimental_time_to_first_byte: { name: "TTFB", good: 800, poor: 1800, fmt: (v) => `${(v / 1e3).toFixed(2)}s` }
};
var CRUX_METRICS = Object.keys(METRICS);
var BARS = "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588";
function spark(vals) {
  const lo = Math.min(...vals), hi = Math.max(...vals);
  return vals.map((v) => BARS[hi === lo ? 3 : Math.round((v - lo) / (hi - lo) * 7)]).join("");
}
var rate = (v, m) => v <= m.good ? "good" : v <= m.poor ? "needs improvement" : "poor";
var ymd = (d) => d ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}` : "?";
function summarizeHistory(rec) {
  const periods = rec?.collectionPeriods ?? [];
  const rows = [];
  for (const [key, m] of Object.entries(METRICS)) {
    const p75s = rec?.metrics?.[key]?.percentilesTimeseries?.p75s ?? [];
    const vals = p75s.map((v) => v == null ? NaN : Number(v)).filter((v) => !Number.isNaN(v));
    if (vals.length < 2) continue;
    const first = vals[0], latest = vals[vals.length - 1];
    rows.push({ metric: m.name, first: m.fmt(first), latest: m.fmt(latest), changePct: first ? Math.round((latest - first) / first * 100) : 0, rating: rate(latest, m), spark: spark(vals), points: vals.length });
  }
  return { rows, from: ymd(periods[0]?.firstDate), to: ymd(periods[periods.length - 1]?.lastDate) };
}
function trendMarkdown(data) {
  const { rows, from, to } = summarizeHistory(data.record);
  if (!rows.length) return `Not enough Chrome UX Report history for ${data.key} yet.`;
  const out = [
    `## Core Web Vitals trend: ${data.key}`,
    `${data.scope === "origin" ? "Whole origin" : "This URL"}, ${data.formFactor.toLowerCase()}, 75th percentile of real Chrome users, ${from} to ${to} (weekly, 28-day windows).`,
    "",
    "| Metric | Then | Now | Change | Now rated | Trend |",
    "|---|---|---|---|---|---|",
    ...rows.map((r) => `| ${r.metric} | ${r.first} | ${r.latest} | ${r.changePct > 0 ? "+" : ""}${r.changePct}% | ${r.rating} | ${r.spark} |`),
    "",
    "Lower is better for every metric. A metric passes Core Web Vitals when its p75 is rated good (LCP, INP and CLS are the three that count).",
    "AlchemyAgent Pro ties these trends to releases and template changes, and alerts you when a metric slips: https://alchemyagent.ai",
    "Source: Chrome UX Report."
  ];
  return out.join("\n");
}

// src/bots.ts
var BOTS = [
  { token: "GPTBot", owner: "OpenAI", purpose: "Model training", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot", ipList: "https://openai.com/gptbot.json" },
  { token: "OAI-SearchBot", owner: "OpenAI", purpose: "ChatGPT search index", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot", ipList: "https://openai.com/searchbot.json" },
  { token: "ChatGPT-User", owner: "OpenAI", purpose: "Live fetch when a ChatGPT user asks", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot", ipList: "https://openai.com/chatgpt-user.json" },
  { token: "ClaudeBot", owner: "Anthropic", purpose: "Model training", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { token: "Claude-SearchBot", owner: "Anthropic", purpose: "Claude search index" },
  { token: "Claude-User", owner: "Anthropic", purpose: "Live fetch when a Claude user asks" },
  { token: "PerplexityBot", owner: "Perplexity", purpose: "Perplexity search index", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)", ipList: "https://www.perplexity.com/perplexitybot.json" },
  { token: "Perplexity-User", owner: "Perplexity", purpose: "Live fetch when a Perplexity user asks", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)", ipList: "https://www.perplexity.com/perplexity-user.json" },
  { token: "Googlebot", owner: "Google", purpose: "Google Search, AI Overviews and AI Mode", ua: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", ipList: "https://developers.google.com/static/search/apis/ipranges/googlebot.json" },
  { token: "Google-Extended", owner: "Google", purpose: "robots.txt opt-out for Gemini training and grounding (no separate crawler)" },
  { token: "Bingbot", owner: "Microsoft", purpose: "Bing Search and Copilot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36", ipList: "https://www.bing.com/toolbox/bingbot.json" },
  { token: "Applebot", owner: "Apple", purpose: "Siri and Spotlight search" },
  { token: "Applebot-Extended", owner: "Apple", purpose: "robots.txt opt-out for Apple Intelligence training (no separate crawler)" },
  { token: "CCBot", owner: "Common Crawl", purpose: "Open web dataset widely used for training" },
  { token: "Meta-ExternalAgent", owner: "Meta", purpose: "Model training" },
  { token: "Amazonbot", owner: "Amazon", purpose: "Alexa and Amazon AI" },
  { token: "Bytespider", owner: "ByteDance", purpose: "Model training" },
  { token: "DuckAssistBot", owner: "DuckDuckGo", purpose: "DuckAssist AI answers" },
  { token: "MistralAI-User", owner: "Mistral", purpose: "Live fetch when a Le Chat user asks" }
];

// src/robots.ts
function parseRobots(txt) {
  const groups = [];
  const sitemaps = [];
  let cur = null;
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (!cur || !lastWasAgent) groups.push(cur = { agents: [], rules: [] });
      cur.agents.push(val.toLowerCase());
      lastWasAgent = true;
    } else if (key === "allow" || key === "disallow") {
      lastWasAgent = false;
      if (cur && val) cur.rules.push({ allow: key === "allow", path: val });
    } else if (key === "sitemap") {
      if (val) sitemaps.push(val);
    } else {
      lastWasAgent = false;
    }
  }
  return { groups, sitemaps };
}
function rulesFor(robots, token) {
  const t = token.toLowerCase();
  const own = robots.groups.filter((g) => g.agents.includes(t));
  if (own.length) return { rules: own.flatMap((g) => g.rules), matched: "specific" };
  const star = robots.groups.filter((g) => g.agents.includes("*"));
  return { rules: star.flatMap((g) => g.rules), matched: star.length ? "wildcard" : "none" };
}
function toRegex(pattern) {
  const anchored = pattern.endsWith("$");
  const body = (anchored ? pattern.slice(0, -1) : pattern).replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp("^" + body + (anchored ? "$" : ""));
}
function isAllowed(rules, path) {
  if (path === "/robots.txt") return { allowed: true };
  let best;
  for (const r of rules) {
    if (!toRegex(r.path).test(path)) continue;
    if (!best || r.path.length > best.path.length || r.path.length === best.path.length && r.allow && !best.allow) best = r;
  }
  return { allowed: best ? best.allow : true, rule: best };
}

// src/aiprefs.ts
var UA = "AlchemyAgent-Check/0.1 (+https://alchemyagent.ai)";
function kv(s) {
  const out = {};
  for (const part of s.split(/[,;]/)) {
    const m = part.trim().match(/^([\w-]+)\s*=\s*([\w-]+)/);
    if (m) out[m[1].toLowerCase()] = m[2].toLowerCase();
  }
  return out;
}
function parseRobotsPrefs(txt) {
  const contentSignals = [];
  const contentUsage = [];
  let agents = [];
  let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (key === "user-agent") {
      agents = lastWasAgent ? [...agents, m[2]] : [m[2]];
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    const who = agents.length ? agents.join(", ") : "all";
    if (key === "content-signal") contentSignals.push({ agents: who, signals: kv(m[2]) });
    if (key === "content-usage") contentUsage.push({ where: `robots.txt (${who})`, value: m[2].trim() });
  }
  return { contentSignals, contentUsage };
}
async function aiPrefsCheck(origin, robotsText, page, f = fetch) {
  const fromRobots = robotsText ? parseRobotsPrefs(robotsText) : { contentSignals: [], contentUsage: [] };
  const h = page?.headers;
  const html = page?.text ?? "";
  const meta = (name) => html.match(new RegExp(`<meta\\b[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1];
  const noai = [];
  const xr = h?.get("x-robots-tag") ?? "";
  if (/\bnoai\b|\bnoimageai\b/i.test(xr)) noai.push(`X-Robots-Tag: ${xr}`);
  for (const m of html.matchAll(/<meta\b[^>]*name=["'](robots|[\w-]*bot)["'][^>]*content=["']([^"']*)["']/gi)) if (/\bnoai\b|\bnoimageai\b/i.test(m[2])) noai.push(`<meta name="${m[1]}" content="${m[2]}">`);
  const cu = h?.get("content-usage");
  const [tdmJson, aiTxt] = await Promise.all([
    get(f, `${origin}/.well-known/tdmrep.json`, UA, 8e3),
    get(f, `${origin}/ai.txt`, UA, 8e3)
  ]);
  const real = (r) => challenged(r) ? null : r.status === 200 && !/<html/i.test(r.text.slice(0, 300));
  return {
    contentSignals: fromRobots.contentSignals,
    contentUsage: [...fromRobots.contentUsage, ...cu ? [{ where: "HTTP header", value: cu }] : []],
    tdm: { header: h?.get("tdm-reservation") ?? void 0, meta: meta("tdm-reservation"), wellKnown: real(tdmJson) },
    noai,
    aiTxt: real(aiTxt)
  };
}
var SIGNAL_MEANING = {
  search: "building a search index and showing links/snippets",
  "ai-input": "using content as input to AI answers (RAG, grounding, AI Overviews)",
  "ai-train": "training or fine-tuning AI models"
};
function aiPrefsMarkdown(p) {
  const L = ["### AI usage preferences (beyond allow/disallow)"];
  const any = p.contentSignals.length || p.contentUsage.length || p.tdm.header || p.tdm.meta || p.tdm.wellKnown || p.noai.length || p.aiTxt;
  for (const c of p.contentSignals) {
    const parts = Object.entries(c.signals).map(([k, v]) => `${k}=${v}${SIGNAL_MEANING[k] ? ` (${SIGNAL_MEANING[k]})` : ""}`);
    L.push(`- Content-Signal for ${c.agents}: ${parts.join("; ") || "(empty)"}`);
    if (c.signals["ai-input"] === "no") L.push("  - ai-input=no asks AI tools not to use your pages in answers. If you want to be cited in AI search, that works against you.");
  }
  for (const c of p.contentUsage) L.push(`- Content-Usage (IETF AI Preferences draft) in ${c.where}: \`${c.value}\``);
  if (p.tdm.header || p.tdm.meta) L.push(`- TDMRep reservation: ${[p.tdm.header && `header tdm-reservation: ${p.tdm.header}`, p.tdm.meta && `meta tdm-reservation=${p.tdm.meta}`].filter(Boolean).join(", ")} (text-and-data-mining rights reserved, EU DSM Article 4).`);
  if (p.tdm.wellKnown) L.push("- /.well-known/tdmrep.json is published (W3C TDMRep policy file).");
  if (p.noai.length) L.push(`- "noai" directives: ${p.noai.join("; ")}. Few crawlers honor these; robots.txt and Content-Signal are more widely read.`);
  if (p.aiTxt) L.push("- /ai.txt is present (Spawning's AI-training opt-out file).");
  if (!any) {
    L.push("- None found. The site says nothing machine-readable about AI use beyond robots.txt.");
    L.push("- Optional: add a Cloudflare-style line to robots.txt to state your intent, e.g. `Content-Signal: search=yes, ai-input=yes, ai-train=no` (be cited in AI answers, opt out of training). These are preferences, not access controls.");
  }
  return L.join("\n");
}

// src/crawler.ts
var OUR_UA = "AlchemyAgent-Check/0.1 (+https://alchemyagent.ai)";
var BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
async function get(f, url, ua, ms = 15e3) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await f(url, { headers: { "user-agent": ua, accept: "text/html,*/*" }, redirect: "follow", signal: ctl.signal });
    const text = await r.text().catch(() => "");
    return { status: r.status, headers: r.headers, text, url: r.url || url };
  } catch (e) {
    return { status: 0, headers: new Headers(), text: "", url, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(t);
  }
}
function challenged(res) {
  return res.headers.get("cf-mitigated") === "challenge" || /<title>\s*Just a moment/i.test(res.text) || /captcha|access denied/i.test(res.text.slice(0, 3e3));
}
function metaRobots(html) {
  const out = [];
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag2 = m[0];
    const name = tag2.match(/\bname\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    const content = tag2.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
    if (name && content != null && (name === "robots" || BOTS.some((b) => b.token.toLowerCase() === name))) out.push({ name, content: content.toLowerCase() });
  }
  return out;
}
async function crawlerCheck(input, f = fetch, ipCounts = {}) {
  const target = new URL(input);
  const origin = target.origin;
  const path = target.pathname + target.search;
  const robotsRes = await get(f, `${origin}/robots.txt`, OUR_UA);
  const robotsChallenged = challenged(robotsRes) || robotsRes.status === 200 && /<html/i.test(robotsRes.text.slice(0, 500));
  const robotsNote = robotsChallenged ? "could not be read (the site's firewall answered with a challenge page instead), so per-bot rules below are unknown" : robotsRes.status === 200 ? "found" : robotsRes.status >= 500 ? `returned ${robotsRes.status}; Google treats a 5xx robots.txt as "block everything" until it recovers` : robotsRes.status === 0 ? `could not be fetched (${robotsRes.error})` : `returned ${robotsRes.status}, so crawlers treat the whole site as allowed`;
  const robots = parseRobots(robotsRes.status === 200 && !robotsChallenged ? robotsRes.text : "");
  const serverBlocksAll = robotsRes.status >= 500;
  const page = await get(f, target.toString(), BROWSER_UA);
  const baselineBlocked = page.status !== 200 || challenged(page);
  const xRobots = baselineBlocked ? "" : page.headers.get("x-robots-tag") ?? "";
  const metas = baselineBlocked ? [] : metaRobots(page.text);
  const rows = BOTS.map((b) => {
    const { rules, matched } = rulesFor(robots, b.token);
    const verdict = isAllowed(rules, path);
    return {
      token: b.token,
      owner: b.owner,
      purpose: b.purpose,
      robots: robotsChallenged ? "unknown" : serverBlocksAll || !verdict.allowed ? "blocked" : "allowed",
      robotsRule: verdict.rule ? `${verdict.rule.allow ? "Allow" : "Disallow"}: ${verdict.rule.path}` : void 0,
      matched,
      ipList: b.ipList ? ipCounts[b.token] ? `${ipCounts[b.token]} ranges` : "published" : void 0
    };
  });
  const probeBots = baselineBlocked ? [] : BOTS.filter((b) => !!b.ua);
  for (let i = 0; i < probeBots.length; i += 3) {
    await Promise.all(probeBots.slice(i, i + 3).map(async (b) => {
      const r = await get(f, target.toString(), b.ua);
      const row = rows.find((x) => x.token === b.token);
      row.probe = r.status === 0 ? "no response" : challenged(r) ? `${r.status} challenge` : r.status === page.status ? `${r.status} same as browser` : `${r.status} (browser got ${page.status})`;
    }));
  }
  const sitemapUrls = robots.sitemaps.length ? robots.sitemaps.slice(0, 5) : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const sitemaps = await Promise.all(sitemapUrls.map(async (u) => {
    const r = await get(f, u, OUR_UA);
    return { url: u, status: r.status, challenged: challenged(r), listed: robots.sitemaps.includes(u) };
  }));
  const llms = await get(f, `${origin}/llms.txt`, OUR_UA);
  const llmsTxt = challenged(llms) ? "unknown" : llms.status === 200 && !/<html/i.test(llms.text.slice(0, 500)) ? "present" : "missing";
  const aiPrefs = await aiPrefsCheck(origin, robotsRes.status === 200 && !robotsChallenged ? robotsRes.text : null, baselineBlocked ? null : page, f);
  return { aiPrefs, origin, path, robotsStatus: robotsRes.status, robotsNote, pageStatus: page.status, baselineBlocked, pageChallenged: challenged(page), xRobots, metas, rows, sitemaps, llmsTxt };
}
function crawlerMarkdown(r, from = "your machine") {
  const blocked = r.rows.filter((x) => x.robots === "blocked");
  const probeIssues = r.rows.filter((x) => x.probe && !/same as browser/.test(x.probe));
  const pageDirectives = [r.xRobots && `X-Robots-Tag: ${r.xRobots}`, ...r.metas.map((m) => `<meta name="${m.name}" content="${m.content}">`)].filter(Boolean);
  const noindex = pageDirectives.some((d) => /noindex|none/.test(d));
  const out = [
    `## AI crawler access: ${r.origin}${r.path}`,
    `robots.txt ${r.robotsNote}. ${r.baselineBlocked ? `The page answered our plain check with ${r.pageStatus}${r.pageChallenged ? " and a firewall challenge" : ""}.` : `Page returned ${r.pageStatus}.`}`,
    "",
    "| Crawler | Owner | What it does | robots.txt | UA probe | IP list |",
    "|---|---|---|---|---|---|",
    ...r.rows.map((x) => `| ${x.token} | ${x.owner} | ${x.purpose} | ${x.robots === "blocked" ? `**blocked**${x.robotsRule ? ` (${x.robotsRule})` : ""}` : x.robots} | ${x.probe ?? (r.baselineBlocked ? "inconclusive" : "n/a")} | ${x.ipList ?? "none published"} |`),
    "",
    "### What stands out"
  ];
  if (r.rows.every((x) => x.robots === "unknown")) out.push("- We couldn't read robots.txt, so per-bot rules are unknown.");
  else if (!blocked.length) out.push("- robots.txt lets every listed crawler reach this page.");
  else out.push(`- robots.txt blocks ${blocked.map((b) => b.token).join(", ")} from this page. Blocking training bots (GPTBot, ClaudeBot, CCBot, Google-Extended) is a business choice. Blocking search or user-fetch bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot) keeps the page out of those AI answers.`);
  if (r.baselineBlocked) out.push(`- The site's firewall or CDN ${r.pageChallenged ? "challenged" : `refused (${r.pageStatus})`} our automated check, so page-level directives and the bot user-agent probe are inconclusive. This is common on sites with bot protection, and verified crawlers coming from their real IPs usually still get through. Confirm in your CDN's bot or firewall logs, or allow AI bots by their published IP ranges.`);
  else if (noindex) out.push(`- The page itself says not to index it: ${pageDirectives.join("; ")}.`);
  else if (pageDirectives.length) out.push(`- Page-level directives: ${pageDirectives.join("; ")}.`);
  if (probeIssues.length) out.push(`- Requests using these bots' user-agents were treated differently from a browser: ${probeIssues.map((p) => `${p.token} (${p.probe})`).join(", ")}. A CDN or firewall rule may be blocking them. This probe comes from ${from}, not the bots' real IPs, so some firewalls block it as an impostor while still letting the verified bot in; confirm in your CDN's bot or firewall logs.`);
  else if (!r.baselineBlocked) out.push(`- No firewall or CDN difference showed up for the bot user-agents we probed (from ${from}; verified-IP rules can't be seen this way).`);
  const okMaps = r.sitemaps.filter((s) => s.status === 200 && !s.challenged);
  const blockedMaps = r.sitemaps.filter((s) => s.challenged || s.status === 403);
  out.push(!okMaps.length && blockedMaps.length ? `- Sitemap: the firewall blocked our check of ${blockedMaps.map((s) => s.url).join(", ")}, so we couldn't confirm it.` : okMaps.length ? `- Sitemap: ${okMaps.map((s) => s.url).join(", ")}${okMaps.some((s) => s.listed) ? " (listed in robots.txt)" : " (not listed in robots.txt; add a Sitemap: line)"}.` : "- No working sitemap found in robots.txt or at /sitemap.xml.");
  out.push(r.llmsTxt === "unknown" ? "- llms.txt: blocked by the firewall, couldn't check." : r.llmsTxt === "present" ? "- llms.txt is present." : "- No llms.txt. It's optional, but some AI tools read it as a guide to your key pages.");
  out.push("- Operators with an IP list can be allowlisted by IP in your firewall, which is safer than allowing by user-agent alone.");
  out.push("", aiPrefsMarkdown(r.aiPrefs));
  out.push("", "AlchemyAgent Pro rechecks this weekly and reads your CDN logs to confirm which AI bots actually reach you: https://alchemyagent.ai");
  return out.join("\n");
}

// src/schema.ts
var RULES = {
  Organization: { required: ["name"], recommended: ["url", "logo", "sameAs"] },
  LocalBusiness: { required: ["name", "address"], recommended: ["telephone", "url", "geo", "openingHoursSpecification", "priceRange"] },
  Product: { required: ["name", ["offers", "review", "aggregateRating"]], recommended: ["image", "description", "brand", "sku"] },
  Offer: { required: [["price", "priceSpecification"]], recommended: ["priceCurrency", "availability", "url"] },
  Article: { required: ["headline"], recommended: ["image", "datePublished", "dateModified", "author"] },
  FAQPage: { required: ["mainEntity"], note: "Google only shows FAQ rich results for well-known government and health sites since 2023; the markup still helps machines read the page." },
  Question: { required: ["name", "acceptedAnswer"] },
  BreadcrumbList: { required: ["itemListElement"] },
  ListItem: { required: ["position"], recommended: ["name", "item"] },
  Review: { required: ["author", "reviewRating"], recommended: ["itemReviewed", "datePublished"] },
  AggregateRating: { required: ["ratingValue", ["ratingCount", "reviewCount"]] },
  Event: { required: ["name", "startDate", "location"], recommended: ["endDate", "eventStatus", "image", "offers"] },
  VideoObject: { required: ["name", "thumbnailUrl", "uploadDate"], recommended: ["description", "duration", "contentUrl"] },
  WebSite: { required: ["name", "url"] },
  WebPage: { required: [], recommended: ["name", "url"] },
  Service: { required: ["name"], recommended: ["provider", "areaServed", "description"] },
  Person: { required: ["name"], recommended: ["url", "sameAs", "jobTitle"] },
  JobPosting: { required: ["title", "description", "datePosted", "hiringOrganization", ["jobLocation", "applicantLocationRequirements"]] },
  SoftwareApplication: { required: ["name", ["offers", "aggregateRating"]], recommended: ["applicationCategory", "operatingSystem"] },
  Recipe: { required: ["name", "image"], recommended: ["recipeIngredient", "recipeInstructions", "author"] },
  HowTo: { required: ["name", "step"], note: "Google retired HowTo rich results in 2023." }
};
var ALIASES = { BlogPosting: "Article", NewsArticle: "Article", TechArticle: "Article", Corporation: "Organization", ProfessionalService: "LocalBusiness", AboutPage: "WebPage", ContactPage: "WebPage", CollectionPage: "WebPage", FAQPage: "FAQPage", MobileApplication: "SoftwareApplication", WebApplication: "SoftwareApplication" };
var LOCAL_SUBTYPES = /^(?:\w+Store|Restaurant|Dentist|Physician|LegalService|Attorney|AutoRepair|HomeAndConstructionBusiness|HealthAndBeautyBusiness|FinancialService|RealEstateAgent|MedicalBusiness|FoodEstablishment|LodgingBusiness|Hotel|EntertainmentBusiness|SportsActivityLocation|AutomotiveBusiness|EmergencyService|GovernmentOffice|ProfessionalService|LocalBusiness)$/;
var URL_KEYS = /* @__PURE__ */ new Set(["url", "logo", "image", "sameAs", "thumbnailUrl", "contentUrl", "embedUrl", "item", "@id"]);
var DATE_KEYS = /* @__PURE__ */ new Set(["datePublished", "dateModified", "startDate", "endDate", "uploadDate", "datePosted", "validThrough", "priceValidUntil"]);
var ISO = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
var types = (n4) => (Array.isArray(n4["@type"]) ? n4["@type"] : n4["@type"] ? [n4["@type"]] : []).map(String);
var ruleFor = (t) => {
  const k = RULES[t] ? t : ALIASES[t] ?? (LOCAL_SUBTYPES.test(t) ? "LocalBusiness" : "");
  return k && RULES[k] ? [k, RULES[k]] : null;
};
var present = (v) => v !== void 0 && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
function walk(v, cb, path = "") {
  if (Array.isArray(v)) v.forEach((x, i) => walk(x, cb, `${path}[${i}]`));
  else if (v && typeof v === "object") {
    cb(v, path);
    for (const [k, x] of Object.entries(v)) if (k !== "@context") walk(x, cb, path ? `${path}.${k}` : k);
  }
}
function checkJsonLd(blocks) {
  const issues = [];
  const nodes = [];
  const parsed = [];
  blocks.forEach((raw, bi) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      issues.push({ level: "error", where: `block ${bi + 1}`, message: `Invalid JSON: ${e.message}. Google ignores the whole block.` });
      return;
    }
    parsed.push(data);
    const roots = Array.isArray(data) ? data : [data];
    for (const r of roots) {
      const ctx = JSON.stringify(r?.["@context"] ?? "");
      if (!/schema\.org/i.test(ctx)) issues.push({ level: "warning", where: `block ${bi + 1}`, message: "Missing or non-schema.org @context." });
    }
    walk(data, (n4, path) => nodes.push({ n: n4, path: `block ${bi + 1}${path ? " \u203A " + path : ""}`, block: bi }));
  });
  const ids = /* @__PURE__ */ new Map();
  for (const { n: n4, block } of nodes) if (typeof n4["@id"] === "string" && types(n4).length) {
    const arr = ids.get(n4["@id"]) ?? [];
    arr.push({ types: types(n4), block });
    ids.set(n4["@id"], arr);
  }
  const typeCount = {};
  for (const { n: n4, path } of nodes) {
    const ts = types(n4);
    const isRef = !ts.length && typeof n4["@id"] === "string" && Object.keys(n4).length === 1;
    if (isRef) {
      if (!ids.has(n4["@id"])) issues.push({ level: "warning", where: path, message: `References @id "${n4["@id"]}" but no node on the page has that @id.` });
      continue;
    }
    for (const t of ts) {
      typeCount[t] = (typeCount[t] ?? 0) + 1;
      const r = ruleFor(t);
      if (!r) continue;
      const [rk, rule] = r;
      for (const req of rule.required) {
        const opts = Array.isArray(req) ? req : [req];
        if (!opts.some((k) => present(n4[k]))) issues.push({ level: "error", where: `${path} (${t})`, message: `Missing required ${opts.length > 1 ? "one of " + opts.join(" / ") : opts[0]}.` });
      }
      const missRec = (rule.recommended ?? []).filter((k) => !present(n4[k]));
      if (missRec.length && ts.length && !path.includes("itemListElement")) issues.push({ level: "info", where: `${path} (${t})`, message: `Recommended but missing: ${missRec.join(", ")}.` });
      if (rule.note) issues.push({ level: "info", where: `${path} (${t})`, message: rule.note });
      if ((rk === "LocalBusiness" || rk === "Organization") && present(n4.aggregateRating))
        issues.push({ level: "warning", where: `${path} (${t})`, message: "aggregateRating on your own business is a self-serving review; Google doesn't show stars for it." });
      if (rk === "AggregateRating") {
        const v = parseFloat(n4.ratingValue), best = parseFloat(n4.bestRating ?? 5), worst = parseFloat(n4.worstRating ?? 1);
        if (Number.isFinite(v) && (v > best || v < worst)) issues.push({ level: "error", where: path, message: `ratingValue ${v} is outside ${worst}\u2013${best}.` });
      }
    }
    for (const [k, v] of Object.entries(n4)) {
      const vals = Array.isArray(v) ? v : [v];
      for (const x of vals) {
        if (URL_KEYS.has(k) && typeof x === "string" && x && !/^(https?:)?\/\//i.test(x) && !(k === "@id" && x.startsWith("#")) && !x.startsWith("data:"))
          issues.push({ level: "warning", where: `${path}.${k}`, message: `Relative URL "${x.slice(0, 80)}". Use an absolute URL.` });
        if (DATE_KEYS.has(k) && typeof x === "string" && !ISO.test(x.trim()))
          issues.push({ level: "error", where: `${path}.${k}`, message: `"${x}" isn't an ISO 8601 date (use 2026-10-15 or 2026-10-15T09:00:00-07:00).` });
        if (typeof x === "string" && x.trim() === "" && !k.startsWith("@")) issues.push({ level: "warning", where: `${path}.${k}`, message: "Empty value." });
      }
    }
  }
  for (const t of ["Organization", "LocalBusiness", "WebSite", "Product", "Article", "BlogPosting", "FAQPage", "BreadcrumbList"]) {
    const withType = nodes.filter(({ n: n4 }) => types(n4).includes(t) && Object.keys(n4).length > 2);
    const distinct = new Set(withType.map(({ n: n4 }) => n4["@id"] ?? JSON.stringify(n4).slice(0, 200)));
    if (distinct.size > 1 && new Set(withType.map((w) => w.block)).size > 1)
      issues.push({ level: "warning", where: t, message: `${distinct.size} separate ${t} entities in ${new Set(withType.map((w) => w.block)).size} different blocks. Usually two plugins or snippets emitting schema; merge them under one @id.` });
  }
  return { blocks: blocks.length, nodes: nodes.length, typeCount, issues };
}
async function schemaCheck(url, f = fetch) {
  const res = await get(f, url, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36");
  if (res.status === 0) throw new Error(`Couldn't fetch ${url}.`);
  if (challenged(res) || res.status >= 400) throw new Error(`The site's firewall or server answered ${res.status}${challenged(res) ? " with a challenge page" : ""}, so the real page couldn't be read. Try the Rich Results Test in a browser, or check from a network the site allows.`);
  const blocks = [...res.text.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1].trim());
  const microdata = (res.text.match(/\sitemscope\b/gi) || []).length;
  const rdfa = (res.text.match(/\stypeof=["']/gi) || []).length;
  return { url: res.url, ...checkJsonLd(blocks), microdata, rdfa };
}
function schemaMarkdown(r) {
  const errs = r.issues.filter((i) => i.level === "error"), warns = r.issues.filter((i) => i.level === "warning"), infos = r.issues.filter((i) => i.level === "info");
  const out = [
    `## Structured data: ${r.url}`,
    `${r.blocks} JSON-LD block${r.blocks === 1 ? "" : "s"}, ${r.nodes} nodes${r.microdata ? `, plus ${r.microdata} microdata item${r.microdata === 1 ? "" : "s"}` : ""}${r.rdfa ? `, ${r.rdfa} RDFa nodes` : ""}.`
  ];
  if (!r.blocks && !r.microdata) out.push("", "No structured data found. At minimum, add Organization (or LocalBusiness) and WebSite on the homepage, and the matching type (Product, Article, Service) on each template.");
  const tc = Object.entries(r.typeCount).sort((a, b) => b[1] - a[1]);
  if (tc.length) out.push("", "Types: " + tc.map(([t, n4]) => n4 > 1 ? `${t} \xD7${n4}` : t).join(", "));
  const list = (title, xs, max) => {
    if (!xs.length) return;
    out.push("", `### ${title} (${xs.length})`);
    for (const i of xs.slice(0, max)) out.push(`- **${i.where}**: ${i.message}`);
    if (xs.length > max) out.push(`- \u2026and ${xs.length - max} more`);
  };
  list("Errors (block rich results)", errs, 15);
  list("Warnings", warns, 15);
  list("Suggestions", infos, 10);
  if (!errs.length && !warns.length && r.blocks) out.push("", "No errors or warnings. Rich-result eligibility also depends on content matching the markup and on Google's own policies.");
  out.push("", "Checked against Google's rich-result requirements for common types.", "AlchemyAgent Pro audits every template and writes the fixed JSON-LD for you: https://alchemyagent.ai");
  return out.join("\n");
}

// src/security.ts
var HEADERS = [
  { name: "strict-transport-security", test: (v) => /max-age=(\d+)/i.exec(v) && +/max-age=(\d+)/i.exec(v)[1] >= 15552e3 ? null : "max-age under 6 months", fix: "Strict-Transport-Security: max-age=31536000; includeSubDomains" },
  { name: "content-security-policy", test: (v) => /unsafe-inline/.test(v) && /script-src/.test(v) ? "allows inline scripts" : null, fix: "Start with Content-Security-Policy-Report-Only to see what would break, then enforce" },
  { name: "x-content-type-options", test: (v) => /nosniff/i.test(v) ? null : "not nosniff", fix: "X-Content-Type-Options: nosniff" },
  { name: "x-frame-options", test: () => null, fix: "X-Frame-Options: SAMEORIGIN (or CSP frame-ancestors 'self')" },
  { name: "referrer-policy", test: (v) => /unsafe-url|no-referrer-when-downgrade/i.test(v) ? "leaks full URLs" : null, fix: "Referrer-Policy: strict-origin-when-cross-origin" },
  { name: "permissions-policy", test: () => null, fix: "Permissions-Policy: camera=(), microphone=(), geolocation=()" }
];
async function securityCheck(url, observatory, f = fetch) {
  const res = await get(f, url, "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36");
  const blocked = res.status === 0 || challenged(res);
  const h = res.headers;
  const frameViaCsp = /frame-ancestors/i.test(h.get("content-security-policy") ?? "");
  const rows = HEADERS.map((x) => {
    const v = h.get(x.name);
    if (x.name === "x-frame-options" && !v && frameViaCsp) return { ...x, status: "ok (CSP frame-ancestors)", value: "" };
    if (!v) return { ...x, status: "missing", value: "" };
    const problem = x.test(v);
    return { ...x, status: problem ? `weak: ${problem}` : "ok", value: v };
  });
  const cookies = (h.get("set-cookie") ?? "").split(/,(?=\s*[^;=]+=)/).filter(Boolean).map((c) => ({ name: c.split("=")[0].trim(), secure: /;\s*secure/i.test(c), httpOnly: /;\s*httponly/i.test(c), sameSite: /;\s*samesite/i.test(c) }));
  return { url: res.url, https: res.url.startsWith("https://"), blocked, rows, cookies, observatory };
}
function securityMarkdown(r) {
  const o = r.observatory;
  const out = [`## Security headers: ${r.url}`];
  if (o?.grade) out.push(`Mozilla HTTP Observatory grade: **${o.grade}** (${o.score}/100), ${o.tests_passed} of ${o.tests_quantity} tests passed. Full report: ${o.details_url}`);
  else out.push(`Mozilla HTTP Observatory: ${o?.error ?? "unavailable right now"}.`);
  if (r.blocked) out.push("", "The site's firewall challenged our direct request, so the header table below may show the firewall's headers rather than the site's. The Observatory grade above is unaffected.");
  out.push("", "| Header | Status | What to set |", "|---|---|---|");
  for (const x of r.rows) out.push(`| ${x.name} | ${x.status} | ${x.status.startsWith("ok") ? "" : x.fix} |`);
  if (!r.https) out.push("", "**The page didn't end up on HTTPS.** Redirect all HTTP traffic to HTTPS first.");
  const weakCookies = r.cookies.filter((c) => !c.secure || !c.sameSite);
  if (weakCookies.length) out.push("", `Cookies set without Secure or SameSite: ${weakCookies.map((c) => c.name).join(", ")}.`);
  out.push("", "Security headers aren't a ranking factor on their own, but HTTPS and a clean, trustworthy site are part of how search engines and AI tools judge a source. On WordPress these are usually set at the CDN (Cloudflare Transform Rules) or host level.", "Source: Mozilla HTTP Observatory.");
  return out.join("\n");
}

// src/classifier.ts
var NOT_ORDINARY = ["Conversational", "Pivot", "Reply artefact", "Tracker probe", "Agent harness", "Pasted string", "Long, uncategorised"];
var REPLY = new Set(
  "yes|no|ok|okay|ok thanks|okay thanks|thanks|thank you|thank you so much|thanks a lot|cool|great|perfect|sounds good|sure|yes please|no thanks|no thank you|go on|yes go on|tell me more|more|continue|keep going|go ahead|do it|yes do it|please continue|more please|more info|more details|explain more|elaborate|got it|nice|awesome|correct|right|exactly|that works|that helps|i see|makes sense|agreed|yep|yeah|nope|why|why not|really|how so|and|and then|what else|anything else|next|okay go on|yes tell me more|show me more|give me more|both|neither|the first one|the second one|option 1|option 2|option a|option b|first|second|yes i do|no i dont|no i don't|i do|i don't|i dont|maybe|not sure|idk|hmm|hm|lol|wow|ok cool|ok great|great thanks|perfect thanks|good|very good|ok good".split("|")
);
var PIVOT = /^(and |but |so |ok |okay )?(what about|how about|what if|and for|same for|same but|what about for|now for|now do|now what about|instead of|compared to that|what other|any other|is there a cheaper|is there another|which one of those|which of these|which of those)\b/;
var TRACKER = /(\bmy location is\b|\bi am located in\b|\bi'm located in\b|\buser location\b|^context: location:|\bcurrent location is\b|give a definitive answer|provide a definitive answer|with a list of pros and cons for each)/;
var HARNESS = /\b(you are an? |you are the |act as an? |respond only|return only|reply only|answer only|output only|in json|as json|json format|ignore (all )?previous|system prompt|do not include|format the output|return the results|list all the brands|search the web and|you must|step 1[:.]|as an ai)\b/;
var CONVO = /\b(i|i'm|im|i've|ive|i'd|my|me|mine|we|we're|our|us|you|your|can you|could you|would you|please|pls|help me|tell me|give me|show me|write me|explain|should i|do i|can i|am i|need to|want to|looking for|recommend|suggest|thanks)\b/;
var EXAM = /(^|\s)(a|b|c|d)[.)] .+(^|\s)(b|c|d)[.)] |pick the answer|which of the following|fill in the blank|_{4,}|^q: /;
var PASTED = /https?:\/\/|\n|\t|"[^"]{40,}"/;
function bucket(q) {
  const s = q.trim().toLowerCase();
  const clean2 = s.replace(/[?.!,]+$/, "");
  const words2 = s.split(/\s+/).filter(Boolean);
  if (REPLY.has(clean2) || words2.length <= 3 && REPLY.has(clean2.replace(/[^a-z' ]/g, ""))) return "Reply artefact";
  if (TRACKER.test(s)) return "Tracker probe";
  if (HARNESS.test(s)) return "Agent harness";
  if (EXAM.test(s)) return "Pasted string";
  if ((s.match(/,/g) || []).length >= 3 && s.split(",").every((p) => p.trim().split(/\s+/).length <= 4)) return "Pasted string";
  if (PASTED.test(s)) return "Pasted string";
  if (PIVOT.test(s) && words2.length <= 10) return "Pivot";
  if (words2.length >= 7 || words2.length >= 4 && CONVO.test(s) || /[^\x00-\x7f]/.test(s)) return "Candidate";
  return "Ordinary";
}
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}
var num = (v) => {
  const n4 = parseFloat(String(v ?? "").replace(/[,%]/g, "").trim());
  return Number.isFinite(n4) ? n4 : 0;
};
function rowsFromCsv(text) {
  const [head, ...data] = parseCsv(text);
  if (!head) return [];
  const h = head.map((x) => x.trim().toLowerCase());
  const qi = h.findIndex((x) => ["top queries", "query", "queries"].includes(x));
  if (qi < 0) throw new Error('No query column found. Export the "Queries" table from Search Console > Performance (Export > CSV) and pass Queries.csv.');
  const col = (name) => h.indexOf(name);
  const ci = col("clicks"), ii = col("impressions"), ti = col("ctr"), pi = col("position");
  return data.filter((r) => r[qi]).map((r) => {
    const ctrRaw = ti >= 0 ? r[ti] ?? "" : "";
    return { query: r[qi], clicks: num(r[ci]), impressions: num(r[ii]), ctr: num(ctrRaw) / (ctrRaw.includes("%") ? 100 : 1), position: num(r[pi]) };
  });
}
function classify(rows) {
  const by = {};
  for (const r of rows) (by[bucket(r.query)] ||= []).push(r);
  for (const k in by) by[k].sort((a, b) => b.impressions - a.impressions);
  const totalImpr = rows.reduce((a, r) => a + r.impressions, 0) || 1;
  return { by, total: rows.length, totalImpr };
}
function classifyMarkdown(c, maxPerBucket = 8) {
  const out = [`## AI-assistant queries in this Search Console export`, `${c.total.toLocaleString()} queries, ${c.totalImpr.toLocaleString()} impressions.`, ""];
  const order = [...NOT_ORDINARY, "Candidate", "Ordinary"];
  out.push("| Bucket | Queries | Impressions | Share of impressions |", "|---|---|---|---|");
  for (const b of order) {
    const rs = c.by[b];
    if (!rs) continue;
    const im = rs.reduce((a, r) => a + r.impressions, 0);
    out.push(`| ${b} | ${rs.length} | ${im.toLocaleString()} | ${(im / c.totalImpr * 100).toFixed(1)}% |`);
  }
  const what = {
    "Tracker probe": "AI-visibility tools testing prompts in your category (a sign your space is being tracked).",
    "Agent harness": "Prompts written for AI agents, landing in Google.",
    "Pivot": 'Follow-up questions from a chat, like "what about for X".',
    "Reply artefact": 'Chat replies such as "yes" or "tell me more" that leaked into search.',
    "Pasted string": "Pasted questions, lists or quiz text."
  };
  for (const b of order) {
    if (b === "Ordinary") continue;
    const rs = c.by[b];
    if (!rs) continue;
    out.push("", `### ${b} (top ${Math.min(maxPerBucket, rs.length)} by impressions)`);
    if (what[b]) out.push(what[b]);
    if (b === "Candidate") out.push("Long or first-person queries the rules can't settle on their own. Judge each one: a full-sentence question or request typed the way someone talks to ChatGPT or Google AI Mode counts as Conversational; a long keyword string doesn't.");
    for (const r of rs.slice(0, maxPerBucket)) out.push(`- "${r.query}" (${r.impressions.toLocaleString()} impressions, ${r.clicks} clicks, position ${r.position.toFixed(1)})`);
  }
  out.push("", "Queries with impressions but no page that answers them are the content gaps worth writing for.", "AlchemyAgent Pro runs this every quarter with a model pass and turns it into page briefs: https://alchemyagent.ai");
  return out.join("\n");
}

// src/wikidata.ts
function entityMarkdown(r, siteSameAs) {
  const out = [`## Brand entity check: ${r.domain}`];
  if (!r.entities.length) {
    out.push(
      "No Wikidata item lists this domain as its official website, and none matched the brand name.",
      "",
      "Why it matters: Google's Knowledge Graph, ChatGPT, Gemini and other AI systems draw brand facts from Wikidata and Wikipedia. Without an item, they rely on whatever the open web says about you.",
      "What to do: Wikidata has notability rules (an item needs serious, public sources such as press coverage or official registries). If you qualify, an item with your official website, founding date, headquarters and social profiles is one of the strongest entity signals you can create. Keep Organization schema on your homepage either way, with sameAs links to your social profiles."
    );
    return out.join("\n");
  }
  out.push(`Matched by ${r.matchedBy}.${r.matchedBy === "name" ? " Check this is really your brand: no item lists your domain as its official website." : ""}`);
  for (const e of r.entities.slice(0, 2)) {
    out.push("", `### ${e.label} (${e.id})`, e.description ? `"${e.description}"` : "_No English description._", `Wikidata: ${e.url}${e.wikipedia ? ` \xB7 Wikipedia: ${e.wikipedia}` : " \xB7 No English Wikipedia article"} \xB7 ${e.sitelinks} sitelinks`);
    if (e.aliases.length) out.push(`Also known as: ${e.aliases.join(", ")}`);
    for (const fct of e.facts) out.push(`- ${fct.label}: ${fct.values.join(", ")}`);
    const gaps = [];
    const has = (p) => e.facts.some((x) => x.prop === p);
    if (!e.description) gaps.push("add a short English description");
    if (!has("P856")) gaps.push("add your official website (P856)");
    if (!has("P571")) gaps.push("add the founding date (P571)");
    if (!has("P159")) gaps.push("add headquarters (P159)");
    if (!["P2002", "P2013", "P2003", "P4264", "P2397"].some(has)) gaps.push("add social profile IDs (LinkedIn, X, YouTube)");
    if (gaps.length) out.push("", `Gaps on Wikidata: ${gaps.join("; ")}. Edits need public sources.`);
    if (siteSameAs && !siteSameAs.length) {
      out.push(`Your homepage has no Organization schema with sameAs links. Add Organization JSON-LD with sameAs pointing to "${e.url}"${e.wikipedia ? `, "${e.wikipedia}"` : ""} and your social profiles, so search engines and AI systems connect your site to this entity.`);
    } else if (siteSameAs) {
      const linksItem = siteSameAs.some((s) => s.includes(e.id) || e.wikipedia && s.toLowerCase() === e.wikipedia.toLowerCase());
      out.push(linksItem ? "Your homepage schema links to this item in sameAs. Good." : `Your homepage Organization schema doesn't link to this item. Add "${e.url}"${e.wikipedia ? ` and "${e.wikipedia}"` : ""} to its sameAs so search engines and AI systems connect your site to the entity.`);
    }
  }
  out.push("", "Data: Wikidata (CC0).");
  return out.join("\n");
}

// src/wayback.ts
var UA2 = "AlchemyAgent/0.1 (https://alchemyagent.ai; support@alchemyagent.ai)";
var CDX = "https://web.archive.org/cdx/search/cdx";
async function get2(f, url, tries = 3) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const r = await f(url, { headers: { "user-agent": UA2 } });
    if (r.ok) return r;
    last = r;
    if (r.status !== 429 && r.status < 500) break;
    await new Promise((res) => setTimeout(res, 800 * (i + 1)));
  }
  throw new Error(last?.status === 429 ? "The Wayback Machine is rate-limiting requests right now. Try again in a few minutes." : `The Wayback Machine returned ${last?.status}.`);
}
var fmt = (ts) => `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`;
var TRACK = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot", "Google-Extended", "CCBot", "Applebot-Extended", "Bytespider", "Googlebot"];
async function robotsHistory(domain, f = fetch, maxFetch = 6) {
  const d = domain.replace(/^www\./, "");
  const r = await get2(f, `${CDX}?url=${encodeURIComponent(d + "/robots.txt")}&output=json&fl=timestamp,statuscode,digest&filter=statuscode:200&collapse=digest`);
  const rows = (await r.json()).slice(1);
  if (!rows.length) return { domain: d, versions: 0, sampled: [] };
  const idx = /* @__PURE__ */ new Set([0, rows.length - 1]);
  for (let i = 1; idx.size < Math.min(maxFetch, rows.length); i++) idx.add(Math.round(i * (rows.length - 1) / (maxFetch - 1)));
  const picks = [...idx].sort((a, b) => a - b).map((i) => rows[i]);
  const results = await Promise.all(picks.map(async ([ts]) => {
    try {
      const body = await (await get2(f, `https://web.archive.org/web/${ts}id_/https://${d}/robots.txt`, 2)).text();
      if (/<html/i.test(body.slice(0, 300))) return null;
      const robots = parseRobots(body);
      return { date: fmt(ts), blocked: TRACK.filter((t) => !isAllowed(rulesFor(robots, t).rules, "/").allowed) };
    } catch {
      return null;
    }
  }));
  const sampled = results.filter((x) => !!x);
  return { domain: d, versions: rows.length, sampled, first: fmt(rows[0][0]), last: fmt(rows[rows.length - 1][0]) };
}
async function pageHistory(url, f = fetch) {
  const r = await get2(f, `${CDX}?url=${encodeURIComponent(url)}&output=json&fl=timestamp,digest&filter=statuscode:200&collapse=timestamp:8&limit=5000`);
  const rows = (await r.json()).slice(1);
  const byYear = {};
  let changes = 0, prev = "";
  for (const [ts, dg] of rows) {
    byYear[ts.slice(0, 4)] = (byYear[ts.slice(0, 4)] ?? 0) + 1;
    if (dg !== prev) changes++;
    prev = dg;
  }
  return { url, captures: rows.length, first: rows[0] && fmt(rows[0][0]), last: rows.length ? fmt(rows[rows.length - 1][0]) : void 0, byYear, changes: Math.max(0, changes - 1) };
}
function waybackMarkdown(robots, page) {
  const out = [];
  if (robots) {
    out.push(`## robots.txt history: ${robots.domain}`);
    if (!robots.versions) out.push("The Wayback Machine has no archived robots.txt for this domain.");
    else {
      out.push(`${robots.versions} distinct versions archived between ${robots.first} and ${robots.last}. Sampled ${robots.sampled.length} across that span:`, "", "| Version | Blocked at the site root |", "|---|---|");
      for (const v of robots.sampled) out.push(`| ${v.date} | ${v.blocked.length ? v.blocked.join(", ") : "none of the tracked bots"} |`);
      const changes = [];
      for (const bot of TRACK) {
        const firstBlocked = robots.sampled.find((v) => v.blocked.includes(bot));
        const lastV = robots.sampled[robots.sampled.length - 1];
        if (firstBlocked && lastV?.blocked.includes(bot)) changes.push(`${bot} blocked since about ${firstBlocked.date}`);
        else if (firstBlocked && !lastV?.blocked.includes(bot)) changes.push(`${bot} was blocked around ${firstBlocked.date} but is allowed now`);
      }
      if (changes.length) out.push("", "Changes: " + changes.join("; ") + ".");
      out.push("", "Dates are when the Wayback Machine captured each version, so a change happened on or before that date.");
    }
  }
  if (page) {
    out.push("", `## Page history: ${page.url}`);
    if (!page.captures) out.push("No archived captures of this URL.");
    else {
      out.push(`${page.captures} days captured, from ${page.first} to ${page.last}. The content changed about ${page.changes} times between captures.`);
      out.push("Captures by year: " + Object.entries(page.byYear).map(([y, n4]) => `${y}: ${n4}`).join(", "));
    }
  }
  out.push("", "Data: Internet Archive Wayback Machine.");
  return out.join("\n");
}
var TRACKED_BOTS = TRACK.filter((t) => BOTS.some((b) => b.token === t));

// src/commoncrawl.ts
var UA3 = "AlchemyAgent/0.1 (https://alchemyagent.ai; support@alchemyagent.ai)";
async function getText(f, url, tries = 2, timeoutMs = 12e3) {
  let status = 0, text = "";
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await f(url, { headers: { "user-agent": UA3 }, signal: ctl.signal });
      status = r.status;
      text = await r.text();
      if (r.ok || r.status === 404) return { status, text };
    } catch (e) {
      status = 0;
      text = String(e);
    } finally {
      clearTimeout(t);
    }
    if (i < tries - 1) await new Promise((res) => setTimeout(res, 1500));
  }
  return { status, text };
}
async function commonCrawlCheck(domain, f = fetch, crawls = 3) {
  const d = domain.replace(/^www\./, "").toLowerCase();
  const info = await getText(f, "https://index.commoncrawl.org/collinfo.json");
  if (info.status !== 200) throw new Error(`The Common Crawl index is unavailable right now (HTTP ${info.status || "no response"}). Try again later.`);
  const list = JSON.parse(info.text).slice(0, crawls);
  const out = await Promise.all(list.map(async (c) => {
    const none = (found) => ({ crawl: c.id, name: c.name, found, count: 0, sample: [], capped: false });
    const base = `https://index.commoncrawl.org/${c.id}-index?url=${encodeURIComponent(d + "/*")}&output=json`;
    const pages = await getText(f, `${base}&showNumPages=true`, 1);
    let blocks = -1;
    try {
      blocks = JSON.parse(pages.text).blocks ?? -1;
    } catch {
    }
    if (blocks === 0) return none(false);
    const r = await getText(f, `${base}&limit=50&fl=url,timestamp,status`);
    if (r.status === 404 || /No Captures found/i.test(r.text)) return none(false);
    if (r.status !== 200) return none(null);
    const rows = r.text.trim().split("\n").filter(Boolean).map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return null;
      }
    }).filter(Boolean);
    return { crawl: c.id, name: c.name, found: rows.length > 0, count: rows.length, sample: rows.slice(0, 5), capped: rows.length >= 50 };
  }));
  return { domain: d, crawls: out };
}
function commonCrawlMarkdown(r, ccbotBlocked) {
  const out = [`## Common Crawl presence: ${r.domain}`, "", "| Crawl | In the crawl? | Pages seen (sample cap 50) |", "|---|---|---|"];
  for (const c of r.crawls) {
    const n4 = c.found === null ? "index busy, couldn't check" : c.found ? c.capped ? "50+" : String(c.count) : "0";
    out.push(`| ${c.name.replace(/^.*?(\d{4})/, "$1")} (${c.crawl}) | ${c.found === null ? "unknown" : c.found ? "yes" : "no"} | ${n4} |`);
  }
  const anyYes = r.crawls.some((c) => c.found);
  const latest = r.crawls[0];
  out.push("");
  if (anyYes) {
    const ex = [...new Set(r.crawls.flatMap((c) => c.sample.map((s) => s.url.split("?")[0])))].slice(0, 3);
    out.push(`Pages from this site are in recent Common Crawl snapshots${ex.length ? `, for example ${ex.join(", ")}` : ""}.`);
  } else if (r.crawls.every((c) => c.found === false)) out.push("No pages from this site are in the last few Common Crawl snapshots.");
  if (ccbotBlocked === true) out.push("robots.txt currently blocks CCBot, so new crawls should skip the site; pages captured before the block stay in older snapshots.");
  else if (ccbotBlocked === false) out.push("robots.txt allows CCBot, so future crawls can include the site.");
  out.push("", "What this means: Common Crawl is a free, open archive of the web, and it is one of the largest sources of training data for AI models (GPT-3 and many open models were trained largely on filtered Common Crawl data). Being in it makes it likely your pages are in AI training sets; it doesn't prove that any specific model used them. To opt out of future crawls, block CCBot in robots.txt (and GPTBot, ClaudeBot, Google-Extended and Applebot-Extended for model training specifically).", latest ? `Latest crawl checked: ${latest.crawl}.` : "", "Data: Common Crawl index.");
  return out.join("\n");
}

// src/render.ts
var BROWSER_UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
var decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'").replace(/&#(\d+);/g, (_, n4) => String.fromCodePoint(Number(n4))).replace(/&[a-z]+;/gi, " ");
var textOf = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
var words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
function frameworks(html) {
  const f = [
    ["Next.js", /__NEXT_DATA__|\/_next\/static\//],
    ["Nuxt", /__NUXT__|\/_nuxt\//],
    ["Gatsby", /___gatsby/],
    ["Remix", /__remixContext/],
    ["Angular", /ng-version=|ng-app/],
    ["Vue", /data-v-[0-9a-f]{6,}|data-server-rendered/],
    ["React", /data-reactroot|react-dom|__REACT_DEVTOOLS/],
    ["Svelte", /svelte-[0-9a-z]{5,}|__sveltekit/],
    ["Astro", /astro-island|data-astro-/],
    ["Webflow", /data-wf-page|webflow\.js/],
    ["Wix", /wix-thunderbolt|static\.wixstatic/],
    ["Squarespace", /static1\.squarespace|Squarespace\./],
    ["Shopify", /cdn\.shopify\.com|Shopify\.theme/],
    ["WordPress", /wp-content\/|wp-includes\//],
    ["Framer", /framerusercontent|data-framer-/],
    ["HubSpot CMS", /hs-scripts|hubspotusercontent/]
  ];
  return f.filter(([, re]) => re.test(html)).map(([n4]) => n4);
}
async function renderCheck(url, f = fetch) {
  const r = await get(f, url, BROWSER_UA2, 2e4);
  const html = r.text;
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  const scriptKb = scripts.reduce((a, m) => a + m[2].length, 0) / 1024;
  const inlineDataKb = scripts.filter((m) => /application\/json|__NEXT_DATA__|__NUXT__|self\.__next_f/.test(m[0])).reduce((a, m) => a + m[2].length, 0) / 1024;
  const noscript = [...html.matchAll(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi)].map((m) => textOf(m[1])).join(" ");
  const stripped = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style|noscript|template|svg|iframe)\b[\s\S]*?<\/\1>/gi, " ");
  const body = stripped.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? stripped;
  const hidden = [...body.matchAll(/<(\w+)\b[^>]*(?:\shidden(?:\s|=|>)|aria-hidden="true"|style="[^"]*display:\s*none)[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => textOf(m[2])).join(" ");
  const text = textOf(body);
  const main = body.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i);
  const headings = [...body.matchAll(/<h([1-3])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: Number(m[1]), text: textOf(m[2]).slice(0, 120) })).filter((h) => h.text);
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const attr2 = (re) => decode(html.match(re)?.[1] ?? "").trim();
  const w = words(text);
  const fw = frameworks(html);
  const shell = w < 150 && (scriptKb > 50 || /<div[^>]+id=["'](root|app|__next|__nuxt|svelte)["'][^>]*>\s*<\/div>/i.test(html));
  return {
    url: r.url || url,
    status: r.status,
    challenged: challenged(r),
    htmlKb: html.length / 1024,
    scriptKb,
    inlineDataKb,
    words: w,
    mainWords: main ? words(textOf(main[2])) : null,
    noscriptWords: words(noscript),
    title: textOf(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    metaDescription: attr2(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || attr2(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i),
    h1: headings.filter((h) => h.level === 1).map((h) => h.text),
    headings,
    links: (body.match(/<a\b[^>]*href=/gi) ?? []).length,
    images: imgs.length,
    imagesNoAlt: imgs.filter((t) => !/\salt=["'][^"']+["']/i.test(t)).length,
    jsonLdBlocks: (html.match(/application\/ld\+json/gi) ?? []).length,
    lang: attr2(/<html\b[^>]*\slang=["']([^"']+)["']/i),
    canonical: attr2(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
    frameworks: fw,
    shell,
    gtm: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]{4,}/.test(html),
    hiddenWords: words(hidden),
    textRatio: html.length ? text.length / html.length : 0,
    sample: text.slice(0, 400)
  };
}
function renderMarkdown(r) {
  const L = [`## What AI crawlers see: ${r.url}`, ""];
  if (r.status !== 200 || r.challenged) {
    L.push(`The page answered a plain request with ${r.status}${r.challenged ? " and a firewall challenge" : ""}. AI crawlers that aren't allowlisted would likely get the same, so they'd see none of the content. Check your CDN/firewall bot settings (run ai_crawler_check for details).`);
    return L.join("\n");
  }
  L.push("Most AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot) read the raw HTML and don't run JavaScript. Googlebot renders JavaScript, so a page can rank in Google and still look empty to AI assistants.", "");
  L.push(
    "| Check | Result |",
    "|---|---|",
    `| Readable words in raw HTML | **${r.words.toLocaleString("en-US")}**${r.mainWords != null ? ` (${r.mainWords.toLocaleString("en-US")} inside <main>/<article>)` : " (no <main> or <article> element)"} |`,
    `| Title | ${r.title || "**missing**"} |`,
    `| Meta description | ${r.metaDescription ? r.metaDescription.slice(0, 160) : "**missing**"} |`,
    `| H1 | ${r.h1.length ? r.h1.join(" / ") : "**none in raw HTML**"} |`,
    `| H2/H3 headings | ${r.headings.filter((h) => h.level > 1).length} |`,
    `| Links / images (missing alt) | ${r.links} / ${r.images} (${r.imagesNoAlt}) |`,
    `| JSON-LD blocks in raw HTML | ${r.jsonLdBlocks} |`,
    `| HTML size / script / embedded JSON data | ${r.htmlKb.toFixed(0)} KB / ${r.scriptKb.toFixed(0)} KB / ${r.inlineDataKb.toFixed(0)} KB |`,
    `| Text-to-HTML ratio | ${(r.textRatio * 100).toFixed(1)}% |`,
    `| Platform / framework | ${r.frameworks.join(", ") || "not detected"} |`,
    ""
  );
  L.push("### Verdict");
  if (r.shell) L.push(`- **This page is a JavaScript app shell.** Only ${r.words} words are in the raw HTML, so AI crawlers see an almost empty page${r.inlineDataKb > 20 ? `. The content is probably in the ${r.inlineDataKb.toFixed(0)} KB of embedded JSON data, which crawlers don't read as page text` : ""}. Fix: server-side rendering or static generation (e.g. Next.js SSR/SSG, Nuxt SSR), or prerendering for bots.`);
  else if (r.words < 300) L.push(`- Thin raw HTML: ${r.words} words. If the page looks fuller in a browser, part of it loads with JavaScript and AI crawlers miss it.`);
  else L.push(`- Good: ${r.words.toLocaleString("en-US")} words of content are in the raw HTML, so AI crawlers can read this page.`);
  if (!r.h1.length) L.push("- No H1 in the raw HTML. Add one that says what the page is about.");
  if (!r.jsonLdBlocks && r.gtm) L.push("- No JSON-LD in the raw HTML, and Google Tag Manager is on the page. If schema is injected through GTM, only Google sees it; AI crawlers don't. Put schema in the HTML.");
  else if (!r.jsonLdBlocks) L.push("- No JSON-LD structured data in the raw HTML.");
  if (r.hiddenWords > 200) L.push(`- ${r.hiddenWords} words sit in hidden elements (tabs, accordions, modals). They're in the HTML, so crawlers can read them, but key answers are safer in visible text.`);
  if (r.noscriptWords > 50) L.push(`- ${r.noscriptWords} words are in <noscript> fallbacks; some crawlers ignore these.`);
  if (r.imagesNoAlt > 0) L.push(`- ${r.imagesNoAlt} of ${r.images} images have no alt text. AI tools can't describe what they can't read.`);
  if (!r.metaDescription) L.push("- No meta description; AI tools and search snippets often quote it.");
  L.push("", "### First 400 characters crawlers read", "> " + (r.sample || "(nothing)"));
  return L.join("\n");
}

// src/agentready.ts
var UA4 = "AlchemyAgent-Check/0.1 (+https://alchemyagent.ai)";
var isHtml = (t) => /^\s*(<!doctype html|<html)/i.test(t.slice(0, 300));
function lintLlmsTxt(txt) {
  const lines = txt.split(/\r?\n/);
  const first = lines.find((l) => l.trim()) ?? "";
  const problems = [];
  const title = /^#\s+\S/.test(first) ? first.replace(/^#\s+/, "").trim() : "";
  if (!title) problems.push("First line should be an H1 with the site or project name (`# Name`).");
  const summary = lines.find((l) => /^>\s*\S/.test(l))?.replace(/^>\s*/, "").trim() ?? "";
  if (!summary) problems.push("No `> summary` blockquote after the title. It's the one line most tools quote.");
  const sections = lines.filter((l) => /^##\s+\S/.test(l)).map((l) => l.replace(/^##\s+/, "").trim());
  if (!sections.length) problems.push("No `## Section` headings grouping the links.");
  const urls = [...txt.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((m) => m[1]);
  if (!urls.length) problems.push("No Markdown links (`- [Page name](https://...): what it covers`).");
  if (lines.some((l) => /^#\s/.test(l) && l !== first)) problems.push("More than one H1; use H2 for sections.");
  return { title, summary, sections, links: urls.length, problems, urls };
}
var DISCOVERY = [
  ["/.well-known/mcp.json", "MCP server discovery"],
  ["/.well-known/agent-card.json", "A2A agent card"],
  ["/.well-known/agent.json", "A2A agent card (older path)"],
  ["/.well-known/api-catalog", "API catalog (RFC 9727)"],
  ["/openapi.json", "OpenAPI description"],
  ["/.well-known/ai-plugin.json", "ChatGPT plugin manifest (legacy)"]
];
async function sitemapInfo(origin, robotsTxt, f) {
  const listed = parseRobots(robotsTxt).sitemaps;
  for (const u of listed.length ? listed.slice(0, 2) : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`]) {
    const r = await get(f, u, UA4, 12e3);
    if (challenged(r)) return { url: u, urls: 0, challenged: true };
    if (r.status !== 200 || !/<(urlset|sitemapindex)/i.test(r.text)) continue;
    const mods = [...r.text.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/gi)].map((m) => m[1]).filter((d) => !isNaN(Date.parse(d))).sort();
    let urls = (r.text.match(/<url>/gi) ?? []).length;
    if (/<sitemapindex/i.test(r.text)) {
      const kids = [...r.text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi)].map((m) => m[1]).slice(0, 5);
      const counts = await Promise.all(kids.map(async (k) => {
        const c = await get(f, k, UA4, 12e3);
        return (c.text.match(/<url>/gi) ?? []).length;
      }));
      urls = counts.reduce((a, b) => a + b, 0);
    }
    const newest = mods[mods.length - 1];
    return { url: u, urls, newest, ageDays: newest ? Math.floor((Date.now() - Date.parse(newest)) / 864e5) : void 0, challenged: false };
  }
  return { urls: 0, challenged: false };
}
async function agentReadiness(url, f = fetch) {
  const target = new URL(url);
  const origin = target.origin;
  const [llms, full, page, robots] = await Promise.all([
    get(f, `${origin}/llms.txt`, UA4, 1e4),
    get(f, `${origin}/llms-full.txt`, UA4, 1e4),
    get(f, target.toString(), UA4, 15e3),
    get(f, `${origin}/robots.txt`, UA4, 1e4)
  ]);
  const state = (r) => challenged(r) ? "blocked" : r.status === 200 && !isHtml(r.text) && r.text.trim() ? "present" : "missing";
  const ls = state(llms);
  const lint = ls === "present" ? lintLlmsTxt(llms.text) : { title: "", summary: "", sections: [], links: 0, problems: [], urls: [] };
  const brokenLinks = [];
  await Promise.all(lint.urls.slice(0, 8).map(async (u) => {
    let abs;
    try {
      abs = new URL(u, origin).toString();
    } catch {
      brokenLinks.push(u);
      return;
    }
    const r = await get(f, abs, UA4, 8e3);
    if (r.status >= 400 && !challenged(r)) brokenLinks.push(`${u} (${r.status})`);
    if (r.status === 0) brokenLinks.push(`${u} (no response)`);
  }));
  const html = challenged(page) ? "" : page.text;
  const altLink = html.match(/<link\b[^>]*type=["']text\/(?:markdown|x-markdown)["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*type=["']text\/(?:markdown|x-markdown)["']/i)?.[1];
  const path = target.pathname.replace(/\/$/, "");
  const mdCandidates = [path ? `${origin}${path}.md` : `${origin}/index.md`, `${origin}${path}/index.html.md`];
  const [neg, ...mds] = await Promise.all([
    f(target.toString(), { headers: { accept: "text/markdown", "user-agent": UA4 } }).then(async (r) => ({ ct: r.headers.get("content-type") ?? "", ok: r.ok })).catch(() => ({ ct: "", ok: false })),
    ...mdCandidates.map((u) => get(f, u, UA4, 8e3))
  ]);
  const mdIdx = mds.findIndex((r) => r.status === 200 && !isHtml(r.text) && /^#|\n#/.test(r.text));
  const discovery = await Promise.all(DISCOVERY.map(async ([p, label]) => {
    const r = await get(f, origin + p, UA4, 8e3);
    const found = challenged(r) ? null : r.status === 200 && !isHtml(r.text) && /^[\s\n]*[{[]/.test(r.text);
    return { path: p, label, found };
  }));
  const feeds = [...html.matchAll(/<link\b[^>]*type=["']application\/(?:rss|atom)\+xml["'][^>]*>/gi)].map((m) => m[0].match(/href=["']([^"']+)["']/i)?.[1]).filter(Boolean);
  const sitemap = await sitemapInfo(origin, robots.status === 200 && !challenged(robots) ? robots.text : "", f);
  const ld = [...html.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join(" ");
  return {
    origin,
    page: target.toString(),
    llms: {
      status: ls,
      bytes: ls === "present" ? llms.text.length : 0,
      title: lint.title,
      summary: lint.summary,
      sections: lint.sections,
      links: lint.links,
      problems: lint.problems,
      brokenLinks,
      full: state(full),
      fullKb: state(full) === "present" ? full.text.length / 1024 : 0
    },
    markdown: { altLink, negotiated: neg.ok && /markdown/i.test(neg.ct), mdUrl: mdIdx >= 0 ? mdCandidates[mdIdx] : void 0 },
    discovery,
    feeds: [...new Set(feeds)],
    sitemap,
    pageBlocked: challenged(page) || page.status >= 400,
    identity: challenged(page) || page.status >= 400 ? null : { organization: /"@type"\s*:\s*\[?\s*"(Organization|Corporation|LocalBusiness|[A-Za-z]*Business|[A-Za-z]*Store)"/.test(ld), website: /"@type"\s*:\s*"WebSite"/.test(ld), sameAs: (ld.match(/"sameAs"/g) ?? []).length }
  };
}
function agentReadyMarkdown(r) {
  const yes = (b, blocked = false) => blocked ? "blocked by firewall" : b ? "yes" : "no";
  const items = [];
  const l = r.llms;
  items.push(["llms.txt", l.status === "present" ? `yes (${l.links} links, ${l.sections.length} sections)` : l.status === "blocked" ? "blocked by firewall" : "missing", l.status === "present" ? l.problems.length || l.brokenLinks.length ? "needs fixes (below)" : "good" : l.status === "blocked" ? "couldn't check" : "add one"]);
  items.push(["llms-full.txt", l.full === "present" ? `yes (${l.fullKb.toFixed(0)} KB)` : l.full, l.full === "present" ? "good" : "optional"]);
  items.push(["Markdown version of this page", r.markdown.mdUrl ? r.markdown.mdUrl : r.markdown.altLink ? `linked: ${r.markdown.altLink}` : r.markdown.negotiated ? "served for Accept: text/markdown" : "no", r.markdown.mdUrl || r.markdown.altLink || r.markdown.negotiated ? "good" : "optional, helps agents"]);
  for (const d of r.discovery) items.push([`${d.label} (${d.path})`, yes(d.found, d.found === null), d.found ? "good" : "only if you offer an API/agent"]);
  items.push(["RSS/Atom feed", r.feeds.length ? r.feeds.slice(0, 2).join(", ") : "none linked", r.feeds.length ? "good" : "add if you publish regularly"]);
  items.push([
    "Sitemap",
    r.sitemap.challenged ? "blocked by firewall" : r.sitemap.url ? `${r.sitemap.urls.toLocaleString("en-US")} URLs${r.sitemap.newest ? `, newest lastmod ${r.sitemap.newest.slice(0, 10)} (${r.sitemap.ageDays} days ago)` : ", no lastmod dates"}` : "not found",
    r.sitemap.challenged ? "couldn't check" : !r.sitemap.url ? "add one" : !r.sitemap.newest ? "add lastmod" : (r.sitemap.ageDays ?? 0) > 90 ? "stale?" : "good"
  ]);
  const id = r.identity;
  items.push(["Organization/WebSite schema", id ? `${id.organization ? "Organization" : "no Organization"}, ${id.website ? "WebSite" : "no WebSite"}, ${id.sameAs} sameAs` : "page blocked by firewall", id ? id.organization && id.sameAs ? "good" : "add" : "couldn't check"]);
  const L = [`## Agent readiness: ${r.origin}`, "", ...r.pageBlocked ? ["The site's firewall challenged our request, so some checks below couldn't run. Verified crawlers usually still get in; check from an allowed network or a browser.", ""] : [], "| Signal | Found | Verdict |", "|---|---|---|", ...items.map((i) => `| ${i.join(" | ")} |`), ""];
  if (l.status === "present" && (l.problems.length || l.brokenLinks.length)) {
    L.push("### llms.txt fixes", ...l.problems.map((p) => `- ${p}`), ...l.brokenLinks.length ? [`- Broken links: ${l.brokenLinks.join(", ")}`] : [], "");
  }
  if (l.status === "missing") L.push("### Starter llms.txt", "Put this at /llms.txt (plain text, Markdown format), then fill in your key pages:", "```", "# Brand name", "> One sentence: what you do, for whom, where.", "", "## Key pages", "- [Services](https://example.com/services/): what you offer", "- [Pricing](https://example.com/pricing/): plans and costs", "- [About](https://example.com/about/): who you are, proof, contact", "", "## Optional", "- [Blog](https://example.com/blog/): guides and updates", "```", "");
  L.push("No AI assistant has committed to reading llms.txt yet, so treat it as cheap insurance. Clean HTML content, schema and an up-to-date sitemap matter more today.");
  return L.join("\n");
}

// src/wikipedia.ts
var UA5 = "AlchemyAgent/0.2 (https://alchemyagent.ai; support@alchemyagent.ai)";
var LANGS = ["en", "de", "fr", "es", "it", "ja", "pt", "nl", "pl", "zh"];
async function json(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15e3);
  try {
    const r = await f(url, { headers: { "user-agent": UA5, "api-user-agent": UA5, accept: "application/json" }, signal: ctl.signal });
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
async function linksIn(f, lang, domain) {
  const out = [];
  let failed = 0;
  for (const proto of ["https", "http"]) for (const q of [domain, `*.${domain}`]) {
    const d = await json(f, `https://${lang}.wikipedia.org/w/api.php?action=query&list=exturlusage&euquery=${encodeURIComponent(q)}&euprotocol=${proto}&eunamespace=0&eulimit=200&format=json&formatversion=2`);
    if (!d) {
      failed++;
      continue;
    }
    for (const e of d.query?.exturlusage ?? []) out.push({ lang, title: e.title, url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(e.title.replace(/ /g, "_"))}`, linkTo: e.url });
  }
  return failed === 4 ? null : out;
}
async function wikipediaCheck(domain, articleUrl, f = fetch, langs = LANGS) {
  const d = domain.replace(/^www\./, "").toLowerCase();
  const results = await Promise.all(langs.map(async (l) => [l, await linksIn(f, l, d)]));
  const by = /* @__PURE__ */ new Map();
  for (const [, links] of results) for (const k of links ?? []) {
    const key = `${k.lang}:${k.title}`;
    const a = by.get(key) ?? { lang: k.lang, title: k.title, url: k.url, links: [] };
    if (!a.links.includes(k.linkTo)) a.links.push(k.linkTo);
    by.set(key, a);
  }
  const out = {
    domain: d,
    articles: [...by.values()].sort((a, b) => (a.lang === "en" ? -1 : 0) - (b.lang === "en" ? -1 : 0) || a.title.localeCompare(b.title)),
    checked: results.filter(([, v]) => v).map(([l]) => l),
    failed: results.filter(([, v]) => !v).map(([l]) => l)
  };
  const m = articleUrl?.match(/^https:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)$/);
  if (m) {
    const end = /* @__PURE__ */ new Date();
    end.setUTCDate(0);
    const start = new Date(end);
    start.setUTCDate(1);
    start.setUTCMonth(start.getUTCMonth() - 11);
    const fmt4 = (x) => x.toISOString().slice(0, 10).replace(/-/g, "") + "00";
    const pv = await json(f, `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${m[1]}.wikipedia/all-access/user/${m[2]}/monthly/${fmt4(start)}/${fmt4(end)}`);
    out.pageviews = pv ? { title: decodeURIComponent(m[2]).replace(/_/g, " "), lang: m[1], months: (pv.items ?? []).map((i) => ({ month: String(i.timestamp).slice(0, 6), views: Number(i.views) || 0 })) } : null;
  }
  return out;
}
function wikipediaMarkdown(r, limit = 25) {
  const L = [`## Wikipedia presence: ${r.domain}`, ""];
  if (r.pageviews) {
    const v = r.pageviews.months;
    const total = v.reduce((a, x) => a + x.views, 0);
    const last3 = v.slice(-3).reduce((a, x) => a + x.views, 0), prev3 = v.slice(-6, -3).reduce((a, x) => a + x.views, 0);
    L.push(
      `### Brand article: ${r.pageviews.title} (${r.pageviews.lang}.wikipedia)`,
      `${total.toLocaleString("en-US")} human page views in the last ${v.length} months; last 3 months ${last3.toLocaleString("en-US")} vs ${prev3.toLocaleString("en-US")} the 3 before${prev3 ? ` (${last3 >= prev3 ? "+" : ""}${Math.round((last3 - prev3) / prev3 * 100)}%)` : ""}.`,
      ""
    );
  } else if (r.pageviews === null) L.push("Couldn't load page views for the brand article.", "");
  const n4 = r.articles.length;
  L.push(`### Articles linking to ${r.domain}`, n4 ? `${n4} article${n4 === 1 ? "" : "s"} across ${new Set(r.articles.map((a) => a.lang)).size} language${new Set(r.articles.map((a) => a.lang)).size === 1 ? "" : "s"} (checked ${r.checked.join(", ")}).` : `None found in ${r.checked.join(", ")} Wikipedia.`, "");
  if (n4) {
    L.push("| Wiki | Article | Links to |", "|---|---|---|");
    for (const a of r.articles.slice(0, limit)) L.push(`| ${a.lang} | [${a.title.replace(/\|/g, "\\|")}](${a.url}) | ${a.links.slice(0, 2).map((u) => u.replace(/^https?:\/\//, "")).join(", ")}${a.links.length > 2 ? ` +${a.links.length - 2}` : ""} |`);
    if (n4 > limit) L.push("", `\u2026and ${n4 - limit} more.`);
    L.push("");
  }
  if (r.failed.length) L.push(`Couldn't check: ${r.failed.join(", ")}.`, "");
  L.push("Why it matters: Wikipedia is one of the most heavily used sources in AI training data and AI answers, and its citations show which sources editors trust. Wikipedia links are nofollow and editors remove promotional edits, so earn citations by publishing original research or data that articles can cite. Never add links to your own site.");
  return L.join("\n");
}

// src/gdelt.ts
var BASE = "https://api.gdeltproject.org/api/v2/doc/doc";
var RATE_MSG = "GDELT (the free news API) is busy or rate-limiting this network right now. Try again in a few minutes.";
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function gdelt(f, params, deadline) {
  const q = new URLSearchParams({ ...params, format: "json" });
  for (let i = 0; i < 2; i++) {
    const left = deadline - Date.now();
    if (left < 5e3) break;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), left);
    try {
      const r = await f(`${BASE}?${q}`, { headers: { "user-agent": "AlchemyAgent/0.2 (+https://alchemyagent.ai)" }, signal: ctl.signal });
      const text = await r.text();
      if (r.ok && /^\s*\{/.test(text)) return JSON.parse(text);
      if (r.ok && !text.trim()) return {};
      if (!(/one every 5 seconds/i.test(text) || r.status === 429)) throw new Error(text.trim().slice(0, 200) || `GDELT returned ${r.status}`);
    } catch (e) {
      if (!(e instanceof TypeError) && !(e instanceof Error && e.name === "AbortError")) throw e;
    } finally {
      clearTimeout(t);
    }
    if (deadline - Date.now() > 12e3) await sleep(6e3);
  }
  throw new Error(RATE_MSG);
}
function gdeltQuery(brand, ownDomain) {
  const b = brand.trim().replace(/"/g, "");
  if (b.length < 3) throw new Error("Brand name must be at least 3 characters for news search.");
  return `"${b}"${ownDomain ? ` -domain:${ownDomain.replace(/^www\./, "")}` : ""}`;
}
async function newsMentions(brand, ownDomain, f = fetch, budgetMs = 45e3) {
  const query = gdeltQuery(brand);
  const own = ownDomain?.replace(/^www\./, "").toLowerCase();
  const list = await gdelt(f, { query, mode: "ArtList", maxrecords: "250", timespan: "3months", sort: "DateDesc" }, Date.now() + budgetMs);
  const day = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  const articles = (list?.articles ?? []).map((a) => ({ title: String(a.title ?? ""), url: String(a.url), domain: String(a.domain ?? ""), date: day(String(a.seendate ?? "")), country: String(a.sourcecountry ?? ""), language: String(a.language ?? "") })).filter((a) => !own || a.domain !== own && !a.domain.endsWith("." + own));
  const weeks = /* @__PURE__ */ new Map();
  for (const a of articles) {
    const d = new Date(a.date);
    if (isNaN(d.getTime())) continue;
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    const k = d.toISOString().slice(0, 10);
    weeks.set(k, (weeks.get(k) ?? 0) + 1);
  }
  return {
    query: own ? `${query} (excluding ${own})` : query,
    total: articles.length,
    capped: (list?.articles ?? []).length >= 250,
    articles,
    timeline: [...weeks].map(([week, count]) => ({ week, count })).sort((a, b) => a.week.localeCompare(b.week)),
    tone: null
  };
}
function newsMarkdown(r, limit = 20) {
  const L = [`## News mentions (last 3 months): ${r.query}`, ""];
  if (!r.articles.length) {
    L.push("No news articles found in GDELT's global news monitoring for this name in the last 3 months.", "", "GDELT covers online news in 65+ languages but not blogs, trade newsletters behind paywalls, or social media. Few mentions is normal for B2B brands; trade-press coverage and data-driven PR are the usual fix.");
    return L.join("\n");
  }
  L.push(`**${r.total.toLocaleString("en-US")}${r.capped ? "+" : ""} articles**${r.capped ? " (GDELT returns at most 250 per search; this is the newest 250)" : ""}${r.tone ? `; tone: ${r.tone.positive} positive, ${r.tone.neutral} neutral, ${r.tone.negative} negative` : ""}.`, "");
  if (r.timeline.length) {
    const max = Math.max(...r.timeline.map((t) => t.count), 1);
    const bars = "\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588";
    L.push(`Weekly volume: ${r.timeline.map((t) => bars[Math.min(7, Math.floor(t.count / max * 7.99))]).join("")} (${r.timeline[0].week} to ${r.timeline[r.timeline.length - 1].week})`, "");
  }
  const outlets = /* @__PURE__ */ new Map();
  for (const a of r.articles) outlets.set(a.domain, (outlets.get(a.domain) ?? 0) + 1);
  L.push(`Top outlets: ${[...outlets].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([d, c]) => `${d} (${c})`).join(", ")}`, "");
  L.push("| Date | Outlet | Headline |", "|---|---|---|");
  for (const a of r.articles.slice(0, limit)) L.push(`| ${a.date} | ${a.domain} | [${a.title.replace(/\|/g, "\\|").slice(0, 110)}](${a.url}) |`);
  L.push("", "News coverage feeds AI answers twice: articles get cited directly, and repeated mentions on trusted outlets shape what models say about a brand. Name matches can include other companies with the same name; check the headlines.", "", "Data: The GDELT Project (gdeltproject.org).");
  return L.join("\n");
}

// src/community.ts
var UA6 = "AlchemyAgent/0.2 (+https://alchemyagent.ai)";
async function json2(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15e3);
  try {
    const r = await f(url, { headers: { "user-agent": UA6, accept: "application/json" }, signal: ctl.signal });
    const body = await r.json().catch(() => null);
    if (!r.ok) throw new Error(body?.error_message ?? body?.message ?? `HTTP ${r.status}`);
    return body;
  } finally {
    clearTimeout(t);
  }
}
var strip = (s) => s.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<");
async function hackerNews(f, brand, domain) {
  const since = Math.floor(Date.now() / 1e3) - 365 * 86400;
  const q = encodeURIComponent(`"${brand}"`);
  const [text, links] = await Promise.all([
    json2(f, `https://hn.algolia.com/api/v1/search_by_date?query=${q}&tags=(story,comment)&numericFilters=created_at_i>${since}&hitsPerPage=15`),
    domain ? json2(f, `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domain)}&restrictSearchableAttributes=url&tags=story&hitsPerPage=20`) : Promise.resolve(null)
  ]);
  const items = [...text?.hits ?? [], ...(links?.hits ?? []).slice(0, 5)].map((h) => ({
    title: strip(h.title ?? h.story_title ?? (h.comment_text ?? "").slice(0, 120)),
    url: `https://news.ycombinator.com/item?id=${h.objectID}`,
    date: String(h.created_at ?? "").slice(0, 10),
    points: h.points ?? void 0,
    comments: h.num_comments ?? void 0,
    where: "Hacker News",
    kind: h._tags?.includes("comment") ? "comment" : "story"
  }));
  const seen = /* @__PURE__ */ new Set();
  return { mentions: text?.nbHits ?? 0, linking: links?.nbHits ?? 0, items: items.filter((i) => !seen.has(i.url) && seen.add(i.url)) };
}
async function stackExchange(f, brand, domain, sites) {
  const out = [];
  for (const site of sites) {
    const [text, links] = await Promise.all([
      json2(f, `https://api.stackexchange.com/2.3/search/excerpts?order=desc&sort=relevance&q=${encodeURIComponent(`"${brand}"`)}&site=${site}&pagesize=15&filter=total`).catch(() => null),
      domain ? json2(f, `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&url=${encodeURIComponent(`*${domain}*`)}&site=${site}&pagesize=10`).catch(() => null) : Promise.resolve(null)
    ]);
    const list = await json2(f, `https://api.stackexchange.com/2.3/search/excerpts?order=desc&sort=relevance&q=${encodeURIComponent(`"${brand}"`)}&site=${site}&pagesize=10`).catch(() => null);
    const items = [...links?.items ?? [], ...list?.items ?? []].map((i) => ({
      title: strip(i.title ?? ""),
      url: i.link ?? `https://${site}.com/q/${i.question_id}`,
      date: i.creation_date ? new Date(i.creation_date * 1e3).toISOString().slice(0, 10) : "",
      points: i.score,
      comments: i.answer_count,
      where: site,
      kind: i.item_type ?? "question"
    }));
    const seen = /* @__PURE__ */ new Set();
    out.push({ site, mentions: text?.total ?? list?.items?.length ?? 0, linking: links?.items?.length ?? 0, items: items.filter((i) => !seen.has(i.url) && seen.add(i.url)) });
  }
  return out;
}
async function communityMentions(brand, domain, sites, f = fetch) {
  const d = domain?.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const [hn, se] = await Promise.all([
    hackerNews(f, brand, d).catch((e) => ({ error: e instanceof Error ? e.message : String(e) })),
    stackExchange(f, brand, d, sites).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }))
  ]);
  return { brand, domain: d, hn, se };
}
function communityMarkdown(r, limit = 10) {
  const L = [`## Community mentions: "${r.brand}"${r.domain ? ` / ${r.domain}` : ""}`, ""];
  const table = (items) => {
    if (!items.length) return;
    L.push("| Date | Where | Title | Score | Replies |", "|---|---|---|---|---|");
    for (const i of items.slice(0, limit)) L.push(`| ${i.date} | ${i.where} ${i.kind} | [${(i.title || "(untitled)").replace(/\|/g, "\\|").slice(0, 100)}](${i.url}) | ${i.points ?? ""} | ${i.comments ?? ""} |`);
    L.push("");
  };
  L.push("### Hacker News");
  if ("error" in r.hn) L.push(`Couldn't search Hacker News: ${r.hn.error}`, "");
  else {
    L.push(`${r.hn.mentions} stories/comments mention the name in the last 12 months${r.domain ? `; ${r.hn.linking} stories ever linked to ${r.domain}` : ""}. Newest mentions first, then the top stories linking to the site.`, "");
    table(r.hn.items);
  }
  L.push("### Stack Exchange");
  if ("error" in r.se) L.push(`Couldn't search Stack Exchange: ${r.se.error}`, "");
  else for (const s of r.se) {
    L.push(`**${s.site}**: ${s.mentions} posts mention the name${r.domain ? `; ${s.linking} questions link to ${r.domain}` : ""}.`, "");
    table(s.items);
  }
  L.push("Name matches can include other products with the same word (e.g. a software library); check the titles.", "");
  L.push(`AI assistants cite community Q&A heavily, because it reads like real people comparing options. Reddit isn't checked here: its API requires approval for commercial use. Search it by hand (site:reddit.com "your brand").`, "", "Data: Hacker News Search by Algolia; Stack Exchange API (CC BY-SA content).");
  return L.join("\n");
}

// src/brave.ts
var sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
var BRAVE_KEY_HELP = "Brave Search rankings need your own Brave Search API key. Sign up at https://api-dashboard.search.brave.com (the free plan covers a few thousand queries a month), create a key, then paste it into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure). The key stays on your computer and is only sent to Brave.";
var host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};
async function braveRank(f, key, domain, queries, country = "US", pause = 1100) {
  const want = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
  const out = [];
  for (const [i, q] of queries.entries()) {
    if (i) await sleep2(pause);
    const params = new URLSearchParams({ q, count: "20", country, search_lang: "en", safesearch: "off" });
    try {
      const r = await f(`https://api.search.brave.com/res/v1/web/search?${params}`, { headers: { accept: "application/json", "x-subscription-token": key } });
      const body = await r.json().catch(() => null);
      if (r.status === 401 || r.status === 403 || r.status === 422) throw new Error(`Brave rejected the API key (HTTP ${r.status}). ${BRAVE_KEY_HELP}`);
      if (r.status === 429) throw new Error("Brave rate limit or monthly quota reached (HTTP 429).");
      if (!r.ok) throw new Error(`Brave Search returned HTTP ${r.status}`);
      const results = body?.web?.results ?? [];
      const idx = results.findIndex((x) => {
        const h = host(x.url);
        return h === want || h.endsWith("." + want);
      });
      out.push({
        query: q,
        position: idx >= 0 ? idx + 1 : null,
        url: idx >= 0 ? results[idx].url : void 0,
        top: results.slice(0, 3).map((x, j) => ({ position: j + 1, host: host(x.url), title: String(x.title ?? "").replace(/<[^>]+>/g, "") })),
        discussions: !!body?.discussions?.results?.length
      });
    } catch (e) {
      const msg2 = e instanceof Error ? e.message : String(e);
      if (/rejected the API key/.test(msg2)) throw e;
      out.push({ query: q, position: null, top: [], discussions: false, error: msg2 });
    }
  }
  return out;
}
function braveMarkdown(domain, rows, country) {
  const L = [`## Brave Search rankings for ${domain} (${country}, top 20)`, "", "| Query | Position | Top 3 results | Forum results shown |", "|---|---|---|---|"];
  for (const r of rows) L.push(`| ${r.query.replace(/\|/g, "\\|")} | ${r.error ? `error: ${r.error}` : r.position ? `**${r.position}**` : "not in top 20"} | ${r.top.map((t) => `${t.position}. ${t.host}`).join(", ")} | ${r.discussions ? "yes" : "no"} |`);
  const ranked = rows.filter((r) => r.position);
  L.push("", `Ranked for ${ranked.length} of ${rows.length} queries${ranked.length ? `, average position ${(ranked.reduce((a, r) => a + (r.position ?? 0), 0) / ranked.length).toFixed(1)}` : ""}.`);
  L.push("", "Why Brave: it runs its own web index (one of very few outside Google and Bing), and its Search API is used by AI assistants for live web results. Pages Brave doesn't rank are less likely to be found by those assistants. Brave discovers pages through its own crawler and through Brave browser users who opt in to share visited URLs.");
  return L.join("\n");
}

// src/osm.ts
var UA7 = "AlchemyAgent/0.2 (https://alchemyagent.ai; support@alchemyagent.ai)";
var digits = (s = "") => s.replace(/\D/g, "").slice(-10);
var norm = (s = "") => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
var hostOf = (u = "") => {
  try {
    return new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};
async function osmLookup(name, location, website, phone, f = fetch) {
  const q = new URLSearchParams({ q: `${name}, ${location}`, format: "jsonv2", addressdetails: "1", extratags: "1", namedetails: "1", limit: "5" });
  const r = await f(`https://nominatim.openstreetmap.org/search?${q}`, { headers: { "user-agent": UA7, "accept-language": "en" } });
  if (r.status === 429 || r.status === 403) throw new Error("OpenStreetMap's Nominatim service is limiting requests from this network. Try again in a minute.");
  if (!r.ok) throw new Error(`Nominatim returned HTTP ${r.status}`);
  const list = await r.json();
  const rank = (p) => /^(amenity|shop|office|craft|tourism|leisure|healthcare|club)$/.test(p.category) ? 0 : p.category === "building" ? 1 : 2;
  list.sort((a, b) => rank(a) - rank(b));
  return list.map((p) => {
    const t = p.extratags ?? {};
    const site = t.website ?? t["contact:website"] ?? t.url;
    const tel = t.phone ?? t["contact:phone"];
    const pname = p.namedetails?.name ?? p.name ?? "";
    return {
      name: pname,
      type: `${p.category}/${p.type}`,
      osmUrl: `https://www.openstreetmap.org/${p.osm_type}/${p.osm_id}`,
      address: p.display_name,
      website: site,
      phone: tel,
      hours: t.opening_hours,
      checks: {
        name: !!pname && (norm(pname).includes(norm(name)) || norm(name).includes(norm(pname))),
        website: website ? site ? hostOf(site) === hostOf(website) : false : null,
        phone: phone ? tel ? digits(tel) === digits(phone) : false : null
      }
    };
  });
}
function osmMarkdown(name, location, places, website) {
  const L = [`## OpenStreetMap listing: ${name}, ${location}`, ""];
  const NOT_BUSINESS = /^(highway|boundary|place|landuse|railway|natural|waterway|route|public_transport)\//;
  const match = places.find((p) => p.checks.name && !NOT_BUSINESS.test(p.type));
  if (!match) {
    L.push("No matching business found in OpenStreetMap.", "");
    if (places.length) L.push(`Closest results: ${places.slice(0, 3).map((p) => `${p.name || "(no name)"} (${p.type})`).join("; ")}.`, "");
    L.push("How to add it: create a free account at https://www.openstreetmap.org, zoom to your location, click Edit, add a point with the right category, and fill in name, address, website, phone and opening_hours. Only add accurate, verifiable facts; OSM volunteers remove promotional edits.");
  } else {
    const ok = (b) => b === null ? "not checked" : b ? "matches" : "**missing or different**";
    L.push(
      `Found: [${match.name}](${match.osmUrl}) (${match.type})`,
      "",
      "| Field | OpenStreetMap | Check |",
      "|---|---|---|",
      `| Name | ${match.name} | ${ok(match.checks.name)} |`,
      `| Address | ${match.address} | compare with your Google Business Profile |`,
      `| Website | ${match.website ?? "none"} | ${ok(match.checks.website)} |`,
      `| Phone | ${match.phone ?? "none"} | ${ok(match.checks.phone)} |`,
      `| Opening hours | ${match.hours ?? "none"} | ${match.hours ? "present" : "add opening_hours"} |`,
      ""
    );
    const fixes = [!match.website && website && "add the website", match.checks.website === false && match.website && "correct the website", match.checks.phone === false && "add or correct the phone number", !match.hours && "add opening hours"].filter(Boolean);
    if (fixes.length) L.push(`To fix: open the listing, click Edit, and ${fixes.join(", ")}.`, "");
  }
  L.push("", "Why it matters: OpenStreetMap is open map data reused by many apps, maps and AI tools for local facts. Keeping name, address, phone and website identical to your Google Business Profile and website (NAP consistency) helps every system agree on who you are.", "", "Map data \xA9 OpenStreetMap contributors, ODbL.");
  return L.join("\n");
}

// src/openalex.ts
var MAILTO = "support@alchemyagent.ai";
async function json3(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  try {
    const r = await f(url, { headers: { "user-agent": `AlchemyAgent/0.2 (mailto:${MAILTO})`, accept: "application/json" }, signal: ctl.signal });
    if (r.status === 429 || r.status === 402) throw new Error("OpenAlex's free daily budget for this network is used up. Add a free OpenAlex API key in AlchemyAgent's settings (get one at https://openalex.org/settings/api), or try tomorrow.");
    if (!r.ok) throw new Error(`OpenAlex returned HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(t);
  }
}
async function researchCitations(brand, domain, f = fetch, apiKey) {
  const auth = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : "";
  const b = brand.replace(/"/g, "").trim();
  const d = domain?.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const search = encodeURIComponent(`"${b}"`);
  const since = (/* @__PURE__ */ new Date()).getUTCFullYear() - 9;
  const ta = encodeURIComponent(`title_and_abstract.search:"${b}"`);
  const [works, years, dom, inst, topWorks] = await Promise.all([
    json3(f, `https://api.openalex.org/works?search=${search}&per-page=1&select=id&mailto=${MAILTO}${auth}`),
    json3(f, `https://api.openalex.org/works?search=${search}&filter=publication_year:>${since}&group_by=publication_year&mailto=${MAILTO}${auth}`),
    d ? json3(f, `https://api.openalex.org/works?search=${encodeURIComponent(`"${d}"`)}&per-page=1&select=id&mailto=${MAILTO}${auth}`).catch(() => null) : Promise.resolve(null),
    json3(f, `https://api.openalex.org/institutions?search=${encodeURIComponent(b)}&per-page=3&mailto=${MAILTO}${auth}`).catch(() => null),
    json3(f, `https://api.openalex.org/works?filter=${ta}&sort=cited_by_count:desc&per-page=15&select=title,publication_year,cited_by_count,doi,id,primary_location&mailto=${MAILTO}${auth}`).catch(() => null)
  ]);
  const top = (inst?.results ?? []).find((i) => String(i.display_name).toLowerCase().includes(b.toLowerCase()));
  return {
    brand: b,
    domain: d,
    total: works?.meta?.count ?? 0,
    domainTotal: dom?.meta?.count ?? 0,
    byYear: (years?.group_by ?? []).map((g) => ({ year: Number(g.key), count: Number(g.count) })).sort((a, z) => a.year - z.year),
    titleAbstract: topWorks?.meta?.count ?? 0,
    works: (topWorks?.results ?? []).map((w) => ({ title: String(w.title ?? ""), year: w.publication_year, cited: w.cited_by_count ?? 0, venue: w.primary_location?.source?.display_name ?? "", url: w.doi ?? w.id })),
    institution: top ? { name: top.display_name, works: top.works_count, cited: top.cited_by_count, url: top.id, type: top.type } : null
  };
}
function researchMarkdown(r, limit = 10) {
  const L = [`## Research citations: "${r.brand}"`, ""];
  L.push(`OpenAlex finds **${r.total.toLocaleString("en-US")} scholarly works** that mention "${r.brand}" anywhere in the text (including funding and conflict-of-interest notes), ${r.titleAbstract.toLocaleString("en-US")} in the title or abstract${r.domain ? `, and ${r.domainTotal.toLocaleString("en-US")} that mention ${r.domain}` : ""}. Name matches can include unrelated uses of the same word.`, "");
  if (r.byYear.length) L.push(`By year: ${r.byYear.map((y) => `${y.year}: ${y.count}`).join(" \xB7 ")}`, "");
  if (r.institution) L.push(`The brand is listed as an OpenAlex institution: [${r.institution.name}](${r.institution.url}) (${r.institution.type}), ${r.institution.works.toLocaleString("en-US")} works authored, cited ${r.institution.cited.toLocaleString("en-US")} times.`, "");
  if (r.works.length) {
    L.push("Most-cited papers with the name in the title or abstract:", "", "| Year | Title | Venue | Cited by |", "|---|---|---|---|");
    for (const w of r.works.slice(0, limit)) L.push(`| ${w.year ?? ""} | [${w.title.replace(/\|/g, "\\|").slice(0, 100)}](${w.url}) | ${w.venue.replace(/\|/g, "\\|").slice(0, 40)} | ${w.cited} |`);
    L.push("");
  }
  L.push("For technical, medical-device and industrial brands, research citations are strong trust signals: AI models are trained on papers, and assistants often cite studies when comparing products. Ways to earn them: publish test data, white papers with DOIs (e.g. via Zenodo), and co-author with university labs.", "", "Data: OpenAlex (CC0).");
  return L.join("\n");
}

// src/authority.ts
var sleep3 = (ms) => new Promise((r) => setTimeout(r, ms));
var clean = (d) => d.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[/?#].*$/, "").toLowerCase();
async function authority(domains, f = fetch, oprKey, pause = 1100) {
  const list = [...new Set(domains.map(clean).filter(Boolean))].slice(0, 10);
  const rows = [];
  for (const [i, d] of list.entries()) {
    if (i) await sleep3(pause);
    try {
      const r = await f(`https://tranco-list.eu/api/ranks/domain/${encodeURIComponent(d)}`, { headers: { accept: "application/json", "user-agent": "AlchemyAgent/0.2 (+https://alchemyagent.ai)" } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const body = await r.json();
      const latest = (body.ranks ?? []).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
      rows.push({ domain: d, tranco: latest?.rank ?? null, trancoDate: latest?.date });
    } catch (e) {
      rows.push({ domain: d, tranco: null, trancoError: e instanceof Error ? e.message : String(e) });
    }
  }
  if (oprKey) {
    const q = list.map((d) => `domains[]=${encodeURIComponent(d)}`).join("&");
    const r = await f(`https://openpagerank.com/api/v1.0/getPageRank?${q}`, { headers: { "API-OPR": oprKey } });
    if (r.status === 401 || r.status === 403) throw new Error("Open PageRank rejected the API key. Get a free key at https://www.domcop.com/openpagerank/ and paste it into AlchemyAgent's settings in Claude.");
    const body = await r.json().catch(() => null);
    for (const x of body?.response ?? []) {
      const row = rows.find((y) => y.domain === clean(String(x.domain)));
      if (row) {
        row.opr = x.status_code === 200 ? Number(x.page_rank_decimal) : null;
        row.oprRank = x.rank ? Number(x.rank) : null;
      }
    }
  }
  return rows;
}
function authorityMarkdown(rows, hasOpr) {
  const L = ["## Authority and popularity", "", `| Domain | Tranco rank (top 1M) |${hasOpr ? " Open PageRank (0-10) | OPR global rank |" : ""}`, `|---|---|${hasOpr ? "---|---|" : ""}`];
  for (const r of rows) L.push(`| ${r.domain} | ${r.tranco ? r.tranco.toLocaleString("en-US") : r.trancoError ? `error: ${r.trancoError}` : "not in top 1M"} |${hasOpr ? ` ${r.opr ?? "n/a"} | ${r.oprRank ? r.oprRank.toLocaleString("en-US") : "n/a"} |` : ""}`);
  L.push("", "- Tranco ranks the most popular ~1M domains by combining several traffic and DNS lists, averaged over 30 days. Being outside the top 1M is normal for B2B and local businesses.");
  L.push(hasOpr ? "- Open PageRank scores link authority from Common Crawl's link graph, 0 to 10. Use it to compare against competitors, not as an absolute grade." : "- Add a free Open PageRank key in AlchemyAgent's settings to also get a 0-10 link-authority score per domain.");
  L.push("- Popular, well-linked domains get crawled more often and appear more in AI training data and AI answers.", "", "Data: Tranco (tranco-list.eu)" + (hasOpr ? "; Open PageRank by DomCop." : "."));
  return L.join("\n");
}

// src/gsc.ts
import { createServer } from "node:http";
import { createHash, createSign, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
var SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
var TOKEN_URL = "https://oauth2.googleapis.com/token";
var API = "https://searchconsole.googleapis.com/webmasters/v3";
var TOKEN_FILE = join(homedir(), ".alchemyagent", "google-token.json");
var GSC_SETUP_HELP = [
  "Search Console needs your own Google credentials (they stay on your computer and are only sent to Google). Pick one:",
  "",
  "**A. Sign in with Google (recommended)**",
  "1. In Google Cloud Console (https://console.cloud.google.com), create or pick a project and enable the **Google Search Console API**.",
  "2. APIs & Services > OAuth consent screen: choose External, add your email as a test user.",
  "3. APIs & Services > Credentials > Create credentials > OAuth client ID > **Desktop app**.",
  "4. Paste the client ID and client secret into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure), then ask Claude to connect Search Console.",
  "",
  "**B. Service account**",
  "1. Create a service account in the same project, download its JSON key.",
  "2. In Search Console > Settings > Users and permissions, add the service account's email (Restricted is enough).",
  "3. Choose the JSON file in AlchemyAgent's settings as the service account key."
].join("\n");
var cached = null;
var b64url = (b) => Buffer.from(b).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
async function loadSaved() {
  try {
    return JSON.parse(await readFile(TOKEN_FILE, "utf8"));
  } catch {
    return null;
  }
}
async function serviceAccountToken(file, f) {
  let sa;
  try {
    sa = JSON.parse(await readFile(file, "utf8"));
  } catch {
    throw new Error(`Couldn't read the service account key file (${file}).`);
  }
  if (!sa.client_email || !sa.private_key) throw new Error("That file isn't a Google service account key (no client_email/private_key).");
  const now = Math.floor(Date.now() / 1e3);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }));
  const sig = b64url(createSign("RSA-SHA256").update(`${head}.${claim}`).sign(sa.private_key));
  const r = await f(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claim}.${sig}` }) });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Google refused the service account (${body.error_description ?? body.error ?? r.status}).`);
  return { token: body.access_token, exp: Date.now() + (body.expires_in - 60) * 1e3 };
}
async function accessToken(creds, f = fetch) {
  const key = creds.serviceAccountFile ?? creds.clientId ?? "";
  if (cached && cached.key === key && cached.exp > Date.now()) return cached.token;
  if (creds.serviceAccountFile) {
    const t = await serviceAccountToken(creds.serviceAccountFile, f);
    cached = { ...t, key };
    return t.token;
  }
  if (!creds.clientId || !creds.clientSecret) throw new Error(GSC_SETUP_HELP);
  const saved = await loadSaved();
  if (!saved || saved.client_id !== creds.clientId) throw new Error("Search Console isn't connected yet. Ask Claude to run gsc_connect to sign in with Google.");
  const r = await f(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: saved.refresh_token, client_id: creds.clientId, client_secret: creds.clientSecret }) });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error === "invalid_grant" ? "Your Google sign-in expired or was revoked (test-mode apps expire after 7 days). Run gsc_connect again." : `Google token refresh failed (${body.error ?? r.status}).`);
  cached = { token: body.access_token, exp: Date.now() + (body.expires_in - 60) * 1e3, key };
  return body.access_token;
}
var pending = null;
function openBrowser(url) {
  const cmd = platform() === "darwin" ? "open" : platform() === "win32" ? "cmd" : "xdg-open";
  const args = platform() === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
  }
}
var PAGE = (msg2) => `<!doctype html><meta charset="utf-8"><title>AlchemyAgent</title><body style="font:16px system-ui;padding:40px;max-width:560px;margin:auto"><h2>AlchemyAgent</h2><p>${msg2}</p></body>`;
async function startConnect(creds, f = fetch, open = openBrowser) {
  if (!creds.clientId || !creds.clientSecret) throw new Error(GSC_SETUP_HELP);
  if (pending) return { url: pending.url, alreadyPending: true };
  const verifier = b64url(randomBytes(32));
  const state = b64url(randomBytes(16));
  const server2 = createServer();
  await new Promise((res) => server2.listen(0, "127.0.0.1", () => res()));
  const port = server2.address().port;
  const redirect = `http://127.0.0.1:${port}/callback`;
  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: creds.clientId,
    redirect_uri: redirect,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent",
    code_challenge: b64url(createHash("sha256").update(verifier).digest()),
    code_challenge_method: "S256",
    state
  });
  const done = new Promise((resolve2, reject) => {
    const timer = setTimeout(() => {
      server2.close();
      pending = null;
      reject(new Error("Sign-in timed out"));
    }, 10 * 60 * 1e3);
    server2.on("request", async (req, res) => {
      const u = new URL(req.url ?? "/", redirect);
      if (u.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const finish = (code, msg2) => {
        res.writeHead(code, { "content-type": "text/html; charset=utf-8" }).end(PAGE(msg2));
        clearTimeout(timer);
        server2.close();
        pending = null;
      };
      if (u.searchParams.get("state") !== state) return finish(400, "This sign-in link doesn't match. Start again from Claude.");
      if (u.searchParams.get("error")) {
        finish(400, `Google said: ${u.searchParams.get("error")}. You can close this tab.`);
        return reject(new Error(String(u.searchParams.get("error"))));
      }
      try {
        const r = await f(TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code: u.searchParams.get("code") ?? "", client_id: creds.clientId, client_secret: creds.clientSecret, redirect_uri: redirect, code_verifier: verifier }) });
        const body = await r.json();
        if (!r.ok || !body.refresh_token) throw new Error(body.error_description ?? body.error ?? "no refresh token");
        await mkdir(join(homedir(), ".alchemyagent"), { recursive: true, mode: 448 });
        const saved = { refresh_token: body.refresh_token, client_id: creds.clientId, scope: SCOPE, saved_at: (/* @__PURE__ */ new Date()).toISOString() };
        await writeFile(TOKEN_FILE, JSON.stringify(saved, null, 2), { mode: 384 });
        await chmod(TOKEN_FILE, 384);
        cached = { token: body.access_token, exp: Date.now() + (body.expires_in - 60) * 1e3, key: creds.clientId };
        finish(200, "Search Console is connected. You can close this tab and go back to Claude.");
        resolve2("ok");
      } catch (e) {
        finish(500, "Couldn't finish sign-in. Go back to Claude and try again.");
        reject(e);
      }
    });
  });
  done.catch(() => {
  });
  pending = { server: server2, url, done };
  open(url);
  return { url, alreadyPending: false };
}
async function connectionStatus(creds) {
  if (creds.serviceAccountFile) return `Using the service account key at ${creds.serviceAccountFile}.`;
  if (!creds.clientId) return "Not set up.";
  const saved = await loadSaved();
  return saved && saved.client_id === creds.clientId ? `Connected (signed in ${saved.saved_at.slice(0, 10)}; token stored at ${TOKEN_FILE}).` : pending ? "Sign-in started; waiting for you to approve in the browser." : "Not connected yet.";
}
async function gsc(creds, f, path, body) {
  const token = await accessToken(creds, f);
  const r = await f(`${API}${path}`, { method: body ? "POST" : "GET", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : void 0 });
  const out = await r.json().catch(() => ({}));
  if (r.status === 403) throw new Error(`Google says this account can't read that property (${out.error?.message ?? "403"}). Check the exact property URL with gsc_sites; Domain properties look like sc-domain:example.com.`);
  if (!r.ok) throw new Error(`Search Console API error ${r.status}: ${out.error?.message ?? ""}`);
  return out;
}
async function listSites(creds, f = fetch) {
  return (await gsc(creds, f, "/sites")).siteEntry ?? [];
}
function matchProperty(sites, input) {
  const exact = sites.find((s) => s.siteUrl === input);
  if (exact) return exact.siteUrl;
  const host4 = input.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
  return sites.find((s) => s.siteUrl === `sc-domain:${host4}`)?.siteUrl ?? sites.find((s) => s.siteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "") === host4)?.siteUrl ?? null;
}
var ymd2 = (d) => d.toISOString().slice(0, 10);
function dateRange(days, endOffset = 2) {
  const end = new Date(Date.now() - endOffset * 864e5);
  return { startDate: ymd2(new Date(end.getTime() - (days - 1) * 864e5)), endDate: ymd2(end) };
}
async function searchAnalytics(creds, siteUrl, opts, f = fetch) {
  const filters = [
    opts.queryContains && { dimension: "query", operator: "contains", expression: opts.queryContains },
    opts.pageContains && { dimension: "page", operator: "contains", expression: opts.pageContains }
  ].filter(Boolean);
  const rows = [];
  for (let start = 0; start < opts.rowLimit; start += 25e3) {
    const body = {
      startDate: opts.startDate,
      endDate: opts.endDate,
      dimensions: opts.dimensions,
      rowLimit: Math.min(25e3, opts.rowLimit - start),
      startRow: start,
      type: opts.type ?? "web",
      dataState: "final",
      ...filters.length ? { dimensionFilterGroups: [{ filters }] } : {}
    };
    const out = await gsc(creds, f, `/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, body);
    rows.push(...out.rows ?? []);
    if ((out.rows ?? []).length < body.rowLimit) break;
  }
  return rows;
}
var n = (v) => Math.round(v).toLocaleString("en-US");
function rowsMarkdown(siteUrl, range, dims, rows, prev, limit) {
  const tot = (rs) => rs.reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 });
  const t = tot(rows);
  const L = [`## Search Console: ${siteUrl}`, `${range.startDate} to ${range.endDate} \xB7 ${dims.join(" \xD7 ")} \xB7 ${rows.length.toLocaleString("en-US")} rows`, ""];
  L.push(`Total in these rows: **${n(t.c)} clicks**, ${n(t.i)} impressions${prev ? ` (previous period: ${n(tot(prev).c)} clicks, ${n(tot(prev).i)} impressions)` : ""}. Rows Google hides for privacy aren't included, so totals can be lower than the Performance report.`, "");
  const pmap = new Map((prev ?? []).map((r) => [r.keys.join("|"), r]));
  L.push(`| ${dims.join(" | ")} | Clicks | Impr. | CTR | Pos.${prev ? " | Clicks \u0394 |" : " |"}`, `|${dims.map(() => "---").join("|")}|---|---|---|---|${prev ? "---|" : ""}`);
  for (const r of rows.slice(0, limit)) {
    const p = pmap.get(r.keys.join("|"));
    L.push(`| ${r.keys.map((k) => k.replace(/\|/g, "\\|")).join(" | ")} | ${n(r.clicks)} | ${n(r.impressions)} | ${(r.ctr * 100).toFixed(1)}% | ${r.position.toFixed(1)}${prev ? ` | ${p ? (r.clicks - p.clicks >= 0 ? "+" : "") + n(r.clicks - p.clicks) : "new"} |` : " |"}`);
  }
  if (rows.length > limit) L.push("", `Showing ${limit} of ${rows.length.toLocaleString("en-US")} rows.`);
  return L.join("\n");
}

// src/prompts.ts
var msg = (text) => ({ messages: [{ role: "user", content: { type: "text", text } }] });
var REPORT_RULES = [
  "Report rules:",
  "- Lead with a 3-line summary: what's working, the biggest risk, the single best next step.",
  "- Then a ranked fix list as a table: Fix | Why it matters for AI search | Impact (high/med/low) | Effort (hours) | Who (dev, content, marketing).",
  "- Quote the evidence for each fix from the tool results (numbers, URLs). Don't invent data; if a tool failed or was blocked, say so and move on.",
  "- Keep it plain English for a marketing lead. No filler."
].join("\n");
function registerPrompts(server2, remote) {
  const local = (tools) => remote ? "" : tools;
  server2.registerPrompt(
    "ai_search_audit",
    {
      title: "Full AI search audit",
      description: "Run every AlchemyAgent site check on one website and get a ranked fix list for AI search visibility.",
      argsSchema: { url: external_exports.string().describe("Website, e.g. example.com"), brand_name: external_exports.string().optional().describe("Brand name, if different from the domain") }
    },
    ({ url, brand_name }) => msg([
      `Run a full AI search audit of ${url}${brand_name ? ` (brand: ${brand_name})` : ""} with the AlchemyAgent tools.`,
      "",
      "Run these (in parallel where you can):",
      `1. ai_crawler_check on ${url} (crawler access, firewall, AI usage preferences)`,
      `2. ai_render_check on the homepage and on one key service or product page you find in the navigation`,
      `3. agent_readiness on ${url}`,
      `4. schema_check on the homepage`,
      `5. pagespeed_check (mobile) on the homepage`,
      `6. entity_check and wikipedia_presence for the brand`,
      `7. authority_check for the domain`,
      local(`8. common_crawl_check, news_mentions and community_mentions for the brand`),
      local(`9. If Search Console is connected (gsc_sites works), gsc_ai_queries for the last 90 days`),
      "",
      REPORT_RULES,
      "- Group fixes under: Access (can AI reach it), Readability (can AI read it), Identity (does AI know who you are), Authority (does AI trust you), Speed.",
      local("- End with one line on which of the user's own data sources aren't connected yet (run data_connections) and what connecting them would add to this audit.")
    ].filter(Boolean).join("\n"))
  );
  if (!remote) server2.registerPrompt(
    "connect_your_data",
    {
      title: "Connect your data",
      description: "Set up Search Console, Bing Webmaster Tools and Cloudflare so AlchemyAgent can rank fixes by your real traffic and crawler data.",
      argsSchema: {}
    },
    () => msg([
      "Help me connect my own data to AlchemyAgent.",
      "",
      "1. Run data_connections and show me what's connected.",
      "2. Walk me through connecting the most valuable missing source first (Search Console, then Bing Webmaster Tools, then Cloudflare), one step at a time, waiting for me between steps.",
      "3. When Search Console has an OAuth client but no sign-in, run gsc_connect.",
      "4. After each connection, run one quick check that uses it (gsc_sites, bing_webmaster, log_file_analysis) to confirm it works, and tell me one thing it found.",
      "Never ask me to paste a key into the chat: keys go in AlchemyAgent's settings."
    ].join("\n"))
  );
  server2.registerPrompt(
    "ai_crawler_fix_plan",
    {
      title: "AI crawler fix plan",
      description: "Find exactly why AI assistants can't reach or read a page, and get the robots.txt and CDN changes to fix it.",
      argsSchema: { url: external_exports.string().describe("Page or website") }
    },
    ({ url }) => msg([
      `Work out whether AI crawlers can reach and read ${url}, and write the exact fixes.`,
      "",
      `1. ai_crawler_check on ${url}`,
      `2. ai_render_check on ${url}`,
      local(`3. wayback_history on the domain (include: robots) to see when any AI-bot blocks started`),
      "",
      "Then write:",
      "- A corrected robots.txt (full file) that allows AI search and user-fetch bots (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User) and states the training choice explicitly (ask me if training bots should be allowed; default to the current setting). Add a Content-Signal line matching that choice.",
      "- CDN/firewall steps if the probe showed blocks (Cloudflare: AI Crawl Control / WAF skip rule for verified bots; allowlist by the published IP ranges).",
      "- Rendering fixes if the page is a JavaScript shell or thin in raw HTML.",
      "- How to verify each fix afterwards (which tool to re-run)."
    ].filter(Boolean).join("\n"))
  );
  server2.registerPrompt(
    "brand_visibility_report",
    {
      title: "Brand visibility report",
      description: "How visible and trusted a brand is in the sources AI assistants learn from and cite: Wikidata, Wikipedia, news, communities, research, Common Crawl.",
      argsSchema: { brand_name: external_exports.string(), url: external_exports.string().describe("Brand website"), competitors: external_exports.string().optional().describe("Comma-separated competitor domains") }
    },
    ({ brand_name, url, competitors }) => msg([
      `Build a brand visibility report for ${brand_name} (${url}) as AI assistants would see it.`,
      "",
      `1. entity_check (url ${url}, brand_name ${brand_name}) and wikipedia_presence`,
      `2. authority_check for ${url}${competitors ? `, ${competitors}` : ""}`,
      local(`3. news_mentions, community_mentions and research_citations for "${brand_name}"`),
      local(`4. common_crawl_check for ${url}`),
      "",
      REPORT_RULES,
      "- Add a scorecard: Knowledge graph, Wikipedia, News, Community, Research, Training data, Authority, each rated strong / some / missing with one line of evidence.",
      "- Watch for name collisions (other companies or products with the same name) and call them out.",
      competitors ? "- Compare against the competitors wherever the tools allow." : ""
    ].filter(Boolean).join("\n"))
  );
  server2.registerPrompt(
    "competitor_ai_readiness",
    {
      title: "Competitor AI-readiness comparison",
      description: "Compare a site with up to 4 competitors on AI crawler access, raw-HTML readability, agent readiness, schema and authority.",
      argsSchema: { url: external_exports.string(), competitors: external_exports.string().describe("Comma-separated competitor domains (up to 4)") }
    },
    ({ url, competitors }) => msg([
      `Compare ${url} with ${competitors} on AI search readiness.`,
      "",
      "For each site's homepage run ai_crawler_check, ai_render_check, agent_readiness and schema_check, then one authority_check with all domains.",
      "",
      "Output one comparison table (rows = checks, columns = sites) with short verdicts, then: where we lead, where we trail, and the 5 fixes that would close the gap fastest (with effort estimates)."
    ].join("\n"))
  );
  if (!remote) {
    server2.registerPrompt(
      "local_listing_audit",
      {
        title: "Local listing audit",
        description: "Check a local business's name, address, phone and website consistency across OpenStreetMap, Wikidata and the site's own schema.",
        argsSchema: { business_name: external_exports.string(), location: external_exports.string().describe("City or full address"), url: external_exports.string(), phone: external_exports.string().optional() }
      },
      ({ business_name, location, url, phone }) => msg([
        `Audit the local listings for ${business_name} in ${location} (${url}${phone ? `, ${phone}` : ""}).`,
        "",
        `1. osm_listing for ${business_name}, ${location}, url ${url}${phone ? `, phone ${phone}` : ""}`,
        `2. schema_check on ${url} (look for LocalBusiness: name, address, telephone, openingHours, geo, sameAs)`,
        `3. entity_check for ${url}`,
        "",
        "Output a NAP table (Source | Name | Address | Phone | Website | Hours) with mismatches in bold, then the exact edits to make in each place, and the LocalBusiness JSON-LD to add if it's missing or incomplete."
      ].join("\n"))
    );
    server2.registerPrompt(
      "daily_brand_alerts",
      {
        title: "Daily brand alerts",
        description: "What's new today: press and mentions (with earned-link check) and pages Google just picked up. Schedule it to run every morning.",
        argsSchema: { brand_name: external_exports.string(), url: external_exports.string().describe("Brand website") }
      },
      ({ brand_name, url }) => msg([
        `Run brand_alerts for ${brand_name} (url ${url}).`,
        "",
        "Then give me a short morning brief:",
        "- New earned press (articles that link to us) first, then unlinked mentions worth a link request (draft a 2-sentence ask for the best one), then new pages Google picked up.",
        "- Flag anything negative or any name collision (another company with the same name).",
        "- If nothing is new, say so in one line."
      ].join("\n"))
    );
    server2.registerPrompt(
      "search_console_ai_report",
      {
        title: "Search Console AI report",
        description: "Pull Search Console data directly and report on AI-assistant queries, winners, losers and quick wins.",
        argsSchema: { site: external_exports.string().describe("Property URL or domain") }
      },
      ({ site }) => msg([
        `Use my Search Console data for ${site}. If gsc_sites fails because Search Console isn't connected, run gsc_connect and wait for me.`,
        "",
        `1. gsc_ai_queries for ${site}, last 90 days`,
        `2. gsc_performance for ${site}: dimensions query, 28 days, compare true, row_limit 5000, show 30`,
        `3. gsc_performance for ${site}: dimensions page, 28 days, compare true, show 30`,
        "",
        "Report: AI-assistant query share and the most telling examples (judge the candidates yourself); top gaining and losing queries and pages vs the previous 28 days; quick wins (queries at position 4-15 with high impressions and low CTR) with the page to improve and what to change."
      ].join("\n"))
    );
  }
}

// src/alerts.ts
import { mkdir as mkdir2, readFile as readFile2, writeFile as writeFile2 } from "node:fs/promises";
import { homedir as homedir2, platform as platform2 } from "node:os";
import { join as join2 } from "node:path";
import { createHash as createHash2 } from "node:crypto";
import { spawn as spawn2 } from "node:child_process";
var UA8 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
var ALERTS_DIR = () => join2(homedir2(), ".alchemyagent", "alerts");
var hash = (s) => createHash2("sha1").update(s).digest("hex").slice(0, 16);
var decode2 = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
var tag = (xml, name) => xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
var slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
var host2 = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
async function getText2(f, url, ms = 15e3) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await f(url, { headers: { "user-agent": UA8, accept: "application/rss+xml, application/atom+xml, text/html;q=0.9, */*;q=0.8" }, redirect: "follow", signal: ctl.signal });
    return { status: r.status, text: await r.text(), url: r.url || url };
  } catch {
    return { status: 0, text: "", url };
  } finally {
    clearTimeout(t);
  }
}
function parseGoogleNews(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((m) => {
    const it = m[1];
    const outlet = decode2(tag(it, "source"));
    const title = decode2(tag(it, "title")).replace(new RegExp(`\\s+-\\s+${outlet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), "");
    const d = Date.parse(decode2(tag(it, "pubDate")));
    return { source: "Google News", title, url: decode2(tag(it, "link")), outlet: outlet || host2(it.match(/<source[^>]*url="([^"]+)"/i)?.[1] ?? ""), date: isNaN(d) ? "" : new Date(d).toISOString().slice(0, 10) };
  });
}
function parseGoogleAlerts(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map((m) => {
    const e = m[1];
    const raw = decode2(e.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "");
    let url = raw;
    try {
      url = new URL(raw).searchParams.get("url") ?? raw;
    } catch {
    }
    const d = Date.parse(decode2(tag(e, "published")) || decode2(tag(e, "updated")));
    return { source: "Google Alerts", title: decode2(tag(e, "title")), url, outlet: host2(url), date: isNaN(d) ? "" : new Date(d).toISOString().slice(0, 10) };
  });
}
async function linksTo(f, url, domain) {
  if (/^https:\/\/news\.google\.com\//.test(url)) return null;
  const r = await getText2(f, url, 1e4);
  if (r.status !== 200 || !r.text || host2(r.url) === "news.google.com") return null;
  const d = domain.replace(/^www\./, "").replace(/\./g, "\\.");
  return new RegExp(`href=["'][^"']*\\/\\/(www\\.)?${d}`, "i").test(r.text);
}
async function loadState(brand) {
  try {
    return JSON.parse(await readFile2(join2(ALERTS_DIR(), `${slug(brand)}.json`), "utf8"));
  } catch {
    return { brand, feeds: [], seen: {} };
  }
}
async function saveState(s) {
  await mkdir2(ALERTS_DIR(), { recursive: true, mode: 448 });
  const entries = Object.entries(s.seen).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 5e3);
  await writeFile2(join2(ALERTS_DIR(), `${slug(s.brand)}.json`), JSON.stringify({ ...s, seen: Object.fromEntries(entries) }, null, 2), { mode: 384 });
}
async function checkAlerts(opts, f = fetch) {
  const state = await loadState(opts.brand);
  const domain = opts.domain?.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "") || state.domain;
  state.domain = domain;
  for (const u of opts.addFeeds ?? []) if (/^https:\/\/www\.google\.com\/alerts\/feeds\//.test(u) && !state.feeds.includes(u)) state.feeds.push(u);
  const firstRun = !state.lastChecked;
  const checked = [], errors = [];
  const found = [];
  const gl = (opts.country ?? "US").toUpperCase();
  const q = encodeURIComponent(`"${opts.brand}"${domain ? ` -site:${domain}` : ""}`);
  const gn = await getText2(f, `https://news.google.com/rss/search?q=${q}&hl=en-${gl}&gl=${gl}&ceid=${gl}:en`);
  if (gn.status === 200) {
    checked.push("Google News");
    found.push(...parseGoogleNews(gn.text).map((x) => ({ ...x, kind: "press", id: hash(x.title + x.outlet) })));
  } else errors.push(`Google News search returned ${gn.status || "no response"}`);
  for (const feed of state.feeds) {
    const r = await getText2(f, feed);
    if (r.status === 200 && /<feed/i.test(r.text)) {
      checked.push("Google Alerts feed");
      found.push(...parseGoogleAlerts(r.text).map((x) => ({ ...x, kind: "press", id: hash(x.url) })));
    } else errors.push(`Google Alerts feed returned ${r.status || "no response"}`);
  }
  if (opts.pagesPickedUp) {
    try {
      const pages = await opts.pagesPickedUp();
      if (pages) {
        checked.push("Search Console (new pages)");
        found.push(...pages.map((p) => ({ source: "Search Console", title: `Started getting Google impressions (${p.impressions} so far)`, url: p.url, outlet: host2(p.url), date: p.first, kind: "page", id: hash("page:" + p.url) })));
      }
    } catch (e) {
      errors.push(`Search Console: ${e instanceof Error ? e.message.split(".")[0] : String(e)}`);
    }
  }
  const fresh = [];
  const ids = /* @__PURE__ */ new Set();
  for (const it of found) {
    if (it.kind === "press" && domain && host2(it.url).endsWith(domain)) continue;
    if (ids.has(it.id) || state.seen[it.id]) continue;
    ids.add(it.id);
    fresh.push(it);
  }
  fresh.sort((a, b) => b.date.localeCompare(a.date));
  if (domain) await Promise.all(fresh.filter((i) => i.kind === "press").slice(0, 10).map(async (i) => {
    i.linksToSite = await linksTo(f, i.url, domain);
  }));
  const now = (/* @__PURE__ */ new Date()).toISOString();
  for (const it of fresh) state.seen[it.id] = now;
  const prev = state.lastChecked;
  state.lastChecked = now;
  await saveState(state);
  return { brand: opts.brand, domain, firstRun, newItems: fresh, checked, errors, feeds: state.feeds.length, lastChecked: prev };
}
function notifyDesktop(title, body) {
  if (platform2() !== "darwin") return;
  const esc2 = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 200);
  try {
    spawn2("osascript", ["-e", `display notification "${esc2(body)}" with title "${esc2(title)}"`], { stdio: "ignore", detached: true }).unref();
  } catch {
  }
}
function alertsMarkdown(r, limit = 25) {
  const L = [`## Brand alerts: ${r.brand}${r.domain ? ` (${r.domain})` : ""}`, ""];
  L.push(r.firstRun ? `First check: everything below is the starting baseline. From now on, each check shows only what's new.` : `New since ${r.lastChecked?.slice(0, 16).replace("T", " ")} UTC.`, "");
  const press = r.newItems.filter((i) => i.kind === "press"), pages = r.newItems.filter((i) => i.kind === "page");
  if (!r.newItems.length) L.push("Nothing new.", "");
  if (press.length) {
    L.push(`### Press and mentions (${press.length})`, "| Date | Outlet | Headline | Links to you |", "|---|---|---|---|");
    for (const i of press.slice(0, limit)) L.push(`| ${i.date} | ${i.outlet.replace(/\|/g, "\\|")} | [${i.title.replace(/\|/g, "\\|").slice(0, 110)}](${i.url}) | ${i.linksToSite === true ? "**yes**" : i.linksToSite === false ? "no" : ""} |`);
    if (press.length > limit) L.push("", `\u2026and ${press.length - limit} more.`);
    L.push("");
    const unlinked = press.filter((i) => i.linksToSite === false);
    if (press.some((i) => i.linksToSite == null) && r.domain) L.push("Blank 'Links to you' means it couldn't be checked: Google News links go through a redirect page. Google Alerts feed links are checked directly.", "");
    if (unlinked.length) L.push(`${unlinked.length} new mention${unlinked.length === 1 ? "" : "s"} don't link to your site: good candidates for a friendly link request.`, "");
  }
  if (pages.length) {
    L.push(`### New pages picked up by Google (${pages.length})`, "| First seen | Page | |", "|---|---|---|");
    for (const i of pages.slice(0, limit)) L.push(`| ${i.date} | ${i.url} | ${i.title} |`);
    L.push("");
  }
  L.push(`Checked: ${r.checked.join(", ") || "nothing"}${r.feeds ? ` (${r.feeds} Google Alerts feed${r.feeds === 1 ? "" : "s"})` : ""}.${r.errors.length ? ` Problems: ${r.errors.join("; ")}.` : ""}`);
  if (!r.feeds) L.push("", "Tip: for wider coverage (blogs, forums, the whole web), create a Google Alert at google.com/alerts for your brand, set Show options > Deliver to: RSS feed, then give me the feed URL.");
  L.push("", "To get these automatically, schedule this check in Claude (for example every morning) with the daily_brand_alerts prompt.");
  return L.join("\n");
}

// src/cflogs.ts
var API2 = "https://api.cloudflare.com/client/v4";
var CF_TOKEN_HELP = "Log file analysis needs your own Cloudflare API token, and the site's DNS must be proxied through Cloudflare. In Cloudflare: My Profile > API Tokens > Create Token > Custom token, with permissions Zone > Analytics > Read and Zone > Zone > Read (add Account > Account Analytics > Read to include Cloudflare Web Analytics visits). Then paste it into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure). The token stays on your computer and is only sent to Cloudflare.";
var CfError = class extends Error {
};
async function cf(f, token, path, init = {}) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 3e4);
  let res;
  try {
    res = await f(`${API2}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", accept: "application/json" }, signal: ctl.signal });
  } catch {
    throw new CfError("Couldn't reach the Cloudflare API. Try again in a minute.");
  } finally {
    clearTimeout(t);
  }
  const body = await res.json().catch(() => null);
  if (res.status === 401 || res.status === 403) throw new CfError(`Cloudflare rejected the API token (HTTP ${res.status}). ${CF_TOKEN_HELP}`);
  if (!res.ok || !body) throw new CfError(`Cloudflare API returned HTTP ${res.status}.`);
  return body;
}
async function gql(f, token, query) {
  const body = await cf(f, token, "/graphql", { method: "POST", body: JSON.stringify({ query }) });
  if (body.errors?.length) return { error: String(body.errors[0]?.message ?? "GraphQL error") };
  return { data: body.data };
}
function hostOf2(input) {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).hostname.toLowerCase();
  } catch {
    return input.toLowerCase();
  }
}
async function findZone(f, token, input) {
  const parts = hostOf2(input).replace(/^www\./, "").split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts.slice(i).join(".");
    const body = await cf(f, token, `/zones?name=${encodeURIComponent(name)}`);
    const z = body.result?.[0];
    if (z) return { id: z.id, name: z.name, plan: z.plan?.name ?? "", accountId: z.account?.id ?? "" };
  }
  throw new CfError(`No Cloudflare zone for ${hostOf2(input)} is visible to this token. Check the domain is on Cloudflare and the token includes that zone.`);
}
var PATTERNS = BOTS.filter((b) => !/no separate crawler/.test(b.purpose)).map((b) => ({
  token: b.token,
  owner: b.owner,
  purpose: b.purpose,
  re: b.token === "Bingbot" ? /bingbot/i : b.token === "Meta-ExternalAgent" ? /meta-external(agent|fetcher)/i : new RegExp(b.token.replace(/[-]/g, "\\-"), "i")
}));
function matchBot(ua) {
  for (const p of PATTERNS) if (p.re.test(ua)) return p.token;
  return null;
}
var AI_CATS = ["AI Crawler", "AI Search", "AI Assistant"];
var BLOCKED = (s) => s === 403 || s === 429 || s === 503;
var iso = (d) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
async function logReport(f, token, input, days = 30) {
  const zone = await findZone(f, token, input);
  const host4 = hostOf2(input);
  const now = /* @__PURE__ */ new Date();
  const windows = [...new Set([days, 30, 14, 7, 3, 1].filter((d) => d <= days))];
  let used = 0, base = null, lastErr = "";
  for (const d of windows) {
    const s = iso(new Date(now.getTime() - d * 864e5));
    const flt = (extra = "") => `{datetime_geq:"${s}",datetime_lt:"${iso(now)}"${extra}}`;
    const q = `{viewer{zones(filter:{zoneTag:"${zone.id}"}){
      total:httpRequestsAdaptiveGroups(limit:1,filter:${flt()}){count}
      html:httpRequestsAdaptiveGroups(limit:1,filter:${flt(',edgeResponseContentTypeName:"html"')}){count}
      cats:httpRequestsAdaptiveGroups(limit:30,orderBy:[count_DESC],filter:${flt()}){count dimensions{verifiedBotCategory}}
      ua:httpRequestsAdaptiveGroups(limit:5000,orderBy:[count_DESC],filter:${flt(',edgeResponseContentTypeName:"html"')}){count dimensions{userAgent verifiedBotCategory edgeResponseStatus}}
      pages:httpRequestsAdaptiveGroups(limit:15,orderBy:[count_DESC],filter:${flt(`,edgeResponseContentTypeName:"html",verifiedBotCategory_in:${JSON.stringify(AI_CATS)}`)}){count dimensions{clientRequestPath}}
      errs:httpRequestsAdaptiveGroups(limit:15,orderBy:[count_DESC],filter:${flt(',verifiedBotCategory_neq:"",edgeResponseStatus_geq:400,edgeResponseStatus_lt:600')}){count dimensions{clientRequestPath edgeResponseStatus}}
    }}}`;
    const r = await gql(f, token, q);
    if (r.data?.viewer?.zones?.[0]) {
      used = d;
      base = r.data.viewer.zones[0];
      break;
    }
    lastErr = r.error ?? "no data";
    if (!/time range|exceed|quota|limit|too far|retention|not allowed|can't|cannot/i.test(lastErr)) break;
  }
  if (!base) throw new CfError(`Cloudflare's analytics API didn't return request data for ${zone.name} (${lastErr}). The token needs Zone > Analytics > Read.`);
  const stats = /* @__PURE__ */ new Map();
  let htmlSampled = 0, browserHtml = 0;
  for (const row of base.ua ?? []) {
    const n4 = Number(row.count) || 0;
    const ua = String(row.dimensions?.userAgent ?? "");
    const cat = String(row.dimensions?.verifiedBotCategory ?? "");
    const st = Number(row.dimensions?.edgeResponseStatus) || 0;
    htmlSampled += n4;
    const tok = matchBot(ua);
    if (!tok) {
      if (!cat && /^Mozilla\/5\.0 \(/.test(ua) && /AppleWebKit|Gecko\//.test(ua) && !/bot|crawl|spider|headless|preview/i.test(ua) && st < 400) browserHtml += n4;
      continue;
    }
    const p = PATTERNS.find((x) => x.token === tok);
    const s = stats.get(tok) ?? { token: tok, owner: p.owner, purpose: p.purpose, requests: 0, verified: 0, served: 0, blocked: 0, verifiedBlocked: 0, verifiedServed: 0 };
    s.requests += n4;
    if (cat) s.verified += n4;
    if (st > 0 && st < 400) {
      s.served += n4;
      if (cat) s.verifiedServed += n4;
    }
    if (BLOCKED(st)) {
      s.blocked += n4;
      if (cat) s.verifiedBlocked += n4;
    }
    stats.set(tok, s);
  }
  let rum = null, rumNote;
  if (zone.accountId) {
    const s = iso(new Date(now.getTime() - used * 864e5));
    const r = await gql(f, token, `{viewer{accounts(filter:{accountTag:"${zone.accountId}"}){rumPageloadEventsAdaptiveGroups(limit:1,filter:{datetime_geq:"${s}",datetime_lt:"${iso(now)}",requestHost:"${host4}"}){count sum{visits}}}}}`).catch(() => ({ error: "unavailable" }));
    const g = r.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups?.[0];
    if (g && (Number(g.count) || Number(g.sum?.visits))) rum = { visits: Number(g.sum?.visits) || 0, pageloads: Number(g.count) || 0 };
    else rumNote = r.error ? "Cloudflare Web Analytics wasn't readable with this token (add Account > Account Analytics > Read)." : `Cloudflare Web Analytics has no data for ${host4} (it's off or uses a different hostname).`;
  }
  const num2 = (x) => Number(x?.[0]?.count) || 0;
  return {
    zone,
    host: host4,
    days: used,
    requested: days,
    from: iso(new Date(now.getTime() - used * 864e5)).slice(0, 10),
    to: iso(now).slice(0, 10),
    total: num2(base.total),
    html: num2(base.html),
    htmlSampled,
    categories: (base.cats ?? []).filter((c) => c.dimensions?.verifiedBotCategory).map((c) => ({ category: c.dimensions.verifiedBotCategory, requests: Number(c.count) || 0 })),
    bots: [...stats.values()].sort((a, b) => b.requests - a.requests),
    aiPages: (base.pages ?? []).map((p) => ({ path: String(p.dimensions?.clientRequestPath ?? ""), requests: Number(p.count) || 0 })),
    botErrors: (base.errs ?? []).map((p) => ({ path: String(p.dimensions?.clientRequestPath ?? ""), status: Number(p.dimensions?.edgeResponseStatus) || 0, requests: Number(p.count) || 0 })),
    browserHtml,
    rum,
    rumNote
  };
}
var n2 = (x) => x.toLocaleString("en-US");
var pct = (a, b) => b ? `${Math.round(a / b * 100)}%` : "\u2013";
var cell = (s) => s.replace(/\|/g, "\\|").slice(0, 80);
function logMarkdown(r, analytics) {
  const L = [];
  L.push(`# Log file analysis for AI search: ${r.host}`, "");
  L.push(`Cloudflare zone ${r.zone.name}${r.zone.plan ? ` (${r.zone.plan})` : ""}, ${r.from} to ${r.to} (${r.days} day${r.days === 1 ? "" : "s"}${r.days < r.requested ? `; your plan's analytics only go back ${r.days} days` : ""}). Counts are from Cloudflare's sampled request analytics.`, "");
  L.push(`- Requests: ${n2(r.total)} total, ${n2(r.html)} for HTML pages`);
  const ai = r.categories.filter((c) => AI_CATS.includes(c.category));
  const aiTotal = ai.reduce((a, c) => a + c.requests, 0);
  L.push(`- Verified AI bots (Cloudflare categories AI Crawler, AI Search, AI Assistant): ${n2(aiTotal)} requests`, "");
  if (r.categories.length) {
    L.push("## Verified bots by category", "", "| Category | Requests |", "|---|---:|");
    for (const c of r.categories.slice(0, 12)) L.push(`| ${c.category} | ${n2(c.requests)} |`);
    L.push("");
  }
  if (r.bots.length) {
    L.push("## AI and search crawlers on your HTML pages", "", "Requests that use each crawler's name. Verified means Cloudflare confirmed the request came from that operator. Unverified requests that were still served are the ones to look at: either fakes getting through, or a real operator Cloudflare doesn't verify.", "", "| Crawler | Owner | Requests | Verified | Verified, served | Unverified, served | Blocked/challenged |", "|---|---|---:|---:|---:|---:|---:|");
    for (const b of r.bots) L.push(`| ${b.token} | ${b.owner} | ${n2(b.requests)} | ${pct(b.verified, b.requests)} | ${n2(b.verifiedServed)} | ${n2(b.served - b.verifiedServed)} | ${n2(b.blocked)} |`);
    L.push("");
  }
  const findings = [];
  const realBlocked = r.bots.filter((b) => b.verifiedBlocked > 0).sort((a, b) => b.verifiedBlocked - a.verifiedBlocked);
  if (realBlocked.length) findings.push(`**Real crawlers are being blocked.** Verified requests got 403/429/503 from: ${realBlocked.map((b) => `${b.token} (${n2(b.verifiedBlocked)})`).join(", ")}. Check your WAF, Bot Fight Mode and rate-limit rules: these are citations you're turning away.`);
  const leaks = r.bots.map((b) => ({ b, u: b.served - b.verifiedServed })).filter((x) => x.u >= 50).sort((a, b) => b.u - a.u);
  const fakeTotal = r.bots.reduce((a, b) => a + (b.requests - b.verified), 0);
  if (leaks.length) findings.push(`**Unverified requests using crawler names got through:** ${leaks.slice(0, 6).map((x) => `${x.b.token} (${n2(x.u)})`).join(", ")}. Some are scrapers borrowing the name; some may be real operators that Cloudflare doesn't verify. Before allowing a crawler by name, match its source network to the operator's published IP ranges (ai_crawler_check lists them). Monitoring tools that send crawler user agents, including your own, show up here too.`);
  else if (fakeTotal >= 50) findings.push(`**Fake crawlers are being stopped:** ${n2(fakeTotal)} unverified requests used AI or search crawler names, and almost none were served.`);
  if (r.botErrors.length) findings.push(`**Crawler-only errors:** verified bots hit ${n2(r.botErrors.reduce((a, e) => a + e.requests, 0))} error responses on the paths below. Broken links, redirects to nowhere and timeouts often show up here first, before any visitor reports them.`);
  if (aiTotal === 0) findings.push("**No verified AI bot traffic** in this window. Check that robots.txt, your firewall and Cloudflare's AI crawler settings (AI Crawl Control) aren't blocking them, and that your key pages are linked and in your sitemap.");
  if (findings.length) L.push("## What stands out", "", ...findings.map((x) => `- ${x}`), "");
  if (r.aiPages.length) {
    L.push("## Pages AI bots read most", "", "Compare this with the pages you want cited. A page that never appears here can't be quoted.", "", "| Page | Requests |", "|---|---:|");
    for (const p of r.aiPages) L.push(`| ${cell(p.path)} | ${n2(p.requests)} |`);
    L.push("");
  }
  if (r.botErrors.length) {
    L.push("## Errors served to verified bots", "", "| Page | Status | Requests |", "|---|---:|---:|");
    for (const e of r.botErrors) L.push(`| ${cell(e.path)} | ${e.status} | ${n2(e.requests)} |`);
    L.push("");
  }
  L.push("## Logs vs analytics", "");
  L.push(`- HTML page requests from browser-like user agents that aren't known bots: ${n2(r.browserHtml)}. This still includes scrapers that pretend to be browsers, so treat it as a ceiling for human page views.`);
  if (r.rum) L.push(`- Cloudflare Web Analytics (cookieless script): ${n2(r.rum.visits)} visits, ${n2(r.rum.pageloads)} page loads. This is usually the closest count of real people.`);
  else if (r.rumNote) L.push(`- ${r.rumNote}`);
  if (analytics) L.push(`- ${analytics.label}: ${n2(analytics.sessions)}. Analytics only count visitors who run the tag and accept cookies; AI crawlers never appear there.`);
  L.push(`- Verified AI bot requests: ${n2(aiTotal)}. These appear only in logs.`, "");
  L.push("Data: Cloudflare GraphQL Analytics API (https://developers.cloudflare.com/analytics/graphql-api/). Your token was used only to call Cloudflare.");
  return L.join("\n");
}

// src/entitymap.ts
var UA9 = "Mozilla/5.0 (compatible; AlchemyAgent/0.3; +https://alchemyagent.ai)";
var CORE_TYPES = /* @__PURE__ */ new Set(["Concept", "ProprietaryTerm", "Methodology", "Metric", "Taxonomy", "Person", "Organization", "SoftwareProduct", "PhysicalProduct", "Service", "Platform", "Place", "Event", "Standard", "Regulation"]);
var TIER1 = ["INSTANCE_OF", "PART_OF", "INCLUDES", "DEPENDS_ON", "REQUIRES", "MEASURES", "PRODUCED_BY", "REGULATED_BY", "AUTHORED_BY", "AFFILIATED_WITH", "COVERS"];
var TIER2 = ["RELATES_TO", "PRECEDES", "ENABLES", "PREVENTS", "CONFLICTS_WITH", "DESCRIBED_BY", "OFFERS"];
var TIER3 = ["IMPROVES", "DEGRADES", "LEADS_TO", "SUITED_FOR", "TARGETS", "ACHIEVES"];
var STANDARD = /* @__PURE__ */ new Set([...TIER1, ...TIER2, ...TIER3]);
var STATUSES = /* @__PURE__ */ new Set(["self-declared", "generator-draft", "third-party-verified"]);
var str = (v) => typeof v === "string" && v.trim().length > 0;
var host3 = (u) => {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return "";
  }
};
function validateEntityMap(doc, now = Date.now()) {
  const issues = [];
  const err = (path, msg2) => issues.push({ level: "error", path, msg: msg2 });
  const warn = (path, msg2) => issues.push({ level: "warning", path, msg: msg2 });
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    err("root", "The file isn't a JSON object.");
    return { issues, entities: 0, chunks: 0, relations: 0 };
  }
  if (doc.version !== "1.0") err("version", `Must be "1.0" (found ${JSON.stringify(doc.version)}).`);
  if (doc.schema !== "https://entitymap.org/spec/v1.0") err("schema", 'Must be "https://entitymap.org/spec/v1.0".');
  const pub = doc.publisher;
  const pubName = typeof pub?.name === "string" ? pub.name : "";
  if (!str(pubName)) err("publisher.name", "Missing. It's the brand name AI tools will use for attribution.");
  else if (/^[a-z0-9-]+\.[a-z.]{2,}$/i.test(pubName.trim())) err("publisher.name", `"${pubName}" looks like a domain. Use the canonical brand name.`);
  if (!str(pub?.url)) err("publisher.url", "Missing the publisher's canonical URL.");
  if (!str(doc.generated) || isNaN(Date.parse(doc.generated))) err("generated", "Missing or not an ISO 8601 timestamp.");
  else if (now - Date.parse(doc.generated) > 30 * 864e5) warn("generated", `Last generated ${doc.generated.slice(0, 10)}, more than 30 days ago. Consumers treat that as possibly stale; rebuild after content changes.`);
  if (doc.verificationStatus != null && !STATUSES.has(doc.verificationStatus)) err("verificationStatus", `Must be one of ${[...STATUSES].join(", ")}.`);
  if (doc.verificationStatus === "third-party-verified" && !doc.certification) warn("verificationStatus", '"third-party-verified" without a certification field is treated as "self-declared".');
  if (doc.certification?.url) {
    const m = /^https:\/\/entitymap\.org\/certified\/([^/]+)\/([0-9a-f]{32})$/.exec(String(doc.certification.url));
    if (!m) err("certification.url", "Must look like https://entitymap.org/certified/{domain}/{32-hex token}.");
    else if (m[1].toLowerCase() !== host3(String(pub?.url ?? ""))) err("certification.url", `Domain segment ${m[1]} doesn't match publisher.url's hostname.`);
  }
  const customPreds = new Set((doc.vocabulary?.predicates ?? []).map(String));
  for (const p of customPreds) {
    if (p !== p.toUpperCase()) err("vocabulary.predicates", `Custom predicate ${p} must be uppercase.`);
    if (STANDARD.has(p)) err("vocabulary.predicates", `Custom predicate ${p} conflicts with a standard predicate.`);
  }
  const ents = Array.isArray(doc.entities) ? doc.entities : [];
  if (!ents.length) err("entities", "Needs at least one entity.");
  if (ents.length > 200 && !doc.shards) warn("entities", `${ents.length} entities. The spec says maps over 200 entities SHOULD be sharded.`);
  const byId = /* @__PURE__ */ new Map();
  const chunkIds = /* @__PURE__ */ new Set();
  let chunks = 0, relations = 0, relatesTo = 0;
  const pairs = /* @__PURE__ */ new Map();
  ents.forEach((e, i) => {
    const at = `entities[${i}]${str(e?.name) ? ` (${e.name})` : ""}`;
    if (!str(e?.entityId)) err(at, "Missing entityId.");
    else if (byId.has(e.entityId)) err(at, `Duplicate entityId ${e.entityId}.`);
    else byId.set(e.entityId, e);
    const t = String(e?.["@type"] ?? "");
    if (!t) err(at, "Missing @type.");
    else if (!CORE_TYPES.has(t) && !/^[a-z][\w-]*:[A-Z]\w*$/.test(t)) err(at, `@type "${t}" isn't a v1.0 core type or a namespaced custom type (e.g. "acme:MetricComponent").`);
    if (!str(e?.name)) err(at, "Missing name.");
    if (!str(e?.description)) err(at, "Missing description.");
    if ((e?.status === "deprecated" || e?.status === "merged") && !str(e?.replacedBy)) err(at, `status "${e.status}" needs replacedBy.`);
    if (t === "Concept" && !(Array.isArray(e?.sameAs) && e.sameAs.length)) warn(at, "Concept without sameAs. Linking Wikidata or Wikipedia helps AI tools match it to general knowledge.");
    const hc = Array.isArray(e?.hasChunks) ? e.hasChunks : [];
    if (!hc.length) err(at, "Needs at least one chunk in hasChunks.");
    if (hc.length > 5) err(`${at}.hasChunks`, `${hc.length} chunks; the maximum is 5.`);
    hc.forEach((c, j) => {
      chunks++;
      const cat = `${at}.hasChunks[${j}]`;
      for (const k of ["chunkId", "text", "sourceUrl", "pageTitle", "publisher"]) if (!str(c?.[k])) err(cat, `Missing ${k}.`);
      if (str(c?.chunkId)) {
        if (chunkIds.has(c.chunkId)) err(cat, `Duplicate chunkId ${c.chunkId}.`);
        chunkIds.add(c.chunkId);
      }
      if (str(c?.text) && c.text.length > 600) err(cat, `Text is ${c.text.length} characters; the maximum is 600.`);
      if (str(c?.publisher) && pubName && c.publisher !== pubName) err(cat, `publisher "${c.publisher}" doesn't exactly match publisher.name "${pubName}" (case and spacing count).`);
      if (str(c?.sourceUrl) && !/^https?:\/\//.test(c.sourceUrl)) err(cat, "sourceUrl must be an absolute URL.");
    });
  });
  ents.forEach((e, i) => {
    const at = `entities[${i}]${str(e?.name) ? ` (${e.name})` : ""}`;
    const t = String(e?.["@type"] ?? "");
    (Array.isArray(e?.relations) ? e.relations : []).forEach((r, k) => {
      relations++;
      const rat = `${at}.relations[${k}]`;
      const p = String(r?.predicate ?? "");
      if (!p) {
        err(rat, "Missing predicate.");
        return;
      }
      if (!STANDARD.has(p) && !customPreds.has(p)) err(rat, `Predicate ${p} isn't in the v1.0 vocabulary or declared in vocabulary.predicates.`);
      if (!str(r?.targetName)) err(rat, "Missing targetName.");
      if (TIER3.includes(p) && !str(r?.confidence)) err(rat, `${p} is an interpretive predicate and needs a confidence field.`);
      if (p === "MEASURES" && t !== "Metric") err(rat, "MEASURES can only come from a Metric entity.");
      if (p === "AFFILIATED_WITH" && t !== "Person") err(rat, "AFFILIATED_WITH can only come from a Person entity.");
      if (p === "COVERS" && !["Concept", "ProprietaryTerm", "Taxonomy"].includes(t)) err(rat, "COVERS can only come from a Concept, ProprietaryTerm or Taxonomy entity.");
      if (p === "RELATES_TO") relatesTo++;
      if (str(r?.targetId)) {
        if (!byId.has(r.targetId) && !/^https?:\/\//.test(r.targetId)) warn(rat, `targetId ${r.targetId} isn't an entity in this file.`);
        const key = `${e?.entityId}>${r.targetId}`;
        const set = pairs.get(key) ?? /* @__PURE__ */ new Set();
        set.add(p);
        pairs.set(key, set);
      }
    });
  });
  const has = (a, b, p) => pairs.get(`${a}>${b}`)?.has(p);
  const seen = /* @__PURE__ */ new Set();
  for (const key of pairs.keys()) {
    const [a, b] = key.split(">");
    const id = [a, b].sort().join("|");
    if (seen.has(id)) continue;
    seen.add(id);
    if (has(a, b, "PART_OF") && has(b, a, "INCLUDES") || has(a, b, "INCLUDES") && has(b, a, "PART_OF")) err(`${a} / ${b}`, "PART_OF and INCLUDES are declared in both directions. Inverses are implicit; keep one.");
    for (const [x, y] of [["IMPROVES", "DEGRADES"], ["ENABLES", "PREVENTS"]]) {
      if ((has(a, b, x) || has(b, a, x)) && (has(a, b, y) || has(b, a, y))) err(`${a} / ${b}`, `${x} and ${y} are both declared between the same pair.`);
    }
  }
  if (relations >= 10 && relatesTo / relations > 0.2) warn("relations", `RELATES_TO is ${Math.round(relatesTo / relations * 100)}% of relations. It's the predicate of last resort; prefer a specific one where it fits.`);
  if (doc.verificationStatus === "generator-draft") warn("verificationStatus", '"generator-draft": fine for unreviewed output. Switch to "self-declared" after a person has reviewed the map.');
  return { issues, entities: ents.length, chunks, relations };
}
function checkHtml(html, pubName) {
  const quotes = html.match(/<blockquote\b[^>]*>/gi) ?? [];
  const withPub = quotes.filter((q) => /data-publisher=/i.test(q)).length;
  const cites = (html.match(/<cite\b[^>]*>[\s\S]*?<\/cite>/gi) ?? []).map((c) => c.replace(/<[^>]+>/g, " "));
  const citeOk = cites.filter((c) => c.toLowerCase().includes(`published by ${pubName}`.toLowerCase())).length;
  return [
    { ok: /<link\b[^>]*rel=["']?alternate["']?[^>]*application\/json|<link\b[^>]*application\/json[^>]*rel=["']?alternate/i.test(html), label: 'Links to entitymap.json with <link rel="alternate" type="application/json">' },
    { ok: /<script\b[^>]*application\/ld\+json/i.test(html), label: "Embeds JSON-LD for entities" },
    { ok: quotes.length > 0 && withPub === quotes.length, label: `data-publisher on every chunk blockquote (${withPub}/${quotes.length})` },
    { ok: cites.length > 0 && citeOk === cites.length, label: `Visible "published by ${pubName}" in every <cite> (${citeOk}/${cites.length})` },
    { ok: !/<meta\b[^>]*name=["']?robots["']?[^>]*noindex/i.test(html), label: "No noindex" }
  ];
}
async function get3(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  try {
    const r = await f(url, { headers: { "user-agent": UA9, accept: "application/json, text/html;q=0.9" }, redirect: "follow", signal: ctl.signal });
    return { status: r.status, text: await r.text() };
  } catch {
    return { status: 0, text: "" };
  } finally {
    clearTimeout(t);
  }
}
async function entitymapCheck(input, f = fetch, jsonText) {
  let origin = "";
  try {
    origin = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).origin;
  } catch {
  }
  const jsonUrl = origin ? `${origin}/entitymap.json` : "(pasted JSON)";
  let text = jsonText, status;
  if (!text) {
    const r = await get3(f, jsonUrl);
    status = r.status;
    if (r.status !== 200) return { jsonUrl, found: false, status: r.status, entities: 0, chunks: 0, relations: 0, issues: [] };
    text = r.text;
  }
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    return { jsonUrl, found: true, status, entities: 0, chunks: 0, relations: 0, issues: [{ level: "error", path: "root", msg: `Not valid JSON (${e.message}).` }] };
  }
  const v = validateEntityMap(doc);
  const res = { jsonUrl, found: true, status, ...v, generated: doc.generated, verificationStatus: doc.verificationStatus };
  if (origin) {
    const h = await get3(f, `${origin}/entitymap.html`);
    res.html = { url: `${origin}/entitymap.html`, status: h.status, checks: h.status === 200 ? checkHtml(h.text, String(doc?.publisher?.name ?? "")) : [] };
  }
  return res;
}
function entitymapMarkdown(r, max = 25) {
  const L = [`# EntityMap check: ${r.jsonUrl}`, ""];
  if (!r.found) {
    L.push(`No EntityMap found (HTTP ${r.status || "no response"}).`, "", "EntityMap is an open standard for publishing a site's entities, their relationships and source passages for AI systems: entitymap.json at the domain root, plus a generated entitymap.html. Spec: https://entitymap.org/spec/v1.0");
    return L.join("\n");
  }
  const errs = r.issues.filter((i) => i.level === "error"), warns = r.issues.filter((i) => i.level === "warning");
  L.push(`**${errs.length ? `Not valid: ${errs.length} error${errs.length === 1 ? "" : "s"}` : "Valid against the v1.0 rules checked"}**, ${warns.length} warning${warns.length === 1 ? "" : "s"}.`, "");
  L.push(`- ${r.entities} entities, ${r.chunks} chunks, ${r.relations} relations`);
  if (r.generated) L.push(`- Generated ${r.generated}`);
  if (r.verificationStatus) L.push(`- verificationStatus: ${r.verificationStatus}`);
  L.push("");
  const list = (title, xs) => {
    if (!xs.length) return;
    L.push(`## ${title}`, "");
    for (const i of xs.slice(0, max)) L.push(`- \`${i.path}\`: ${i.msg}`);
    if (xs.length > max) L.push(`- \u2026and ${xs.length - max} more`);
    L.push("");
  };
  list("Errors", errs);
  list("Warnings", warns);
  if (r.html) {
    L.push("## HTML companion", "");
    if (r.html.status !== 200) L.push(`- ${r.html.url}: HTTP ${r.html.status || "no response"}. The spec expects an entitymap.html generated from the JSON.`);
    else for (const c of r.html.checks) L.push(`- ${c.ok ? "\u2713" : "\u2717"} ${c.label}`);
    L.push("");
  }
  L.push("Checked against EntityMap v1.0 (https://entitymap.org/spec/v1.0). The official validator is https://entitymap.org/validate.");
  return L.join("\n");
}

// src/images.ts
var UA10 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 AlchemyAgent/0.3";
var KB = 1024;
var attr = (tag2, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag2);
  return m ? m[2] ?? m[3] ?? m[4] ?? "" : null;
};
function extractImages(html, base) {
  const abs = (u) => {
    try {
      return new URL(u.trim(), base).href;
    } catch {
      return "";
    }
  };
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const page = (() => {
    try {
      const u = new URL(base);
      return u.origin + u.pathname;
    } catch {
      return base;
    }
  })();
  const add = (i) => {
    if (!i.url || i.url.startsWith("data:") || seen.has(i.url) || i.url.split(/[?#]/)[0] === page) return;
    seen.add(i.url);
    out.push(i);
  };
  const body = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  let n4 = 0;
  for (const m of body.matchAll(/<(img|source|video)\b[^>]*>/gi)) {
    const tag2 = m[0], name = m[1].toLowerCase();
    if (name === "img") {
      const src = attr(tag2, "data-lazy-src") || attr(tag2, "data-src") || attr(tag2, "src") || "";
      add({ url: abs(src), kind: "img", index: n4++, alt: attr(tag2, "alt"), width: attr(tag2, "width"), height: attr(tag2, "height"), loading: attr(tag2, "loading") ?? (attr(tag2, "data-src") || attr(tag2, "data-lazy-src") ? "lazy" : null), fetchpriority: attr(tag2, "fetchpriority"), srcset: !!(attr(tag2, "srcset") || attr(tag2, "data-srcset")) });
    } else if (name === "source") {
      const ss = attr(tag2, "srcset") || attr(tag2, "data-srcset");
      const src = attr(tag2, "src");
      if (src && /video|mp4|webm/i.test(attr(tag2, "type") ?? src)) add({ url: abs(src), kind: "video", index: n4++, srcset: false });
      else if (ss) add({ url: abs(ss.split(",")[0].trim().split(/\s+/)[0]), kind: "source", index: n4++, srcset: true });
    } else {
      const poster = attr(tag2, "poster");
      const autoplay = /\sautoplay\b/i.test(tag2);
      const src = attr(tag2, "src");
      if (poster) add({ url: abs(poster), kind: "poster", index: n4++, srcset: false });
      if (src) add({ url: abs(src), kind: "video", index: n4++, srcset: false, autoplay, hasPoster: !!poster });
    }
  }
  for (const m of body.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/gi)) {
    const autoplay = /\sautoplay\b/i.test(m[1]), hasPoster = !!attr(`<v ${m[1]}>`, "poster");
    for (const s of m[2].matchAll(/<source\b[^>]*>/gi)) {
      const u = abs(attr(s[0], "src") ?? "");
      const v = out.find((x) => x.url === u && x.kind === "video");
      if (v) {
        v.autoplay = autoplay;
        v.hasPoster = hasPoster;
      }
    }
  }
  const og = /<meta\b[^>]*property=["']og:image["'][^>]*>/i.exec(body);
  const ogUrl = og ? abs(attr(og[0], "content") ?? "") : "";
  if (ogUrl) out.push({ url: ogUrl, kind: "og", index: -1, srcset: false });
  return out.filter((i) => i.url || i.kind === "video");
}
async function measure(f, img) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  try {
    const isSvg = /\.svg(\?|#|$)/i.test(img.url);
    const res = await f(img.url, { method: img.kind === "video" ? "HEAD" : "GET", headers: { "user-agent": UA10, accept: "image/avif,image/webp,image/*,*/*;q=0.8" }, redirect: "follow", signal: ctl.signal });
    img.status = res.status;
    img.type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
    if (img.kind === "video") {
      img.bytes = Number(res.headers.get("content-length")) || void 0;
      return;
    }
    if (/^text\/html/.test(img.type)) {
      img.status = -1;
      return;
    }
    if (isSvg || img.type === "image/svg+xml") {
      const text = await res.text();
      img.bytes = new TextEncoder().encode(text).length;
      let emb = 0;
      for (const m of text.matchAll(/data:image\/(?:png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)/g)) emb += Math.floor(m[1].replace(/\s/g, "").length * 3 / 4);
      if (emb) img.embeddedRasterBytes = emb;
    } else {
      img.bytes = (await res.arrayBuffer()).byteLength;
    }
  } catch {
    img.status = 0;
  } finally {
    clearTimeout(t);
  }
}
var fmt2 = (b) => b == null ? "?" : b >= KB * KB ? `${(b / KB / KB).toFixed(1)} MB` : `${Math.round(b / KB)} KB`;
var short = (u) => {
  try {
    const x = new URL(u);
    return x.pathname.split("/").filter(Boolean).slice(-2).join("/") || x.hostname;
  } catch {
    return u;
  }
};
async function imageAudit(input, f = fetch, maxImages = 40) {
  const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  let res;
  try {
    res = await f(url, { headers: { "user-agent": UA10, accept: "text/html" }, redirect: "follow" });
  } catch {
    throw new Error(`Couldn't load ${url}.`);
  }
  const html = await res.text();
  if (res.status !== 200) throw new Error(`${url} returned HTTP ${res.status}${/cf-mitigated|challenge/i.test(html) ? " (a bot challenge)" : ""}.`);
  const images = extractImages(html, res.url || url).slice(0, maxImages);
  const queue = images.filter((i) => i.url);
  await Promise.all(Array.from({ length: 6 }, async () => {
    for (let i = queue.shift(); i; i = queue.shift()) await measure(f, i);
  }));
  const page = images.filter((i) => i.kind !== "og" && i.kind !== "video" && i.status !== -1);
  const totalBytes = page.reduce((a, i) => a + (i.bytes ?? 0), 0);
  const findings = [];
  const push = (severity, title, detail, xs, label) => {
    if (xs.length) findings.push({ severity, title, detail, items: xs.map(label) });
  };
  push(
    1,
    "Photos hidden inside SVG files",
    "These .svg files wrap a base64 PNG or JPEG. They can't be compressed, cached or resized like real images, and they're often several MB. Export each as WebP (or AVIF) and point the page at that file.",
    page.filter((i) => (i.embeddedRasterBytes ?? 0) > 20 * KB),
    (i) => `${short(i.url)}: ${fmt2(i.bytes)} (${fmt2(i.embeddedRasterBytes)} of embedded raster)`
  );
  const first = page.find((i) => i.kind === "img");
  if (first && first.loading === "lazy") findings.push({ severity: 1, title: "The first image is lazy-loaded", detail: 'The first image is usually the hero and the Largest Contentful Paint element. Lazy-loading it delays LCP. Use loading="eager" and fetchpriority="high" on it.', items: [short(first.url)] });
  push(1, "Autoplay videos without a poster image", "Without a poster, the browser shows nothing until the video downloads, and the video itself becomes the LCP element. Add a lightweight WebP poster.", images.filter((i) => i.kind === "video" && i.autoplay && !i.hasPoster), (i) => i.url ? `${short(i.url)}${i.bytes ? ` (${fmt2(i.bytes)})` : ""}` : "inline <video> with no src");
  push(2, "Heavy images (over 200 KB)", "Resize to the largest size the layout actually shows (usually under 2000 px wide) and compress. Most photos land under 150 KB as WebP.", page.filter((i) => (i.bytes ?? 0) > 200 * KB && !i.embeddedRasterBytes).sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0)), (i) => `${short(i.url)}: ${fmt2(i.bytes)}`);
  push(2, "JPG, PNG or GIF that should be WebP or AVIF", "WebP is typically 25\u201335% smaller than JPEG at the same quality, and every current browser supports it.", page.filter((i) => /image\/(jpeg|png|gif)/.test(i.type ?? "") && (i.bytes ?? 0) > 50 * KB), (i) => `${short(i.url)} (${i.type?.replace("image/", "")}, ${fmt2(i.bytes)})`);
  push(2, "Large images without srcset", "Phones download the full desktop file. Add srcset and sizes so each device gets a right-sized version (WordPress does this automatically for images inserted from the media library).", page.filter((i) => i.kind === "img" && !i.srcset && (i.bytes ?? 0) > 100 * KB && !/svg/.test(i.type ?? "")), (i) => `${short(i.url)}: ${fmt2(i.bytes)}`);
  push(3, "Missing width and height", "Without dimensions the layout jumps as images load (Cumulative Layout Shift).", page.filter((i) => i.kind === "img" && (!i.width || !i.height)), (i) => short(i.url));
  push(3, "Below-the-fold images not lazy-loaded", `Images after the first few should use loading="lazy" so they don't compete with the hero.`, page.filter((i) => i.kind === "img" && i.index > 3 && i.loading !== "lazy"), (i) => short(i.url));
  push(3, "Missing alt text", 'Alt text is how screen readers and AI systems understand an image. Describe what it shows; use alt="" only for decoration.', page.filter((i) => i.kind === "img" && i.alt == null), (i) => short(i.url));
  push(3, "Broken images", "These image URLs didn't load.", images.filter((i) => i.url && i.status != null && i.status !== 0 && i.status >= 400), (i) => `${short(i.url)} (HTTP ${i.status})`);
  const og = images.find((i) => i.kind === "og");
  if (!og) findings.push({ severity: 3, title: "No og:image", detail: "Links shared in Slack, LinkedIn and chat apps show no preview image. Add a 1200x630 og:image.", items: [] });
  else if ((og.bytes ?? 0) > 600 * KB) findings.push({ severity: 3, title: "Heavy share image", detail: "Some platforms skip og:images over a few hundred KB or time out fetching them.", items: [`${short(og.url)}: ${fmt2(og.bytes)}`] });
  findings.sort((a, b) => a.severity - b.severity);
  return { url: res.url || url, status: res.status, images, totalBytes, findings };
}
function imageMarkdown(a, maxItems = 8) {
  const L = [`# Image audit: ${a.url}`, ""];
  const imgs = a.images.filter((i) => i.kind !== "og" && i.kind !== "video" && i.status !== -1);
  const biggest = [...imgs].sort((x, y) => (y.bytes ?? 0) - (x.bytes ?? 0))[0];
  L.push(`- ${imgs.length} images found in the HTML, ${fmt2(a.totalBytes)} in total${biggest?.bytes ? `; the largest is ${short(biggest.url)} at ${fmt2(biggest.bytes)}` : ""}`);
  const vids = a.images.filter((i) => i.kind === "video");
  if (vids.length) L.push(`- ${vids.length} video${vids.length === 1 ? "" : "s"}${vids.some((v) => v.autoplay) ? " (autoplay)" : ""}`);
  L.push("- Counts only what's in the page HTML. Images added later by JavaScript or CSS backgrounds aren't included; use pagespeed_check for the full picture.", "");
  if (!a.findings.length) {
    L.push("No image problems found.");
    return L.join("\n");
  }
  const label = ["", "Fix first", "Fix next", "Worth doing"];
  for (const s of [1, 2, 3]) {
    const fs = a.findings.filter((x) => x.severity === s);
    if (!fs.length) continue;
    L.push(`## ${label[s]}`, "");
    for (const x of fs) {
      L.push(`**${x.title}**${x.items.length ? ` (${x.items.length})` : ""}. ${x.detail}`);
      for (const it of x.items.slice(0, maxItems)) L.push(`- ${it}`);
      if (x.items.length > maxItems) L.push(`- \u2026and ${x.items.length - maxItems} more`);
      L.push("");
    }
  }
  return L.join("\n").trimEnd();
}

// src/featured.ts
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir as mkdir3, readFile as readFile3, writeFile as writeFile3 } from "node:fs/promises";
import { homedir as homedir3 } from "node:os";
import { join as join3, resolve } from "node:path";
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var fmt3 = (v) => Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 1 });
var font = (f) => f.trim().replace(/ /g, "+");
function cardHtml(c, accent) {
  const title = c.title ? `<h3>${esc(c.title)}</h3>` : "";
  const foot = (f) => f ? `<div class="foot"><span class="big" style="color:${accent}">${esc(f.value)}</span><span>${esc(f.text)}</span></div>` : "";
  if (c.type === "bars") {
    const max = Math.max(...c.rows.map((r) => r.value), 1);
    const colors = [accent, "#f98600", "#e8e8e8", "#9ad1ff", "#b9f6ca"];
    const dense = c.rows.length + (c.footer ? 1 : 0) >= 5;
    return title + c.rows.slice(0, 5).map((r, i) => `<div class="bar${dense ? " dense" : ""}"><div class="bl"><span><b>${esc(r.label)}</b>${r.note ? ` <i>\xB7 ${esc(r.note)}</i>` : ""}</span><b class="num">${fmt3(r.value)}</b></div><div class="track"><div style="width:${Math.max(r.value / max * 100, 1.6).toFixed(1)}%;background:${colors[i % colors.length]}"></div></div></div>`).join("") + foot(c.footer);
  }
  if (c.type === "stats") {
    return title + `<div class="stats">${c.rows.slice(0, 4).map((r) => `<div><span class="big" style="color:${accent}${r.value.length > 9 ? ";font-size:28px" : ""}">${esc(r.value)}</span><span>${esc(r.label)}</span></div>`).join("")}</div>`;
  }
  if (c.type === "before_after") {
    const W = 492, x0 = 150, x1 = 480, rows = c.rows.slice(0, 7);
    const X = (v) => x0 + (v - c.min) / Math.max(c.max - c.min, 1) * (x1 - x0);
    const H = 20 + rows.length * 42 + 20;
    let svg = `<svg width="${W}" height="${Math.min(H + 24, 290)}" viewBox="0 0 ${W} ${H + 24}" font-family="inherit">`;
    const step = c.max - c.min <= 10 ? 1 : Math.ceil((c.max - c.min) / 8);
    for (let v = c.min; v <= c.max; v += step) svg += `<line x1="${X(v)}" y1="0" x2="${X(v)}" y2="${H}" stroke="#262626"/><text x="${X(v)}" y="${H + 20}" fill="#8a8a8a" font-size="13" text-anchor="middle">${v}</text>`;
    rows.forEach((r, i) => {
      const y = 20 + i * 42;
      svg += `<text x="0" y="${y + 5}" fill="#e6e6e6" font-size="15">${esc(r.label)}</text><line x1="${X(r.before)}" y1="${y}" x2="${X(r.after)}" y2="${y}" stroke="${accent}" stroke-width="4"/><circle cx="${X(r.before)}" cy="${y}" r="8" fill="#6b6b6b"/><circle cx="${X(r.after)}" cy="${y}" r="9" fill="${accent}"/>`;
    });
    return title + svg + "</svg>" + foot(c.footer);
  }
  return title + `<ul class="list">${c.rows.slice(0, 6).map((r) => `<li><span style="background:${accent}"></span>${esc(r)}</li>`).join("")}</ul>`;
}
async function featuredHtml(s) {
  const bg = s.background ?? "#ffc61a", ink = s.ink ?? "#111111", accent = s.accent ?? bg;
  const hf = s.headingFont ?? "Days One", bf = s.bodyFont ?? "DM Sans";
  let logo = s.brand ? `<div class="brand">${esc(s.brand)}</div>` : "";
  if (s.logoSvg) {
    const svg = await readFile3(resolve(s.logoSvg.replace(/^~(?=\/)/, homedir3())), "utf8");
    logo = `<div class="logo">${svg.replace(/<\?xml[^>]*>/, "")}</div>`;
  }
  const long = s.headline.length > 42;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=${font(hf)}&family=${font(bf)}:wght@400;500;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{font-family:'${bf}',sans-serif;color:${ink};position:relative;background:radial-gradient(circle at 18% 105%,rgba(255,255,255,.28) 0,transparent 55%),radial-gradient(circle at 95% 0%,rgba(0,0,0,.08) 0,transparent 50%),${bg}}
.rings{position:absolute;left:-240px;bottom:-330px;width:760px;height:760px;border-radius:50%;box-shadow:0 0 0 38px rgba(255,255,255,.10),0 0 0 76px rgba(0,0,0,.035),0 0 0 114px rgba(255,255,255,.08),0 0 0 152px rgba(0,0,0,.03)}
.pix{position:absolute;right:0;top:0;width:520px;height:630px;opacity:.55;background-image:linear-gradient(90deg,rgba(255,255,255,.10) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.10) 1px,transparent 1px);background-size:44px 44px}
.logo{position:absolute;left:64px;top:48px;height:52px;display:flex;align-items:center}.logo svg{height:44px;width:auto;max-width:420px}
.brand{position:absolute;left:64px;top:58px;font:700 22px '${bf}';letter-spacing:.12em;text-transform:uppercase}
.eyebrow{position:absolute;right:64px;top:60px;font:700 13px '${bf}';letter-spacing:.14em;background:${ink};color:${bg};padding:8px 14px;border-radius:999px;text-transform:uppercase}
.left{position:absolute;left:64px;top:150px;width:470px}
h1{font-family:'${hf}',sans-serif;font-weight:400;font-size:${long ? 40 : 46}px;line-height:1.08}
.sub{margin-top:18px;font-size:20px;line-height:1.4;font-weight:500;opacity:.88}
.card{position:absolute;right:56px;top:128px;width:560px;height:410px;background:#111;border-radius:22px;padding:30px 34px;color:#f2f2f2;box-shadow:0 30px 60px rgba(0,0,0,.22);overflow:hidden}
.card h3{font:700 13px '${bf}';letter-spacing:.14em;color:${accent === "#111111" ? "#fff" : accent};margin-bottom:18px;text-transform:uppercase}
.bar{margin:0 0 22px}.bl{display:flex;justify-content:space-between;font-size:15px;margin-bottom:8px}.bl i{color:#9a9a9a;font-style:normal}.num{font-family:'${hf}'}
.track{height:26px;background:#222;border-radius:6px}.track div{height:26px;border-radius:6px}
.bar.dense{margin:0 0 13px}.bar.dense .bl{margin-bottom:6px}.bar.dense .track,.bar.dense .track div{height:18px}
.foot{border-top:1px solid #2c2c2c;padding-top:18px;display:flex;align-items:baseline;gap:14px}.foot span:last-child{font-size:15px;line-height:1.35;color:#d8d8d8}
.big{font:400 40px '${hf}'}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:26px 22px;margin-top:8px}.stats div{display:flex;flex-direction:column;gap:6px}.stats span:last-child{font-size:15px;color:#d8d8d8;line-height:1.35}
.list{list-style:none;margin-top:6px}.list li{display:flex;gap:12px;align-items:center;font-size:18px;margin:0 0 18px}.list li span{width:10px;height:10px;border-radius:50%;flex:none}
.src{position:absolute;left:64px;bottom:40px;font-size:14px;font-weight:500;opacity:.8}
.url{position:absolute;right:64px;bottom:40px;font:700 14px '${bf}'}
</style></head><body><div class="rings"></div><div class="pix"></div>${logo}${s.eyebrow ? `<div class="eyebrow">${esc(s.eyebrow)}</div>` : ""}
<div class="left"><h1>${esc(s.headline)}</h1>${s.subhead ? `<p class="sub">${esc(s.subhead)}</p>` : ""}</div>
<div class="card">${cardHtml(s.card, accent === bg && /^#?f/i.test(bg) ? bg : accent)}</div>
${s.source ? `<div class="src">${esc(s.source)}</div>` : ""}${s.site ? `<div class="url">${esc(s.site)}</div>` : ""}</body></html>`;
}
var CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n4 = 0; n4 < 256; n4++) {
    let c = n4;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n4] = c >>> 0;
  }
  return t;
})();
function crc32(b) {
  let c = 4294967295;
  for (const x of b) c = CRC_TABLE[(c ^ x) & 255] ^ c >>> 8;
  return (c ^ 4294967295) >>> 0;
}
function addPngText(png, entries) {
  const iend = png.lastIndexOf(Buffer.from("IEND", "latin1")) - 4;
  if (iend < 8) return png;
  const chunks = Object.entries(entries).map(([k, v]) => {
    const data = Buffer.concat([Buffer.from(k, "latin1"), Buffer.from([0]), Buffer.from(v, "latin1")]);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const type = Buffer.from("tEXt", "latin1");
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
    return Buffer.concat([len, type, data, crc]);
  });
  return Buffer.concat([png.subarray(0, iend), ...chunks, png.subarray(iend)]);
}
var CREDIT = { Software: "AlchemyAgent (https://alchemyagent.ai)", Comment: "Created with AlchemyAgent, https://alchemyagent.ai" };
function findChrome() {
  const c = process.platform === "darwin" ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"] : process.platform === "win32" ? [`${process.env["PROGRAMFILES"]}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env["PROGRAMFILES(X86)"]}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env["LOCALAPPDATA"]}\\Google\\Chrome\\Application\\chrome.exe`, `${process.env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`] : ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"];
  return c.find((p) => p && existsSync(p)) ?? null;
}
async function renderFeatured(spec, outDir, name = "featured", credit = true) {
  const dir = resolve((outDir ?? join3(homedir3(), "Downloads", "alchemyagent-images")).replace(/^~(?=\/)/, homedir3()));
  await mkdir3(dir, { recursive: true });
  const slug2 = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "featured";
  const html = join3(dir, `${slug2}.html`), png = join3(dir, `${slug2}.png`);
  await writeFile3(html, await featuredHtml(spec), "utf8");
  const chrome = findChrome();
  if (!chrome) return { html, note: "No Chrome, Edge, Chromium or Brave found, so only the HTML was written. Open it in a browser at 1200x630 and screenshot it, or install Chrome and run again." };
  await new Promise((ok) => execFile(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=1200,630", "--virtual-time-budget=5000", `--screenshot=${png}`, `file://${html}`], { timeout: 6e4 }, () => ok()));
  if (!existsSync(png)) return { html, note: `Chrome didn't produce a screenshot. The HTML is at ${html}.` };
  if (credit) await writeFile3(png, addPngText(await readFile3(png), CREDIT));
  return { html, png };
}

// src/connections.ts
import { existsSync as existsSync2 } from "node:fs";
function connState(o, tokenFile) {
  return {
    gscOAuth: !!(o.gsc?.clientId && o.gsc?.clientSecret),
    gscSignedIn: existsSync2(tokenFile),
    gscServiceAccount: !!o.gsc?.serviceAccountFile,
    bing: !!o.bingKey,
    cloudflare: !!o.cloudflareToken,
    brave: !!o.braveKey,
    psi: !!o.psiKey
  };
}
var SETTINGS = "Claude Desktop: Settings > Extensions > AlchemyAgent > Configure. Claude Code: run /plugin, open AlchemyAgent and edit its settings.";
function connectionsMarkdown(s) {
  const gsc2 = s.gscServiceAccount || s.gscOAuth && s.gscSignedIn;
  const rows = [
    [
      "Google Search Console",
      gsc2,
      "Your real Google queries, clicks, impressions and positions, and which queries come from AI assistants. The single most useful source: fixes get ranked by what actually earns traffic.",
      s.gscOAuth && !s.gscSignedIn ? 'Your OAuth client is set. Ask Claude to "connect Search Console" (gsc_connect) and sign in once.' : `Add a Google OAuth client ID and secret (Google Cloud > Credentials > OAuth client ID > Desktop app, with the Search Console API enabled), or a service account JSON file whose email is a user on your property. ${SETTINGS} Then ask Claude to "connect Search Console".`
    ],
    [
      "Bing Webmaster Tools",
      s.bing,
      "Bing traffic, top queries and pages, index and crawl errors. Bing's index also feeds Microsoft Copilot and other AI assistants.",
      `Bing Webmaster Tools > Settings (gear) > API access > API key, then paste it into bing_api_key. ${SETTINGS}`
    ],
    [
      "Cloudflare logs",
      s.cloudflare,
      "Which AI crawlers and assistants actually read your pages, fake bots, real crawlers you're blocking, and bot-only errors. Analytics tools never see any of this.",
      `Cloudflare > My Profile > API Tokens > Create Token > Custom: Zone > Analytics > Read and Zone > Zone > Read (add Account > Account Analytics > Read for Web Analytics). Paste it into cloudflare_api_token. ${SETTINGS} Needs your site proxied through Cloudflare.`
    ],
    [
      "Google Analytics 4",
      false,
      "Sessions, conversions and revenue by landing page and channel, including AI-assistant referrals.",
      "Coming soon. Until then, tell Claude your GA4 numbers (for example, sessions for the last 28 days) and tools like log_file_analysis will compare them with your logs."
    ],
    ["Brave Search API", s.brave, "Where you rank in Brave Search, an independent index several AI tools use.", `Free plan at api-dashboard.search.brave.com; paste the key into brave_api_key. ${SETTINGS}`],
    ["PageSpeed Insights key", s.psi, "Optional: skips the shared daily limit on speed checks.", `Free key from Google Cloud with the PageSpeed Insights API enabled; paste it into psi_api_key. ${SETTINGS}`]
  ];
  const on = rows.filter((r) => r[1]).length;
  const L = [
    `# Your data connections: ${on} of ${rows.length} connected`,
    "",
    "Every public-site check works without these. Connecting your own data is what lets AlchemyAgent rank fixes by real traffic, real queries and real crawler visits instead of best practice alone. Keys and tokens stay on your computer and only go to the service they belong to.",
    ""
  ];
  for (const [name, ok, why, how] of rows) {
    L.push(`## ${ok ? "\u2713" : "\u25CB"} ${name}${ok ? ": connected" : ""}`, why);
    if (!ok) L.push("", `**How to connect:** ${how}`);
    L.push("");
  }
  const next = rows.find((r) => !r[1] && r[0] !== "Google Analytics 4");
  if (next) L.push(`**Start with:** ${next[0]}.`);
  return L.join("\n").trimEnd();
}

// src/bing.ts
var BASE2 = "https://ssl.bing.com/webmaster/api.svc/json/";
var BING_KEY_HELP = "Bing Webmaster Tools needs your own API key. In Bing Webmaster Tools (https://www.bing.com/webmasters), open Settings (the gear) > API access > API key, generate a key, then paste it into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure). The key stays on your computer and is only sent to Bing.";
var BingError = class extends Error {
};
async function call(f, key, method, params = {}) {
  const q = new URLSearchParams({ ...params, apikey: key });
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  let res;
  try {
    res = await f(`${BASE2}${method}?${q}`, { headers: { accept: "application/json" }, signal: ctl.signal });
  } catch {
    throw new BingError(`Couldn't reach the Bing Webmaster API (${method}). Try again in a minute.`);
  } finally {
    clearTimeout(t);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.ErrorCode) {
    const msg2 = body?.Message ? String(body.Message) : `HTTP ${res.status}`;
    if (res.status === 401 || /api ?key|unauthori[sz]ed|InvalidApiKey/i.test(msg2)) throw new BingError(`Bing rejected the API key (${msg2}). ${BING_KEY_HELP}`);
    throw new BingError(`Bing Webmaster API ${method} failed: ${msg2}`);
  }
  return body.d;
}
function bingDate(v) {
  const m = /\/Date\((-?\d+)/.exec(String(v ?? ""));
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : "";
}
async function listSites2(f, key) {
  const d = await call(f, key, "GetUserSites") ?? [];
  return d.map((s) => ({ url: String(s.Url), verified: !!s.IsVerified }));
}
function matchSite(sites, input) {
  const host4 = (u) => {
    try {
      return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "";
    }
  };
  const want = host4(input);
  return sites.find((s) => s.url.replace(/\/$/, "") === input.replace(/\/$/, "")) ?? sites.find((s) => host4(s.url) === want) ?? null;
}
function aggregate(rows) {
  const by = /* @__PURE__ */ new Map();
  const dates = [];
  for (const r of rows ?? []) {
    const k = String(r.Query ?? "");
    if (!k) continue;
    const a = by.get(k) ?? { clicks: 0, impressions: 0, posSum: 0, posW: 0 };
    const imp = Number(r.Impressions) || 0;
    a.clicks += Number(r.Clicks) || 0;
    a.impressions += imp;
    const pos = Number(r.AvgImpressionPosition);
    if (pos > 0 && imp > 0) {
      a.posSum += pos * imp;
      a.posW += imp;
    }
    by.set(k, a);
    const d = bingDate(r.Date);
    if (d) dates.push(d);
  }
  dates.sort();
  return {
    rows: [...by].map(([key, a]) => ({ key, clicks: a.clicks, impressions: a.impressions, position: a.posW ? a.posSum / a.posW : null })).sort((x, y) => y.clicks - x.clicks || y.impressions - x.impressions),
    from: dates[0] ?? "",
    to: dates[dates.length - 1] ?? ""
  };
}
async function bingReport(f, key, siteUrl, sections) {
  const p = { siteUrl };
  const want = new Set(sections);
  const [traffic, queries, pages, crawl, quota] = await Promise.all([
    want.has("traffic") ? call(f, key, "GetRankAndTrafficStats", p) : null,
    want.has("queries") ? call(f, key, "GetQueryStats", p) : null,
    want.has("pages") ? call(f, key, "GetPageStats", p) : null,
    want.has("crawl") ? call(f, key, "GetCrawlStats", p) : null,
    want.has("crawl") ? call(f, key, "GetUrlSubmissionQuota", p).catch(() => null) : null
  ]);
  const out = { site: siteUrl };
  if (traffic) {
    const rows = traffic.map((r) => ({ date: bingDate(r.Date), clicks: Number(r.Clicks) || 0, impressions: Number(r.Impressions) || 0 })).filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
    const last = rows.length ? Date.parse(rows[rows.length - 1].date) : 0;
    const sum = (lo, hi) => rows.filter((r) => {
      const age = (last - Date.parse(r.date)) / 864e5;
      return age >= lo && age < hi;
    }).reduce((a, r) => ({ clicks: a.clicks + r.clicks, impressions: a.impressions + r.impressions }), { clicks: 0, impressions: 0 });
    out.traffic = { last28: sum(0, 28), prev28: sum(28, 56), from: rows[0]?.date ?? "", to: rows[rows.length - 1]?.date ?? "" };
  }
  if (queries) out.queries = aggregate(queries);
  if (pages) out.pages = aggregate(pages);
  if (crawl) {
    const rows = [...crawl].sort((a, b) => bingDate(a.Date).localeCompare(bingDate(b.Date)));
    const r = rows[rows.length - 1];
    out.crawl = r ? {
      date: bingDate(r.Date),
      inIndex: Number(r.InIndex) || 0,
      crawled: Number(r.CrawledPages) || 0,
      errors: Number(r.CrawlErrors) || 0,
      c4xx: Number(r.Code4xx) || 0,
      c5xx: Number(r.Code5xx) || 0,
      robotsBlocked: Number(r.BlockedByRobotsTxt) || 0,
      inLinks: Number(r.InLinks) || 0
    } : null;
  }
  if (quota) out.quota = { daily: Number(quota.DailyQuota) || 0, monthly: Number(quota.MonthlyQuota) || 0 };
  return out;
}
var n3 = (v) => v.toLocaleString("en-US");
var pct2 = (a, b) => b ? `${a >= b ? "+" : ""}${Math.round((a - b) / b * 100)}%` : "n/a";
function sitesMarkdown(sites) {
  if (!sites.length) return "No sites in this Bing Webmaster Tools account yet. Add and verify one at https://www.bing.com/webmasters (you can import sites from Google Search Console).";
  return ["## Sites in your Bing Webmaster Tools account", "", ...sites.map((s) => `- ${s.url}${s.verified ? "" : " (not verified)"}`), "", 'Ask for a report on one of these, e.g. "Bing queries for ' + sites[0].url + '".'].join("\n");
}
function bingMarkdown(r, limit = 15) {
  const L = [`## Bing Webmaster Tools: ${r.site}`, ""];
  if (r.traffic) {
    const { last28: a, prev28: b } = r.traffic;
    L.push(
      "### Bing search traffic",
      "| | Last 28 days | Previous 28 days | Change |",
      "|---|---|---|---|",
      `| Clicks | ${n3(a.clicks)} | ${n3(b.clicks)} | ${pct2(a.clicks, b.clicks)} |`,
      `| Impressions | ${n3(a.impressions)} | ${n3(b.impressions)} | ${pct2(a.impressions, b.impressions)} |`,
      `| CTR | ${a.impressions ? (a.clicks / a.impressions * 100).toFixed(1) + "%" : "n/a"} | ${b.impressions ? (b.clicks / b.impressions * 100).toFixed(1) + "%" : "n/a"} | |`,
      "",
      `Data through ${r.traffic.to || "n/a"}. Bing's index also feeds Microsoft Copilot and several other search and AI tools, so it matters beyond bing.com.`,
      ""
    );
  }
  const table = (title, agg, label) => {
    L.push(`### ${title}`, agg.from ? `${agg.from} to ${agg.to}, ${n3(agg.rows.length)} ${label.toLowerCase()}s` : "", "");
    if (!agg.rows.length) {
      L.push("No data yet. New sites can take a few days to show data.", "");
      return;
    }
    L.push(`| ${label} | Clicks | Impressions | CTR | Avg position |`, "|---|---|---|---|---|");
    for (const q of agg.rows.slice(0, limit)) {
      L.push(`| ${q.key.replace(/\|/g, "\\|")} | ${n3(q.clicks)} | ${n3(q.impressions)} | ${q.impressions ? (q.clicks / q.impressions * 100).toFixed(1) + "%" : ""} | ${q.position ? q.position.toFixed(1) : ""} |`);
    }
    L.push("");
  };
  if (r.queries) table("Top queries", r.queries, "Query");
  if (r.pages) table("Top pages", r.pages, "Page");
  if (r.crawl !== void 0) {
    L.push("### Crawl and index");
    if (!r.crawl) L.push("No crawl data yet.");
    else {
      const c = r.crawl;
      L.push(`Latest day (${c.date}): **${n3(c.inIndex)} pages in Bing's index**, ${n3(c.crawled)} crawled, ${n3(c.errors)} crawl errors (${n3(c.c4xx)} 4xx, ${n3(c.c5xx)} 5xx), ${n3(c.robotsBlocked)} blocked by robots.txt, ${n3(c.inLinks)} inbound links.`);
      if (c.c5xx > 0) L.push("", "5xx errors mean Bingbot is hitting server errors or a firewall. Check that your CDN/WAF isn't challenging Bingbot.");
    }
    if (r.quota) L.push("", `URL submission quota: ${n3(r.quota.daily)} today, ${n3(r.quota.monthly)} this month. (IndexNow pings don't use this quota.)`);
    L.push("");
  }
  return L.join("\n").trimEnd();
}

// src/server.ts
var BROWSER_UA3 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
async function homepageSameAs(origin, f) {
  const r = await get(f, origin + "/", BROWSER_UA3);
  if (r.status !== 200 || challenged(r)) return null;
  const out = [];
  for (const m of r.text.matchAll(/<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk2 = (v) => {
        if (Array.isArray(v)) return v.forEach(walk2);
        if (v && typeof v === "object") {
          const t = [].concat(v["@type"] ?? []).join(" ");
          if (/Organization|LocalBusiness|Corporation|Brand/.test(t) && v.sameAs) out.push(...[].concat(v.sameAs));
          Object.values(v).forEach(walk2);
        }
      };
      walk2(JSON.parse(m[1]));
    } catch {
    }
  }
  return out;
}
async function botBlocked(origin, token, f) {
  const r = await get(f, origin + "/robots.txt", "AlchemyAgent-Check/0.1 (+https://alchemyagent.ai)");
  if (challenged(r) || r.status >= 500 || r.status === 0) return null;
  if (r.status !== 200) return false;
  return !isAllowed(rulesFor(parseRobots(r.text), token).rules, "/").allowed;
}
var VERSION = "0.3.7";
var DEFAULT_API_BASE = "https://api.alchemyagent.ai";
var errorResult = (e) => ({ isError: true, content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }] });
function createServer2(opts = {}) {
  const apiBase = (opts.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const f = opts.fetchFn ?? fetch;
  const psi = { apiBase, apiKey: opts.psiKey, fetchFn: f };
  const server2 = new McpServer({ name: "alchemyagent", version: VERSION });
  const clean2 = (r) => opts.remote && r?.content ? { ...r, content: r.content.map((c) => c.type === "text" ? { ...c, text: c.text.split("\n").filter((l) => !l.startsWith("AlchemyAgent Pro")).join("\n").trimEnd() } : c) } : r;
  const register = ((name, cfg, cb) => server2.registerTool(name, { ...cfg, annotations: { title: cfg.title, ...cfg.annotations } }, async (...a) => clean2(await cb(...a))));
  async function api(path) {
    const res = await f(`${apiBase}${path}`, { headers: { accept: "application/json" } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.error?.message ?? `AlchemyAgent API returned ${res.status}`);
    return body;
  }
  register(
    "pagespeed_check",
    {
      title: "PageSpeed and Core Web Vitals check",
      description: "Run Google PageSpeed Insights on a public URL. Returns real-user Core Web Vitals (LCP, INP, CLS from the Chrome UX Report), the Lighthouse performance score, lab metrics and the biggest speed opportunities. Use when someone asks if a site is slow, about Core Web Vitals, or for a PageSpeed score. Uses the Google PageSpeed Insights API v5 (https://developers.google.com/speed/docs/insights/v5/get-started).",
      inputSchema: {
        url: external_exports.string().describe("Public page URL, e.g. https://example.com/ or example.com"),
        strategy: external_exports.enum(["mobile", "desktop", "both"]).default("mobile").describe("Device to test. Google indexes mobile-first, so mobile is the default.")
      },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url, strategy }) => {
      try {
        const target = normalizeUrl(url);
        const strategies = strategy === "both" ? ["mobile", "desktop"] : [strategy];
        const results = await Promise.all(strategies.map(async (s) => summarize(await runPsi(target, s, psi), s)));
        return { content: [{ type: "text", text: toMarkdown(results) }], structuredContent: { results } };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "cwv_trend",
    {
      title: "Core Web Vitals trend (last 40 weeks)",
      description: "Show how a site's real-user Core Web Vitals (LCP, INP, CLS, FCP, TTFB) changed over the last ~40 weeks, from the Chrome UX Report History API. Use for 'are we getting faster?', before/after a redesign or migration, or comparing then vs now. Pass a homepage for the whole site (origin) or a deeper URL for that page; falls back to the origin when the page has too little traffic. Uses the Chrome UX Report History API (https://developer.chrome.com/docs/crux/history-api).",
      inputSchema: {
        url: external_exports.string().describe("Public URL or domain, e.g. example.com or https://example.com/pricing/"),
        device: external_exports.enum(["phone", "desktop", "all"]).default("phone")
      },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url, device }) => {
      try {
        const target = normalizeUrl(url);
        const data = await api(`/api/crux?url=${encodeURIComponent(target)}&formFactor=${device.toUpperCase()}`);
        return { content: [{ type: "text", text: trendMarkdown(data) }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "ai_crawler_check",
    {
      title: "AI crawler access check",
      description: "Check whether AI and search crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Googlebot, Google-Extended, Bingbot, CCBot and more) can reach a page: robots.txt rules per bot, noindex/X-Robots-Tag directives, a user-agent probe for firewall/CDN blocks, sitemap and llms.txt presence, which bots publish IP ranges for allowlisting, and AI usage preferences (Cloudflare Content-Signal, IETF Content-Usage, TDMRep, noai). Use when someone asks why they don't show up in ChatGPT/Perplexity/AI answers, or whether they block AI bots. Follows RFC 9309 robots.txt rules and the operators' published crawler docs, e.g. https://developers.openai.com/api/docs/bots and https://docs.perplexity.ai/guides/bots.",
      inputSchema: { url: external_exports.string().describe("Public page URL or domain") },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url }) => {
      try {
        const target = normalizeUrl(url);
        const ipCounts = await api("/api/bots").then((d) => d.ipCounts ?? {}).catch(() => ({}));
        const result = await crawlerCheck(target, f, ipCounts);
        return { content: [{ type: "text", text: crawlerMarkdown(result, opts.remote ? "AlchemyAgent's servers on Cloudflare's network" : "your machine") }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "schema_check",
    {
      title: "Structured data (schema) check",
      description: "Check a page's JSON-LD structured data against Google's rich-result requirements for common types (Organization, LocalBusiness, Product, Article, FAQPage, BreadcrumbList, Review, Event, VideoObject, Service, JobPosting and more). Flags invalid JSON, missing required properties, relative URLs, non-ISO dates, dangling @id references, duplicate entities from two plugins, and self-serving reviews. Rules follow Google Search structured data docs (https://developers.google.com/search/docs/appearance/structured-data/search-gallery).",
      inputSchema: { url: external_exports.string().describe("Public page URL") },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url }) => {
      try {
        return { content: [{ type: "text", text: schemaMarkdown(await schemaCheck(normalizeUrl(url), f)) }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "security_headers",
    {
      title: "Security headers check",
      description: "Grade a site's security headers with Mozilla HTTP Observatory and list exactly which headers are missing or weak (HSTS, Content-Security-Policy, X-Content-Type-Options, frame protection, Referrer-Policy, Permissions-Policy), plus HTTPS and cookie flags. Uses the Mozilla HTTP Observatory API v2 (https://developer.mozilla.org/en-US/observatory/docs/faq).",
      inputSchema: { url: external_exports.string().describe("Public URL or domain") },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url }) => {
      try {
        const target = normalizeUrl(url);
        const obs = await api(`/api/observatory?host=${encodeURIComponent(new URL(target).hostname)}`).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }));
        return { content: [{ type: "text", text: securityMarkdown(await securityCheck(target, obs, f)) }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "gsc_query_classifier",
    {
      title: "Find AI-assistant queries in Search Console",
      description: opts.remote ? "Classify a Google Search Console queries export to find AI-assistant traffic: conversational prompts, follow-up pivots, AI-visibility tracker probes, agent prompts, pasted strings and chat reply artefacts, with impressions per bucket. Export from Search Console > Performance > Export > CSV and pass the contents of Queries.csv as csv_text. Processed in memory and not stored. Also returns candidate queries that the rules can't classify on their own." : "Classify a Google Search Console queries export to find AI-assistant traffic: conversational prompts, follow-up pivots, AI-visibility tracker probes, agent prompts, pasted strings and chat reply artefacts, with impressions per bucket. Runs locally; the data never leaves the user's machine. Export from Search Console > Performance > Export > CSV and pass Queries.csv (path or contents). Also returns candidate queries that the rules can't classify on their own.",
      inputSchema: opts.remote ? { csv_text: external_exports.string().describe("The contents of Queries.csv from a Search Console export") } : {
        csv_path: external_exports.string().optional().describe("Path to the Queries.csv file from a Search Console export"),
        csv_text: external_exports.string().optional().describe("The CSV contents, if pasting instead of a path")
      },
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async ({ csv_path, csv_text }) => {
      try {
        let text = csv_text;
        if (!text && csv_path && opts.remote) throw new Error("This hosted version can't read files. Paste the contents of Queries.csv as csv_text.");
        if (!text && csv_path) {
          const { readFile: readFile4 } = await import("node:fs/promises");
          text = await readFile4(csv_path.replace(/^~(?=\/)/, process.env.HOME ?? "~"), "utf8");
        }
        if (!text) throw new Error("Pass csv_path (the Queries.csv from a Search Console export) or csv_text.");
        const rows = rowsFromCsv(text);
        if (!rows.length) throw new Error("No query rows found in that CSV.");
        return { content: [{ type: "text", text: classifyMarkdown(classify(rows)) }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  register(
    "entity_check",
    {
      title: "Brand entity check (Wikidata)",
      description: "Check how a brand appears in Wikidata, the open knowledge base that Google's Knowledge Graph and AI assistants draw brand facts from. Finds the item by the site's official website (or by brand name), lists its facts (description, type, founding date, headquarters, social profiles, Wikipedia article), flags gaps, and checks whether the homepage's Organization schema links to it in sameAs. Uses the Wikidata API and query service (https://www.wikidata.org/wiki/Wikidata:Data_access).",
      inputSchema: {
        url: external_exports.string().describe("The brand's website, e.g. example.com"),
        brand_name: external_exports.string().optional().describe("Brand name, used if no Wikidata item lists the website")
      },
      annotations: { readOnlyHint: true, openWorldHint: true }
    },
    async ({ url, brand_name }) => {
      try {
        const target = new URL(normalizeUrl(url));
        const q = new URLSearchParams({ domain: target.hostname });
        if (brand_name) q.set("name", brand_name);
        const [data, sameAs] = await Promise.all([api(`/api/wikidata?${q}`), homepageSameAs(target.origin, f).catch(() => null)]);
        return { content: [{ type: "text", text: entityMarkdown(data, sameAs) }] };
      } catch (e) {
        return errorResult(e);
      }
    }
  );
  const ro = { readOnlyHint: true, openWorldHint: true };
  const run = (fn) => fn().then((text) => ({ content: [{ type: "text", text }] }), errorResult);
  register(
    "ai_render_check",
    {
      title: "What AI crawlers see (raw HTML check)",
      description: "Show what AI crawlers that don't run JavaScript (GPTBot, ClaudeBot, PerplexityBot, CCBot) actually see on a page: readable words in the raw HTML, title, meta description, H1 and headings, JSON-LD, images without alt text, and whether the page is a JavaScript app shell that looks empty to them. Use when someone asks why AI assistants don't mention or cite a page, or whether a React/Next/Webflow/Shopify page is readable by AI.",
      inputSchema: { url: external_exports.string().describe("Public page URL") },
      annotations: ro
    },
    async ({ url }) => run(async () => renderMarkdown(await renderCheck(normalizeUrl(url), f)))
  );
  register(
    "agent_readiness",
    {
      title: "Agent readiness check (llms.txt and more)",
      description: "Check how ready a site is for AI agents: llms.txt (validated against the llmstxt.org format, with broken-link check) and llms-full.txt, Markdown versions of pages, agent and API discovery files (MCP, A2A agent card, RFC 9727 API catalog, OpenAPI), RSS/Atom feeds, sitemap size and freshness, and Organization/WebSite schema. Gives a starter llms.txt when missing.",
      inputSchema: { url: external_exports.string().describe("Website or page URL") },
      annotations: ro
    },
    async ({ url }) => run(async () => agentReadyMarkdown(await agentReadiness(normalizeUrl(url), f)))
  );
  register(
    "wikipedia_presence",
    {
      title: "Wikipedia presence",
      description: "Find Wikipedia articles (in the 10 largest language editions) that link to a domain, and the brand's own Wikipedia article page views over the last 12 months (found through Wikidata). Use for brand authority, digital PR and 'are we cited on Wikipedia?' questions. Uses the MediaWiki API and Wikimedia Pageviews API (https://www.mediawiki.org/wiki/API:Exturlusage).",
      inputSchema: { url: external_exports.string().describe("The brand's website or domain") },
      annotations: ro
    },
    async ({ url }) => run(async () => {
      const host4 = new URL(normalizeUrl(url)).hostname;
      const wd = await api(`/api/wikidata?${new URLSearchParams({ domain: host4 })}`).catch(() => null);
      const article = wd?.matchedBy === "official website" ? wd.entities?.[0]?.wikipedia : void 0;
      return wikipediaMarkdown(await wikipediaCheck(host4, article, f));
    })
  );
  register(
    "authority_check",
    {
      title: "Authority and popularity (Tranco, Open PageRank)",
      description: "Compare up to 10 domains (a site and its competitors) by Tranco popularity rank (top 1M sites)" + (opts.remote ? "." : " and, with the user's free Open PageRank key, a 0-10 link-authority score.") + " A free stand-in for domain authority. Uses the Tranco API (https://tranco-list.eu).",
      inputSchema: { domains: external_exports.array(external_exports.string()).min(1).max(10).describe('Domains to compare, e.g. ["example.com", "competitor.com"]') },
      annotations: ro
    },
    async ({ domains }) => run(async () => authorityMarkdown(await authority(domains, f, opts.remote ? void 0 : opts.oprKey), !opts.remote && !!opts.oprKey))
  );
  if (!opts.remote) {
    register(
      "wayback_history",
      {
        title: "Wayback Machine history",
        description: "Look up a site's history in the Internet Archive Wayback Machine: how its robots.txt changed over time (and when it started or stopped blocking GPTBot, ClaudeBot, Google-Extended, CCBot and other AI crawlers), and how often a page was captured and changed. Uses the Wayback CDX API (https://archive.org/developers/wayback-cdx-server.html).",
        inputSchema: {
          url: external_exports.string().describe("Domain for robots.txt history, or a full page URL for page history"),
          include: external_exports.enum(["robots", "page", "both"]).default("both").describe("robots: robots.txt changes for the domain; page: capture history of the URL")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ url, include }) => {
        try {
          const target = normalizeUrl(url);
          const host4 = new URL(target).hostname.replace(/^www\./, "");
          const [robots, page] = await Promise.all([
            include === "page" ? Promise.resolve(null) : robotsHistory(host4, f),
            include === "robots" ? Promise.resolve(null) : pageHistory(target, f)
          ]);
          return { content: [{ type: "text", text: waybackMarkdown(robots, page) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "common_crawl_check",
      {
        title: "Common Crawl check (AI training data)",
        description: "Check whether a site's pages are in the latest Common Crawl snapshots, the open web archive that much AI model training data is built from, and whether robots.txt currently blocks CCBot. Answers 'is my site in AI training data?' with the evidence and how to opt out. Uses the Common Crawl index API (https://index.commoncrawl.org/).",
        inputSchema: { url: external_exports.string().describe("Website or domain") },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ url }) => {
        try {
          const target = new URL(normalizeUrl(url));
          const [data, ccbot] = await Promise.all([commonCrawlCheck(target.hostname, f), botBlocked(target.origin, "CCBot", f).catch(() => null)]);
          if (data.crawls.every((c) => c.found === null)) throw new Error("The Common Crawl index is busy right now. Try again in a few minutes.");
          return { content: [{ type: "text", text: commonCrawlMarkdown(data, ccbot) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "research_citations",
      {
        title: "Research citations (OpenAlex)",
        description: "Count scholarly papers that mention a brand or its domain, show the most-cited ones and the trend by year, and whether the brand is itself a research institution in OpenAlex. Most useful for medical-device, industrial, engineering and other technical brands. Uses the OpenAlex API (https://docs.openalex.org).",
        inputSchema: { brand_name: external_exports.string().describe("Brand or company name"), url: external_exports.string().optional().describe("Brand website, to also count papers that mention the domain") },
        annotations: ro
      },
      async ({ brand_name, url }) => run(async () => researchMarkdown(await researchCitations(brand_name, url ? new URL(normalizeUrl(url)).hostname : void 0, f, opts.openalexKey)))
    );
    register(
      "news_mentions",
      {
        title: "News mentions (GDELT)",
        description: "Find news articles that mention a brand in the last 3 months across global online news (65+ languages): article count, weekly trend, tone, top outlets and headlines. Excludes the brand's own site when a URL is given. Can take up to 45 seconds; the free API is sometimes slow or busy. Uses the GDELT DOC 2.0 API (https://www.gdeltproject.org).",
        inputSchema: { brand_name: external_exports.string().describe("Brand name as it appears in news, at least 3 characters"), url: external_exports.string().optional().describe("Brand website, excluded from results") },
        annotations: ro
      },
      async ({ brand_name, url }) => run(async () => newsMarkdown(await newsMentions(brand_name, url ? new URL(normalizeUrl(url)).hostname : void 0, f)))
    );
    register(
      "community_mentions",
      {
        title: "Community mentions (Hacker News, Stack Exchange)",
        description: "Find mentions of a brand and links to its site on Hacker News (last 12 months) and Stack Exchange sites (Stack Overflow by default; others like superuser, webmasters, electronics, engineering). Reddit isn't included because its API requires approval for commercial use. Uses the HN Search API by Algolia and the Stack Exchange API.",
        inputSchema: {
          brand_name: external_exports.string(),
          url: external_exports.string().optional().describe("Brand website, to find posts linking to it"),
          sites: external_exports.array(external_exports.string()).max(3).default(["stackoverflow"]).describe("Stack Exchange site slugs, e.g. stackoverflow, superuser, webmasters, electronics, engineering")
        },
        annotations: ro
      },
      async ({ brand_name, url, sites }) => run(async () => communityMarkdown(await communityMentions(brand_name, url ? new URL(normalizeUrl(url)).hostname : void 0, sites, f)))
    );
    register(
      "brave_rank",
      {
        title: "Brave Search rankings",
        description: "Check where a domain ranks in Brave Search (top 20) for up to 10 queries, with the top 3 results per query. Brave runs its own independent web index that AI assistants use for live web results. Needs the user's own Brave Search API key. Uses the Brave Search API (https://brave.com/search/api/).",
        inputSchema: {
          url: external_exports.string().describe("Domain to look for, e.g. example.com"),
          queries: external_exports.array(external_exports.string()).min(1).max(10).describe("Search queries to check"),
          country: external_exports.string().length(2).default("US").describe("2-letter country code")
        },
        annotations: ro
      },
      async ({ url, queries, country }) => run(async () => {
        if (!opts.braveKey) throw new Error(BRAVE_KEY_HELP);
        const host4 = new URL(normalizeUrl(url)).hostname;
        return braveMarkdown(host4, await braveRank(f, opts.braveKey, host4, queries, country.toUpperCase()), country.toUpperCase());
      })
    );
    register(
      "osm_listing",
      {
        title: "OpenStreetMap local listing check",
        description: "Find a local business in OpenStreetMap and check its name, address, website, phone and opening hours against the real ones (NAP consistency). Explains how to add or fix the listing. Uses OpenStreetMap Nominatim (https://nominatim.org).",
        inputSchema: {
          business_name: external_exports.string(),
          location: external_exports.string().describe("City, or street address and city"),
          url: external_exports.string().optional().describe("Business website, to check the listing's website"),
          phone: external_exports.string().optional()
        },
        annotations: ro
      },
      async ({ business_name, location, url, phone }) => run(async () => osmMarkdown(business_name, location, await osmLookup(business_name, location, url, phone, f), url))
    );
    const gscCreds = opts.gsc ?? {};
    const property = async (site) => {
      const sites = await listSites(gscCreds, f);
      const p = matchProperty(sites, site);
      if (!p) throw new Error(`${site} isn't a Search Console property this account can read. Properties: ${sites.map((s) => s.siteUrl).join(", ") || "none"}.`);
      return p;
    };
    register(
      "gsc_connect",
      {
        title: "Connect Google Search Console",
        description: "Connect the user's own Google Search Console (read-only) by opening Google's sign-in page in their browser. Credentials and tokens stay on the user's computer and are only sent to Google. Run this once; afterwards use gsc_sites, gsc_performance and gsc_ai_queries. If credentials aren't configured, returns setup steps.",
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async () => run(async () => {
        if (gscCreds.serviceAccountFile) return `Search Console uses your service account key; no sign-in needed. ${await connectionStatus(gscCreds)}`;
        const { url, alreadyPending } = await startConnect(gscCreds, f);
        return [
          `${alreadyPending ? "A sign-in is already waiting." : "I opened Google's sign-in page in your browser."} Approve read-only Search Console access there.`,
          "",
          `If the browser didn't open, visit this link: ${url}`,
          "",
          "When the page says it's connected, ask me to list your Search Console sites.",
          "",
          `If Google shows "Google hasn't verified this app", that's your own Google Cloud project in testing mode: click Continue.`
        ].join("\n");
      })
    );
    register(
      "gsc_sites",
      {
        title: "Search Console properties",
        description: "List the Search Console properties the connected Google account can read, with permission levels, and the connection status. Uses the Search Console API (https://developers.google.com/webmaster-tools).",
        inputSchema: {},
        annotations: ro
      },
      async () => run(async () => {
        const status = await connectionStatus(gscCreds);
        const sites = await listSites(gscCreds, f);
        return [`## Search Console properties`, status, "", ...sites.length ? sites.map((s) => `- ${s.siteUrl} (${s.permissionLevel.replace(/^site/, "").toLowerCase()})`) : ["No properties. Add the account or service account as a user in Search Console > Settings > Users and permissions."]].join("\n");
      })
    );
    register(
      "gsc_performance",
      {
        title: "Search Console performance",
        description: "Read Google Search Console performance (clicks, impressions, CTR, position) for a property, grouped by query, page, date, country or device, with an optional comparison to the previous period of the same length and contains-filters on query or page. Handles up to 100,000 rows. Uses the Search Console Search Analytics API (https://developers.google.com/webmaster-tools/v1/searchanalytics/query).",
        inputSchema: {
          site: external_exports.string().describe("Property URL or domain, e.g. https://example.com/ or sc-domain:example.com or example.com"),
          dimensions: external_exports.array(external_exports.enum(["query", "page", "date", "country", "device"])).min(1).max(3).default(["query"]),
          days: external_exports.number().int().min(1).max(480).default(28).describe("Length of the period, ending ~2 days ago (GSC data lag)"),
          compare: external_exports.boolean().default(true).describe("Also fetch the previous period of the same length"),
          query_contains: external_exports.string().optional(),
          page_contains: external_exports.string().optional(),
          search_type: external_exports.enum(["web", "image", "video", "news", "discover", "googleNews"]).default("web"),
          row_limit: external_exports.number().int().min(1).max(1e5).default(1e3),
          show: external_exports.number().int().min(1).max(200).default(25).describe("Rows to show in the table")
        },
        annotations: ro
      },
      async ({ site, dimensions, days, compare, query_contains, page_contains, search_type, row_limit, show }) => run(async () => {
        const prop = await property(site);
        const range = dateRange(days);
        const o = { dimensions, rowLimit: row_limit, queryContains: query_contains, pageContains: page_contains, type: search_type };
        const rows = await searchAnalytics(gscCreds, prop, { ...range, ...o }, f);
        const prev = compare && !dimensions.includes("date") ? await searchAnalytics(gscCreds, prop, { ...dateRange(days, days + 2), ...o }, f) : null;
        return rowsMarkdown(prop, range, dimensions, rows, prev, show);
      })
    );
    register(
      "gsc_ai_queries",
      {
        title: "AI-assistant queries from Search Console",
        description: "Pull up to 25,000 queries straight from the user's Search Console and find the ones that look like they came from AI assistants (conversational prompts, AI tracker probes, pivots, pasted strings). Same rules as gsc_query_classifier, without exporting a CSV. Candidates are returned for you to judge.",
        inputSchema: { site: external_exports.string().describe("Property URL or domain"), days: external_exports.number().int().min(7).max(480).default(90) },
        annotations: ro
      },
      async ({ site, days }) => run(async () => {
        const prop = await property(site);
        const range = dateRange(days);
        const rows = await searchAnalytics(gscCreds, prop, { ...range, dimensions: ["query"], rowLimit: 25e3 }, f);
        const md = classifyMarkdown(classify(rows.map((r) => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }))));
        return `${prop}, ${range.startDate} to ${range.endDate}

${md}`;
      })
    );
    register(
      "brand_alerts",
      {
        title: "Brand alerts (press, mentions, new pages)",
        description: "Show what's new since the last check: news articles and web mentions of the brand (Google News, plus the user's Google Alerts RSS feeds if given), whether each new article links to the site (earned link), and, if Search Console is connected, pages Google started showing in the last 7 days. Remembers what it has already reported on this computer, so run it daily (for example as a scheduled task) to get alerts. Sends a desktop notification when there's something new.",
        inputSchema: {
          brand_name: external_exports.string().describe("Brand name as people write it"),
          url: external_exports.string().optional().describe("Brand website; excluded from press results and used for the earned-link check and Search Console"),
          google_alerts_feeds: external_exports.array(external_exports.string()).max(10).optional().describe("Google Alerts RSS feed URLs (https://www.google.com/alerts/feeds/...); saved for future checks"),
          notify: external_exports.boolean().default(true).describe("Show a desktop notification when there are new items"),
          country: external_exports.string().length(2).default("US")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ brand_name, url, google_alerts_feeds, notify, country }) => run(async () => {
        const domain = url ? new URL(normalizeUrl(url)).hostname : void 0;
        const canGsc = !!(gscCreds.serviceAccountFile || gscCreds.clientId && gscCreds.clientSecret);
        const pagesPickedUp = canGsc && domain ? async () => {
          const prop = await property(domain);
          const recent = dateRange(7), older = dateRange(90, 9);
          const [now, before] = await Promise.all([
            searchAnalytics(gscCreds, prop, { ...recent, dimensions: ["page"], rowLimit: 5e3 }, f),
            searchAnalytics(gscCreds, prop, { ...older, dimensions: ["page"], rowLimit: 25e3 }, f)
          ]);
          const old = new Set(before.map((r) => r.keys[0]));
          return now.filter((r) => !old.has(r.keys[0])).map((r) => ({ url: r.keys[0], impressions: r.impressions, first: recent.startDate }));
        } : void 0;
        const res = await checkAlerts({ brand: brand_name, domain, addFeeds: google_alerts_feeds, pagesPickedUp, country }, f);
        if (notify && !res.firstRun && res.newItems.length) {
          const press = res.newItems.filter((i) => i.kind === "press").length, pages = res.newItems.length - press;
          notifyDesktop(`AlchemyAgent: ${brand_name}`, [press && `${press} new mention${press === 1 ? "" : "s"}`, pages && `${pages} new page${pages === 1 ? "" : "s"} picked up`].filter(Boolean).join(", "));
        }
        return alertsMarkdown(res);
      })
    );
    register(
      "data_connections",
      {
        title: "Connect your data (setup status)",
        description: "Show which of the user's own data sources AlchemyAgent can use (Google Search Console, Bing Webmaster Tools, Cloudflare logs, Brave Search, PageSpeed key; GA4 coming soon), why each one matters, and exactly how to connect the missing ones. Use this first with a new user, when a tool needs a key that isn't set, or when someone asks how to get better, data-driven recommendations.",
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async () => ({ content: [{ type: "text", text: connectionsMarkdown(connState(opts, TOKEN_FILE)) }] })
    );
    register(
      "featured_image",
      {
        title: "Featured image generator (data card)",
        description: "Make a blog featured image or social share image (1200x630, rendered at 2400x1260 PNG) from a post's own data: a headline and subhead on the left and a data card on the right (bar chart, big stats, before/after ratings, or a key-points list), in the user's brand colors with their SVG logo. Use real numbers from the post; never invent data. Renders locally with the user's Chrome or Edge and saves the PNG and its HTML source (default folder ~/Downloads/alchemyagent-images). Original data visuals help image search and give AI systems something concrete to describe; write descriptive alt text from the same numbers. By default the PNG carries an invisible metadata credit to AlchemyAgent (no visible mark); credit: false removes it.",
        inputSchema: {
          headline: external_exports.string().max(80).describe("Short headline, ideally under 40 characters"),
          subhead: external_exports.string().max(140).optional(),
          eyebrow: external_exports.string().max(32).optional().describe("Small label top right, e.g. CASE STUDY"),
          source: external_exports.string().max(90).optional().describe("Source line bottom left, e.g. 'Source: GA4 and Cloudflare, Oct 2026'"),
          site: external_exports.string().max(40).optional().describe("Domain shown bottom right"),
          brand: external_exports.string().max(30).optional().describe("Brand name text, used when no logo_svg is given"),
          logo_svg: external_exports.string().optional().describe("Path to an SVG logo file (a dark logo reads best on light backgrounds)"),
          background: external_exports.string().optional().describe("Background color (hex). Default #ffc61a"),
          ink: external_exports.string().optional().describe("Text color (hex). Default #111111"),
          accent: external_exports.string().optional().describe("Accent color for the data card (hex). Defaults to the background color"),
          heading_font: external_exports.string().optional().describe("Google Font for the headline. Default Days One"),
          body_font: external_exports.string().optional().describe("Google Font for body text. Default DM Sans"),
          card: external_exports.discriminatedUnion("type", [
            external_exports.object({ type: external_exports.literal("bars"), title: external_exports.string().optional(), rows: external_exports.array(external_exports.object({ label: external_exports.string(), note: external_exports.string().optional(), value: external_exports.number() })).min(1).max(5), footer: external_exports.object({ value: external_exports.string(), text: external_exports.string() }).optional() }),
            external_exports.object({ type: external_exports.literal("stats"), title: external_exports.string().optional(), rows: external_exports.array(external_exports.object({ value: external_exports.string(), label: external_exports.string() })).min(1).max(4) }),
            external_exports.object({ type: external_exports.literal("before_after"), title: external_exports.string().optional(), min: external_exports.number(), max: external_exports.number(), rows: external_exports.array(external_exports.object({ label: external_exports.string(), before: external_exports.number(), after: external_exports.number() })).min(1).max(7), footer: external_exports.object({ value: external_exports.string(), text: external_exports.string() }).optional() }),
            external_exports.object({ type: external_exports.literal("list"), title: external_exports.string().optional(), rows: external_exports.array(external_exports.string()).min(1).max(6) })
          ]).describe("The data card. bars: up to 5 values; stats: up to 4 big numbers; before_after: ratings on a scale; list: up to 6 short points"),
          out_dir: external_exports.string().optional().describe("Folder to save into. Default ~/Downloads/alchemyagent-images"),
          file_name: external_exports.string().optional().describe("File name without extension, e.g. the post slug"),
          credit: external_exports.boolean().default(true).describe("Add an invisible credit to the PNG's metadata ('Created with AlchemyAgent, https://alchemyagent.ai'). Nothing is drawn on the image. Set false to leave it out.")
        },
        annotations: { readOnlyHint: false, openWorldHint: false }
      },
      async (a) => {
        try {
          const r = await renderFeatured({ headline: a.headline, subhead: a.subhead, eyebrow: a.eyebrow, source: a.source, site: a.site, brand: a.brand, logoSvg: a.logo_svg, background: a.background, ink: a.ink, accent: a.accent, headingFont: a.heading_font, bodyFont: a.body_font, card: a.card }, a.out_dir, a.file_name ?? a.headline, a.credit !== false);
          const text = [r.png ? `Saved ${r.png} (2400x1260) and its source ${r.html}.` : `Wrote ${r.html}.`, r.note ?? "", a.credit !== false && r.png ? `The PNG's metadata includes an invisible credit ("Created with AlchemyAgent"); nothing is drawn on the image. Pass credit: false to leave it out.` : "", "Upload it as the post's featured image (most SEO plugins also use it as og:image) and write alt text that states what the chart shows, with the numbers."].filter(Boolean).join("\n");
          const content = [{ type: "text", text }];
          if (r.png) content.push({ type: "image", data: (await (await import("node:fs/promises")).readFile(r.png)).toString("base64"), mimeType: "image/png" });
          return { content };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "image_audit",
      {
        title: "Image optimization audit",
        description: "Audit the images on one page and rank what to fix: photos hidden inside SVG files (base64 rasters), a lazy-loaded hero image, autoplay videos without posters, heavy files, JPG/PNG that should be WebP or AVIF, large images without srcset, missing width/height (layout shift), below-the-fold images not lazy-loaded, missing alt text, broken images and the og:image. Downloads each image once from the user's machine to measure its real size.",
        inputSchema: {
          url: external_exports.string().describe("Page URL, e.g. https://example.com/ or example.com"),
          max_images: external_exports.number().int().min(5).max(80).default(40).describe("Max images to measure")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ url, max_images }) => {
        try {
          return { content: [{ type: "text", text: imageMarkdown(await imageAudit(url, f, max_images)) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "entitymap_check",
      {
        title: "EntityMap validator",
        description: "Validate a site's EntityMap (the open standard for publishing a site's entities, relationships and source passages for AI systems): fetches /entitymap.json and /entitymap.html from the domain, or checks a local draft file, against the EntityMap v1.0 spec. Reports errors (required fields, types, predicates, chunk limits, publisher attribution, confidence on interpretive predicates, conflicting relations) and warnings (staleness, missing sameAs, overuse of RELATES_TO, dangling targets), plus the HTML companion's required attribution. Spec: https://entitymap.org/spec/v1.0.",
        inputSchema: {
          url: external_exports.string().optional().describe("Site or domain, e.g. example.com. Fetches /entitymap.json and /entitymap.html from its root."),
          json_path: external_exports.string().optional().describe("Or: path to a local entitymap.json draft to check before publishing"),
          max_issues: external_exports.number().int().min(5).max(200).default(25).describe("Max errors and warnings to list per section")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ url, json_path, max_issues }) => {
        try {
          if (!url && !json_path) throw new Error("Give a url (e.g. example.com) or a json_path to a local entitymap.json.");
          const text = json_path ? await (await import("node:fs/promises")).readFile(json_path.replace(/^~(?=\/)/, process.env.HOME ?? "~"), "utf8") : void 0;
          const r = await entitymapCheck(url ?? "", f, text);
          if (json_path && !url) r.jsonUrl = json_path;
          return { content: [{ type: "text", text: entitymapMarkdown(r, max_issues) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "log_file_analysis",
      {
        title: "Log file analysis for AI search (Cloudflare)",
        description: "Analyze the user's own Cloudflare request logs for AI search: which AI crawlers, AI search bots and AI assistants (GPTBot, ClaudeBot, ChatGPT-User, Claude-User, PerplexityBot, Applebot, Meta and more) fetched the site's pages, how many were verified by Cloudflare versus likely fake, real crawlers being blocked or challenged, error pages served only to bots, the pages AI bots read most, and log counts next to analytics counts (Cloudflare Web Analytics, plus GA4 sessions if the user gives them). Needs the user's Cloudflare API token and a site proxied through Cloudflare. Uses the Cloudflare GraphQL Analytics API (https://developers.cloudflare.com/analytics/graphql-api/).",
        inputSchema: {
          domain: external_exports.string().describe("The site to analyze, e.g. example.com (must be a zone in the user's Cloudflare account)"),
          days: external_exports.number().int().min(1).max(30).default(30).describe("How many days back. Plans keep different amounts of history; the tool steps down automatically."),
          analytics_sessions: external_exports.number().int().min(0).optional().describe("Optional: sessions or visits from GA4 (or another analytics tool) for the same period, to compare with the logs"),
          analytics_label: external_exports.string().default("GA4 sessions").describe("Label for analytics_sessions")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ domain, days, analytics_sessions, analytics_label }) => {
        try {
          if (!opts.cloudflareToken) throw new Error(CF_TOKEN_HELP);
          const r = await logReport(f, opts.cloudflareToken, domain, days);
          return { content: [{ type: "text", text: logMarkdown(r, analytics_sessions != null ? { sessions: analytics_sessions, label: analytics_label } : void 0) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "bing_webmaster",
      {
        title: "Bing Webmaster Tools report",
        description: "Read the user's own Bing Webmaster Tools data with their API key: Bing clicks and impressions (last 28 days vs the previous 28), top queries, top pages, pages in Bing's index, crawl errors and URL submission quota. Call without site_url to list the sites in the account. Uses the Bing Webmaster API (https://learn.microsoft.com/en-us/bingwebmaster/getting-access).",
        inputSchema: {
          site_url: external_exports.string().optional().describe("A site in the user's Bing Webmaster Tools account, e.g. https://example.com/ or example.com. Omit to list sites."),
          report: external_exports.enum(["overview", "queries", "pages", "crawl"]).default("overview").describe("overview: traffic, top 10 queries and crawl; or one section in more depth"),
          limit: external_exports.number().int().min(1).max(100).default(15).describe("Rows for query/page tables")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ site_url, report, limit }) => {
        try {
          if (!opts.bingKey) throw new Error(BING_KEY_HELP);
          const sites = await listSites2(f, opts.bingKey);
          if (!site_url) return { content: [{ type: "text", text: sitesMarkdown(sites) }] };
          const site = matchSite(sites, site_url);
          if (!site) throw new Error(`${site_url} isn't in this Bing Webmaster Tools account. ${sites.length ? "Sites in the account: " + sites.map((s) => s.url).join(", ") : "Add and verify it at https://www.bing.com/webmasters first."}`);
          const sections = report === "overview" ? ["traffic", "queries", "crawl"] : [report];
          const data = await bingReport(f, opts.bingKey, site.url, sections);
          return { content: [{ type: "text", text: bingMarkdown(data, report === "overview" ? Math.min(limit, 10) : limit) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
  }
  registerPrompts(server2, !!opts.remote);
  return server2;
}

// src/index.ts
var env = (k) => {
  const v = (process.env[k] || "").trim();
  return v && !v.startsWith("${") ? v : void 0;
};
var server = createServer2({
  psiKey: env("ALCHEMYAGENT_PSI_KEY"),
  bingKey: env("ALCHEMYAGENT_BING_KEY"),
  braveKey: env("ALCHEMYAGENT_BRAVE_KEY"),
  cloudflareToken: env("ALCHEMYAGENT_CLOUDFLARE_TOKEN"),
  oprKey: env("ALCHEMYAGENT_OPR_KEY"),
  openalexKey: env("ALCHEMYAGENT_OPENALEX_KEY"),
  gsc: { clientId: env("ALCHEMYAGENT_GOOGLE_CLIENT_ID"), clientSecret: env("ALCHEMYAGENT_GOOGLE_CLIENT_SECRET"), serviceAccountFile: env("ALCHEMYAGENT_GOOGLE_SA_FILE") },
  apiBase: env("ALCHEMYAGENT_API_BASE")
});
await server.connect(new StdioServerTransport());
