// AlchemyAgent for Claude. (c) AlchemyLeads. https://alchemyagent.ai
import {
  ACCOUNT_NEEDED,
  BING_KEY_HELP,
  BOTS,
  CF_TOKEN_HELP,
  GA4_SCOPE,
  TOKEN_FILE,
  bingMarkdown,
  bingReport,
  challenged,
  connState,
  connectionStatus,
  connectionsMarkdown,
  crawlerCheck,
  crawlerMarkdown,
  dateRange,
  entitymapCheck,
  entitymapMarkdown,
  ga4Markdown,
  ga4Report,
  get,
  hasScope,
  hostedConnectionsMarkdown,
  imageAudit,
  imageMarkdown,
  isAllowed,
  linksMarkdown,
  listProperties,
  listSites,
  listSites2,
  logMarkdown,
  logReport,
  matchGa4,
  matchProperty,
  matchSite,
  norm,
  parseRobots,
  propertiesMarkdown,
  renderFeatured,
  rowsMarkdown,
  rulesFor,
  runLinks,
  saveLinkFiles,
  searchAnalytics,
  sitesMarkdown,
  startConnect
} from "./chunks/chunk-AX4KF6ZD.mjs";
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
    return new Promise((resolve) => {
      const json4 = serializeMessage(message);
      if (this._stdout.write(json4)) {
        resolve();
      } else {
        this._stdout.once("drain", resolve);
      }
    });
  }
};

