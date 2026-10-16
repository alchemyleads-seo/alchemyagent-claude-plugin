---
name: robots-ai-policy
description: Write a robots.txt AI-crawler policy (search, user-fetch and training bots) plus a Content-Signal line that states the site's AI usage preferences. Use when someone asks whether to block GPTBot/ClaudeBot, how to let ChatGPT or Claude cite them, or after ai_crawler_check shows AI bots are blocked.
---

# robots.txt AI policy

## Bot categories (decide each separately)
| Category | Examples | Blocking it means |
|---|---|---|
| Search indexing for AI answers | OAI-SearchBot, Claude-SearchBot, PerplexityBot, Bingbot, Googlebot | Not shown or cited in that assistant's search answers |
| User-triggered fetch | ChatGPT-User, Claude-User, Perplexity-User | The assistant can't open your page when a user asks it to |
| Model training | GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, meta-externalagent | Content isn't used to train future models (a business/legal choice) |

Most businesses that want AI visibility **allow search and user-fetch bots** and decide training separately.

## Steps
1. Run `ai_crawler_check` to see the current rules, firewall behavior and any existing Content-Signal/Content-Usage lines. Run `wayback_history` (robots) to see when blocks started.
2. Ask the owner one question: allow AI training, yes or no? Default to their current setting.
3. Write the full robots.txt, keeping existing rules for other bots. Example for "visible in AI answers, no training":

```
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: CCBot
User-agent: Google-Extended
User-agent: Applebot-Extended
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

4. If the firewall/CDN challenged bots, add a rule that lets verified bots through (Cloudflare: AI Crawl Control or a WAF skip rule for verified bots) or allowlist by the operators' published IP ranges.
5. Re-run `ai_crawler_check` to confirm.

## Notes
- robots.txt is a request, not access control. Content-Signal and Content-Usage state preferences; they don't block anything.
- Google-Extended controls Gemini training and grounding but not Google Search or AI Overviews, which use Googlebot.
- Never block Googlebot or Bingbot to stop AI training; that removes you from search.
