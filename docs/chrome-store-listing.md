# Chrome Web Store listing

## Name

DevKit: JSON Formatter & Developer Tools

## Summary

23 offline developer tools: JSON and SQL formatters, JWT decoder, Base64, UUIDs, regex and more. Local processing, no tracking.

## Detailed description

Format JSON, beautify SQL, decode JWT claims, and convert Base64 without leaving Chrome. DevKit is a free, open-source developer toolbox with 23 utilities that process data locally on your device.

Open a quick task from the toolbar popup, keep tools beside your work in Chrome’s side panel, or expand into a full-page workspace. The installed production extension works offline.

FORMAT AND INSPECT
• JSON formatter: pretty-print JSON with 2 or 4 spaces.
• JSON validator and minifier: check syntax or compact valid JSON.
• SQL formatter: choose standard SQL, PostgreSQL, MySQL, SQLite, T-SQL, or BigQuery.
• cURL to JavaScript fetch: generate request code without executing it.
• URL parser: inspect components and repeated query parameters.
• Number base converter: binary, octal, decimal, and hexadecimal integers using BigInt.

ENCODE AND DEBUG
• Base64 encoder and decoder for UTF-8 text.
• URL encoder and decoder for percent-encoded components.
• JWT decoder for headers and claims. Signatures are NOT verified.
• JavaScript regex tester with captures and a worker timeout.
• Text diff checker for line-by-line comparisons.

GENERATE AND CONVERT
• UUID v4, random passwords, and custom-alphabet random strings using Web Crypto.
• QR code generator with SVG download.
• SHA-256, SHA-384, SHA-512, and legacy SHA-1 text hashes.
• Unix timestamp converter for seconds, milliseconds, and ISO dates.
• Five-field cron expression builder with the next five runs in UTC.
• Case converter, Unicode word and character counter, HEX/RGB/HSL color converter, and CSS linear gradient generator.

MADE FOR EVERYDAY DEVELOPMENT
Find a tool with global search, pin favorites, switch between light and dark themes, and use copy/reset controls. Keyboard shortcuts include Ctrl/Cmd+K to search and Ctrl/Cmd+Enter to run the active tool.

PRIVACY BY DESIGN
No accounts, analytics, advertising, backend services, or remote tool APIs. Inputs and results stay in memory and clear when switching tools or reloading. Only theme and favorite tool IDs are stored locally. Your clipboard manager or operating system may retain copied content.

DevKit requests only the sidePanel permission. It has no host permissions or content scripts and cannot read websites or browsing history. All executable code is bundled.

Every tool is free. Optional Buy Me a Coffee donations support development and never unlock features or interrupt your work.

Open source under the MIT license:
https://github.com/Abhisharma08/devkit

Limitations: JWT decoding does not establish authenticity. SQL formatting does not execute or optimize queries. The cURL converter supports a documented subset and sends no requests. SHA-1 is legacy; plain SHA hashing is unsuitable for password storage.

## Suggested category and language

Developer Tools, if offered by the dashboard; otherwise Productivity. Language: English. Choose the closest accurate current category rather than unrelated keywords.

## Single purpose

Provide local developer utilities for formatting, encoding, generating, inspecting, and comparing development data through a popup, native side panel, and full-page workspace.

## Permission justification

`sidePanel`: Lets users open DevKit's local developer toolbox in Chrome's native side panel while working. It does not grant access to page contents or browsing history. No host permissions or content scripts are requested.

## Remote-code question

No remotely hosted executable code. JavaScript, styles, icons, and the regex worker are bundled in the extension. The donation link is an external navigation initiated by the user, not executable code loaded into the extension.

## Privacy practices

The extension does not transmit or collect tool inputs, generated values, browsing history, website contents, identifiers, or analytics. Theme and favorite tool IDs stay in local storage. Clipboard contents are written only after the user chooses Copy; the OS or clipboard manager can retain copied data. Opening Buy Me a Coffee is a user-initiated external navigation governed by that service's policies.

Answer the dashboard according to the package actually uploaded. The current package does not collect or transmit the listed personal-data categories. Do not declare data collection for purely local processing, and do not claim Google's approval before review.

## URLs and account fields to complete

- Website: actual Cloudflare Pages production URL after deployment.
- Privacy policy: actual production URL plus `/privacy/`.
- Support URL: https://github.com/Abhisharma08/devkit/issues
- Support email: a monitored address from the publisher; verify it in the dashboard.

## Assets

- Store icon: `release/store-assets/store-icon-128.png`, or `apps/extension/public/icon/128.png`.
- Screenshots: `release/store-assets/01-tool-directory.png`, `02-json-formatter.png`, and `03-uuid-generator.png`.

These screenshots must be generated from the actual built extension and visually reviewed. They are produced by `npm run release:screenshots` in CI or an environment that permits Chromium. Until that command succeeds, these screenshot files are pending; they are not mock images.

## Discoverability and submission notes

The name and summary above match `apps/extension/wxt.config.ts`; submit the detailed description manually in the Chrome Web Store developer dashboard. This repository change does not publish or update a store listing.

Primary store intent: a local developer toolbox for Chrome. Supporting terms describe actual workflows: JSON formatter, SQL formatter, JWT decoder, Base64, UUID, and regex tester. Do not add a repeated keyword block, competitor names, unsupported capabilities, artificial reviews, or ranking claims. Store placement depends on more than copy. See [Chrome’s listing guidance](https://developer.chrome.com/docs/webstore/best-listing) and [keyword spam policy](https://developer.chrome.com/docs/webstore/program-policies/listing-requirements).