// src/quality.ts
var PRO_HELP = "Page quality rating is part of AlchemyAgent Pro: each page is rated 1 to 9 against our private rubric (built from the concepts in Google's public Search Quality Rater Guidelines), with quoted evidence and a specific fix. Add your Pro license key in the AlchemyAgent settings (Claude Desktop: Settings > Extensions > AlchemyAgent > Configure; Claude Code: /plugin, then AlchemyAgent's settings). Get Pro: https://alchemyagent.ai/#pro";
var LINKS_PRO_HELP = "Internal link rewiring is part of AlchemyAgent Pro: it crawls your site from your computer, reads your own Search Console, and plans the body links that move pages stuck at positions 8 to 15 onto page one. Add your Pro license key in the AlchemyAgent settings (Claude Desktop: Settings > Extensions > AlchemyAgent > Configure; Claude Code: /plugin, then AlchemyAgent's settings). Get Pro: https://alchemyagent.ai/#pro";
async function verifyPro(f, apiBase2, licenseKey, feature) {
  const r = await f(`${apiBase2}/api/pro/verify`, { method: "POST", headers: { authorization: `Bearer ${licenseKey}`, "content-type": "application/json", "user-agent": "AlchemyAgent-MCP" }, body: JSON.stringify({ feature }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || `AlchemyAgent license check failed (${r.status})`);
  return j;
}
async function fetchPage(f, url) {
  try {
    const r = await f(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; AlchemyAgent/0.3; +https://alchemyagent.ai)", accept: "text/html,application/xhtml+xml" }, redirect: "follow" });
    const t = await r.text();
    if (!r.ok || /cf-chl|challenge-platform|Just a moment\.\.\./i.test(t.slice(0, 5e3))) return void 0;
    return t;
  } catch {
    return void 0;
  }
}
async function rateQuality(f, apiBase2, licenseKey, url, context) {
  const html = await fetchPage(f, url);
  const r = await f(`${apiBase2}/api/quality`, {
    method: "POST",
    headers: { authorization: `Bearer ${licenseKey}`, "content-type": "application/json", "user-agent": "AlchemyAgent-MCP" },
    body: JSON.stringify({ url, context, html })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.message || `Page quality service error ${r.status}`);
  return j;
}
function qualityMarkdown(rs, failed = []) {
  const L = [`# Page quality: ${rs.length} page${rs.length === 1 ? "" : "s"} rated`, ""];
  if (rs.length > 1) {
    L.push("| Page | Rating | Purpose | Biggest issue |", "|---|---|---|---|");
    for (const r of [...rs].sort((a, b) => a.rating - b.rating)) L.push(`| ${r.url} | ${r.rating}/9 ${r.band} | ${r.purpose} | ${(r.issues[0]?.issue ?? "none").replace(/\|/g, "/")} |`);
    L.push("");
  }
  for (const r of rs) {
    L.push(`## ${r.title || r.url}`, `${r.url}`, "", `**${r.rating}/9 (${r.band})** \xB7 purpose: ${r.purpose} \xB7 expertise shown: ${r.expertise}${r.ymyl ? " \xB7 YMYL (held to a higher bar)" : ""} \xB7 ${r.words.toLocaleString("en-US")} words`, "", r.summary, "");
    if (r.strengths.length) L.push("**Working well**", ...r.strengths.map((s) => `- ${s}`), "");
    if (r.issues.length) L.push("**Fix first**", ...r.issues.map((i) => `- ${i.issue} \u2192 ${i.fix}`), "");
  }
  for (const x of failed) L.push(`- Couldn't rate ${x.url}: ${x.error}`);
  const last = rs[rs.length - 1];
  if (last) L.push("", `Ratings are a model's judgment against AlchemyLeads' rubric; Google's own systems aren't public. Use them to triage, then a person decides. Used today: ${last.used_today} of ${last.daily_limit}.`);
  return L.join("\n").trimEnd();
}

// src/market.ts
var ENGINES = ["google_ai_overview", "google_ai_mode", "chatgpt", "gemini", "perplexity", "claude"];
var ENGINE_LABEL = { google_ai_overview: "Google AIO", google_ai_mode: "AI Mode", chatgpt: "ChatGPT", gemini: "Gemini", perplexity: "Perplexity", claude: "Claude" };
var MODES = ["national", "local", "map_pack"];
var host = (u) => (u || "").toLowerCase().split("//").pop().split("/")[0].replace(/^www\./, "");
var squash = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
var sameSite = (h, d) => !!h && (h === d || h.endsWith("." + d));
function profileErrors(p, need = []) {
  const e = [];
  if (!p.site) e.push("site is missing (the website, e.g. example.com).");
  if (!p.brand_terms?.length) e.push("brand_terms is missing (how people and AI write the brand name).");
  if (!p.topic_terms?.length) e.push('topic_terms is missing (what the business does, e.g. "industrial marketing"); it filters junk keywords.');
  if (!p.competitors?.length) e.push("competitors is missing (1-8 competitor domains).");
  else if (p.competitors.length > 8) e.push("competitors: keep it to the 8 that matter most.");
  if (need.includes("rank")) {
    if (!p.rank_tracking?.length) e.push("rank_tracking is missing: keyword groups, each with mode national, local or map_pack.");
    (p.rank_tracking ?? []).forEach((g, i) => {
      if (!MODES.includes(g.mode)) e.push(`rank_tracking group ${i + 1}: mode must be national, local or map_pack.`);
      if (g.mode !== "national" && !g.location) e.push(`rank_tracking group ${i + 1} (${g.mode}): location is required, e.g. "Los Angeles,California,United States".`);
      if (g.mode === "map_pack" && !g.business_name) e.push(`rank_tracking group ${i + 1} (map_pack): business_name is required (as on Google Business Profile).`);
      if (!g.keywords?.length) e.push(`rank_tracking group ${i + 1}: keywords is empty.`);
    });
  }
  if (need.includes("ai")) {
    const ai = p.ai_tracking;
    if (!ai?.clusters?.some((c) => c.prompts?.length)) e.push("ai_tracking.clusters needs at least one cluster with prompts.");
    if (ai && ![25, 50, 100, "unlimited"].includes(ai.tier)) e.push("ai_tracking.tier must be 25, 50, 100 or unlimited.");
    const n = (ai?.clusters ?? []).reduce((a, c) => a + (c.prompts?.length ?? 0), 0);
    if (ai && typeof ai.tier === "number" && n > ai.tier) e.push(`${n} prompts is over the tier-${ai.tier} limit.`);
    const bad = (ai?.engines ?? []).filter((x) => !ENGINES.includes(x));
    if (bad.length) e.push(`ai_tracking.engines: unknown ${bad.join(", ")}.`);
  }
  return e;
}
var SETUP_HELP = `Set up tracking once (tracking_setup) and every AlchemyAgent app uses it:
- site, brand_terms (how the brand is written), topic_terms (what the business does), competitors (1-5 domains)
- rank_tracking: groups with mode national (country), local (organic from a city: location) or map_pack (Google Maps from a city: location + business_name)
- ai_tracking: tier 25 | 50 | 100, cadence weekly | monthly, engines, clusters of prompts written the way buyers ask AI`;
var CITED = /* @__PURE__ */ new Set(["references", "sources", "annotations", "citations"]);
var SKIP_TEXT = /* @__PURE__ */ new Set([...CITED, "search_results", "fan_out_queries", "check_url", "url", "domain", "brand_entities"]);
var siteUrl = (p) => p.site_url || (p.site ? `https://${p.site}` : "");
function summarizeAi(rows, engines, competitors, brands) {
  const by_engine = {};
  for (const e of engines) {
    const rs = rows.map((r) => r.engines[e]).filter(Boolean);
    by_engine[e] = { prompts: rs.length, answered: rs.filter((x) => x.answered).length, mentioned: rs.filter((x) => x.mentioned).length, cited: rs.filter((x) => x.cited).length };
  }
  const cells = rows.flatMap((r) => Object.values(r.engines));
  const branded = (p) => brands.some((b) => squash(b) && squash(p).includes(squash(b)));
  const sov = Object.fromEntries(["us", ...competitors].map((k) => [k, 0]));
  for (const r of rows) if (!branded(r.prompt)) for (const x of Object.values(r.engines)) {
    if (x.mentioned) sov.us++;
    for (const d of x.competitors_mentioned) if (d in sov) sov[d]++;
  }
  const counts = /* @__PURE__ */ new Map();
  for (const x of cells) for (const d of x.cited_domains) counts.set(d, (counts.get(d) ?? 0) + 1);
  return {
    cells: cells.length,
    mentioned: cells.filter((x) => x.mentioned).length,
    cited: cells.filter((x) => x.cited).length,
    by_engine,
    share_of_voice: sov,
    top_cited: [...counts].sort((a, b) => b[1] - a[1]).slice(0, 12)
  };
}
var pct = (a, b) => b ? `${Math.round(100 * a / b)}%` : "\u2013";
function aiMarkdown(site, date, rows, s, engines, prev, tier) {
  const sovTotal = Object.values(s.share_of_voice).reduce((a, b) => a + b, 0) || 1;
  const L = [
    `# AI visibility: ${site}`,
    "",
    `${date} \xB7 ${rows.length} prompts \xD7 ${engines.length} engines${tier ? ` \xB7 tier ${tier}` : ""}`,
    "",
    `**Mentioned in ${pct(s.mentioned, s.cells)} of AI answers, site cited in ${pct(s.cited, s.cells)}.**` + (prev ? ` Last run: ${pct(prev.mentioned, prev.cells)} / ${pct(prev.cited, prev.cells)}.` : ""),
    "",
    "| Engine | Mentioned | Cited | No AI answer |",
    "|---|---:|---:|---:|",
    ...Object.entries(s.by_engine).map(([e, v]) => `| ${ENGINE_LABEL[e]} | ${pct(v.mentioned, v.prompts)} | ${pct(v.cited, v.prompts)} | ${v.prompts - v.answered} |`),
    "",
    "**Share of voice** (unbranded prompts): " + Object.entries(s.share_of_voice).map(([k, v]) => `${k === "us" ? "you" : k} ${Math.round(100 * v / sovTotal)}%`).join(", "),
    ""
  ];
  const clusters = /* @__PURE__ */ new Map();
  for (const r of rows) clusters.set(r.cluster, [...clusters.get(r.cluster) ?? [], r]);
  L.push("| Cluster | Prompts | Mentioned | Cited |", "|---|---:|---:|---:|");
  for (const [name, rs] of clusters) {
    const cells = rs.flatMap((r) => Object.values(r.engines));
    L.push(`| ${name} | ${rs.length} | ${pct(cells.filter((x) => x.mentioned).length, cells.length)} | ${pct(cells.filter((x) => x.cited).length, cells.length)} |`);
  }
  const zero = rows.filter((r) => !Object.values(r.engines).some((x) => x.mentioned || x.cited)).map((r) => r.prompt);
  if (zero.length) L.push("", `**${zero.length} prompts where no engine mentions or cites you** (content brief candidates):`, ...zero.slice(0, 10).map((p) => `- ${p}`));
  L.push(
    "",
    "**Sites AI cites most:** " + s.top_cited.slice(0, 8).map(([d, n]) => `${d} (${n})`).join(", "),
    "",
    "| Prompt | " + engines.map((e) => ENGINE_LABEL[e]).join(" | ") + " |",
    "|---|" + engines.map(() => "---|").join("")
  );
  const cell = (x) => !x ? "?" : !x.answered ? "\u2013" : (x.mentioned ? "M" : "") + (x.cited ? "C" : "") || "\xB7";
  for (const r of rows) L.push(`| ${r.prompt.replace(/\|/g, "/")} | ` + engines.map((e) => cell(r.engines[e])).join(" | ") + " |");
  L.push("", "M = brand mentioned, C = site cited as a source, \u2013 = the engine showed no AI answer. Data: DataForSEO (Google SERP and AI Mode, ChatGPT and Gemini as users see them, Perplexity Sonar and Claude with web search).");
  return L.join("\n");
}
function locationLabel(location) {
  const city = (location || "").split(",")[0].trim();
  return city.split(/\s+/).length > 1 ? city.split(/\s+/).map((w) => w[0]).join("").toUpperCase() : city;
}
function rankJobs(p) {
  const jobs = [];
  for (const g of p.rank_tracking ?? []) {
    const tag2 = g.mode === "national" ? "" : g.mode === "local" ? ` (${locationLabel(g.location)})` : ` [map ${locationLabel(g.location)}]`;
    for (const k of [...new Set(g.keywords)]) jobs.push({ label: k + tag2, keyword: k, mode: g.mode, location: g.location, business_name: g.business_name });
  }
  return jobs;
}
function rankMarkdown(site, date, rows, competitors, depth = 20, prev) {
  const L = [`# Rankings: ${site}`, "", `${date} \xB7 ${rows.length} keywords`, ""];
  for (const m of MODES) {
    const rs = rows.filter((r) => r.mode === m);
    if (!rs.length) continue;
    const ranked = rs.filter((r) => r.position);
    let line = `- **${m === "map_pack" ? "Map pack" : m[0].toUpperCase() + m.slice(1)}:** ranking for ${ranked.length} of ${rs.length} (top 3: ${ranked.filter((r) => r.position <= 3).length})`;
    if (m !== "map_pack") {
      const a = rs.filter((r) => r.ai_overview);
      line += `; AI Overviews on ${a.length}, citing you on ${a.filter((r) => r.aio_cites_us).length}`;
    }
    L.push(line);
  }
  if (prev) {
    const moved = rows.filter((r) => (prev[r.label] ?? null) !== r.position);
    if (moved.length) L.push(`- Changed since last check: ${moved.slice(0, 8).map((r) => `${r.label} ${prev[r.label] ?? `>${depth}`} \u2192 ${r.position ?? `>${depth}`}`).join("; ")}`);
  }
  const ahead = competitors.map((c) => `${c} on ${rows.filter((r) => r.competitors[c] && (!r.position || r.competitors[c] < r.position)).length}`);
  if (competitors.length) L.push(`- Competitors ahead of you: ${ahead.join(", ")}`);
  L.push("", "| Keyword | Mode | You | AI Overview | Map pack | " + competitors.map((c) => c.split(".")[0]).join(" | ") + " |", "|---|---|---|---|---|" + competitors.map(() => "---|").join(""));
  for (const r of rows) {
    const aio = r.ai_overview ? r.aio_cites_us ? "cites you" : "yes" : "";
    const pack = r.local_pack ? r.in_local_pack ? "in it" : "yes" : "";
    L.push(`| ${r.label} | ${r.mode} | ${r.position ?? `>${depth}`} | ${aio} | ${pack} | ` + competitors.map((c) => r.competitors[c] ?? "").join(" | ") + " |");
  }
  L.push("", "Data: DataForSEO (Google organic, desktop; map pack from Google Maps).");
  return L.join("\n");
}
function kwTable(rows, cols = [], limit = 30) {
  const head = ["Keyword", "Volume/mo", "KD", "Intent", ...cols.map((c) => ({ position: "Your position", competitors: "Competitors on page one", cluster: "Cluster" })[c])];
  const L = ["| " + head.join(" | ") + " |", "|" + head.map((_, i) => i === 1 || i === 2 ? "---:|" : "---|").join("")];
  for (const r of rows.slice(0, limit)) {
    const extra = cols.map((c) => c === "position" ? `#${r.position} ${r.url ? host(r.url) + new URL(r.url).pathname : ""}` : c === "competitors" ? Object.entries(r.competitors ?? {}).map(([d, v]) => `${d} #${v.position}`).join(", ") : r.cluster ?? "");
    L.push(`| ${r.keyword} | ${r.volume.toLocaleString("en-US")} | ${r.kd ?? "?"} | ${r.intent ?? "?"} | ${extra.join(" | ")}${extra.length ? " |" : ""}`.replace(/\|  \|$/, "|"));
  }
  return L;
}
function droppedNote(d) {
  const n = Object.values(d ?? {}).reduce((a, b) => a + b, 0);
  if (!n) return "";
  const names = { format: "malformed", language: "other language", navigational: "someone else's brand search", brand: "brand terms", noise: "noise terms", other_vertical: "other industries", other_location: "other cities/countries", off_topic: "off-topic" };
  return `Filtered out ${n} junk keywords: ` + Object.entries(d).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${names[k] ?? k} ${v}`).join(", ") + ".";
}
var REVIEW = /(^|\.)(trustpilot\.com|clutch\.co|g2\.com|capterra\.com|designrush\.com|goodfirms\.co|bbb\.org|yelp\.com|glassdoor\.com|upcity\.com|sortlist\.com|techreviewer\.co|selectedfirms\.co|themanifest\.com)$/;
var COMMUNITY = /(^|\.)(reddit\.com|quora\.com|youtube\.com|linkedin\.com|medium\.com|x\.com|twitter\.com|facebook\.com)$/;
var targetType = (d) => REVIEW.test(d) ? "review/directory profile" : COMMUNITY.test(d) ? "community/video/social" : "article or list (pitch for inclusion)";
function citationTargets(rows, domain, competitors, brands) {
  const branded = (p) => brands.some((b) => squash(b) && squash(p).includes(squash(b)));
  const agg = /* @__PURE__ */ new Map();
  for (const r of rows) {
    if (branded(r.prompt)) continue;
    for (const [e, x] of Object.entries(r.engines)) {
      if (!x || x.mentioned) continue;
      for (const url of x.cited_urls ?? []) {
        const h = host(url);
        if (sameSite(h, domain) || competitors.some((c) => sameSite(h, c))) continue;
        const t = agg.get(url) ?? { url, domain: h, n: 0, e: /* @__PURE__ */ new Set(), p: /* @__PURE__ */ new Set(), c: /* @__PURE__ */ new Set() };
        t.n++;
        t.e.add(ENGINE_LABEL[e]);
        t.p.add(r.prompt);
        t.c.add(r.cluster);
        agg.set(url, t);
      }
    }
  }
  return [...agg.values()].sort((a, b) => b.n - a.n || b.p.size - a.p.size).map((t) => ({
    url: t.url,
    domain: t.domain,
    type: targetType(t.domain),
    times_cited: t.n,
    engines: [...t.e].sort().join(", "),
    clusters: [...t.c].sort().join(", "),
    prompts: [...t.p].sort().join(" | ")
  }));
}
var csvCell = (v) => {
  const s = v === null || v === void 0 ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
var toCsv = (rows) => rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
function aiGridCsv(rows, engines) {
  const out = [["cluster", "prompt", "engine", "ai_answer", "brand_mentioned", "site_cited", "competitors_mentioned", "competitors_cited", "cited_domains", "cited_urls"]];
  const yn = (b) => b ? "yes" : "no";
  for (const r of rows) for (const e of engines) {
    const x = r.engines[e];
    if (x) out.push([r.cluster, r.prompt, ENGINE_LABEL[e], yn(x.answered), yn(x.mentioned), yn(x.cited), x.competitors_mentioned.join(", "), x.competitors_cited.join(", "), x.cited_domains.join(", "), (x.cited_urls ?? []).join(" ")]);
  }
  return toCsv(out);
}
var targetsCsv = (t) => toCsv([["url", "domain", "type", "times_cited", "engines", "clusters", "prompts"], ...t.map((x) => [x.url, x.domain, x.type, x.times_cited, x.engines, x.clusters, x.prompts])]);
var rankCsv = (rows, comps) => toCsv([
  ["keyword", "mode", "your_position", "url", "ai_overview", "ai_overview_cites_you", "map_pack", "in_map_pack", ...comps],
  ...rows.map((r) => [r.label, r.mode, r.position ?? "", r.url ?? "", r.ai_overview ? "yes" : "", r.aio_cites_us ? "yes" : "", r.local_pack ? "yes" : "", r.in_local_pack ? "yes" : "", ...comps.map((c) => r.competitors[c] ?? "")])
]);
var kwCsv = (rows) => toCsv([
  ["cluster", "source", "keyword", "volume", "kd", "intent", "cpc", "position", "url", "competitors"],
  ...rows.map((r) => [r.cluster ?? "", r.source ?? "", r.keyword, r.volume, r.kd ?? "", r.intent ?? "", r.cpc ?? "", r.position ?? "", r.url ?? "", Object.entries(r.competitors ?? {}).map(([d, v]) => `${d} #${v.position}`).join("; ")])
]);

// src/market-client.ts
var MARKET_PRO_HELP = "AI visibility, rank tracking, keyword gaps, reach keywords and keyword research are part of AlchemyAgent Starter and Pro (Starter: 25 AI prompts monthly and 25 rank keywords; Pro: 50 prompts weekly, 100 keywords, gaps, reach, research and citation outreach). Add your license key in the AlchemyAgent settings (Claude Desktop: Settings > Extensions > AlchemyAgent > Configure; Claude Code: /plugin, then AlchemyAgent's settings). Get a plan: https://alchemyagent.ai/#pro";
var ProApi = class {
  constructor(f, base, key) {
    this.f = f;
    this.base = base;
    this.key = key;
  }
  async call(path, body, method = body === void 0 ? "GET" : "POST") {
    const r = await this.f(`${this.base}/api/pro/${path}`, { method, headers: { authorization: `Bearer ${this.key}`, "content-type": "application/json", "user-agent": "AlchemyAgent-MCP" }, body: body === void 0 ? void 0 : JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error?.message || `AlchemyAgent API error ${r.status}`);
    return j;
  }
  profile = async () => (await this.call("profile")).profile;
};
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k]);
    }
  }));
  return out;
}
async function setupMarkdown(api, patch) {
  if (patch && Object.keys(patch).length) {
    const r = await api.call("profile", { profile: patch }, "PUT");
    return [`# Tracking setup saved`, "", "```json", JSON.stringify(r.profile, null, 2), "```", ...r.warnings.length ? ["", "Still missing for some reports:", ...r.warnings.map((w) => `- ${w}`)] : ["", "Everything is set: ai_visibility, rank_tracking, keyword_gaps, reach_keywords and keyword_research can run."]].join("\n");
  }
  const p = await api.profile();
  if (!p) return `# No tracking setup yet

${SETUP_HELP}`;
  const errs = profileErrors(p, ["rank", "ai"]);
  return [`# Tracking setup: ${siteUrl(p)}`, "", "```json", JSON.stringify(p, null, 2), "```", ...errs.length ? ["", "Missing:", ...errs.map((e) => `- ${e}`)] : []].join("\n");
}
async function runAiVisibility(api, o) {
  const p = await api.profile();
  const errs = p ? profileErrors(p, ["ai"]) : ["No tracking setup yet."];
  if (errs.length) throw new Error("Set up AI tracking first (tracking_setup):\n- " + errs.join("\n- ") + "\n\n" + SETUP_HELP);
  const engines = o.engines?.length ? o.engines : p.ai_tracking.engines?.length ? p.ai_tracking.engines : [...ENGINES];
  let prompts = p.ai_tracking.clusters.flatMap((c) => (c.prompts ?? []).map((prompt) => ({ cluster: c.name, prompt })));
  if (o.cluster) prompts = prompts.filter((x) => x.cluster.toLowerCase() === o.cluster.toLowerCase());
  if (o.limit) prompts = prompts.slice(0, o.limit);
  if (!prompts.length) throw new Error(`No prompts${o.cluster ? ` in cluster "${o.cluster}"` : ""}.`);
  const batches = [];
  for (let i = 0; i < prompts.length; i += 5) batches.push(prompts.slice(i, i + 5));
  const prog = o.progress ?? { phase: "", done: 0, total: 0 };
  Object.assign(prog, { phase: "asking AI engines", done: 0, total: prompts.length });
  let cost = 0;
  const rows = (await pool(batches, 2, async (b) => {
    const r = await api.call("ai-visibility", { prompts: b, engines });
    cost += r.cost;
    prog.done += b.length;
    return r.rows;
  })).flat();
  const brands = p.brand_terms, comps = p.competitors;
  const s = summarizeAi(rows, engines, comps, brands);
  const hist = (await api.call("history?kind=ai").catch(() => ({ history: [] }))).history;
  const prev = hist.length ? hist[hist.length - 1].summary : null;
  if (!o.cluster && !o.limit) await api.call("history", { kind: "ai", date: today(), summary: s }).catch(() => {
  });
  const targets = citationTargets(rows, p.site, comps, brands);
  let md = aiMarkdown(siteUrl(p), today(), rows, s, engines, prev, p.ai_tracking.tier);
  if (targets.length) md += "\n\n## Citation outreach\nPages AI cites where you're not mentioned (pitch for inclusion, claim or improve the profile, or join the thread):\n\n| Page | Type | Times cited | Engines |\n|---|---|---:|---|\n" + targets.slice(0, 20).map((t) => `| ${t.url} | ${t.type} | ${t.times_cited} | ${t.engines} |`).join("\n");
  md += `

Data cost this run: $${cost.toFixed(2)} (included in your plan).`;
  const d = today();
  return { markdown: md, exports: [{ name: `ai-visibility-${d}.csv`, csv: aiGridCsv(rows, engines) }, { name: `citation-targets-${d}.csv`, csv: targetsCsv(targets) }] };
}
async function runRanks(api, o = {}) {
  const p = await api.profile();
  const errs = p ? profileErrors(p, ["rank"]) : ["No tracking setup yet."];
  if (errs.length) throw new Error("Set up rank tracking first (tracking_setup):\n- " + errs.join("\n- ") + "\n\n" + SETUP_HELP);
  const jobs = rankJobs(p);
  const batches = [];
  for (let i = 0; i < jobs.length; i += 10) batches.push(jobs.slice(i, i + 10));
  const prog = o.progress ?? { phase: "", done: 0, total: 0 };
  Object.assign(prog, { phase: "checking rankings", done: 0, total: jobs.length });
  const rows = (await pool(batches, 2, async (b) => {
    const r = await api.call("rank", { jobs: b });
    prog.done += b.length;
    return r.rows;
  })).flat();
  const hist = (await api.call("history?kind=rank").catch(() => ({ history: [] }))).history;
  await api.call("history", { kind: "rank", date: today(), summary: Object.fromEntries(rows.map((r) => [r.label, r.position])) }).catch(() => {
  });
  const comps = p.competitors;
  return { markdown: rankMarkdown(siteUrl(p), today(), rows, comps, 20, hist.length ? hist[hist.length - 1].summary : null), exports: [{ name: `rankings-${today()}.csv`, csv: rankCsv(rows, comps) }] };
}
async function runGaps(api, o = {}) {
  const r = await api.call("keyword-gaps", { competitors: o.competitors, top: o.top });
  const md = [
    `# Keyword gaps vs ${r.competitors.join(", ")}`,
    "",
    `You rank top 20 for ${r.ours} keywords. ${r.gaps.length} on-topic keywords where a competitor is on page one and you aren't in the top 20:`,
    "",
    ...kwTable(r.gaps, ["competitors"]),
    "",
    droppedNote(r.dropped),
    "",
    "Data: DataForSEO Labs (Google, country-level). Turn the best ones into page briefs."
  ].join("\n");
  return { markdown: md, exports: [{ name: `keyword-gaps-${today()}.csv`, csv: kwCsv(r.gaps) }] };
}
async function runReach(api, o = {}) {
  const r = await api.call("reach", o);
  const lo = o.min_pos ?? 50, hi = o.max_pos ?? 100;
  const pages = /* @__PURE__ */ new Map();
  for (const x of r.rows) if (x.url) pages.set(x.url, (pages.get(x.url) ?? 0) + 1);
  const md = [
    `# Reach keywords: positions ${lo}-${hi}`,
    "",
    `${r.rows.length} on-topic keywords you already rank ${lo}-${hi} for. Search Console barely shows these (too few impressions), but Google already considers the page. Easiest wins first:`,
    "",
    ...kwTable(r.rows, ["position"]),
    "",
    "**Pages holding the most:** " + [...pages].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([u, n]) => `${u} (${n})`).join(", "),
    "",
    droppedNote(r.dropped),
    "",
    "Next: expand or retarget the ranking page, or brief a dedicated page."
  ].join("\n");
  return { markdown: md, exports: [{ name: `reach-keywords-${today()}.csv`, csv: kwCsv(r.rows) }] };
}
async function runResearch(api, o) {
  const r = await api.call("keyword-research", o);
  const L = [`# Keyword research: ${Object.keys(o.clusters).length} clusters`, "", "| Cluster | Keywords | Volume/mo | Median KD | Biggest keyword |", "|---|---:|---:|---:|---|"];
  for (const name of Object.keys(o.clusters)) {
    const look = r.rows.filter((x) => x.cluster === name && x.source === "lookup");
    const kd = look.map((x) => x.kd).filter((x) => x !== null).sort((a, b) => a - b);
    const big = [...look].sort((a, b) => b.volume - a.volume)[0];
    L.push(`| ${name} | ${look.length} | ${look.reduce((a, x) => a + x.volume, 0).toLocaleString("en-US")} | ${kd.length ? kd[Math.floor(kd.length / 2)] : "?"} | ${big ? `${big.keyword} (${big.volume.toLocaleString("en-US")})` : ""} |`);
  }
  const ideas = r.rows.filter((x) => x.source === "idea");
  if (ideas.length) L.push("", `**${ideas.length} related searches** (longer searches containing your keywords):`, "", ...kwTable(ideas.sort((a, b) => b.volume - a.volume), ["cluster"], 25));
  const noData = r.rows.filter((x) => x.no_data).map((x) => x.keyword);
  if (noData.length) L.push("", `No search data for: ${noData.slice(0, 10).join(", ")} (too rare, too new, or phrased the way people ask AI assistants).`);
  const flagged = r.rows.filter((x) => x.flag).map((x) => `${x.keyword} (${x.flag})`);
  if (flagged.length) L.push("", `Check these, they look off-topic for this business: ${flagged.slice(0, 10).join(", ")}.`);
  const note = droppedNote(r.dropped);
  if (note) L.push("", note);
  L.push("", "Data: DataForSEO Labs (Google Ads volumes, country-level).");
  return { markdown: L.join("\n"), exports: [{ name: `keyword-research-${today()}.csv`, csv: kwCsv(r.rows) }] };
}

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
  const metrics = src ? Object.entries(FIELD_METRICS).filter(([k]) => src.metrics[k]).map(([k, [name, fmt2]]) => ({ name, value: fmt2(src.metrics[k].percentile), rating: String(src.metrics[k].category ?? "").replace("_", " ").toLowerCase() })) : [];
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
var types = (n) => (Array.isArray(n["@type"]) ? n["@type"] : n["@type"] ? [n["@type"]] : []).map(String);
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
    walk(data, (n, path) => nodes.push({ n, path: `block ${bi + 1}${path ? " \u203A " + path : ""}`, block: bi }));
  });
  const ids = /* @__PURE__ */ new Map();
  for (const { n, block } of nodes) if (typeof n["@id"] === "string" && types(n).length) {
    const arr = ids.get(n["@id"]) ?? [];
    arr.push({ types: types(n), block });
    ids.set(n["@id"], arr);
  }
  const typeCount = {};
  for (const { n, path } of nodes) {
    const ts = types(n);
    const isRef = !ts.length && typeof n["@id"] === "string" && Object.keys(n).length === 1;
    if (isRef) {
      if (!ids.has(n["@id"])) issues.push({ level: "warning", where: path, message: `References @id "${n["@id"]}" but no node on the page has that @id.` });
      continue;
    }
    for (const t of ts) {
      typeCount[t] = (typeCount[t] ?? 0) + 1;
      const r = ruleFor(t);
      if (!r) continue;
      const [rk, rule] = r;
      for (const req of rule.required) {
        const opts = Array.isArray(req) ? req : [req];
        if (!opts.some((k) => present(n[k]))) issues.push({ level: "error", where: `${path} (${t})`, message: `Missing required ${opts.length > 1 ? "one of " + opts.join(" / ") : opts[0]}.` });
      }
      const missRec = (rule.recommended ?? []).filter((k) => !present(n[k]));
      if (missRec.length && ts.length && !path.includes("itemListElement")) issues.push({ level: "info", where: `${path} (${t})`, message: `Recommended but missing: ${missRec.join(", ")}.` });
      if (rule.note) issues.push({ level: "info", where: `${path} (${t})`, message: rule.note });
      if ((rk === "LocalBusiness" || rk === "Organization") && present(n.aggregateRating))
        issues.push({ level: "warning", where: `${path} (${t})`, message: "aggregateRating on your own business is a self-serving review; Google doesn't show stars for it." });
      if (rk === "AggregateRating") {
        const v = parseFloat(n.ratingValue), best = parseFloat(n.bestRating ?? 5), worst = parseFloat(n.worstRating ?? 1);
        if (Number.isFinite(v) && (v > best || v < worst)) issues.push({ level: "error", where: path, message: `ratingValue ${v} is outside ${worst}\u2013${best}.` });
      }
    }
    for (const [k, v] of Object.entries(n)) {
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
    const withType = nodes.filter(({ n }) => types(n).includes(t) && Object.keys(n).length > 2);
    const distinct = new Set(withType.map(({ n }) => n["@id"] ?? JSON.stringify(n).slice(0, 200)));
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
  if (tc.length) out.push("", "Types: " + tc.map(([t, n]) => n > 1 ? `${t} \xD7${n}` : t).join(", "));
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
  const n = parseFloat(String(v ?? "").replace(/[,%]/g, "").trim());
  return Number.isFinite(n) ? n : 0;
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
var UA = "AlchemyAgent/0.1 (https://alchemyagent.ai; support@alchemyagent.ai)";
var CDX = "https://web.archive.org/cdx/search/cdx";
async function get2(f, url, tries = 3) {
  let last = null;
  for (let i = 0; i < tries; i++) {
    const r = await f(url, { headers: { "user-agent": UA } });
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
      out.push("Captures by year: " + Object.entries(page.byYear).map(([y, n]) => `${y}: ${n}`).join(", "));
    }
  }
  out.push("", "Data: Internet Archive Wayback Machine.");
  return out.join("\n");
}
var TRACKED_BOTS = TRACK.filter((t) => BOTS.some((b) => b.token === t));

// src/commoncrawl.ts
var UA2 = "AlchemyAgent/0.1 (https://alchemyagent.ai; support@alchemyagent.ai)";
async function getText(f, url, tries = 2, timeoutMs = 12e3) {
  let status = 0, text = "";
  for (let i = 0; i < tries; i++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), timeoutMs);
    try {
      const r = await f(url, { headers: { "user-agent": UA2 }, signal: ctl.signal });
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
    const n = c.found === null ? "index busy, couldn't check" : c.found ? c.capped ? "50+" : String(c.count) : "0";
    out.push(`| ${c.name.replace(/^.*?(\d{4})/, "$1")} (${c.crawl}) | ${c.found === null ? "unknown" : c.found ? "yes" : "no"} | ${n} |`);
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
var BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
var decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&[a-z]+;/gi, " ");
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
  return f.filter(([, re]) => re.test(html)).map(([n]) => n);
}
async function renderCheck(url, f = fetch) {
  const r = await get(f, url, BROWSER_UA, 2e4);
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
  const attr = (re) => decode(html.match(re)?.[1] ?? "").trim();
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
    metaDescription: attr(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || attr(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i),
    h1: headings.filter((h) => h.level === 1).map((h) => h.text),
    headings,
    links: (body.match(/<a\b[^>]*href=/gi) ?? []).length,
    images: imgs.length,
    imagesNoAlt: imgs.filter((t) => !/\salt=["'][^"']+["']/i.test(t)).length,
    jsonLdBlocks: (html.match(/application\/ld\+json/gi) ?? []).length,
    lang: attr(/<html\b[^>]*\slang=["']([^"']+)["']/i),
    canonical: attr(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i),
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
var UA3 = "AlchemyAgent-Check/0.1 (+https://alchemyagent.ai)";
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
    const r = await get(f, u, UA3, 12e3);
    if (challenged(r)) return { url: u, urls: 0, challenged: true };
    if (r.status !== 200 || !/<(urlset|sitemapindex)/i.test(r.text)) continue;
    const mods = [...r.text.matchAll(/<lastmod>\s*([^<\s]+)\s*<\/lastmod>/gi)].map((m) => m[1]).filter((d) => !isNaN(Date.parse(d))).sort();
    let urls = (r.text.match(/<url>/gi) ?? []).length;
    if (/<sitemapindex/i.test(r.text)) {
      const kids = [...r.text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi)].map((m) => m[1]).slice(0, 5);
      const counts = await Promise.all(kids.map(async (k) => {
        const c = await get(f, k, UA3, 12e3);
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
    get(f, `${origin}/llms.txt`, UA3, 1e4),
    get(f, `${origin}/llms-full.txt`, UA3, 1e4),
    get(f, target.toString(), UA3, 15e3),
    get(f, `${origin}/robots.txt`, UA3, 1e4)
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
    const r = await get(f, abs, UA3, 8e3);
    if (r.status >= 400 && !challenged(r)) brokenLinks.push(`${u} (${r.status})`);
    if (r.status === 0) brokenLinks.push(`${u} (no response)`);
  }));
  const html = challenged(page) ? "" : page.text;
  const altLink = html.match(/<link\b[^>]*type=["']text\/(?:markdown|x-markdown)["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*type=["']text\/(?:markdown|x-markdown)["']/i)?.[1];
  const path = target.pathname.replace(/\/$/, "");
  const mdCandidates = [path ? `${origin}${path}.md` : `${origin}/index.md`, `${origin}${path}/index.html.md`];
  const [neg, ...mds] = await Promise.all([
    f(target.toString(), { headers: { accept: "text/markdown", "user-agent": UA3 } }).then(async (r) => ({ ct: r.headers.get("content-type") ?? "", ok: r.ok })).catch(() => ({ ct: "", ok: false })),
    ...mdCandidates.map((u) => get(f, u, UA3, 8e3))
  ]);
  const mdIdx = mds.findIndex((r) => r.status === 200 && !isHtml(r.text) && /^#|\n#/.test(r.text));
  const discovery = await Promise.all(DISCOVERY.map(async ([p, label]) => {
    const r = await get(f, origin + p, UA3, 8e3);
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
var UA4 = "AlchemyAgent/0.2 (https://alchemyagent.ai; support@alchemyagent.ai)";
var LANGS = ["en", "de", "fr", "es", "it", "ja", "pt", "nl", "pl", "zh"];
async function json(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15e3);
  try {
    const r = await f(url, { headers: { "user-agent": UA4, "api-user-agent": UA4, accept: "application/json" }, signal: ctl.signal });
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
    const fmt2 = (x) => x.toISOString().slice(0, 10).replace(/-/g, "") + "00";
    const pv = await json(f, `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${m[1]}.wikipedia/all-access/user/${m[2]}/monthly/${fmt2(start)}/${fmt2(end)}`);
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
  const n = r.articles.length;
  L.push(`### Articles linking to ${r.domain}`, n ? `${n} article${n === 1 ? "" : "s"} across ${new Set(r.articles.map((a) => a.lang)).size} language${new Set(r.articles.map((a) => a.lang)).size === 1 ? "" : "s"} (checked ${r.checked.join(", ")}).` : `None found in ${r.checked.join(", ")} Wikipedia.`, "");
  if (n) {
    L.push("| Wiki | Article | Links to |", "|---|---|---|");
    for (const a of r.articles.slice(0, limit)) L.push(`| ${a.lang} | [${a.title.replace(/\|/g, "\\|")}](${a.url}) | ${a.links.slice(0, 2).map((u) => u.replace(/^https?:\/\//, "")).join(", ")}${a.links.length > 2 ? ` +${a.links.length - 2}` : ""} |`);
    if (n > limit) L.push("", `\u2026and ${n - limit} more.`);
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
var UA5 = "AlchemyAgent/0.2 (+https://alchemyagent.ai)";
async function json2(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15e3);
  try {
    const r = await f(url, { headers: { "user-agent": UA5, accept: "application/json" }, signal: ctl.signal });
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
var host2 = (u) => {
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
        const h = host2(x.url);
        return h === want || h.endsWith("." + want);
      });
      out.push({
        query: q,
        position: idx >= 0 ? idx + 1 : null,
        url: idx >= 0 ? results[idx].url : void 0,
        top: results.slice(0, 3).map((x, j) => ({ position: j + 1, host: host2(x.url), title: String(x.title ?? "").replace(/<[^>]+>/g, "") })),
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
var UA6 = "AlchemyAgent/0.2 (https://alchemyagent.ai; support@alchemyagent.ai)";
var digits = (s = "") => s.replace(/\D/g, "").slice(-10);
var norm2 = (s = "") => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim();
var hostOf = (u = "") => {
  try {
    return new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};
async function osmLookup(name, location, website, phone, f = fetch) {
  const q = new URLSearchParams({ q: `${name}, ${location}`, format: "jsonv2", addressdetails: "1", extratags: "1", namedetails: "1", limit: "5" });
  const r = await f(`https://nominatim.openstreetmap.org/search?${q}`, { headers: { "user-agent": UA6, "accept-language": "en" } });
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
        name: !!pname && (norm2(pname).includes(norm2(name)) || norm2(name).includes(norm2(pname))),
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

// src/prompts.ts
var msg = (text) => ({ messages: [{ role: "user", content: { type: "text", text } }] });
var REPORT_RULES = [
  "Report rules:",
  "- Lead with a 3-line summary: what's working, the biggest risk, the single best next step.",
  "- Then a ranked fix list as a table: Fix | Why it matters for AI search | Impact (high/med/low) | Effort (hours) | Who (dev, content, marketing).",
  "- Quote the evidence for each fix from the tool results (numbers, URLs). Don't invent data; if a tool failed or was blocked, say so and move on.",
  "- Keep it plain English for a marketing lead. No filler."
].join("\n");
function registerPrompts(server2, remote, pro = !remote, hostedData = false) {
  const local = (tools) => remote ? "" : tools;
  const own = (text) => !remote || hostedData ? text : "";
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
      own(`9. If Search Console is connected (gsc_sites works), gsc_ai_queries for the last 90 days; if GA4 is connected, ga4_report by ai_assistants; if Bing is connected, bing_webmaster`),
      "",
      REPORT_RULES,
      "- Group fixes under: Access (can AI reach it), Readability (can AI read it), Identity (does AI know who you are), Authority (does AI trust you), Speed.",
      own("- End with one line on which of the user's own data sources aren't connected yet (run data_connections) and what connecting them would add to this audit.")
    ].filter(Boolean).join("\n"))
  );
  if (!remote) server2.registerPrompt(
    "connect_your_data",
    {
      title: "Start here: connect your data",
      description: "First run: connect Google Search Console and GA4 (one Google sign-in), Bing Webmaster Tools and Cloudflare so AlchemyAgent can rank fixes by your real traffic and crawler data.",
      argsSchema: {}
    },
    () => msg([
      "Help me connect my own data to AlchemyAgent.",
      "",
      "1. Run data_connections and show me what's connected.",
      "2. Walk me through connecting the most valuable missing source first (Google: Search Console and GA4 in one sign-in, then Bing Webmaster Tools, then Cloudflare), one step at a time, waiting for me between steps.",
      "3. When Search Console has an OAuth client but no sign-in, run gsc_connect.",
      "4. After each connection, run one quick check that uses it (gsc_sites, ga4_report, bing_webmaster, log_file_analysis) to confirm it works, and tell me one thing it found.",
      "Never ask me to paste a key into the chat: keys go in AlchemyAgent's settings."
    ].join("\n"))
  );
  else if (hostedData) server2.registerPrompt(
    "connect_your_data",
    {
      title: "Start here: connect your data",
      description: "First run: connect Google Search Console and GA4 (one Google sign-in) and Bing Webmaster Tools to your AlchemyAgent account so fixes get ranked by your real traffic and queries.",
      argsSchema: {}
    },
    () => msg([
      "Help me connect my own data to AlchemyAgent.",
      "",
      "1. Run data_connections, show me what's connected, and give me the private connect link it returns.",
      "2. Tell me in one line each what Google (Search Console and GA4, one sign-in) and Bing Webmaster Tools add.",
      "3. When I say I'm done, run one quick check per new connection (gsc_sites, ga4_report with no property, bing_webmaster with no site) to confirm it works, and tell me one thing it found.",
      "Never ask me to paste a key or password into the chat: the connect page handles that."
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
    server2.registerPrompt(
      "internal_link_rewiring",
      {
        title: "Internal link rewiring (Pro)",
        description: "Move pages stuck at positions 8-15 onto page one with internal links from pages that already rank, then clean up redirects, broken links and generic anchors. Needs AlchemyAgent Pro and Search Console.",
        argsSchema: { site: external_exports.string().describe("Website, e.g. https://example.com/"), brand_name: external_exports.string().optional().describe("Brand name and common spellings, comma-separated") }
      },
      ({ site, brand_name }) => msg([
        `Plan internal link rewiring for ${site} with AlchemyAgent.`,
        "",
        `1. Check data_connections. If Search Console isn't connected, run gsc_connect and wait for me (without it the plan is cleanup only).`,
        `2. Run internal_links for ${site}${brand_name ? ` with brand_terms ${JSON.stringify(brand_name.split(",").map((x) => x.trim()).filter(Boolean))}` : ""}. It crawls the whole site, so if it says it's still running, call it again with the same site until the plan comes back.`,
        "3. Sanity-check every proposed link before you show it to me: open the donor page (ai_render_check) and confirm the quoted sentence is real body copy, the anchor reads naturally there, and the donor is on the same topic as the target. Drop any link that fails and say why.",
        "",
        "Then give me:",
        "- A 3-line summary: how many pages are stuck at 8-15, how many links I should add, and the biggest cleanup item.",
        "- The link list as a table: Target page | Position | Impressions | Add a link on | Anchor | The sentence to put it in (rewrite the sentence so the anchor fits, keeping its meaning).",
        "- Cleanup, ranked: broken links and links to redirects first (fix each at the source page, not with another redirect), then generic anchors (suggest the replacement wording), then orphan pages (link them or prune them).",
        "- What to leave alone (pages already in the top 5) and when to measure: re-check the targets with gsc_performance about 4 and 8 weeks after the links go live.",
        "Don't change anything on the site. Point me to the CSV files for the full lists."
      ].join("\n"))
    );
  }
  if (pro) {
    server2.registerPrompt(
      "setup_tracking",
      {
        title: "Set up AI visibility and rank tracking",
        description: "One-time setup shared by every AlchemyAgent app: brand, topics, competitors, rank tracking modes (national, local, map pack) and AI prompt clusters.",
        argsSchema: { site: external_exports.string().describe("Website, e.g. example.com") }
      },
      ({ site }) => msg([
        `Help me set up AlchemyAgent tracking for ${site}. Ask me one group of questions at a time and save with tracking_setup after each answer.`,
        "",
        "1. Brand: how do people and AI write our name (all spellings)? What do we do (topic_terms: services/products in our words)? Which cities or regions do we serve?",
        "2. Competitors: who do we actually lose deals to (1-8 domains)? Suggest the domains that hold page one for our money keywords, but I decide.",
        "3. Rank tracking: for each group of keywords, national (whole country), local (organic results from a city) or map pack (our Google Maps listing from a city: I'll give the Google Business Profile name)? Suggest money terms plus a few we already rank for (gsc_performance if Search Console is connected).",
        "4. AI tracking: which plan tier (25, 50 or 100 prompts) and weekly or monthly? Draft prompts the way buyers ask AI (full questions: category + use case + segment), grouped into clusters by buying stage (brand, best-of/vendor choice, cost, how-to, comparisons). Show me the list before saving.",
        "Finish with plan_usage and a one-line summary of what will run."
      ].join("\n"))
    );
    server2.registerPrompt(
      "ai_visibility_report",
      {
        title: "AI visibility report",
        description: "Run the AI prompt tracker and get a ranked plan: where you're invisible, who AI cites instead, and the outreach list.",
        argsSchema: {}
      },
      () => msg([
        "Run ai_visibility (call it again while it says it's still running). Then give me:",
        "- A 3-line summary: mention and citation rates, the best and worst engine, change since last run.",
        "- The clusters where we're invisible, and the top 5 zero-presence prompts with the page we should create or improve for each.",
        "- Who AI cites instead, and the citation outreach list grouped by type: articles/lists to pitch for inclusion, review/directory profiles to claim or improve, community threads/videos to join. For the top 5 articles, draft a 2-sentence pitch.",
        "- Point me to the spreadsheets."
      ].join("\n"))
    );
  }
}

// src/alerts.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
var UA7 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
var ALERTS_DIR = () => join(homedir(), ".alchemyagent", "alerts");
var hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 16);
var decode2 = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/<[^>]+>/g, "").trim();
var tag = (xml, name) => xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
var slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "brand";
var host3 = (u) => {
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
    const r = await f(url, { headers: { "user-agent": UA7, accept: "application/rss+xml, application/atom+xml, text/html;q=0.9, */*;q=0.8" }, redirect: "follow", signal: ctl.signal });
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
    return { source: "Google News", title, url: decode2(tag(it, "link")), outlet: outlet || host3(it.match(/<source[^>]*url="([^"]+)"/i)?.[1] ?? ""), date: isNaN(d) ? "" : new Date(d).toISOString().slice(0, 10) };
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
    return { source: "Google Alerts", title: decode2(tag(e, "title")), url, outlet: host3(url), date: isNaN(d) ? "" : new Date(d).toISOString().slice(0, 10) };
  });
}
async function linksTo(f, url, domain) {
  if (/^https:\/\/news\.google\.com\//.test(url)) return null;
  const r = await getText2(f, url, 1e4);
  if (r.status !== 200 || !r.text || host3(r.url) === "news.google.com") return null;
  const d = domain.replace(/^www\./, "").replace(/\./g, "\\.");
  return new RegExp(`href=["'][^"']*\\/\\/(www\\.)?${d}`, "i").test(r.text);
}
async function loadState(brand) {
  try {
    return JSON.parse(await readFile(join(ALERTS_DIR(), `${slug(brand)}.json`), "utf8"));
  } catch {
    return { brand, feeds: [], seen: {} };
  }
}
async function saveState(s) {
  await mkdir(ALERTS_DIR(), { recursive: true, mode: 448 });
  const entries = Object.entries(s.seen).sort((a, b) => b[1].localeCompare(a[1])).slice(0, 5e3);
  await writeFile(join(ALERTS_DIR(), `${slug(s.brand)}.json`), JSON.stringify({ ...s, seen: Object.fromEntries(entries) }, null, 2), { mode: 384 });
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
        found.push(...pages.map((p) => ({ source: "Search Console", title: `Started getting Google impressions (${p.impressions} so far)`, url: p.url, outlet: host3(p.url), date: p.first, kind: "page", id: hash("page:" + p.url) })));
      }
    } catch (e) {
      errors.push(`Search Console: ${e instanceof Error ? e.message.split(".")[0] : String(e)}`);
    }
  }
  const fresh = [];
  const ids = /* @__PURE__ */ new Set();
  for (const it of found) {
    if (it.kind === "press" && domain && host3(it.url).endsWith(domain)) continue;
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
  if (platform() !== "darwin") return;
  const esc = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').slice(0, 200);
  try {
    spawn("osascript", ["-e", `display notification "${esc(body)}" with title "${esc(title)}"`], { stdio: "ignore", detached: true }).unref();
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

// src/server.ts
var BROWSER_UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
async function homepageSameAs(origin, f) {
  const r = await get(f, origin + "/", BROWSER_UA2);
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
var VERSION = "0.5.1";
var DEFAULT_API_BASE = "https://api.alchemyagent.ai";
function serverInstructions(opts) {
  const base = "AlchemyAgent checks how a website shows up in AI search and Google: AI crawler access, what AI sees, speed, schema, entity and authority.";
  const unlock = [
    "- Google Search Console: real Google queries, clicks and positions, including the queries that come from AI assistants.",
    "- Google Analytics 4 (same Google sign-in): sessions and key events by channel and landing page, including referrals from ChatGPT, Perplexity, Claude and Gemini.",
    "- Bing Webmaster Tools: Bing traffic, queries and index health; Bing's index also feeds Microsoft Copilot and other AI assistants."
  ].join("\n");
  if (opts.remote && !opts.hostedData) return `${base} This free connector has no account, so it only checks public pages. On a new user's first request, answer it, then add one short line that their own Search Console, GA4 and Bing Webmaster Tools data can be connected with an AlchemyAgent account (data_connections explains how). Don't repeat it in later replies.`;
  const how = opts.hostedData ? "Call data_connections: it shows what is connected and returns a private connect link (valid 24 hours). Share that link as is; the user signs in with Google once for Search Console and GA4, and pastes a Bing API key on the same page. Never ask for keys or passwords in the chat." : "Call data_connections: it shows what is connected and how to add the rest. The connect_your_data prompt walks through it step by step. Keys go in AlchemyAgent's settings, never in the chat.";
  return [
    base,
    "",
    "Onboarding: on a new user's first request, call data_connections before or alongside the tools the question needs. In your first reply, if Google or Bing isn't connected yet, invite the user to connect Google Search Console and GA4 (one Google sign-in) and Bing Webmaster Tools, with one line each on what it unlocks:",
    unlock,
    how,
    "Then answer their question anyway with the tools that work without a connection. Mention connecting only once per conversation, and skip it when everything is already connected.",
    "When a Search Console, GA4 or Bing tool says it isn't connected, call data_connections and give the user the next step."
  ].join("\n");
}
var errorResult = (e) => ({ isError: true, content: [{ type: "text", text: e instanceof Error ? e.message : String(e) }] });
function createServer(opts = {}) {
  const apiBase2 = (opts.apiBase ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const f = opts.fetchFn ?? fetch;
  const psi = { apiBase: apiBase2, apiKey: opts.psiKey, fetchFn: f };
  const server2 = new McpServer({ name: "alchemyagent", version: VERSION }, { instructions: serverInstructions(opts) });
  const clean2 = (r) => opts.remote && r?.content ? { ...r, content: r.content.map((c) => c.type === "text" ? { ...c, text: c.text.split("\n").filter((l) => !l.startsWith("AlchemyAgent Pro")).join("\n").trimEnd() } : c) } : r;
  const register = ((name, cfg, cb) => server2.registerTool(name, { ...cfg, annotations: { title: cfg.title, ...cfg.annotations } }, async (...a) => {
    try {
      const r = clean2(await cb(...a));
      opts.track?.(name, !r?.isError);
      return r;
    } catch (e) {
      opts.track?.(name, false);
      throw e;
    }
  }));
  async function api(path) {
    const res = await f(`${apiBase2}${path}`, { headers: { accept: "application/json" } });
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
          const { readFile: readFile2 } = await import("node:fs/promises");
          text = await readFile2(csv_path.replace(/^~(?=\/)/, process.env.HOME ?? "~"), "utf8");
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
  const gscCreds = opts.hostedData ? { getToken: () => opts.hostedData.googleToken() } : opts.gsc ?? {};
  const property = async (site) => {
    const sites = await listSites(gscCreds, f);
    const p = matchProperty(sites, site);
    if (!p) throw new Error(`${site} isn't a Search Console property this account can read. Properties: ${sites.map((s) => s.siteUrl).join(", ") || "none"}.`);
    return p;
  };
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
      "page_quality",
      {
        title: "Page quality rating (Pro)",
        description: "AlchemyAgent Pro: rate up to 10 pages 1-9 for quality the way a trained search quality rater would (purpose, main content effort and originality, expertise, trust, YMYL), with quoted evidence, what works, and a specific fix for each issue. The rubric runs on AlchemyAgent's servers and needs the user's Pro license key. Use it to find thin, generic or outdated pages worth rewriting.",
        inputSchema: {
          urls: external_exports.array(external_exports.string()).min(1).max(10).describe("Page URLs to rate, e.g. https://example.com/services/"),
          context: external_exports.string().max(1500).optional().describe("Optional: one or two sentences about the business (what it sells, to whom, who writes the content). Improves trust and expertise judgments.")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ urls, context }) => {
        try {
          if (!opts.licenseKey) throw new Error(PRO_HELP);
          const ok = [], failed = [];
          const results = await Promise.allSettled(urls.map((u) => rateQuality(f, apiBase2, opts.licenseKey, normalizeUrl(u), context)));
          results.forEach((r, i) => r.status === "fulfilled" ? ok.push(r.value) : failed.push({ url: urls[i], error: r.reason instanceof Error ? r.reason.message : String(r.reason) }));
          if (!ok.length) throw new Error(failed.map((x) => `${x.url}: ${x.error}`).join("\n"));
          return { content: [{ type: "text", text: qualityMarkdown(ok, failed) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    const linkJobs = /* @__PURE__ */ new Map();
    register(
      "internal_links",
      {
        title: "Internal link rewiring plan (Pro)",
        description: "AlchemyAgent Pro: plan internal links that move pages stuck at positions 8 to 15 in Google onto page one, without new content. Crawls every page in the site's sitemap from the user's computer, maps every internal link (body, nav, footer, template) and its anchor, scores internal authority (PageRank), then reads the user's own Search Console: each page sitting at positions 8-15 with real non-brand impressions gets up to 3 new body links from pages that already rank on page one for the same topic, with an anchor taken from its own queries and the sentence in the donor page where the link fits. Also lists cleanup: links to redirects and broken pages, generic anchors, one anchor pointing at several URLs, and orphan pages. Plan only: it never changes the site. Large sites take a few minutes: if the result says it's still running, call it again with the same site.",
        inputSchema: {
          site: external_exports.string().describe("Website, e.g. https://example.com/ (it should also be a Search Console property for the full plan)"),
          brand_terms: external_exports.array(external_exports.string()).max(10).optional().describe('Brand names and spellings to leave out of topic matching, e.g. ["acme", "acme widgets"]. Defaults to the domain name.'),
          days: external_exports.number().int().min(28).max(480).default(90).describe("Search Console period"),
          max_pages: external_exports.number().int().min(10).max(3e3).default(1e3).describe("Most sitemap pages to crawl"),
          position_min: external_exports.number().min(1).max(50).default(8),
          position_max: external_exports.number().min(1).max(100).default(15),
          min_impressions: external_exports.number().int().min(0).default(100).describe("Non-brand impressions a page needs to be a target"),
          donors_per_page: external_exports.number().int().min(1).max(5).default(3),
          refresh: external_exports.boolean().default(false).describe("Start a new run even if one finished in the last 12 hours"),
          out_dir: external_exports.string().optional().describe("Folder for the CSV, JSON and Markdown files (default ~/Downloads/alchemyagent-reports)")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => {
        if (!opts.licenseKey) throw new Error(LINKS_PRO_HELP);
        const base = new URL(normalizeUrl(a.site)).origin + "/";
        const key = norm(base);
        let job = linkJobs.get(key);
        const fresh = job?.result && Date.now() - job.started < 12 * 36e5;
        if (!job || job.error || a.refresh && job.result || job.result && !fresh) {
          const v = await verifyPro(f, apiBase2, opts.licenseKey, "internal_links");
          let gsc = null, gscProperty;
          if (gscCreds.serviceAccountFile || gscCreds.clientId && gscCreds.clientSecret) {
            try {
              gscProperty = await property(a.site);
              const range = dateRange(a.days);
              const [pg, pq] = await Promise.all([
                searchAnalytics(gscCreds, gscProperty, { ...range, dimensions: ["page"], rowLimit: 25e3 }, f),
                searchAnalytics(gscCreds, gscProperty, { ...range, dimensions: ["page", "query"], rowLimit: 1e5 }, f)
              ]);
              gsc = {
                pages: Object.fromEntries(pg.map((r) => [norm(r.keys[0]), { clicks: r.clicks, impressions: r.impressions, position: Math.round(r.position * 10) / 10 }])),
                pq: pq.map((r) => [norm(r.keys[0]), r.keys[1], r.clicks, r.impressions, Math.round(r.position * 10) / 10])
              };
            } catch (e) {
              gsc = null;
              gscProperty = void 0;
              if (!/isn't a Search Console property|sign in|connect/i.test(String(e))) throw e;
            }
          }
          const host4 = new URL(base).hostname.replace(/^www\./, "");
          const progress = { phase: "starting", done: 0, total: 0 };
          const j = { started: Date.now(), progress, promise: Promise.resolve(null) };
          j.promise = runLinks({
            base,
            f,
            maxPages: a.max_pages,
            gsc,
            gscProperty,
            progress,
            plan: { posMin: a.position_min, posMax: a.position_max, minImpressions: a.min_impressions, donorsPer: a.donors_per_page, brand: a.brand_terms?.length ? a.brand_terms : [host4.split(".")[0]] }
          }).then(async (r) => {
            const md0 = linksMarkdown(r);
            r.files = await saveLinkFiles(r, md0, a.out_dir).catch(() => void 0);
            j.result = r;
            j.md = linksMarkdown(r) + `

AlchemyAgent Pro runs today: ${v.used_today} of ${v.daily_limit}.`;
            return r;
          }, (e) => {
            j.error = e instanceof Error ? e.message : String(e);
            throw e;
          });
          j.promise.catch(() => {
          });
          linkJobs.set(key, j);
          job = j;
        }
        await Promise.race([job.promise.catch(() => {
        }), new Promise((r) => setTimeout(r, 4e4))]);
        if (job.error) throw new Error(job.error);
        if (job.md) return job.md;
        const pr = job.progress;
        return `Still running (${Math.round((Date.now() - job.started) / 1e3)} s so far): ${pr.phase}${pr.total ? ` ${pr.done} of ${pr.total}` : ""}. Call internal_links again with the same site in about a minute to get the plan.`;
      })
    );
  }
  const hosted = opts.hostedData;
  if (!opts.remote || hosted) {
    const bingKey = async () => {
      if (hosted) return hosted.bingKey();
      if (!opts.bingKey) throw new Error(BING_KEY_HELP);
      return opts.bingKey;
    };
    const gscStatus = async () => hosted ? "Connected through your AlchemyAgent account (read-only)." : connectionStatus(gscCreds);
    register(
      "gsc_sites",
      {
        title: "Search Console properties",
        description: "List the Search Console properties the connected Google account can read, with permission levels, and the connection status. Uses the Search Console API (https://developers.google.com/webmaster-tools).",
        inputSchema: {},
        annotations: ro
      },
      async () => run(async () => {
        const sites = await listSites(gscCreds, f);
        const status = await gscStatus();
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
      "ga4_report",
      {
        title: "Google Analytics 4 report",
        description: "Read the user's own Google Analytics 4 data with their Google sign-in: sessions, engaged sessions, key events and revenue for the last N days vs the N days before, by channel, landing page, source, or AI assistant referrals (ChatGPT, Perplexity, Claude, Gemini, Copilot and more). Call without property to list the GA4 properties the account can read. Uses the Google Analytics Data API (https://developers.google.com/analytics/devguides/reporting/data/v1).",
        inputSchema: {
          property: external_exports.string().optional().describe("GA4 property name or ID (or the site's domain). Omit to list properties."),
          by: external_exports.enum(["channel", "landing_page", "source", "ai_assistants"]).default("channel").describe("How to group sessions"),
          days: external_exports.number().int().min(7).max(365).default(28).describe("Days to report (compared with the same number of days before)"),
          limit: external_exports.number().int().min(5).max(100).default(20).describe("Rows to show")
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async ({ property: property2, by, days, limit }) => {
        try {
          const creds = gscCreds;
          const props = await listProperties(creds, f);
          if (!property2) return { content: [{ type: "text", text: propertiesMarkdown(props) }] };
          const p = matchGa4(props, property2);
          if (!p) throw new Error(`${property2} isn't a GA4 property this account can read. ${props.length ? "Properties: " + props.map((x) => `${x.name} (${x.id})`).join(", ") : ""}`);
          return { content: [{ type: "text", text: ga4Markdown(await ga4Report(creds, p, by, days, f), limit) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
    register(
      "data_connections",
      {
        title: "Connect your data (setup status)",
        description: hosted ? "Show which of the user's own data sources are connected to their AlchemyAgent account (Google Search Console and GA4 with one Google sign-in, Bing Webmaster Tools), what each one unlocks, and a fresh private link to connect or disconnect them. Use this first with a new user, whenever a Search Console, GA4 or Bing tool says it isn't connected, or when someone asks how to get data-driven recommendations." : "Show which of the user's own data sources AlchemyAgent can use (Google Search Console and GA4 with one Google sign-in, Bing Webmaster Tools, Cloudflare logs, Brave Search, PageSpeed key), why each one matters, and exactly how to connect the missing ones. Use this first with a new user, when a tool needs a key that isn't set, or when someone asks how to get better, data-driven recommendations.",
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: false }
      },
      async () => run(async () => hosted ? hostedConnectionsMarkdown(await hosted.status(), await hosted.connectLink()) : connectionsMarkdown({ ...connState(opts, TOKEN_FILE), ga4: await hasScope(opts.gsc ?? {}, GA4_SCOPE).catch(() => false) }))
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
          const key = await bingKey();
          const sites = await listSites2(f, key);
          if (!site_url) return { content: [{ type: "text", text: sitesMarkdown(sites) }] };
          const site = matchSite(sites, site_url);
          if (!site) throw new Error(`${site_url} isn't in this Bing Webmaster Tools account. ${sites.length ? "Sites in the account: " + sites.map((s) => s.url).join(", ") : "Add and verify it at https://www.bing.com/webmasters first."}`);
          const sections = report === "overview" ? ["traffic", "queries", "crawl"] : [report];
          const data = await bingReport(f, key, site.url, sections);
          return { content: [{ type: "text", text: bingMarkdown(data, report === "overview" ? Math.min(limit, 10) : limit) }] };
        } catch (e) {
          return errorResult(e);
        }
      }
    );
  }
  if (opts.remote && !hosted) register(
    "data_connections",
    {
      title: "Connect your data (setup status)",
      description: "Explain how to connect the user's own Google Search Console, GA4 and Bing Webmaster Tools data to AlchemyAgent. This free connector has no account, so it can't hold connections; use this when someone asks about their own search traffic, queries or analytics.",
      inputSchema: {},
      annotations: { readOnlyHint: true, openWorldHint: false }
    },
    async () => run(async () => ACCOUNT_NEEDED)
  );
  if (!opts.remote || opts.proHosted) {
    const pro = () => {
      if (!opts.licenseKey) throw new Error(MARKET_PRO_HELP);
      return new ProApi(f, apiBase2, opts.licenseKey);
    };
    const saveExports = async (r, outDir) => {
      if (opts.proHosted) {
        const links = await opts.proHosted.saveExports(r.exports);
        return r.markdown + "\n\n**Spreadsheets:** " + Object.entries(links).map(([n, u]) => `[${n}](${u})`).join(" \xB7 ");
      }
      const { mkdir: mkdir2, writeFile: writeFile2 } = await import("node:fs/promises");
      const { homedir: homedir3 } = await import("node:os");
      const { join: join3, resolve } = await import("node:path");
      const dir = resolve((outDir ?? join3(homedir3(), "Downloads", "alchemyagent-reports")).replace(/^~(?=\/)/, homedir3()));
      await mkdir2(dir, { recursive: true });
      const paths = [];
      for (const x of r.exports) {
        const pth = join3(dir, x.name);
        await writeFile2(pth, x.csv);
        paths.push(pth);
      }
      return r.markdown + "\n\n**Spreadsheets** (open in Excel or Google Sheets):\n" + paths.map((x) => `- ${x}`).join("\n");
    };
    const marketJobs = /* @__PURE__ */ new Map();
    const asJob = async (key, refresh, start, hostedKind) => {
      if (opts.proHosted && hostedKind) {
        await pro().call("report/run", { kind: hostedKind });
        const last = await pro().call(`report?kind=${hostedKind}`).catch(() => null);
        return `A full ${hostedKind === "ai" ? "AI visibility" : "rankings"} run is queued and will be ready within the hour (ask for latest_report then).` + (last?.report ? `

Meanwhile, the last report from ${last.report.date}:

${last.report.markdown}` : "");
      }
      let job = marketJobs.get(key);
      if (!job || job.error || refresh && job.md || job.md && Date.now() - job.started > 6 * 36e5) {
        const progress = { phase: "starting", done: 0, total: 0 };
        const j = { started: Date.now(), progress, promise: Promise.resolve("") };
        j.promise = start(progress).then((md) => j.md = md, (e) => {
          j.error = e instanceof Error ? e.message : String(e);
          throw e;
        });
        j.promise.catch(() => {
        });
        marketJobs.set(key, j);
        job = j;
      }
      await Promise.race([job.promise.catch(() => {
      }), new Promise((r) => setTimeout(r, 4e4))]);
      if (job.error) throw new Error(job.error);
      if (job.md) return job.md;
      return `Still running (${Math.round((Date.now() - job.started) / 1e3)} s): ${job.progress.phase}${job.progress.total ? ` ${job.progress.done} of ${job.progress.total}` : ""}. Call the tool again with the same inputs in about a minute to get the report.`;
    };
    const strList = external_exports.array(external_exports.string());
    const freshReport = async (kind, days) => {
      const r = await pro().call(`report?kind=${kind}`).catch(() => null);
      if (!r?.report || Date.now() - Date.parse(r.report.date) > days * 864e5) return null;
      return r.report.markdown + `

_Scheduled report from ${r.report.date}. Ask with refresh: true for a new run now._`;
    };
    register(
      "tracking_setup",
      {
        title: "Tracking setup (AI visibility and rankings)",
        description: "Show or save the account's tracking setup, shared by every AlchemyAgent app (Claude, ChatGPT, WordPress, Slack): site, brand_terms, topic_terms (what the business does; filters junk keywords), competitors (1-8 domains), rank_tracking groups (mode national, local with location, or map_pack with location + business_name) and ai_tracking (tier 25/50/100, cadence weekly/monthly, engines, clusters of prompts). Call with no fields to show it. Fields you pass are merged into the saved setup. Ask the user for modes and competitors; don't guess them.",
        inputSchema: {
          site: external_exports.string().optional(),
          brand_terms: strList.optional(),
          topic_terms: strList.optional(),
          competitors: strList.optional(),
          competitor_names: external_exports.record(external_exports.string(), strList).optional(),
          service_areas: strList.optional(),
          rank_tracking: external_exports.array(external_exports.object({ mode: external_exports.enum(MODES), keywords: strList, location: external_exports.string().optional(), business_name: external_exports.string().optional() })).optional(),
          ai_tracking: external_exports.object({
            tier: external_exports.union([external_exports.literal(25), external_exports.literal(50), external_exports.literal(100), external_exports.literal("unlimited")]),
            cadence: external_exports.enum(["weekly", "monthly"]).optional(),
            engines: external_exports.array(external_exports.enum(ENGINES)).optional(),
            clusters: external_exports.array(external_exports.object({ name: external_exports.string(), prompts: strList }))
          }).optional(),
          location_code: external_exports.number().int().optional().describe("Country (DataForSEO location code; US 2840)"),
          language_code: external_exports.string().optional(),
          schedule: external_exports.enum(["server", "off"]).optional().describe("server: AlchemyAgent runs AI visibility and rankings on their cadence and keeps the latest report ready in every app"),
          rank_cadence: external_exports.enum(["weekly", "monthly"]).optional(),
          notify: external_exports.object({ slack_webhook: external_exports.string().optional() }).optional().describe("Where the scheduled digest goes: a Slack incoming webhook URL")
        },
        annotations: { readOnlyHint: false, openWorldHint: true }
      },
      async (a) => run(async () => setupMarkdown(pro(), Object.fromEntries(Object.entries(a).filter(([, v]) => v !== void 0))))
    );
    register(
      "ai_visibility",
      {
        title: "AI visibility tracker (Starter/Pro)",
        description: "Run the account's AI prompt clusters through Google AI Overviews, Google AI Mode, ChatGPT, Gemini, Perplexity and Claude, and report per prompt and engine whether the brand is mentioned, whether its site is cited as a source, competitor share of voice (unbranded prompts), the sites AI cites instead, zero-presence prompts, change since the last run, and citation outreach targets (pages AI cites where the brand is missing). Writes spreadsheets. Prompts come from tracking_setup. A full run takes a few minutes: if it says it's still running, call it again with the same inputs.",
        inputSchema: {
          cluster: external_exports.string().optional().describe("Only this cluster"),
          engines: external_exports.array(external_exports.enum(ENGINES)).optional(),
          limit: external_exports.number().int().min(1).optional().describe("Only the first N prompts (quick test)"),
          refresh: external_exports.boolean().default(false),
          out_dir: external_exports.string().optional()
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => {
        if (!a.refresh && !a.cluster && !a.limit && !a.engines) {
          const md = await freshReport("ai", 7);
          if (md) return md;
        }
        const small = !!(a.limit && a.limit <= 5);
        return asJob(`ai:${a.cluster ?? ""}:${(a.engines ?? []).join(",")}:${a.limit ?? ""}`, a.refresh, async (progress) => saveExports(await runAiVisibility(pro(), { ...a, progress }), a.out_dir), small ? void 0 : "ai");
      })
    );
    register(
      "rank_tracking",
      {
        title: "Rank tracking: national, local, map pack (Starter/Pro)",
        description: "Check Google positions for the account's tracked keyword groups (tracking_setup): national (country), local (organic from a city) and map pack (Google Maps listing from a city), with whether an AI Overview shows and cites the site, each competitor's position, and change since the last check. Writes a spreadsheet. If it says it's still running, call it again.",
        inputSchema: { refresh: external_exports.boolean().default(false), out_dir: external_exports.string().optional() },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => {
        if (!a.refresh) {
          const md = await freshReport("rank", 7);
          if (md) return md;
        }
        return asJob("rank", a.refresh, async (progress) => saveExports(await runRanks(pro(), { progress }), a.out_dir), "rank");
      })
    );
    register(
      "keyword_gaps",
      {
        title: "Keyword gaps vs competitors (Pro)",
        description: "Keywords where the account's competitors rank on page one and the site isn't in the top 20, filtered to on-topic keywords for this business (other industries, cities, brands and languages removed), with volume, difficulty and intent. Writes a spreadsheet.",
        inputSchema: { competitors: strList.optional().describe("Override the saved competitors (up to 3 compared)"), top: external_exports.number().int().min(5).max(200).default(50), out_dir: external_exports.string().optional() },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => saveExports(await runGaps(pro(), a), a.out_dir))
    );
    register(
      "reach_keywords",
      {
        title: "Reach keywords: positions 50-100 (Pro)",
        description: "On-topic keywords the site already ranks 50-100 for, where Search Console shows almost nothing but Google already considers the page; easiest wins first, with the ranking page. Writes a spreadsheet.",
        inputSchema: { min_pos: external_exports.number().int().min(11).max(99).default(50), max_pos: external_exports.number().int().min(20).max(100).default(100), top: external_exports.number().int().min(5).max(200).default(60), out_dir: external_exports.string().optional() },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => saveExports(await runReach(pro(), a), a.out_dir))
    );
    register(
      "keyword_research",
      {
        title: "Keyword research in batches (Pro)",
        description: "Look up many keywords and whole keyword clusters at once: search volume, difficulty, intent and CPC for every keyword in one call, per-cluster totals, and optionally longer searches that contain them (junk filtered). Put the whole request in one call, never one call per keyword. Writes a spreadsheet.",
        inputSchema: {
          clusters: external_exports.record(external_exports.string(), strList).describe('{"Cluster name": ["keyword", ...]}; use {"Lookup": [...]} for a plain list'),
          expand: external_exports.boolean().default(false).describe("Also find longer searches containing each cluster's top keywords"),
          ideas: external_exports.number().int().min(10).max(200).default(100),
          min_volume: external_exports.number().int().min(0).default(10),
          out_dir: external_exports.string().optional()
        },
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async (a) => run(async () => saveExports(await runResearch(pro(), a), a.out_dir))
    );
    register(
      "latest_report",
      {
        title: "Latest scheduled report (AI visibility or rankings)",
        description: "Show the latest AI visibility or rankings report that AlchemyAgent ran on schedule for this account, with spreadsheet download links, or queue a fresh run (run_now) for the next scheduled tick (within the hour). Use this first when someone asks how they're doing this week.",
        inputSchema: { kind: external_exports.enum(["ai", "rank"]).default("ai"), run_now: external_exports.boolean().default(false) },
        annotations: { readOnlyHint: false, openWorldHint: true }
      },
      async (a) => run(async () => {
        if (a.run_now) {
          await pro().call("report/run", { kind: a.kind });
          return `Queued: a new ${a.kind === "ai" ? "AI visibility" : "rankings"} run starts within the hour. Ask for the latest report after that.`;
        }
        const r = await pro().call(`report?kind=${a.kind}`);
        if (!r.report) return `No scheduled ${a.kind === "ai" ? "AI visibility" : "rankings"} report yet.${r.queued ? " One is queued and runs within the hour." : " Turn on schedule: server in tracking_setup, or run it now with run_now."}${r.last_error ? `

Last error: ${r.last_error}` : ""}`;
        return r.report.markdown + (r.last_error ? `

The last scheduled attempt failed: ${r.last_error}` : "");
      })
    );
    register(
      "plan_usage",
      {
        title: "AlchemyAgent plan and usage",
        description: "Show the account's plan, this month's usage of AI visibility checks, rank checks and keyword data calls, and the limits.",
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: true }
      },
      async () => run(async () => {
        const u = await pro().call("usage");
        return [
          `# ${u.limits.label} plan \xB7 ${u.month}`,
          "",
          "| | Used | Included |",
          "|---|---:|---:|",
          `| AI visibility checks (prompt \xD7 engine) | ${u.used.ai_checks} | ${u.limits.ai_checks} |`,
          `| Rank checks | ${u.used.rank_checks} | ${u.limits.rank_checks} |`,
          `| Keyword data calls | ${u.used.labs_calls} | ${u.limits.labs_calls} |`,
          "",
          `AI visibility tier: up to ${u.limits.ai_tier ?? "unlimited"} prompts.`
        ].join("\n");
      })
    );
  }
  registerPrompts(server2, !!opts.remote, !opts.remote || !!opts.proHosted, !!opts.hostedData);
  return server2;
}

// src/telemetry.ts
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { join as join2 } from "node:path";
var OFF = /* @__PURE__ */ new Set(["0", "false", "off", "no"]);
function telemetryEnabled(env2) {
  const dnt = (env2.DO_NOT_TRACK ?? "").trim().toLowerCase();
  if (dnt && !OFF.has(dnt)) return false;
  return !OFF.has((env2.ALCHEMYAGENT_TELEMETRY ?? "").trim().toLowerCase());
}
function installId(dir = join2(homedir2(), ".alchemyagent")) {
  const file = join2(dir, "install-id");
  try {
    const id2 = readFileSync(file, "utf8").trim();
    if (/^[0-9a-f-]{36}$/.test(id2)) return id2;
  } catch {
  }
  const id = randomUUID();
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, id + "\n", { mode: 384 });
  } catch {
  }
  return id;
}
function makeTelemetry(o) {
  const f = o.fetchFn ?? fetch;
  let id = o.id;
  const client = /^[a-z_]{1,20}$/.test(o.client) ? o.client : "unknown";
  return (tool, ok) => {
    id ??= installId();
    const body = JSON.stringify({ id, v: o.version, c: client, tool, ok });
    f(`${o.apiBase}/api/telemetry`, { method: "POST", headers: { "content-type": "application/json" }, body, signal: AbortSignal.timeout(3e3) }).catch(() => {
    });
  };
}

// src/index.ts
var env = (k) => {
  const v = (process.env[k] || "").trim();
  return v && !v.startsWith("${") ? v : void 0;
};
var apiBase = (env("ALCHEMYAGENT_API_BASE") ?? DEFAULT_API_BASE).replace(/\/$/, "");
var telemetryEnv = { DO_NOT_TRACK: process.env.DO_NOT_TRACK, ALCHEMYAGENT_TELEMETRY: env("ALCHEMYAGENT_TELEMETRY") };
var track = telemetryEnabled(telemetryEnv) ? makeTelemetry({ apiBase, version: VERSION, client: env("ALCHEMYAGENT_CLIENT") ?? "unknown" }) : void 0;
var server = createServer({
  psiKey: env("ALCHEMYAGENT_PSI_KEY"),
  bingKey: env("ALCHEMYAGENT_BING_KEY"),
  braveKey: env("ALCHEMYAGENT_BRAVE_KEY"),
  cloudflareToken: env("ALCHEMYAGENT_CLOUDFLARE_TOKEN"),
  oprKey: env("ALCHEMYAGENT_OPR_KEY"),
  openalexKey: env("ALCHEMYAGENT_OPENALEX_KEY"),
  licenseKey: env("ALCHEMYAGENT_LICENSE_KEY"),
  gsc: { clientId: env("ALCHEMYAGENT_GOOGLE_CLIENT_ID"), clientSecret: env("ALCHEMYAGENT_GOOGLE_CLIENT_SECRET"), serviceAccountFile: env("ALCHEMYAGENT_GOOGLE_SA_FILE") },
  apiBase,
  track
});
await server.connect(new StdioServerTransport());
