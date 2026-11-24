# DevKit keyword research and implementation

Research date: November 24, 2026. Audience: English-speaking developers. Scope: public web search results, competitor pages, Chrome Web Store listings, and official indexing/listing documentation. This is qualitative intent and positioning research, not a country-specific search-volume study. No paid keyword dataset, verified monthly search volumes, CPC, keyword difficulty scores, Search Console history, or store conversion data was available. Priorities below are editorial judgments, not measured difficulty or demand.

## Findings and positioning

Generic phrases such as “developer tools” have ambiguous intent: people also use them to find Chrome DevTools documentation. Give the homepage the broad toolbox role, while each tool page answers a specific task. Search results for JSON formatter and SQL formatter contain numerous dedicated tools. A new toolbox should therefore pair exact task usefulness with specific supported workflows instead of assuming it can rank for a broad term immediately.

[JSONFormatter.org](https://jsonformatter.org/) combines formatting, validation, and beautification terminology. Its page also describes features DevKit does not implement, such as tree and graph views. Target JSON formatting and validation honestly; do not claim to be a JSON tree viewer.

[SQLFormatter.dev](https://sqlformatter.dev/) presents dialect-specific formatting. DevKit can address PostgreSQL, MySQL, SQLite, T-SQL, and BigQuery on one useful SQL page. Separate near-identical dialect landing pages would add little value today.

[Epoch Converter](https://www.epochconverter.com/) uses both epoch and Unix timestamp terminology and provides conversion guidance. DevKit’s timestamp page covers seconds, milliseconds, ISO dates, UTC, and device-local time; it does not claim nanosecond conversion.

[ToolsDeck’s cURL converter](https://toolsdeck.app/tool/curl-converter) and [ToolPlank’s converter](https://toolplank.com/tools/curl-to-fetch/) demonstrate direct “cURL to fetch” task phrasing. DevKit’s opportunity is a precise JavaScript-only conversion workflow with an explicit supported subset and no execution.

The public [DevGrove Chrome listing](https://chromewebstore.google.com/detail/devgrove-%E2%80%94-offline-develo/dhacaggpfllpahknoeneffhbifdoilog) emphasizes offline operation and a side panel. Those benefits are relevant to DevKit too, but they are not unique differentiators. Lead with actual tool coverage, predictable privacy behavior, and a useful workspace rather than claiming novelty.

## Keyword-to-page map

“First” means a focused launch/validation priority based on product fit and distinct task intent. “Core” means an important supported task, often with substantial visible competition. “Support” means useful coverage and internal navigation. These labels do not estimate search volume or ranking ease. Phrases not directly sampled in searches are candidates derived from implemented features and need Search Console validation after launch.

| Target page | Primary phrase | Supporting task phrases | Priority | Evidence |
| --- | --- | --- | --- | --- |
| `/` | free developer tools | local developer toolbox, browser developer utilities | Core | Broad SERP/intent sample |
| `/chrome-extension/` | offline developer tools Chrome extension | developer toolbox side panel, JSON formatter Chrome extension | First | Store listing sample |
| `/tools/json-formatter/` | JSON formatter online | JSON beautifier, pretty print JSON, private JSON formatter | Core | Direct SERP/page sample |
| `/tools/json-validator/` | JSON validator online | JSON syntax checker, validate JSON | Core | Direct JSON page sample |
| `/tools/json-minifier/` | JSON minifier | compact JSON, minify JSON online | Support | Direct JSON page sample |
| `/tools/sql-formatter/` | SQL formatter online | PostgreSQL formatter, MySQL beautifier, SQLite formatter | Core | Direct SERP/page sample |
| `/tools/curl-to-fetch/` | curl to fetch | curl to JavaScript fetch converter | First | Direct SERP/page sample |
| `/tools/url-parser/` | URL parser | URL query parameter inspector, parse repeated query parameters | First | Feature-derived candidate |
| `/tools/number-base-converter/` | binary decimal hex converter | BigInt base converter, large integer hex conversion | First | Feature-derived candidate |
| `/tools/base64-encoder-decoder/` | Base64 encoder decoder | UTF-8 Base64 converter, decode Base64 text | Core | Store coverage sample; web demand unmeasured |
| `/tools/url-encoder-decoder/` | URL encoder decoder | percent encoding, encode URL component | Support | Feature-derived candidate |
| `/tools/jwt-decoder/` | JWT decoder online | decode JWT locally, inspect JWT claims | First | Store coverage sample; web demand unmeasured |
| `/tools/uuid-generator/` | UUID v4 generator | random GUID generator, bulk UUID generator | Core | Store coverage sample; web demand unmeasured |
| `/tools/password-generator/` | random password generator | local password generator, Web Crypto password | Support | Feature-derived candidate |
| `/tools/qr-code-generator/` | QR code generator SVG | static QR code download, local QR generator | Support | Feature-derived candidate |
| `/tools/sha-hash-generator/` | SHA-256 hash generator | SHA-512 text hash, local hash calculator | Support | Feature-derived candidate |
| `/tools/random-string-generator/` | random string generator | custom alphabet random string, alphanumeric generator | Support | Feature-derived candidate |
| `/tools/unix-timestamp-converter/` | Unix timestamp converter | epoch converter, milliseconds to date, ISO to timestamp | Core | Direct page sample |
| `/tools/cron-expression-builder/` | cron expression builder | five-field cron generator, next cron runs UTC | First | Store coverage sample; web demand unmeasured |
| `/tools/regex-tester/` | JavaScript regex tester | regular expression tester, regex captures | Core | Store coverage sample; web demand unmeasured |
| `/tools/text-diff/` | text diff checker | compare two texts, line by line text comparison | Support | Feature-derived candidate |
| `/tools/case-converter/` | case converter | camelCase converter, snake_case, kebab-case | Support | Feature-derived candidate |
| `/tools/word-counter/` | word and character counter | UTF-8 byte counter, Unicode grapheme count | Support | Feature-derived candidate |
| `/tools/color-converter/` | HEX RGB HSL converter | CSS color converter | Support | Feature-derived candidate |
| `/tools/css-gradient-generator/` | CSS linear gradient generator | two color gradient CSS, gradient angle | Support | Feature-derived candidate |

## Implemented technical changes

- Twenty-three statically exported tool pages with working engines, unique titles/descriptions, visible task instructions, examples, limitations, and contextual related-tool links.
- Real anchor links in the website tool directory; extension navigation remains local. Old hash-based tool URLs continue to open the selected tool.
- Homepage overview and a truthful Chrome installation page; no invented public store listing.
- Canonical URLs, Open Graph and Twitter metadata, a 1200×630 local sharing image, robots.txt, and an XML sitemap.
- WebApplication structured data with factual free access and MIT licensing. Tool pages add breadcrumbs when an origin is configured. No fabricated ratings or promises of rich results. Visible answers are useful content; no FAQ rich-result claim.
- Chrome manifest title/summary and a submission-ready detailed description written around actual tasks. No keyword stuffing or extra permissions.
- Build cache keys include the origin settings, preventing stale canonical URLs when deployment configuration changes.

Google advises using [crawlable anchors](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) and [separate URLs for JavaScript application views](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics). Those are the main reasons to replace hash-only discovery with real pages. A sitemap helps discovery; it does not guarantee indexing or improve rankings on its own. See [Google’s sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).

For Chrome, accurate copy is only part of discovery. [Google’s store guidance](https://developer.chrome.com/docs/webstore/best-listing) also discusses product quality, usage, and ratings. [Listing policy](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements) prohibits keyword spam and misleading metadata.

## Production origin setup

The production hostname is now configured as `https://devkit.opervia.tech` in shared project configuration. Configure **NEXT_PUBLIC_SITE_URL** to the actual HTTPS website origin in Cloudflare Pages production settings, then rebuild. Alternatively set `websiteUrl` in `packages/config/src/index.ts`. A Git-connected Pages build on branch `main` can automatically use `CF_PAGES_URL`. Other production branch names should set the explicit variable. Preview deployments should use the production origin explicitly rather than announcing a temporary preview hostname as canonical.

Local builds use the shared production origin unless explicitly overridden. In a fork with both the shared origin and environment override empty, canonical and absolute social URLs are omitted and the sitemap has no URLs, avoiding a fictitious hostname. An archive built without the origin must be rebuilt with the correct origin before a manual production upload. Do not submit the empty local sitemap to search engines. The social PNG is generated from the checked-in SVG; it loads no external fonts or scripts.

## Launch and measurement

1. Deploy the new build. Verify the real `/robots.txt`, `/sitemap.xml`, tool page canonical tags, and `/social-card.png`. Ensure preview sites do not become competing indexed copies; Cloudflare normally supplies noindex headers on Pages previews, and this should be checked on the actual deployment.
2. Add the verified production site to Google Search Console using a URL-prefix property for a pages.dev address. Submit `/sitemap.xml` and inspect the homepage plus first-priority tool URLs. Search Console verification is account work; it is not configured by this change.
3. Publish the Chrome package and paste `docs/chrome-store-listing.md` into the developer dashboard. Add the actual website/privacy URLs, real screenshots, and support contact. Link to the verified store listing from the website once it exists.
4. After about four weeks, compare actual impressions, clicks, click-through rates, and indexed pages by query and page. Group branded DevKit queries separately from task queries. Improve pages showing relevant impressions but weak clicks; address index exclusions before creating additional content.
5. Review store impressions, installs, and uninstall trends in the Chrome dashboard. Improve screenshots and workflow clarity based on real feedback. Do not add analytics scripts or collect pasted tool inputs to measure SEO.
6. Revisit the candidate keyword priorities after real data exists. Earn links through accurate project documentation and genuine community participation; publishing promotional posts or outreach is outside this implementation.

No ranking, traffic, installation, or revenue increase is guaranteed. No tracking or advertising SDK was introduced.
