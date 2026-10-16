---
name: ai-search-audit
description: Audit a website's visibility in AI search (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) with the AlchemyAgent tools and produce a ranked fix list. Use when someone asks why they don't show up in AI answers, for an "AI SEO", "GEO" or "AEO" audit, or how AI-ready their site is.
---

# AI search audit

AI assistants find a brand in two ways: they **retrieve** pages live (crawlers and search indexes) and they **remember** what they learned in training (Common Crawl, Wikipedia, news, research, forums). Audit both.

## 1. Run the checks
Use the `ai_search_audit` prompt from the AlchemyAgent server, or call the tools directly (in parallel where you can):

| Layer | Question | Tools |
|---|---|---|
| Access | Can AI crawlers reach the site? | `ai_crawler_check` |
| Readability | Can they read it without JavaScript? | `ai_render_check` (homepage + one money page), `agent_readiness`, `schema_check` |
| Identity | Do knowledge sources know who the brand is? | `entity_check`, `wikipedia_presence`, `osm_listing` (local businesses) |
| Authority | Is it cited and trusted? | `authority_check`, `news_mentions`, `community_mentions`, `research_citations` (technical brands) |
| Training data | Is it in the open web corpus? | `common_crawl_check`, `wayback_history` |
| Demand | Are people already asking AI about it? | `gsc_ai_queries` (if Search Console is connected) |
| Speed | Is it fast enough to be fetched and quoted? | `pagespeed_check`, `cwv_trend` |

## 2. Prioritize
Fix in this order. Earlier layers block the later ones.
1. **Access blockers**: robots.txt blocking search/user bots (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot), firewall challenges, noindex.
2. **Readability**: JavaScript app shells, missing H1 or meta description, schema only injected via Tag Manager.
3. **Identity**: missing or wrong Wikidata item, no Organization schema with `sameAs`, inconsistent name/address/phone.
4. **Authority**: few independent mentions. That's PR and content work, so it's slower but compounds.

## 3. Report
- Three-line summary: what works, the biggest risk, the single best next step.
- Ranked table: Fix | Why it matters for AI search | Impact | Effort | Owner.
- Quote evidence from the tool output. Never invent numbers; if a check was blocked or failed, say so.
- Training bots (GPTBot, ClaudeBot, CCBot, Google-Extended) are a business choice. Present the trade-off; don't decide it for the owner.
