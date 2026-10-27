// AlchemyAgent for Claude. (c) AlchemyLeads. https://alchemyagent.ai
import {
  __export
} from "./chunk-UPBUYWNZ.mjs";

// src/links.ts
var links_exports = {};
__export(links_exports, {
  LINKS_UA: () => LINKS_UA,
  bestSentence: () => bestSentence,
  bodyText: () => bodyText,
  buildPlan: () => buildPlan,
  crawl: () => crawl,
  extractLinks: () => extractLinks,
  linksMarkdown: () => linksMarkdown,
  norm: () => norm,
  pagerank: () => pagerank,
  paragraphs: () => paragraphs,
  resolveTargets: () => resolveTargets,
  runLinks: () => runLinks,
  saveLinkFiles: () => saveLinkFiles,
  sitemapUrls: () => sitemapUrls,
  tokens: () => tokens
});
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve as resolvePath } from "node:path";

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
    const text2 = await r.text().catch(() => "");
    return { status: r.status, headers: r.headers, text: text2, url: r.url || url };
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
    const tag = m[0];
    const name = tag.match(/\bname\s*=\s*["']?([^"'\s>]+)/i)?.[1]?.toLowerCase();
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
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
  const sitemapUrls2 = robots.sitemaps.length ? robots.sitemaps.slice(0, 5) : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const sitemaps = await Promise.all(sitemapUrls2.map(async (u) => {
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
  const googleToo = probeIssues.some((p) => /^Googlebot$/i.test(p.token)) && probeIssues.length >= 3;
  if (googleToo) out.push(`- Likely a false alarm: our Googlebot-named probe was challenged too, and sites that block the real Googlebot drop out of Google. This pattern means the CDN blocks impostors (requests that use a bot's name from the wrong IPs) while letting verified crawlers through. Treat the probe result below as low priority unless the CDN's logs show verified AI crawlers being challenged.`);
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

// src/links.ts
var LINKS_UA = "Mozilla/5.0 (compatible; AlchemyAgent/0.3; +https://alchemyagent.ai)";
var STOP = new Set("a an and are as at be by can do for from how i in is it of on or our the to vs what when where which who why with you your best top near me 2024 2025 2026".split(" "));
var GENERIC_TOPIC = new Set("seo services service agency agencies company companies marketing digital google online business strategy strategies guide tips tools free cost".split(" "));
var GENERIC = /^(read more|read story|read the story|learn more|click here|here|more|this|link|this page|see more|find out more|continue reading|details|view|view more)$/i;
var UTILITY = /^\/(call|contact[^/]*|book[^/]*|privacy[^/]*|terms[^/]*|legal|disclaimer|[^/]*polic(y|ies)|site-?map|entitymap\.html|thank[^/]*|search[^/]*|cart|account|login|blog|newsletters?)\/?$|\.html$/i;
var OPERATOR = /[":]|^site |^inurl|^intitle/;
var SKIP_PATH = /(^\/wp-|\/feed\/?$|\/tag\/|\/author\/|\/page\/\d+|\.(pdf|jpe?g|png|webp|gif|svg|zip|xml|css|js)$|\/cdn-cgi\/)/i;
var ZONE_TAGS = ["nav", "header", "footer", "aside"];
var decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&ndash;|&mdash;/g, "-").replace(/&#(\d+);/g, (_, n5) => String.fromCharCode(Number(n5))).replace(/&#x([0-9a-f]+);/gi, (_, n5) => String.fromCharCode(parseInt(n5, 16)));
var text = (fragment) => decode(fragment.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
function norm(u) {
  try {
    const p = new URL(u);
    return `${p.protocol}//${p.host.toLowerCase().replace(/^www\./, "")}${p.pathname.replace(/\/+$/, "") || "/"}`;
  } catch {
    return u;
  }
}
function tokens(s) {
  return new Set((s.toLowerCase().match(/[a-z0-9][a-z0-9+.-]*/g) ?? []).filter((w) => !STOP.has(w) && w.length > 2));
}
var minus = (a, b) => new Set([...a].filter((w) => !b.has(w)));
function zones(html) {
  const spans = [];
  for (const tag of ZONE_TAGS)
    for (const m of html.matchAll(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi")))
      spans.push([m.index, m.index + m[0].length, tag === "footer" ? "footer" : tag === "aside" ? "other" : "nav"]);
  return spans;
}
function extractLinks(pageUrl, html, host2) {
  const clean = html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, (m) => " ".repeat(m.length));
  const zs = zones(clean);
  const out = [];
  for (const m of clean.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const hm = m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hm) continue;
    const href = decode(hm[1]).trim();
    if (/^(#|mailto:|tel:|javascript:)/i.test(href)) continue;
    let abs;
    try {
      abs = new URL(href, pageUrl);
    } catch {
      continue;
    }
    abs.hash = "";
    if (!/^https?:$/.test(abs.protocol) || abs.hostname.toLowerCase().replace(/^www\./, "") !== host2 || SKIP_PATH.test(abs.pathname)) continue;
    let zone = "body";
    for (const [a, b, z] of zs) {
      if (a <= m.index && m.index < b) {
        zone = z;
        if (z === "nav" || z === "footer") break;
      }
    }
    const anchor = text(m[2]) || m[1].match(/\baria-label\s*=\s*["']([^"']+)/i)?.[1] || m[2].match(/alt\s*=\s*["']([^"']+)/i)?.[1] || "";
    out.push({ to: norm(abs.href.split("?")[0]), raw: abs.href, anchor: anchor.slice(0, 120), zone, nofollow: /\brel\s*=\s*["'][^"']*nofollow/i.test(m[1]) });
  }
  return out;
}
var NON_BODY = /<!--[\s\S]*?-->|<(script|style|noscript|template|nav|header|footer|aside|form)\b[\s\S]*?<\/\1>/gi;
function bodyText(html) {
  const x = html.replace(NON_BODY, " ");
  const m = x.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i);
  return text(m ? m[2] : x);
}
function paragraphs(html) {
  const x = html.replace(NON_BODY, " ");
  const out = [];
  for (const m of x.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = text(m[2]);
    if (t.length >= 60 && t.length <= 700 && !/^(by [a-z]+ [a-z]+ ·|published|updated|table of contents)/i.test(t)) out.push(t);
    if (out.length >= 400) break;
  }
  return out;
}
async function pool(items, n5, fn, onDone) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n5, items.length) }, async () => {
    while (i < items.length) {
      const k = i++;
      out[k] = await fn(items[k]);
      onDone?.();
    }
  }));
  return out;
}
async function sitemapUrls(base, f, limit) {
  const origin = new URL(base).origin;
  const host2 = new URL(base).hostname.replace(/^www\./, "");
  const robots = await get(f, `${origin}/robots.txt`, LINKS_UA, 1e4);
  const listed = robots.status === 200 ? parseRobots(robots.text).sitemaps : [];
  const todo = listed.length ? [...listed] : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const seenMaps = /* @__PURE__ */ new Set(), seen = /* @__PURE__ */ new Set(), urls = [];
  while (todo.length && urls.length < limit && seenMaps.size < 60) {
    const sm = todo.shift();
    if (seenMaps.has(sm)) continue;
    seenMaps.add(sm);
    const r = await get(f, sm, LINKS_UA, 2e4);
    if (r.status !== 200) continue;
    const locs = [...r.text.matchAll(/<loc>\s*(?:<!\[CDATA\[)?\s*([^<\]\s]+)/gi)].map((m) => decode(m[1]));
    if (/<sitemapindex/i.test(r.text)) {
      todo.push(...locs.filter((u) => !/(image|video|news|agentic)/i.test(u)));
      continue;
    }
    for (const u of locs) {
      let h = "";
      try {
        h = new URL(u).hostname.replace(/^www\./, "");
      } catch {
        continue;
      }
      if (h !== host2 || seen.has(u) || /\.(jpe?g|png|webp|gif|pdf|xml)(\?|$)/i.test(u)) continue;
      seen.add(u);
      urls.push(u);
      if (urls.length >= limit) break;
    }
  }
  return urls;
}
var isChallenge = (status, headers, body) => headers.get("cf-mitigated") === "challenge" || (status === 403 || status === 503) && /Just a moment|cf-chl|captcha|challenge-platform/i.test(body.slice(0, 5e3));
async function crawl(urls, f, host2, onDone) {
  const out = {};
  const rows = await pool(urls, 6, async (u) => {
    const r = await get(f, u, LINKS_UA, 2e4);
    if (r.status === 0) return [u, { status: 0 }];
    if (isChallenge(r.status, r.headers, r.text)) return [u, { status: r.status, challenged: true }];
    if (r.status !== 200 || !/html/i.test(r.headers.get("content-type") ?? "")) return [u, { status: r.status }];
    const t = r.text;
    return [u, {
      status: 200,
      final: norm(r.url),
      title: text(t.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 160),
      h1: text(t.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "").slice(0, 160),
      noindex: /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(t),
      links: extractLinks(r.url, t, host2),
      text: bodyText(t).slice(0, 4e4),
      paras: paragraphs(t)
    }];
  }, onDone);
  for (const [u, p] of rows) out[norm(u)] = p;
  return out;
}
async function resolveTargets(targets, f, onDone) {
  const out = {};
  const rows = await pool(Object.entries(targets), 6, async ([u, raw]) => {
    let cur = raw.split("?")[0], hops = 0;
    while (hops < 6) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 15e3);
      try {
        const r = await f(cur, { headers: { "user-agent": LINKS_UA, accept: "text/html,*/*" }, redirect: "manual", signal: ctl.signal });
        await r.body?.cancel().catch(() => {
        });
        const loc = r.headers.get("location");
        if ([301, 302, 307, 308].includes(r.status) && loc) {
          cur = new URL(loc, cur).href;
          hops++;
          continue;
        }
        return [u, { status: r.status, final: norm(cur), hops }];
      } catch {
        return [u, { status: 0 }];
      } finally {
        clearTimeout(timer);
      }
    }
    return [u, { status: 310, final: norm(cur), hops }];
  }, onDone);
  for (const [u, r] of rows) out[u] = r;
  return out;
}
function pagerank(nodes, edges, d = 0.85, iters = 60) {
  const n5 = nodes.length;
  if (!n5) return {};
  const idx = new Map(nodes.map((u, i) => [u, i]));
  const outs = nodes.map(() => []);
  const list = edges instanceof Set ? [...edges].map((e) => e.split("	")) : edges;
  for (const [a, b] of list) if (idx.has(a) && idx.has(b) && a !== b) outs[idx.get(a)].push(idx.get(b));
  let pr = new Array(n5).fill(1 / n5);
  for (let it = 0; it < iters; it++) {
    const nxt = new Array(n5).fill((1 - d) / n5);
    let dangling = 0;
    for (let i = 0; i < n5; i++) if (!outs[i].length) dangling += pr[i];
    for (let i = 0; i < n5; i++) if (outs[i].length) {
      const share = d * pr[i] / outs[i].length;
      for (const j of outs[i]) nxt[j] += share;
    }
    for (let j = 0; j < n5; j++) nxt[j] += d * dangling / n5;
    pr = nxt;
  }
  const top = Math.max(...pr) || 1;
  return Object.fromEntries(nodes.map((u, i) => [u, Math.round(pr[i] / top * 1e4) / 100]));
}
function bestSentence(paras, anchor) {
  const all = tokens(anchor);
  const want = minus(all, GENERIC_TOPIC).size ? minus(all, GENERIC_TOPIC) : all;
  let best = "", score = 0;
  for (const para of paras)
    for (const s of para.split(/(?<=[.!?])\s+/)) {
      if (s.length < 40 || s.length > 400) continue;
      const st = tokens(s);
      const hit = [...want].filter((w) => st.has(w)).length;
      if (hit > score) {
        best = s;
        score = hit;
      }
    }
  return score >= Math.min(2, want.size) ? best.slice(0, 260) : "";
}
var esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function buildPlan(pages, resolved, gsc2, base, o) {
  const brands = o.brand.map((b) => b.trim().toLowerCase()).filter(Boolean);
  const brandRe = brands.length ? new RegExp(brands.map(esc).join("|"), "i") : null;
  const isTopicQ = (q) => !OPERATOR.test(q) && !(brandRe && brandRe.test(q));
  const pathOf = (u) => {
    try {
      return new URL(u).pathname || "/";
    } catch {
      return "/";
    }
  };
  const utility = (u) => UTILITY.test(pathOf(u));
  const ok = {};
  for (const [u, p] of Object.entries(pages)) if (p.status === 200 && !p.noindex) ok[u] = { title: p.title ?? "", h1: p.h1 ?? "", links: p.links ?? [], text: p.text ?? "", paras: p.paras ?? [] };
  const nodes = Object.keys(ok).sort();
  const status = {};
  for (const u of nodes) status[u] = { status: 200, final: u };
  for (const [u, r] of Object.entries(resolved)) if (!status[u]) status[u] = r;
  for (const [u, p] of Object.entries(pages)) if (!status[u] && p.status >= 400) status[u] = { status: p.status, final: u };
  const freq = /* @__PURE__ */ new Map();
  for (const p of Object.values(ok)) for (const k of new Set(p.links.map((l) => `${l.to}	${l.anchor.toLowerCase()}`))) freq.set(k, (freq.get(k) ?? 0) + 1);
  if (nodes.length >= 10) {
    for (const p of Object.values(ok)) for (const l of p.links) if (l.zone === "body" && (freq.get(`${l.to}	${l.anchor.toLowerCase()}`) ?? 0) >= 0.4 * nodes.length) l.zone = "template";
  }
  const edges = /* @__PURE__ */ new Set(), bodyEdges = /* @__PURE__ */ new Set();
  const anyIn = /* @__PURE__ */ new Map(), anchorsTo = /* @__PURE__ */ new Map();
  const redirects = [], broken = [], generic = [];
  for (const src of nodes) {
    for (const l of ok[src].links) {
      const st = status[l.to] ?? { status: 0 };
      const dst = st.final ?? l.to;
      if (dst !== l.to && ([301, 302, 307, 308].includes(st.status) || st.status === 200 && st.hops)) redirects.push({ page: src, href: l.raw, final: dst, anchor: l.anchor, zone: l.zone });
      else if (st.status >= 400) {
        broken.push({ page: src, href: l.raw, status: st.status, anchor: l.anchor, zone: l.zone });
        continue;
      }
      if (dst === src) continue;
      edges.add(`${src}	${dst}`);
      anyIn.set(dst, (anyIn.get(dst) ?? 0) + 1);
      if (l.zone === "body") {
        bodyEdges.add(`${src}	${dst}`);
        const a = l.anchor.trim();
        if (a && GENERIC.test(a)) generic.push({ page: src, to: dst, anchor: a });
        if (a.length >= 4 && !GENERIC.test(a)) {
          const k = a.toLowerCase();
          if (!anchorsTo.has(k)) anchorsTo.set(k, /* @__PURE__ */ new Set());
          anchorsTo.get(k).add(dst);
        }
      }
    }
  }
  const pr = pagerank(nodes, edges);
  const gp = gsc2.pages;
  const qByPage = /* @__PURE__ */ new Map();
  for (const [page, q, c, i, pos] of gsc2.pq) if (isTopicQ(q)) {
    if (!qByPage.has(page)) qByPage.set(page, []);
    qByPage.get(page).push([q, c, i, pos]);
  }
  const prof = /* @__PURE__ */ new Map();
  for (const u of nodes) {
    const t = /* @__PURE__ */ new Map();
    for (const [q, , i] of [...qByPage.get(u) ?? []].sort((a, b) => b[2] - a[2]).slice(0, 40))
      for (const w of minus(tokens(q), GENERIC_TOPIC)) t.set(w, (t.get(w) ?? 0) + Math.log10(i + 10));
    for (const w of minus(tokens(`${ok[u].title} ${ok[u].h1}`), GENERIC_TOPIC)) t.set(w, (t.get(w) ?? 0) + 1);
    prof.set(u, t);
  }
  const total = (m) => [...m.values()].reduce((a, b) => a + b, 0);
  const sim = (a, b) => {
    const ta = prof.get(a), tb = prof.get(b);
    if (!ta.size || !tb.size) return 0;
    let inter = 0;
    for (const [w, v] of ta) if (tb.has(w)) inter += Math.min(v, tb.get(w));
    return inter / (Math.min(total(ta), total(tb)) || 1);
  };
  const topicImpr = new Map(nodes.map((u) => [u, (qByPage.get(u) ?? []).reduce((a, r) => a + r[2], 0)]));
  const topicRank = new Map(nodes.map((u) => [u, (qByPage.get(u) ?? []).filter((r) => r[3] && r[3] <= 10)]));
  const ranksWell = (u) => !utility(u) && ok[u].text.split(/\s+/).length >= 250 && topicRank.get(u).reduce((a, r) => a + r[2], 0) >= 20;
  const cands = nodes.filter((u) => gp[u] && !utility(u) && gp[u].position >= o.posMin && gp[u].position <= o.posMax && topicImpr.get(u) >= o.minImpressions);
  cands.sort((a, b) => topicImpr.get(b) - topicImpr.get(a));
  const usedAnchor = new Map([...anchorsTo].map(([a, v]) => [a, new Set(v)]));
  const proposals = [];
  for (const c of cands) {
    const pageWords = tokens(`${ok[c].title} ${ok[c].h1} ${ok[c].text.slice(0, 2e4)}`);
    const qs = [...qByPage.get(c) ?? []].sort((a, b) => b[2] - a[2]).map((r) => r[0]).filter((q) => q.length >= 4 && q.length <= 60 && q.split(/\s+/).length <= 6 && [...tokens(q)].every((w) => pageWords.has(w))).slice(0, 8);
    const donors = [];
    for (const d of nodes) {
      if (d === c || bodyEdges.has(`${d}	${c}`) || !ranksWell(d)) continue;
      const s = sim(c, d);
      if (s < 0.12) continue;
      donors.push([s * (1 + Math.log10((gp[d]?.impressions ?? 0) + 10)) * (1 + pr[d] / 50), s, d]);
    }
    donors.sort((a, b) => b[0] - a[0]);
    let k = 0, taken = 0;
    for (const [, s, d] of donors.slice(0, 12)) {
      if (taken >= o.donorsPer) break;
      const order = [...qs.slice(k), ...qs.slice(0, k)];
      const anchor = order.find((q) => ![...usedAnchor.get(q.toLowerCase()) ?? []].some((x) => x !== c)) ?? (ok[c].h1 || ok[c].title).split(" | ")[0];
      const sent = bestSentence(ok[d].paras.length ? ok[d].paras : [ok[d].text], anchor);
      if (!sent) continue;
      k++;
      taken++;
      if (!usedAnchor.has(anchor.toLowerCase())) usedAnchor.set(anchor.toLowerCase(), /* @__PURE__ */ new Set());
      usedAnchor.get(anchor.toLowerCase()).add(c);
      proposals.push({
        target: c,
        target_title: ok[c].title,
        target_position: gp[c].position,
        target_impressions: topicImpr.get(c),
        target_clicks: gp[c].clicks,
        donor: d,
        donor_title: ok[d].title,
        donor_position: gp[d]?.position ?? 0,
        similarity: Math.round(s * 100) / 100,
        donor_authority: pr[d],
        anchor,
        place_near: sent,
        target_authority_before: 0,
        target_authority_after: 0
      });
    }
  }
  const after = pagerank(nodes, /* @__PURE__ */ new Set([...edges, ...proposals.map((p) => `${p.donor}	${p.target}`)]));
  for (const p of proposals) {
    p.target_authority_before = pr[p.target];
    p.target_authority_after = after[p.target];
  }
  const home = norm(base);
  const orphans = nodes.filter((u) => !anyIn.get(u) && u !== home);
  const tmpl = {};
  for (const l of ok[home]?.links ?? []) tmpl[l.zone] = (tmpl[l.zone] ?? 0) + 1;
  return {
    pages: nodes.length,
    edges: edges.size,
    body_edges: bodyEdges.size,
    candidates: cands.length,
    proposals,
    redirect_links: redirects,
    broken_links: broken,
    generic_anchors: generic,
    mixed_anchors: [...anchorsTo].filter(([, v]) => v.size > 1).map(([anchor, v]) => ({ anchor, targets: [...v].sort() })),
    orphans,
    prune_or_link: orphans.filter((u) => (gp[u]?.impressions ?? 0) < 10),
    leave_alone: nodes.filter((u) => gp[u] && gp[u].position && gp[u].position <= 5 && gp[u].clicks >= 10),
    homepage_links: tmpl,
    authority: Object.fromEntries(Object.entries(pr).sort((a, b) => b[1] - a[1]).slice(0, 30)),
    unlinked_candidates: cands.filter((c) => !proposals.some((p) => p.target === c))
  };
}
async function runLinks(o) {
  const host2 = new URL(o.base).hostname.toLowerCase().replace(/^www\./, "");
  const prog = o.progress ?? { phase: "", done: 0, total: 0 };
  Object.assign(prog, { phase: "reading sitemaps", done: 0, total: 0 });
  const urls = await sitemapUrls(o.base, o.f, o.maxPages);
  if (!urls.length) throw new Error(`No sitemap URLs found for ${o.base} (checked robots.txt Sitemap lines and /sitemap.xml). The crawl starts from the sitemap, so publish one first.`);
  Object.assign(prog, { phase: "crawling pages", done: 0, total: urls.length });
  const pages = await crawl(urls, o.f, host2, () => prog.done++);
  const blocked = Object.values(pages).filter((p) => p.challenged).length;
  const known = new Set(Object.keys(pages));
  const targets = {};
  for (const p of Object.values(pages)) for (const l of p.status === 200 ? p.links ?? [] : []) if (!known.has(l.to) && !targets[l.to] && Object.keys(targets).length < 1500) targets[l.to] = l.raw;
  Object.assign(prog, { phase: "checking link targets", done: 0, total: Object.keys(targets).length });
  const resolved = await resolveTargets(targets, o.f, () => prog.done++);
  Object.assign(prog, { phase: "building the plan", done: 0, total: 0 });
  const plan = buildPlan(pages, resolved, o.gsc ?? { pages: {}, pq: [] }, o.base, o.plan);
  return { site: norm(o.base), date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), range: [o.plan.posMin, o.plan.posMax], gscProperty: o.gsc ? o.gscProperty : void 0, crawled: Object.keys(pages).length, blocked, sitemapUrls: urls.length, plan };
}
var csvCell = (v) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
var csv = (rows) => rows.map((r) => r.map(csvCell).join(",")).join("\n") + "\n";
async function saveLinkFiles(r, md, outDir) {
  const host2 = new URL(r.site).hostname;
  const dir = resolvePath((outDir ?? join(homedir(), "Downloads", "alchemyagent-reports")).replace(/^~(?=\/)/, homedir()));
  await mkdir(dir, { recursive: true });
  const stem = join(dir, `internal-links-${host2}-${r.date}`);
  const p = r.plan;
  const fields = ["target", "target_position", "target_impressions", "target_clicks", "donor", "donor_position", "similarity", "donor_authority", "anchor", "place_near", "target_authority_before", "target_authority_after"];
  const cleanup = [["type", "page", "href_or_to", "detail", "anchor", "zone"]];
  for (const x of p.redirect_links) cleanup.push(["redirect (rewrite to final URL)", x.page, x.href, x.final, x.anchor, x.zone]);
  for (const x of p.broken_links) cleanup.push(["broken", x.page, x.href, x.status, x.anchor, x.zone]);
  for (const x of p.generic_anchors) cleanup.push(["generic anchor", x.page, x.to, "", x.anchor, "body"]);
  for (const x of p.mixed_anchors) cleanup.push(["same anchor, different URLs", "", x.targets.join(" | "), "", x.anchor, "body"]);
  for (const u of p.orphans) cleanup.push([`orphan${p.prune_or_link.includes(u) ? " (prune or link)" : ""}`, u, "", "", "", ""]);
  const files = [`${stem}.csv`, `${stem}.cleanup.csv`, `${stem}.json`, `${stem}.md`];
  await writeFile(files[0], csv([fields, ...p.proposals.map((x) => fields.map((k) => x[k]))]));
  await writeFile(files[1], csv(cleanup));
  await writeFile(files[2], JSON.stringify(r, null, 1));
  await writeFile(files[3], md + "\n");
  return files;
}
var fmt = (n5) => Math.round(n5).toLocaleString("en-US");
var cell = (s) => s.replace(/\|/g, "/").replace(/\n/g, " ");
function linksMarkdown(r, show = 25) {
  const p = r.plan;
  const short2 = (u) => u.replace(r.site.replace(/\/$/, ""), "") || "/";
  const L = [
    `# Internal link rewiring: ${new URL(r.site).hostname}`,
    "",
    `Plan only, nothing on the site changed. ${r.date}: ${p.pages} indexable pages from ${r.sitemapUrls} sitemap URLs, ${fmt(p.edges)} internal links (${fmt(p.body_edges)} in body copy).${r.blocked ? ` ${r.blocked} pages were blocked by a firewall challenge and skipped.` : ""}`
  ];
  if (!r.gscProperty) L.push("", "**Search Console isn't connected**, so there are no impression-based link targets in this run: cleanup only. Connect Google (gsc_connect) and run it again for the full plan.");
  else L.push(`Search Console: ${r.gscProperty}. Impressions below are non-brand.`);
  L.push("");
  const targets = /* @__PURE__ */ new Map();
  for (const x of p.proposals) {
    if (!targets.has(x.target)) targets.set(x.target, []);
    targets.get(x.target).push(x);
  }
  if (r.gscProperty) {
    L.push(
      p.proposals.length ? `## ${targets.size} page${targets.size === 1 ? "" : "s"} stuck at positions ${r.range[0]}-${r.range[1]} get ${p.proposals.length} new body link${p.proposals.length === 1 ? "" : "s"}` : `## No new body links this run`,
      "Each link comes from a page that already ranks on page one for the same topic. Anchors are the target's own queries. Add each link inside the donor's body copy, in or next to the quoted sentence.",
      ""
    );
    if (p.proposals.length) {
      L.push("| Target page | Position | Impressions | Link from | Anchor | Place near | Authority before \u2192 after |", "|---|---:|---:|---|---|---|---|");
      for (const x of p.proposals.slice(0, show))
        L.push(`| ${short2(x.target)} | ${x.target_position} | ${fmt(x.target_impressions)} | ${short2(x.donor)} (pos ${x.donor_position}) | ${cell(x.anchor)} | \u201C${cell(x.place_near.slice(0, 140))}${x.place_near.length > 140 ? "\u2026" : ""}\u201D | ${x.target_authority_before} \u2192 ${x.target_authority_after} |`);
      if (p.proposals.length > show) L.push("", `\u2026and ${p.proposals.length - show} more in the CSV.`);
    } else L.push(p.candidates ? `Pages are sitting at ${r.range[0]}-${r.range[1]}, but no page that already ranks on the same topic has a natural spot for a link. Those pages need content work first.` : `No pages with real impressions are sitting at positions ${r.range[0]}-${r.range[1]} right now.`);
    if (p.unlinked_candidates.length) L.push("", `${p.unlinked_candidates.length}${p.proposals.length ? " more" : ""} page${p.unlinked_candidates.length === 1 ? "" : "s"} at ${r.range[0]}-${r.range[1]} had no good donor: ${p.unlinked_candidates.slice(0, 8).map(short2).join(", ")}.`);
    L.push("");
  }
  L.push(
    "## Cleanup",
    `- **${p.redirect_links.length} links point at redirects.** Rewrite each to its final URL at the source.`,
    `- **${p.broken_links.length} links point at errors** (4xx/5xx).`,
    `- **${p.generic_anchors.length} body links use generic anchors** ("read more", "click here"). Replace them with words that describe the target.`,
    `- **${p.mixed_anchors.length} anchors point at more than one URL**, which blurs which page owns the topic.`,
    `- **${p.orphans.length} sitemap pages have no internal links**${p.prune_or_link.length ? ` (${p.prune_or_link.length} with no search demand either: link them or prune them)` : ""}.`
  );
  const ex = [...p.broken_links.slice(0, 5).map((x) => `- Broken: ${short2(x.page)} \u2192 ${x.href} (${x.status})`), ...p.redirect_links.slice(0, 5).map((x) => `- Redirect: ${short2(x.page)} \u2192 ${x.href} \u2192 ${short2(x.final)}`), ...p.orphans.slice(0, 5).map((u) => `- Orphan: ${short2(u)}`)];
  if (ex.length) L.push("", "Examples:", ...ex);
  if (Object.keys(p.homepage_links).length) L.push("", `Homepage links by zone: ${Object.entries(p.homepage_links).sort().map(([k, v]) => `${k} ${v}`).join(", ")}.`);
  if (p.leave_alone.length) L.push("", `Leave alone: ${p.leave_alone.length} pages already rank in the top 5 with clicks. Don't rewire their links.`);
  L.push(
    "",
    "Authority is internal PageRank on a 0 to 100 scale (100 = the strongest page). It estimates how link equity flows; Google's own signals aren't public.",
    `Baseline for measuring: ${r.date}. Re-check the target pages with gsc_performance (page filter) about 4 and 8 weeks after the links go live.`
  );
  if (r.files?.length) L.push("", "Files:", ...r.files.map((x) => `- ${x}`));
  return L.join("\n");
}

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
import { mkdir as mkdir2, readFile, writeFile as writeFile2, chmod } from "node:fs/promises";
import { homedir as homedir2, platform } from "node:os";
import { join as join2 } from "node:path";
import { spawn } from "node:child_process";
var SCOPE = "https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/analytics.readonly";
var GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
var TOKEN_URL = "https://oauth2.googleapis.com/token";
var API = "https://searchconsole.googleapis.com/webmasters/v3";
var TOKEN_FILE = join2(homedir2(), ".alchemyagent", "google-token.json");
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
  if (creds.getToken) return creds.getToken();
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
        await mkdir2(join2(homedir2(), ".alchemyagent"), { recursive: true, mode: 448 });
        const saved = { refresh_token: body.refresh_token, client_id: creds.clientId, scope: SCOPE, saved_at: (/* @__PURE__ */ new Date()).toISOString() };
        await writeFile2(TOKEN_FILE, JSON.stringify(saved, null, 2), { mode: 384 });
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
  if (creds.serviceAccountFile || creds.getToken) return true;
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
var cell2 = (s) => s.replace(/\|/g, "\\|").slice(0, 80);
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
    for (const p of r.aiPages) L.push(`| ${cell2(p.path)} | ${n2(p.requests)} |`);
    L.push("");
  }
  if (r.botErrors.length) {
    L.push("## Errors served to verified bots", "", "| Page | Status | Requests |", "|---|---:|---:|");
    for (const e of r.botErrors) L.push(`| ${cell2(e.path)} | ${e.status} | ${n2(e.requests)} |`);
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
var UA2 = "Mozilla/5.0 (compatible; AlchemyAgent/0.3; +https://alchemyagent.ai)";
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
async function get2(f, url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 2e4);
  try {
    const r = await f(url, { headers: { "user-agent": UA2, accept: "application/json, text/html;q=0.9" }, redirect: "follow", signal: ctl.signal });
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
  let text2 = jsonText, status;
  if (!text2) {
    const r = await get2(f, jsonUrl);
    status = r.status;
    if (r.status !== 200) return { jsonUrl, found: false, status: r.status, entities: 0, chunks: 0, relations: 0, issues: [] };
    text2 = r.text;
  }
  let doc;
  try {
    doc = JSON.parse(text2);
  } catch (e) {
    return { jsonUrl, found: true, status, entities: 0, chunks: 0, relations: 0, issues: [{ level: "error", path: "root", msg: `Not valid JSON (${e.message}).` }] };
  }
  const v = validateEntityMap(doc);
  const res = { jsonUrl, found: true, status, ...v, generated: doc.generated, verificationStatus: doc.verificationStatus };
  if (origin) {
    const h = await get2(f, `${origin}/entitymap.html`);
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
var UA3 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 AlchemyAgent/0.3";
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
    const res = await f(img.url, { method: img.kind === "video" ? "HEAD" : "GET", headers: { "user-agent": UA3, accept: "image/avif,image/webp,image/*,*/*;q=0.8" }, redirect: "follow", signal: ctl.signal });
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
      const text2 = await res.text();
      img.bytes = new TextEncoder().encode(text2).length;
      let emb = 0;
      for (const m of text2.matchAll(/data:image\/(?:png|jpe?g|webp|gif);base64,([A-Za-z0-9+/=\s]+)/g)) emb += Math.floor(m[1].replace(/\s/g, "").length * 3 / 4);
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
    res = await f(url, { headers: { "user-agent": UA3, accept: "text/html" }, redirect: "follow" });
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
import { mkdir as mkdir3, readFile as readFile2, writeFile as writeFile3 } from "node:fs/promises";
import { homedir as homedir3 } from "node:os";
import { join as join3, resolve } from "node:path";
var esc2 = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var fmt3 = (v) => Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { maximumFractionDigits: 1 });
var font = (f) => f.trim().replace(/ /g, "+");
function cardHtml(c, accent) {
  const title = c.title ? `<h3>${esc2(c.title)}</h3>` : "";
  const foot = (f) => f ? `<div class="foot"><span class="big" style="color:${accent}">${esc2(f.value)}</span><span>${esc2(f.text)}</span></div>` : "";
  if (c.type === "bars") {
    const max = Math.max(...c.rows.map((r) => r.value), 1);
    const colors = [accent, "#f98600", "#e8e8e8", "#9ad1ff", "#b9f6ca"];
    const dense = c.rows.length + (c.footer ? 1 : 0) >= 5;
    return title + c.rows.slice(0, 5).map((r, i) => `<div class="bar${dense ? " dense" : ""}"><div class="bl"><span><b>${esc2(r.label)}</b>${r.note ? ` <i>\xB7 ${esc2(r.note)}</i>` : ""}</span><b class="num">${fmt3(r.value)}</b></div><div class="track"><div style="width:${Math.max(r.value / max * 100, 1.6).toFixed(1)}%;background:${colors[i % colors.length]}"></div></div></div>`).join("") + foot(c.footer);
  }
  if (c.type === "stats") {
    return title + `<div class="stats">${c.rows.slice(0, 4).map((r) => `<div><span class="big" style="color:${accent}${r.value.length > 9 ? ";font-size:28px" : ""}">${esc2(r.value)}</span><span>${esc2(r.label)}</span></div>`).join("")}</div>`;
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
      svg += `<text x="0" y="${y + 5}" fill="#e6e6e6" font-size="15">${esc2(r.label)}</text><line x1="${X(r.before)}" y1="${y}" x2="${X(r.after)}" y2="${y}" stroke="${accent}" stroke-width="4"/><circle cx="${X(r.before)}" cy="${y}" r="8" fill="#6b6b6b"/><circle cx="${X(r.after)}" cy="${y}" r="9" fill="${accent}"/>`;
    });
    return title + svg + "</svg>" + foot(c.footer);
  }
  return title + `<ul class="list">${c.rows.slice(0, 6).map((r) => `<li><span style="background:${accent}"></span>${esc2(r)}</li>`).join("")}</ul>`;
}
async function featuredHtml(s) {
  const bg = s.background ?? "#ffc61a", ink = s.ink ?? "#111111", accent = s.accent ?? bg;
  const hf = s.headingFont ?? "Days One", bf = s.bodyFont ?? "DM Sans";
  let logo = s.brand ? `<div class="brand">${esc2(s.brand)}</div>` : "";
  if (s.logoSvg) {
    const svg = await readFile2(resolve(s.logoSvg.replace(/^~(?=\/)/, homedir3())), "utf8");
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
</style></head><body><div class="rings"></div><div class="pix"></div>${logo}${s.eyebrow ? `<div class="eyebrow">${esc2(s.eyebrow)}</div>` : ""}
<div class="left"><h1>${esc2(s.headline)}</h1>${s.subhead ? `<p class="sub">${esc2(s.subhead)}</p>` : ""}</div>
<div class="card">${cardHtml(s.card, accent === bg && /^#?f/i.test(bg) ? bg : accent)}</div>
${s.source ? `<div class="src">${esc2(s.source)}</div>` : ""}${s.site ? `<div class="url">${esc2(s.site)}</div>` : ""}</body></html>`;
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
  const dir = resolve((outDir ?? join3(homedir3(), "Downloads", "alchemyagent-images")).replace(/^~(?=\/)/, homedir3()));
  await mkdir3(dir, { recursive: true });
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "featured";
  const html = join3(dir, `${slug}.html`), png = join3(dir, `${slug}.png`);
  await writeFile3(html, await featuredHtml(spec), "utf8");
  const chrome = findChrome();
  if (!chrome) return { html, note: "No Chrome, Edge, Chromium or Brave found, so only the HTML was written. Open it in a browser at 1200x630 and screenshot it, or install Chrome and run again." };
  await new Promise((ok) => execFile(chrome, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=2", "--window-size=1200,630", "--virtual-time-budget=5000", `--screenshot=${png}`, `file://${html}`], { timeout: 6e4 }, () => ok()));
  if (!existsSync(png)) return { html, note: `Chrome didn't produce a screenshot. The HTML is at ${html}.` };
  if (credit) await writeFile3(png, addPngText(await readFile2(png), CREDIT));
  return { html, png };
}

// src/connections.ts
var connections_exports = {};
__export(connections_exports, {
  ACCOUNT_NEEDED: () => ACCOUNT_NEEDED,
  connState: () => connState,
  connectionsMarkdown: () => connectionsMarkdown,
  hostedConnectionsMarkdown: () => hostedConnectionsMarkdown
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
var ACCOUNT_NEEDED = [
  "# Connect your own data",
  "",
  "This free connector only checks public pages, so it has no account to hold your connections.",
  "Your own Google Search Console, GA4 and Bing Webmaster Tools data needs an AlchemyAgent account: use the signed-in connector (https://mcp.alchemyagent.ai/pro/mcp), the AlchemyAgent app for Claude, Slack or WordPress, or see https://alchemyagent.ai.",
  "",
  "- Google Search Console: your real Google queries, clicks and positions, including AI-assistant queries.",
  "- Google Analytics 4 (same Google sign-in): sessions and key events by channel and landing page, including AI referrals.",
  "- Bing Webmaster Tools: Bing traffic, queries and index health. Bing's index also feeds Microsoft Copilot."
].join("\n");
function hostedConnectionsMarkdown(s, link) {
  const since = (d) => d ? ` (since ${d.slice(0, 10)})` : "";
  const rows = [
    ["Google Search Console", s.google.connected, "Your real Google queries, clicks, impressions and positions, and which queries come from AI assistants. Fixes get ranked by what actually earns traffic.", since(s.google.since)],
    ["Google Analytics 4", s.google.connected, "Sessions, key events and revenue by channel and landing page, including referrals from ChatGPT, Perplexity, Claude, Gemini and Copilot.", since(s.google.since)],
    ["Bing Webmaster Tools", s.bing.connected, "Bing traffic, top queries and pages, index and crawl errors. Bing's index also feeds Microsoft Copilot and other AI assistants.", since(s.bing.since)]
  ];
  const on = rows.filter((r) => r[1]).length;
  const L = [
    `# Your data connections: ${on} of ${rows.length} connected`,
    "",
    "Every public-site check works without these. Connecting your own data lets AlchemyAgent rank fixes by real traffic and real queries. Access is read-only, tokens are encrypted at rest, and you can disconnect any source on the same page.",
    ""
  ];
  for (const [name, ok, why, when] of rows) L.push(`## ${ok ? "\u2713" : "\u25CB"} ${name}${ok ? `: connected${when ?? ""}` : ""}`, why, "");
  if (!s.google.connected) L.push(s.googleAvailable ? "Google: one sign-in connects Search Console and GA4 together (read-only)." : "Google: the Search Console and GA4 sign-in is opening soon. Bing can be connected now.");
  if (!s.bing.connected) L.push("Bing: paste a Bing Webmaster Tools API key (Bing Webmaster Tools > Settings > API access > API key) on the same page.");
  L.push("", `**${on === rows.length ? "Manage or disconnect" : "Connect"} here (private link for this account, valid 24 hours):** ${link}`);
  if (on) L.push("", "Then try: gsc_performance, gsc_ai_queries, ga4_report or bing_webmaster.");
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
  BING_KEY_STEPS: () => BING_KEY_STEPS,
  BingError: () => BingError,
  bingDate: () => bingDate,
  bingMarkdown: () => bingMarkdown,
  bingReport: () => bingReport,
  isThrottle: () => isThrottle,
  listSites: () => listSites2,
  matchSite: () => matchSite,
  sitesMarkdown: () => sitesMarkdown
});
var BASE = "https://ssl.bing.com/webmaster/api.svc/json/";
var BING_KEY_STEPS = "In Bing Webmaster Tools (https://www.bing.com/webmasters), open Settings (the gear) > API access > API key and generate a key.";
var BING_KEY_HELP = "Bing Webmaster Tools needs your own API key. In Bing Webmaster Tools (https://www.bing.com/webmasters), open Settings (the gear) > API access > API key, generate a key, then paste it into AlchemyAgent's settings in Claude (Settings > Extensions > AlchemyAgent > Configure). The key stays on your computer and is only sent to Bing.";
var BingError = class extends Error {
};
var isThrottle = (e) => /Throttle/i.test(String(e?.message ?? e));
async function call2(f, key, method, params = {}, waits = [1500, 4e3]) {
  for (let i = 0; ; i++) {
    try {
      return await callOnce(f, key, method, params);
    } catch (e) {
      if (!isThrottle(e) || i >= waits.length) throw e;
      await new Promise((r) => setTimeout(r, waits[i]));
    }
  }
}
async function callOnce(f, key, method, params) {
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
    if (/Throttle/i.test(msg)) throw new BingError(`Bing is rate-limiting requests right now (Throttle). Try again in a few minutes.`);
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
  const [traffic, queries, pages, crawl2, quota] = await Promise.all([
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
  if (crawl2) {
    const rows = [...crawl2].sort((a, b) => bingDate(a.Date).localeCompare(bingDate(b.Date)));
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
  parseRobots,
  rulesFor,
  isAllowed,
  get,
  challenged,
  crawlerCheck,
  crawlerMarkdown,
  norm,
  runLinks,
  saveLinkFiles,
  linksMarkdown,
  links_exports,
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
  ACCOUNT_NEEDED,
  hostedConnectionsMarkdown,
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
