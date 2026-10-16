# AlchemyAgent for Claude

AI search tools for Claude Code, from [AlchemyLeads](https://alchemyleads.com). Check whether AI crawlers can reach a site and what they actually read, audit llms.txt and agent readiness, see how a brand shows up in Wikidata, Wikipedia, news, research and developer communities, and read your own Search Console, Bing and Brave data. Every tool is read-only.

## Install

```
/plugin install alchemyagent --marketplace alchemyleads-seo/alchemyagent-claude-plugin
```

Needs Node.js 18 or later. Using Claude Desktop instead? Install the one-click bundle from [alchemyagent.ai](https://alchemyagent.ai), or add the hosted connector `https://mcp.alchemyagent.ai/mcp`.

## What's inside

**Tools (MCP server).** AI crawler access and AI-use preferences, what AI crawlers see without JavaScript, agent readiness and llms.txt, schema, PageSpeed and Core Web Vitals trends, security headers, Wikidata, Wikipedia, authority (Tranco, Open PageRank), research citations (OpenAlex), news mentions (GDELT), Hacker News and Stack Exchange mentions, OpenStreetMap listings, Common Crawl, the Wayback Machine, Bing Webmaster, Brave Search rankings, Google Search Console, and brand alerts for new press and newly indexed pages.

**Workflows (MCP prompts).** Full AI search audit, AI crawler fix plan, brand visibility report, competitor AI-readiness comparison, local listing audit, Search Console AI report and daily brand alerts.

**Skills.** `ai-search-audit`, `llms-txt-writer`, `robots-ai-policy`.

## Optional keys

Most tools need no key. When you enable the plugin, Claude Code asks for optional keys (you can skip them and add them later in `/config`). Keys are stored in your system keychain, stay on your computer, and are only sent to the service they belong to.

| Setting | Unlocks |
|---|---|
| Google OAuth client ID + secret (Desktop app), or a service account key file | Google Search Console (`gsc_*` tools, brand alerts for newly indexed pages) |
| Bing Webmaster Tools API key | Bing Webmaster report |
| Brave Search API key | Brave Search rankings |
| Open PageRank API key | Link-authority scores |
| OpenAlex API key | Your own research-citations quota |
| PageSpeed Insights API key | Your own PageSpeed quota |

## External services

The MCP server runs on your computer and calls these services only when you use the matching tool. It sends the website, domain, brand name or query you asked about; your own keys go only to their own service.

| Service | Used by | Sent |
|---|---|---|
| AlchemyAgent API (api.alchemyagent.ai) | PageSpeed, Core Web Vitals trend, security headers, Wikidata, AI crawler IP lists | URL or domain |
| The website you ask about | crawler, render, schema, agent-readiness, security and alerts checks | ordinary page requests |
| Google PageSpeed Insights (with your own key) | `pagespeed_check` | URL, your key |
| Google Search Console API, Google OAuth | `gsc_*`, `brand_alerts` | your Google sign-in or service account; property and date range |
| Bing Webmaster Tools API | `bing_webmaster` | your key, site URL |
| Brave Search API | `brave_rank` | your key, search queries |
| Wikipedia / Wikimedia APIs | `wikipedia_presence` | domain, article title |
| Tranco, Open PageRank | `authority_check` | domains (Open PageRank: your key) |
| OpenAlex | `research_citations` | brand name, domain (your key if set) |
| GDELT DOC API | `news_mentions` | brand name |
| Google News RSS, your Google Alerts RSS feeds | `brand_alerts` | brand name |
| Hacker News Search (Algolia), Stack Exchange API | `community_mentions` | brand name, domain |
| OpenStreetMap Nominatim | `osm_listing` | business name, location |
| Common Crawl index, Internet Archive Wayback Machine | `common_crawl_check`, `wayback_history` | domain or URL |

Saved on your computer: the Google refresh token (`~/.alchemyagent/google-token.json`, readable only by you) and the brand-alerts history (`~/.alchemyagent/alerts/`). Nothing else is stored.

## Privacy

Checks run on your computer. A few use AlchemyAgent's free API (api.alchemyagent.ai) for PageSpeed, Chrome UX Report, Mozilla Observatory and Wikidata lookups: we receive the website you ask about, and cache public-site results for up to 12 hours. See the [privacy policy](https://alchemyleads.com/privacy-policy/#alchemyagent-free-tools).

Support: support@alchemyagent.ai
