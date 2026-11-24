# Chrome Web Store listing

## Name

DevKit — Local Developer Tools

## Summary

23 free, private developer tools. Format, encode, generate and debug locally.

## Detailed description

DevKit brings 23 developer utilities into a Chrome popup, side panel, and full-page workspace. Every tool processes its input locally on your device.

Included tools:

- JSON formatting, validation, and minification; SQL formatting.
- Base64 and URL encoding/decoding; JWT decoding.
- UUIDs, passwords, random strings, QR codes, and SHA hashes.
- Unix timestamps and cron schedules.
- Regex testing, text diff, case conversion, and Unicode word counting.
- Color conversion and CSS gradients.
- cURL-to-fetch code conversion, URL inspection, and integer base conversion.

Use search, favorites, keyboard shortcuts, copy/reset controls, and light or dark themes. The installed production extension works offline. Tool inputs and results remain in memory and are cleared when switching tools or reloading. Only theme and favorite tool identifiers are saved locally.

No accounts, analytics, advertisements, backend services, paywalls, or paid APIs. Optional Buy Me a Coffee donations never unlock features and open only when clicked.

JWT tokens are decoded only; signatures are not verified. Regex testing uses a disposable worker with a timeout. The cURL converter generates code without executing commands or sending requests.

Open-source project, MIT license:
https://github.com/Abhisharma08/devkit

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
