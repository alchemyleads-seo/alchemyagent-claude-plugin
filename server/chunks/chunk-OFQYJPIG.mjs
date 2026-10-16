// AlchemyAgent for Claude. (c) AlchemyLeads. https://alchemyagent.ai
import {
  __export
} from "./chunk-UPBUYWNZ.mjs";

// src/gsc.ts
var gsc_exports = {};
__export(gsc_exports, {
  GA4_SCOPE: () => GA4_SCOPE,
  GSC_SETUP_HELP: () => GSC_SETUP_HELP,
  TOKEN_FILE: () => TOKEN_FILE,
  accessToken: () => accessToken,
  connectionStatus: () => connectionStatus,
  dateRange: () => dateRange,
  hasScope: () => hasScope,
  listSites: () => listSites,
  matchProperty: () => matchProperty,
  rowsMarkdown: () => rowsMarkdown,
  searchAnalytics: () => searchAnalytics,
  startConnect: () => startConnect
});
import { createServer } from "node:http";
import { createHash, createSign, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
var SCOPE = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";
var GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
var TOKEN_URL = "https://oauth2.googleapis.com/token";
var API = "https://searchconsole.googleapis.com/webmasters/v3";
var TOKEN_FILE = join(homedir(), ".alchemyagent", "google-token.json");
var GSC_SETUP_HELP = [
  "Search Console needs your own Google credentials (they stay on your computer and are only sent to Google). Pick one:",
  "",
  "**A. Sign in with Google (recommended)**",
  "1. In Google Cloud Console (https://console.cloud.google.com), create or pick a project and enable the **Google Search Console API** (and, for GA4, the **Google Analytics Data API** and **Google Analytics Admin API**).",
  "2. APIs & Services > OAuth consent screen: choose External, add your email as a test user.",
  "3. APIs & Services > Credentials > Create credentials > OAuth client ID > **Desktop app**.",
  "4. Paste the client ID and client secret into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure), then ask Claude to connect Search Console.",
  "",
  "**B. Service account**",
  "1. Create a service account in the same project, download its JSON key.",
  "2. In Search Console > Settings > Users and permissions, add the service account's email (Restricted is enough). For GA4: Admin > Property access management > add the same email as Viewer.",
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
var PAGE = (msg) => `<!doctype html><meta charset="utf-8"><title>AlchemyAgent</title><body style="font:16px system-ui;padding:40px;max-width:560px;margin:auto"><h2>AlchemyAgent</h2><p>${msg}</p></body>`;
async function startConnect(creds, f = fetch, open = openBrowser) {
  if (!creds.clientId || !creds.clientSecret) throw new Error(GSC_SETUP_HELP);
  if (pending) return { url: pending.url, alreadyPending: true };
  const verifier = b64url(randomBytes(32));
  const state = b64url(randomBytes(16));
  const server = createServer();
  await new Promise((res) => server.listen(0, "127.0.0.1", () => res()));
  const port = server.address().port;
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
      server.close();
      pending = null;
      reject(new Error("Sign-in timed out"));
    }, 10 * 60 * 1e3);
    server.on("request", async (req, res) => {
      const u = new URL(req.url ?? "/", redirect);
      if (u.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const finish = (code, msg) => {
        res.writeHead(code, { "content-type": "text/html; charset=utf-8" }).end(PAGE(msg));
        clearTimeout(timer);
        server.close();
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
        finish(200, "Google is connected (Search Console and GA4, read-only). You can close this tab and go back to Claude.");
        resolve2("ok");
      } catch (e) {
        finish(500, "Couldn't finish sign-in. Go back to Claude and try again.");
        reject(e);
      }
    });
  });
  done.catch(() => {
  });
  pending = { server, url, done };
  open(url);
  return { url, alreadyPending: false };
}
async function hasScope(creds, scope) {
  if (creds.serviceAccountFile) return true;
  const saved = await loadSaved();
  return !!saved && saved.client_id === creds.clientId && saved.scope.split(" ").includes(scope);
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
  const host2 = input.replace(/^sc-domain:/, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").toLowerCase();
  return sites.find((s) => s.siteUrl === `sc-domain:${host2}`)?.siteUrl ?? sites.find((s) => s.siteUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "") === host2)?.siteUrl ?? null;
}
var ymd = (d) => d.toISOString().slice(0, 10);
function dateRange(days, endOffset = 2) {
  const end = new Date(Date.now() - endOffset * 864e5);
  return { startDate: ymd(new Date(end.getTime() - (days - 1) * 864e5)), endDate: ymd(end) };
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

// src/cflogs.ts
var cflogs_exports = {};
__export(cflogs_exports, {
  CF_TOKEN_HELP: () => CF_TOKEN_HELP,
  CfError: () => CfError,
  findZone: () => findZone,
  hostOf: () => hostOf,
  logMarkdown: () => logMarkdown,
  logReport: () => logReport,
  matchBot: () => matchBot
});

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
function hostOf(input) {
  try {
    return new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`).hostname.toLowerCase();
  } catch {
    return input.toLowerCase();
  }
}
async function findZone(f, token, input) {
  const parts = hostOf(input).replace(/^www\./, "").split(".");
  for (let i = 0; i < parts.length - 1; i++) {
    const name = parts.slice(i).join(".");
    const body = await cf(f, token, `/zones?name=${encodeURIComponent(name)}`);
    const z = body.result?.[0];
    if (z) return { id: z.id, name: z.name, plan: z.plan?.name ?? "", accountId: z.account?.id ?? "" };
  }
  throw new CfError(`No Cloudflare zone for ${hostOf(input)} is visible to this token. Check the domain is on Cloudflare and the token includes that zone.`);
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
  const host2 = hostOf(input);
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
    const n5 = Number(row.count) || 0;
    const ua = String(row.dimensions?.userAgent ?? "");
    const cat = String(row.dimensions?.verifiedBotCategory ?? "");
    const st = Number(row.dimensions?.edgeResponseStatus) || 0;
    htmlSampled += n5;
    const tok = matchBot(ua);
    if (!tok) {
      if (!cat && /^Mozilla\/5\.0 \(/.test(ua) && /AppleWebKit|Gecko\//.test(ua) && !/bot|crawl|spider|headless|preview/i.test(ua) && st < 400) browserHtml += n5;
      continue;
    }
    const p = PATTERNS.find((x) => x.token === tok);
    const s = stats.get(tok) ?? { token: tok, owner: p.owner, purpose: p.purpose, requests: 0, verified: 0, served: 0, blocked: 0, verifiedBlocked: 0, verifiedServed: 0 };
    s.requests += n5;
    if (cat) s.verified += n5;
    if (st > 0 && st < 400) {
      s.served += n5;
      if (cat) s.verifiedServed += n5;
    }
    if (BLOCKED(st)) {
      s.blocked += n5;
      if (cat) s.verifiedBlocked += n5;
    }
    stats.set(tok, s);
  }
  let rum = null, rumNote;
  if (zone.accountId) {
    const s = iso(new Date(now.getTime() - used * 864e5));
    const r = await gql(f, token, `{viewer{accounts(filter:{accountTag:"${zone.accountId}"}){rumPageloadEventsAdaptiveGroups(limit:1,filter:{datetime_geq:"${s}",datetime_lt:"${iso(now)}",requestHost:"${host2}"}){count sum{visits}}}}}`).catch(() => ({ error: "unavailable" }));
    const g = r.data?.viewer?.accounts?.[0]?.rumPageloadEventsAdaptiveGroups?.[0];
    if (g && (Number(g.count) || Number(g.sum?.visits))) rum = { visits: Number(g.sum?.visits) || 0, pageloads: Number(g.count) || 0 };
    else rumNote = r.error ? "Cloudflare Web Analytics wasn't readable with this token (add Account > Account Analytics > Read)." : `Cloudflare Web Analytics has no data for ${host2} (it's off or uses a different hostname).`;
  }
  const num = (x) => Number(x?.[0]?.count) || 0;
  return {
    zone,
    host: host2,
    days: used,
    requested: days,
    from: iso(new Date(now.getTime() - used * 864e5)).slice(0, 10),
    to: iso(now).slice(0, 10),
    total: num(base.total),
    html: num(base.html),
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
var entitymap_exports = {};
__export(entitymap_exports, {
  checkHtml: () => checkHtml,
  entitymapCheck: () => entitymapCheck,
  entitymapMarkdown: () => entitymapMarkdown,
  validateEntityMap: () => validateEntityMap
});
var UA = "Mozilla/5.0 (compatible; AlchemyAgent/0.3; +https://alchemyagent.ai)";
var CORE_TYPES = /* @__PURE__ */ new Set(["Concept", "ProprietaryTerm", "Methodology", "Metric", "Taxonomy", "Person", "Organization", "SoftwareProduct", "PhysicalProduct", "Service", "Platform", "Place", "Event", "Standard", "Regulation"]);
var TIER1 = ["INSTANCE_OF", "PART_OF", "INCLUDES", "DEPENDS_ON", "REQUIRES", "MEASURES", "PRODUCED_BY", "REGULATED_BY", "AUTHORED_BY", "AFFILIATED_WITH", "COVERS"];
var TIER2 = ["RELATES_TO", "PRECEDES", "ENABLES", "PREVENTS", "CONFLICTS_WITH", "DESCRIBED_BY", "OFFERS"];
var TIER3 = ["IMPROVES", "DEGRADES", "LEADS_TO", "SUITED_FOR", "TARGETS", "ACHIEVES"];
var STANDARD = /* @__PURE__ */ new Set([...TIER1, ...TIER2, ...TIER3]);
var STATUSES = /* @__PURE__ */ new Set(["self-declared", "generator-draft", "third-party-verified"]);
var str = (v) => typeof v === "string" && v.trim().length > 0;
var host = (u) => {
  try {
    return new URL(u).hostname.toLowerCase();
  } catch {
    return "";
  }
};
function validateEntityMap(doc, now = Date.now()) {
  const issues = [];
  const err = (path, msg) => issues.push({ level: "error", path, msg });
  const warn = (path, msg) => issues.push({ level: "warning", path, msg });
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
    else if (m[1].toLowerCase() !== host(String(pub?.url ?? ""))) err("certification.url", `Domain segment ${m[1]} doesn't match publisher.url's hostname.`);
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
async function get(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  try {
    const r = await f(url, { headers: { "user-agent": UA, accept: "application/json, text/html;q=0.9" }, redirect: "follow", signal: ctl.signal });
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
    const r = await get(f, jsonUrl);
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
    const h = await get(f, `${origin}/entitymap.html`);
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
var images_exports = {};
__export(images_exports, {
  extractImages: () => extractImages,
  imageAudit: () => imageAudit,
  imageMarkdown: () => imageMarkdown
});
var UA2 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 AlchemyAgent/0.3";
var KB = 1024;
var attr = (tag, name) => {
  const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
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
  let n5 = 0;
  for (const m of body.matchAll(/<(img|source|video)\b[^>]*>/gi)) {
    const tag = m[0], name = m[1].toLowerCase();
    if (name === "img") {
      const src = attr(tag, "data-lazy-src") || attr(tag, "data-src") || attr(tag, "src") || "";
      add({ url: abs(src), kind: "img", index: n5++, alt: attr(tag, "alt"), width: attr(tag, "width"), height: attr(tag, "height"), loading: attr(tag, "loading") ?? (attr(tag, "data-src") || attr(tag, "data-lazy-src") ? "lazy" : null), fetchpriority: attr(tag, "fetchpriority"), srcset: !!(attr(tag, "srcset") || attr(tag, "data-srcset")) });
    } else if (name === "source") {
      const ss = attr(tag, "srcset") || attr(tag, "data-srcset");
      const src = attr(tag, "src");
      if (src && /video|mp4|webm/i.test(attr(tag, "type") ?? src)) add({ url: abs(src), kind: "video", index: n5++, srcset: false });
      else if (ss) add({ url: abs(ss.split(",")[0].trim().split(/\s+/)[0]), kind: "source", index: n5++, srcset: true });
    } else {
      const poster = attr(tag, "poster");
      const autoplay = /\sautoplay\b/i.test(tag);
      const src = attr(tag, "src");
      if (poster) add({ url: abs(poster), kind: "poster", index: n5++, srcset: false });
      if (src) add({ url: abs(src), kind: "video", index: n5++, srcset: false, autoplay, hasPoster: !!poster });
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
    const res = await f(img.url, { method: img.kind === "video" ? "HEAD" : "GET", headers: { "user-agent": UA2, accept: "image/avif,image/webp,image/*,*/*;q=0.8" }, redirect: "follow", signal: ctl.signal });
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
var fmt = (b) => b == null ? "?" : b >= KB * KB ? `${(b / KB / KB).toFixed(1)} MB` : `${Math.round(b / KB)} KB`;
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
    res = await f(url, { headers: { "user-agent": UA2, accept: "text/html" }, redirect: "follow" });
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
    (i) => `${short(i.url)}: ${fmt(i.bytes)} (${fmt(i.embeddedRasterBytes)} of embedded raster)`
  );
  const first = page.find((i) => i.kind === "img");
  if (first && first.loading === "lazy") findings.push({ severity: 1, title: "The first image is lazy-loaded", detail: 'The first image is usually the hero and the Largest Contentful Paint element. Lazy-loading it delays LCP. Use loading="eager" and fetchpriority="high" on it.', items: [short(first.url)] });
  push(1, "Autoplay videos without a poster image", "Without a poster, the browser shows nothing until the video downloads, and the video itself becomes the LCP element. Add a lightweight WebP poster.", images.filter((i) => i.kind === "video" && i.autoplay && !i.hasPoster), (i) => i.url ? `${short(i.url)}${i.bytes ? ` (${fmt(i.bytes)})` : ""}` : "inline <video> with no src");
  push(2, "Heavy images (over 200 KB)", "Resize to the largest size the layout actually shows (usually under 2000 px wide) and compress. Most photos land under 150 KB as WebP.", page.filter((i) => (i.bytes ?? 0) > 200 * KB && !i.embeddedRasterBytes).sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0)), (i) => `${short(i.url)}: ${fmt(i.bytes)}`);
  push(2, "JPG, PNG or GIF that should be WebP or AVIF", "WebP is typically 25\u201335% smaller than JPEG at the same quality, and every current browser supports it.", page.filter((i) => /image\/(jpeg|png|gif)/.test(i.type ?? "") && (i.bytes ?? 0) > 50 * KB), (i) => `${short(i.url)} (${i.type?.replace("image/", "")}, ${fmt(i.bytes)})`);
  push(2, "Large images without srcset", "Phones download the full desktop file. Add srcset and sizes so each device gets a right-sized version (WordPress does this automatically for images inserted from the media library).", page.filter((i) => i.kind === "img" && !i.srcset && (i.bytes ?? 0) > 100 * KB && !/svg/.test(i.type ?? "")), (i) => `${short(i.url)}: ${fmt(i.bytes)}`);
  push(3, "Missing width and height", "Without dimensions the layout jumps as images load (Cumulative Layout Shift).", page.filter((i) => i.kind === "img" && (!i.width || !i.height)), (i) => short(i.url));
  push(3, "Below-the-fold images not lazy-loaded", `Images after the first few should use loading="lazy" so they don't compete with the hero.`, page.filter((i) => i.kind === "img" && i.index > 3 && i.loading !== "lazy"), (i) => short(i.url));
  push(3, "Missing alt text", 'Alt text is how screen readers and AI systems understand an image. Describe what it shows; use alt="" only for decoration.', page.filter((i) => i.kind === "img" && i.alt == null), (i) => short(i.url));
  push(3, "Broken images", "These image URLs didn't load.", images.filter((i) => i.url && i.status != null && i.status !== 0 && i.status >= 400), (i) => `${short(i.url)} (HTTP ${i.status})`);
  const og = images.find((i) => i.kind === "og");
  if (!og) findings.push({ severity: 3, title: "No og:image", detail: "Links shared in Slack, LinkedIn and chat apps show no preview image. Add a 1200x630 og:image.", items: [] });
  else if ((og.bytes ?? 0) > 600 * KB) findings.push({ severity: 3, title: "Heavy share image", detail: "Some platforms skip og:images over a few hundred KB or time out fetching them.", items: [`${short(og.url)}: ${fmt(og.bytes)}`] });
  findings.sort((a, b) => a.severity - b.severity);
  return { url: res.url || url, status: res.status, images, totalBytes, findings };
}
function imageMarkdown(a, maxItems = 8) {
  const L = [`# Image audit: ${a.url}`, ""];
  const imgs = a.images.filter((i) => i.kind !== "og" && i.kind !== "video" && i.status !== -1);
  const biggest = [...imgs].sort((x, y) => (y.bytes ?? 0) - (x.bytes ?? 0))[0];
  L.push(`- ${imgs.length} images found in the HTML, ${fmt(a.totalBytes)} in total${biggest?.bytes ? `; the largest is ${short(biggest.url)} at ${fmt(biggest.bytes)}` : ""}`);
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
var featured_exports = {};
__export(featured_exports, {
  CREDIT: () => CREDIT,
  addPngText: () => addPngText,
  featuredHtml: () => featuredHtml,
  findChrome: () => findChrome,
  renderFeatured: () => renderFeatured
});
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir as mkdir2, readFile as readFile2, writeFile as writeFile2 } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { join as join2, resolve } from "node:path";
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var fmt2 = (v) => Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 1 });
var font = (f) => f.trim().replace(/ /g, "+");
function cardHtml(c, accent) {
  const title = c.title ? `<h3>${esc(c.title)}</h3>` : "";
  const foot = (f) => f ? `<div class="foot"><span class="big" style="color:${accent}">${esc(f.value)}</span><span>${esc(f.text)}</span></div>` : "";
  if (c.type === "bars") {
    const max = Math.max(...c.rows.map((r) => r.value), 1);
    const colors = [accent, "#f98600", "#e8e8e8", "#9ad1ff", "#b9f6ca"];
    const dense = c.rows.length + (c.footer ? 1 : 0) >= 5;
    return title + c.rows.slice(0, 5).map((r, i) => `<div class="bar${dense ? " dense" : ""}"><div class="bl"><span><b>${esc(r.label)}</b>${r.note ? ` <i>\xB7 ${esc(r.note)}</i>` : ""}</span><b class="num">${fmt2(r.value)}</b></div><div class="track"><div style="width:${Math.max(r.value / max * 100, 1.6).toFixed(1)}%;background:${colors[i % colors.length]}"></div></div></div>`).join("") + foot(c.footer);
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
    const svg = await readFile2(resolve(s.logoSvg.replace(/^~(?=\/)/, homedir2())), "utf8");
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
  for (let n5 = 0; n5 < 256; n5++) {
    let c = n5;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n5] = c >>> 0;
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
  const dir = resolve((outDir ?? join2(homedir2(), "Downloads", "alchemyagent-images")).replace(/^~(?=\/)/, homedir2()));
  await mkdir2(dir, { recursive: true });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "featured";
  const html = join2(dir, `${slug}.html`), png = join2(dir, `${slug}.png`);
  await writeFile2(html, await featuredHtml(spec), "utf8");
  const chrome = findChrome();
  if (!chrome) return { html, note: "No Chrome, Edge, Chromium or Brave found, so only the HTML was written. Open it in a browser at 1200x630 and screenshot it, or install Chrome and run again." };
  await new Promise((ok) => execFile(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=1200,630", "--virtual-time-budget=5000", `--screenshot=${png}`, `file://${html}`], { timeout: 6e4 }, () => ok()));
  if (!existsSync(png)) return { html, note: `Chrome didn't produce a screenshot. The HTML is at ${html}.` };
  if (credit) await writeFile2(png, addPngText(await readFile2(png), CREDIT));
  return { html, png };
}

// src/connections.ts
var connections_exports = {};
__export(connections_exports, {
  connState: () => connState,
  connectionsMarkdown: () => connectionsMarkdown
});
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
      !!s.ga4 && (s.gscServiceAccount || s.gscOAuth && s.gscSignedIn),
      "Sessions, key events and revenue by channel and landing page, including AI-assistant referrals (ga4_report). Pair it with log_file_analysis to see what analytics misses.",
      s.gscOAuth && s.gscSignedIn ? 'Your Google sign-in predates GA4 support. Enable the Google Analytics Data API and Admin API in your Google Cloud project, then ask Claude to "connect Google" again (gsc_connect) and approve Analytics.' : `Uses the same Google setup as Search Console: enable the Google Analytics Data API and Admin API in your Google Cloud project, then connect Google. A service account needs Viewer access in GA4 (Admin > Property access management). ${SETTINGS}`
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
  const next = rows.find((r) => !r[1]);
  if (next) L.push(`**Start with:** ${next[0]}.`);
  return L.join("\n").trimEnd();
}

// src/ga4.ts
var ga4_exports = {};
__export(ga4_exports, {
  AI_SOURCE: () => AI_SOURCE,
  GA4_HELP: () => GA4_HELP,
  ga4Markdown: () => ga4Markdown,
  ga4Report: () => ga4Report,
  listProperties: () => listProperties,
  matchGa4: () => matchGa4,
  propertiesMarkdown: () => propertiesMarkdown
});
var DATA = "https://analyticsdata.googleapis.com/v1beta";
var ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
var AI_SOURCE = /chatgpt|openai|perplexity|claude\.ai|anthropic|gemini\.google|bard\.google|copilot|bing\.com\/chat|(^|[./])you\.com|phind|meta\.ai|deepseek|grok|(^|[./])x\.ai\b|mistral|poe\.com|kagi|chat\.qwen|doubao|kimi\.|manus\.im/i;
var GA4_HELP = "GA4 uses the same Google sign-in as Search Console. In your Google Cloud project, enable the Google Analytics Data API and the Google Analytics Admin API, then ask Claude to connect Google (gsc_connect) so the sign-in includes Analytics. With a service account instead, add its email as a Viewer in GA4 (Admin > Property access management).";
async function call(creds, f, url, body) {
  if (creds.clientId && !creds.serviceAccountFile && !await hasScope(creds, GA4_SCOPE))
    throw new Error("Your Google sign-in only covers Search Console. Run gsc_connect once more and approve Analytics (read-only) too. " + GA4_HELP);
  const token = await accessToken(creds, f);
  const r = await f(url, { method: body ? "POST" : "GET", headers: { authorization: `Bearer ${token}`, "content-type": "application/json" }, body: body ? JSON.stringify(body) : void 0 });
  const out = await r.json().catch(() => ({}));
  const msg = String(out.error?.message ?? "");
  if (r.status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(msg + JSON.stringify(out.error?.details ?? ""))) throw new Error(`The Google Analytics API isn't enabled in your Google Cloud project. ${GA4_HELP}`);
  if (r.status === 403) throw new Error(`Google says this account can't read that GA4 property (${msg || "403"}). Check the property with ga4_report and no property, which lists the ones you can read.`);
  if (!r.ok) throw new Error(`GA4 API error ${r.status}: ${msg}`);
  return out;
}
async function listProperties(creds, f = fetch) {
  const out = [];
  let page = "";
  do {
    const j = await call(creds, f, `${ADMIN}/accountSummaries?pageSize=200${page ? `&pageToken=${encodeURIComponent(page)}` : ""}`);
    for (const a of j.accountSummaries ?? []) for (const p of a.propertySummaries ?? []) out.push({ id: String(p.property ?? "").replace("properties/", ""), name: String(p.displayName ?? ""), account: String(a.displayName ?? "") });
    page = j.nextPageToken ?? "";
  } while (page);
  return out;
}
function matchGa4(props, input) {
  const s = input.trim().toLowerCase().replace(/^properties\//, "");
  const host2 = s.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return props.find((p) => p.id === s) ?? props.find((p) => p.name.toLowerCase() === s) ?? props.find((p) => host2 && p.name.toLowerCase().replace(/^www\./, "").includes(host2)) ?? null;
}
var DIM = { channel: "sessionDefaultChannelGroup", landing_page: "landingPagePlusQueryString", source: "sessionSource", ai_assistants: "sessionSource" };
var METRICS = ["sessions", "engagedSessions", "keyEvents", "totalRevenue"];
var iso2 = (d) => d.toISOString().slice(0, 10);
async function ga4Report(creds, property, by, days, f = fetch, now = /* @__PURE__ */ new Date()) {
  const end = new Date(now.getTime() - 864e5);
  const start = new Date(end.getTime() - (days - 1) * 864e5);
  const pEnd = new Date(start.getTime() - 864e5), pStart = new Date(pEnd.getTime() - (days - 1) * 864e5);
  const body = {
    dateRanges: [{ startDate: iso2(start), endDate: iso2(end), name: "cur" }, { startDate: iso2(pStart), endDate: iso2(pEnd), name: "prev" }],
    dimensions: [{ name: DIM[by] }],
    metrics: METRICS.map((name) => ({ name })),
    limit: 1e4,
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }]
  };
  const j = await call(creds, f, `${DATA}/properties/${property.id}:runReport`, body);
  const cur = /* @__PURE__ */ new Map(), prev = /* @__PURE__ */ new Map();
  const zero = (key) => ({ key, sessions: 0, engaged: 0, keyEvents: 0, revenue: 0 });
  for (const r of j.rows ?? []) {
    const key = String(r.dimensionValues?.[0]?.value ?? "(not set)");
    const range = String(r.dimensionValues?.[1]?.value ?? "cur");
    const m = (r.metricValues ?? []).map((v) => Number(v.value) || 0);
    if (range === "prev") {
      const p = prev.get(key) ?? { sessions: 0, keyEvents: 0 };
      p.sessions += m[0];
      p.keyEvents += m[2];
      prev.set(key, p);
      continue;
    }
    const c = cur.get(key) ?? zero(key);
    c.sessions += m[0];
    c.engaged += m[1];
    c.keyEvents += m[2];
    c.revenue += m[3];
    cur.set(key, c);
  }
  let rows = [...cur.values()].map((r) => ({ ...r, prev: prev.get(r.key) ?? { sessions: 0, keyEvents: 0 } }));
  const sum = (xs) => xs.reduce((a, r) => ({ ...a, sessions: a.sessions + r.sessions, engaged: a.engaged + r.engaged, keyEvents: a.keyEvents + r.keyEvents, revenue: a.revenue + r.revenue }), zero("Total"));
  const totals = sum(rows);
  const pt = [...prev.values()].reduce((a, p) => ({ ...a, sessions: a.sessions + p.sessions, keyEvents: a.keyEvents + p.keyEvents }), zero("Previous"));
  if (by === "ai_assistants") rows = rows.filter((r) => AI_SOURCE.test(r.key));
  rows.sort((a, b) => b.sessions - a.sessions);
  return { property, by, days, range: `${iso2(start)} to ${iso2(end)}`, rows, totals, prevTotals: pt };
}
var n3 = (x) => Math.round(x).toLocaleString("en-US");
var delta = (a, b) => b ? `${a >= b ? "+" : ""}${Math.round((a - b) / b * 100)}%` : a ? "new" : "\u2013";
function ga4Markdown(r, limit = 20) {
  const label = { channel: "channel", landing_page: "landing page", source: "source", ai_assistants: "AI assistant referrals" }[r.by];
  const L = [`# GA4: ${r.property.name} by ${label}`, "", `Property ${r.property.id}, ${r.range} (${r.days} days), compared with the ${r.days} days before.`, ""];
  L.push(`- Sessions: ${n3(r.totals.sessions)} (${delta(r.totals.sessions, r.prevTotals.sessions)}), engaged ${n3(r.totals.engaged)} (${r.totals.sessions ? Math.round(r.totals.engaged / r.totals.sessions * 100) : 0}%)`);
  L.push(`- Key events: ${n3(r.totals.keyEvents)} (${delta(r.totals.keyEvents, r.prevTotals.keyEvents)})${r.totals.revenue ? `, revenue ${n3(r.totals.revenue)}` : ""}`);
  if (r.by === "ai_assistants") {
    const ai = r.rows.reduce((a, x) => a + x.sessions, 0), aiPrev = r.rows.reduce((a, x) => a + (x.prev?.sessions ?? 0), 0);
    L.push(`- From AI assistants: ${n3(ai)} sessions (${r.totals.sessions ? (ai / r.totals.sessions * 100).toFixed(1) : "0"}% of all), ${delta(ai, aiPrev)} vs before`);
    L.push("", "Many AI clicks arrive with no referrer and land in Direct, so this is a floor. Server logs (log_file_analysis) show the AI crawlers and assistants that never appear here.");
  }
  L.push("");
  if (!r.rows.length) {
    L.push(r.by === "ai_assistants" ? "No sessions from AI assistant referrers in this period." : "No data in this period.");
    return L.join("\n");
  }
  L.push(`| ${label[0].toUpperCase() + label.slice(1)} | Sessions | vs before | Engaged | Key events |${r.totals.revenue ? " Revenue |" : ""}`, `|---|---:|---:|---:|---:|${r.totals.revenue ? "---:|" : ""}`);
  for (const x of r.rows.slice(0, limit)) L.push(`| ${x.key.replace(/\|/g, "\\|").slice(0, 90)} | ${n3(x.sessions)} | ${delta(x.sessions, x.prev?.sessions ?? 0)} | ${x.sessions ? Math.round(x.engaged / x.sessions * 100) : 0}% | ${n3(x.keyEvents)} |${r.totals.revenue ? ` ${n3(x.revenue)} |` : ""}`);
  if (r.rows.length > limit) L.push("", `\u2026and ${r.rows.length - limit} more rows.`);
  L.push("", "Data: Google Analytics Data API. GA4 only counts visitors who run the tag and accept analytics cookies.");
  return L.join("\n");
}
function propertiesMarkdown(props) {
  if (!props.length) return "No GA4 properties are visible to this Google account. Make sure the account (or service account email) has at least Viewer access in GA4 > Admin > Property access management.";
  return ["# GA4 properties you can read", "", "| Property | ID | Account |", "|---|---|---|", ...props.map((p) => `| ${p.name} | ${p.id} | ${p.account} |`), "", "Call ga4_report with one of these (name or ID)."].join("\n");
}

// src/bing.ts
var bing_exports = {};
__export(bing_exports, {
  BING_KEY_HELP: () => BING_KEY_HELP,
  BingError: () => BingError,
  bingDate: () => bingDate,
  bingMarkdown: () => bingMarkdown,
  bingReport: () => bingReport,
  listSites: () => listSites2,
  matchSite: () => matchSite,
  sitesMarkdown: () => sitesMarkdown
});
var BASE = "https://ssl.bing.com/webmaster/api.svc/json/";
var BING_KEY_HELP = "Bing Webmaster Tools needs your own API key. In Bing Webmaster Tools (https://www.bing.com/webmasters), open Settings (the gear) > API access > API key, generate a key, then paste it into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure). The key stays on your computer and is only sent to Bing.";
var BingError = class extends Error {
};
async function call2(f, key, method, params = {}) {
  const q = new URLSearchParams({ ...params, apikey: key });
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  let res;
  try {
    res = await f(`${BASE}${method}?${q}`, { headers: { accept: "application/json" }, signal: ctl.signal });
  } catch {
    throw new BingError(`Couldn't reach the Bing Webmaster API (${method}). Try again in a minute.`);
  } finally {
    clearTimeout(t);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body || body.ErrorCode) {
    const msg = body?.Message ? String(body.Message) : `HTTP ${res.status}`;
    if (res.status === 401 || /api ?key|unauthori[sz]ed|InvalidApiKey/i.test(msg)) throw new BingError(`Bing rejected the API key (${msg}). ${BING_KEY_HELP}`);
    throw new BingError(`Bing Webmaster API ${method} failed: ${msg}`);
  }
  return body.d;
}
function bingDate(v) {
  const m = /\/Date\((-?\d+)/.exec(String(v ?? ""));
  return m ? new Date(Number(m[1])).toISOString().slice(0, 10) : "";
}
async function listSites2(f, key) {
  const d = await call2(f, key, "GetUserSites") ?? [];
  return d.map((s) => ({ url: String(s.Url), verified: !!s.IsVerified }));
}
function matchSite(sites, input) {
  const host2 = (u) => {
    try {
      return new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "";
    }
  };
  const want = host2(input);
  return sites.find((s) => s.url.replace(/\/$/, "") === input.replace(/\/$/, "")) ?? sites.find((s) => host2(s.url) === want) ?? null;
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
    want.has("traffic") ? call2(f, key, "GetRankAndTrafficStats", p) : null,
    want.has("queries") ? call2(f, key, "GetQueryStats", p) : null,
    want.has("pages") ? call2(f, key, "GetPageStats", p) : null,
    want.has("crawl") ? call2(f, key, "GetCrawlStats", p) : null,
    want.has("crawl") ? call2(f, key, "GetUrlSubmissionQuota", p).catch(() => null) : null
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
var n4 = (v) => v.toLocaleString("en-US");
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
      `| Clicks | ${n4(a.clicks)} | ${n4(b.clicks)} | ${pct2(a.clicks, b.clicks)} |`,
      `| Impressions | ${n4(a.impressions)} | ${n4(b.impressions)} | ${pct2(a.impressions, b.impressions)} |`,
      `| CTR | ${a.impressions ? (a.clicks / a.impressions * 100).toFixed(1) + "%" : "n/a"} | ${b.impressions ? (b.clicks / b.impressions * 100).toFixed(1) + "%" : "n/a"} | |`,
      "",
      `Data through ${r.traffic.to || "n/a"}. Bing's index also feeds Microsoft Copilot and several other search and AI tools, so it matters beyond bing.com.`,
      ""
    );
  }
  const table = (title, agg, label) => {
    L.push(`### ${title}`, agg.from ? `${agg.from} to ${agg.to}, ${n4(agg.rows.length)} ${label.toLowerCase()}s` : "", "");
    if (!agg.rows.length) {
      L.push("No data yet. New sites can take a few days to show data.", "");
      return;
    }
    L.push(`| ${label} | Clicks | Impressions | CTR | Avg position |`, "|---|---|---|---|---|");
    for (const q of agg.rows.slice(0, limit)) {
      L.push(`| ${q.key.replace(/\|/g, "\\|")} | ${n4(q.clicks)} | ${n4(q.impressions)} | ${q.impressions ? (q.clicks / q.impressions * 100).toFixed(1) + "%" : ""} | ${q.position ? q.position.toFixed(1) : ""} |`);
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
      L.push(`Latest day (${c.date}): **${n4(c.inIndex)} pages in Bing's index**, ${n4(c.crawled)} crawled, ${n4(c.errors)} crawl errors (${n4(c.c4xx)} 4xx, ${n4(c.c5xx)} 5xx), ${n4(c.robotsBlocked)} blocked by robots.txt, ${n4(c.inLinks)} inbound links.`);
      if (c.c5xx > 0) L.push("", "5xx errors mean Bingbot is hitting server errors or a firewall. Check that your CDN/WAF isn't challenging Bingbot.");
    }
    if (r.quota) L.push("", `URL submission quota: ${n4(r.quota.daily)} today, ${n4(r.quota.monthly)} this month. (IndexNow pings don't use this quota.)`);
    L.push("");
  }
  return L.join("\n").trimEnd();
}

export {
  BOTS,
  GA4_SCOPE,
  TOKEN_FILE,
  startConnect,
  hasScope,
  connectionStatus,
  listSites,
  matchProperty,
  dateRange,
  searchAnalytics,
  rowsMarkdown,
  gsc_exports,
  CF_TOKEN_HELP,
  logReport,
  logMarkdown,
  cflogs_exports,
  entitymapCheck,
  entitymapMarkdown,
  entitymap_exports,
  imageAudit,
  imageMarkdown,
  images_exports,
  renderFeatured,
  featured_exports,
  connState,
  connectionsMarkdown,
  connections_exports,
  listProperties,
  matchGa4,
  ga4Report,
  ga4Markdown,
  propertiesMarkdown,
  ga4_exports,
  BING_KEY_HELP,
  listSites2,
  matchSite,
  bingReport,
  sitesMarkdown,
  bingMarkdown,
  bing_exports
};
