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

## Privacy

Checks run on your computer. A few use AlchemyAgent's free API (api.alchemyagent.ai) for PageSpeed, Chrome UX Report, Mozilla Observatory and Wikidata lookups: we receive the website you ask about, and cache public-site results for up to 12 hours. See the [privacy policy](https://alchemyleads.com/privacy-policy/#alchemyagent-free-tools).

Support: support@alchemyagent.ai
