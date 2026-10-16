---
name: llms-txt-writer
description: Write or fix a site's llms.txt (and optionally llms-full.txt) following the llmstxt.org format, using the site's sitemap and key pages. Use when someone asks for an llms.txt, says agent_readiness flagged llms.txt problems, or wants their site to be easier for AI tools to navigate.
---

# llms.txt writer

llms.txt is a Markdown file at the site root that tells AI tools what the site is and which pages matter. No major assistant has committed to reading it, so keep it cheap: accurate, short, maintained.

## Steps
1. Run `agent_readiness` on the site. Note the current llms.txt problems, sitemap size and whether Markdown page versions exist.
2. Read the homepage and navigation (`ai_render_check` shows the headings). Pick 10–30 pages that answer what buyers ask: services/products, pricing, proof (case studies, reviews), about/contact, key guides.
3. Write the file in this exact shape:

```
# Brand name

> One sentence: what you do, for whom, where. Concrete, no slogans.

Optional short paragraph with key facts (founded, locations, specialties).

## Services
- [Page title](https://example.com/page/): one line on what it answers

## Proof
- [Case study](https://example.com/case/): result in one line

## Optional
- [Blog](https://example.com/blog/): lower-priority pages go here
```

## Rules
- Absolute URLs that return 200 and are canonical (no redirects, no tracking parameters).
- One H1, a `>` summary, `##` sections, `- [name](url): note` links. `## Optional` marks skippable pages.
- Facts only. Don't add claims that aren't on the site.
- Serve it as plain text at `/llms.txt`. On WordPress, a static file or a plugin that serves it; on Shopify or Webflow, a redirect to a hosted file or an app.
- Re-run `agent_readiness` afterwards to confirm it parses and every link resolves.
