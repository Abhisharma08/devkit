# DevKit

Local developer utilities.

A free, privacy-first developer toolbox for the web and Chrome. All processing happens locally. No accounts, backend, database, analytics, ads, subscriptions, or paid APIs. Optional Buy Me a Coffee donations are the only revenue mechanism.

## Status

The original 20 MVP tools plus three developer utilities and all four application surfaces are implemented. See [VERIFICATION.md](VERIFICATION.md) for the checks actually run in the implementation environment. **Production artifacts build successfully. Browser and offline-extension checks must pass in CI before Chrome Store submission.**

## Quick start

Requires Node.js 24 LTS and pnpm 10.34.9 (the version declared in `package.json`).

```sh
pnpm install
pnpm dev:web
# In another terminal, if developing the extension:
pnpm dev:extension
```

The website runs at http://127.0.0.1:3000. Load the development extension from `apps/extension/.output/chrome-mv3-dev` using Chrome's **Extensions → Developer mode → Load unpacked**. Development builds include WXT's local development connection; distribute only the production build.

The root `workspaces` field also makes manifests understandable to npm tooling. pnpm workspaces and Turborepo are the project's supported installation and orchestration workflow. Internal `*` dependencies resolve to local packages through `linkWorkspacePackages` and `preferWorkspacePackages`.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev:web` | Next.js development server |
| `pnpm dev:extension` | WXT development extension |
| `pnpm lint` | ESLint, with warnings treated as errors |
| `pnpm typecheck` | Check every shared package and app |
| `pnpm test` | Independent tool engine and configuration tests |
| `pnpm build` | Static website and production MV3 extension |
| `node scripts/verify-artifacts.mjs` | Check output files, icons, permissions and CSP |
| `pnpm exec playwright install chromium` | Install the browser for local E2E tests |
| `pnpm test:e2e` | Real production files, mobile and extension tests |
| `pnpm package:extension` | Chrome Web Store ZIP |
| `pnpm verify` | Lint, types, unit tests, builds, browser tests |

CI and Cloudflare use `npm ci` with the committed `package-lock.json` to install the exact tested dependency graph. The monorepo retains pnpm workspaces and Turborepo for orchestration. A canonical pnpm lockfile still needs a registry-enabled pnpm installation; once generated and committed, CI can switch to `pnpm install --frozen-lockfile`.

Publishing instructions and the ready-to-use Cloudflare settings are in [docs/PUBLISHING.md](docs/PUBLISHING.md). Run `npm run release:package` after building to create the website and Chrome upload ZIPs in `release/`.

## Architecture

```text
apps/
  web/                  Next.js App Router; output: export
  extension/            WXT + React; Manifest V3
    entrypoints/
      popup/            Chrome toolbar popup
      sidepanel/        Native Chrome side panel
      workspace/        Full-page extension workspace
packages/
  config/               Shared product and donation configuration
  engines/              Local, UI-independent operations and unit tests
  ui/                   Registry, reusable tool workspace, shadcn-style
                        Button/Radix primitives, CodeMirror, Zustand, styles
scripts/                Static test server, icons, artifact validation
tests/e2e/              Playwright web/mobile/extension tests
```

All tools are defined in `packages/ui/src/registry.ts` with stable ID, category, description, keywords, icon, controls, component mapping, and engine execution function. Each entry maps to the reusable `ToolWorkspace`, which renders the controls and appropriate preview. Engines can also be built and tested independently with `pnpm --filter @devkit/engines build` and `pnpm --filter @devkit/engines test`.

Engines never depend on React, Zustand, Next.js, WXT, or browser extension APIs.

Tailwind CSS 4 provides utility styling and theme tokens. The checked-in shadcn-style Button uses Radix Slot, class-variance-authority and tailwind-merge; the rest of the workspace uses small local components and semantic/native controls. No external UI service or remote fonts are loaded. Lucide icons and CodeMirror assets ship in the bundles.

## Included tools

| Category | Tools |
| --- | --- |
| Data | JSON formatter, JSON validator, JSON minifier, SQL formatter with selectable dialect, binary/octal/decimal/hex integer converter |
| API | cURL-to-fetch code converter, URL inspector with decoded query parameters |
| Encoding | UTF-8 Base64 encoder/decoder, URL component encoder/decoder |
| Security | JWT decoder, password generator, SHA-1/256/384/512 hashing |
| Generators | UUID v4, random strings with a custom alphabet, QR codes with SVG download |
| Time | Unix/ISO timestamp converter, five-field cron builder with five upcoming UTC runs |
| Text | Worker-isolated regex tester, line diff, eight case conversions, Unicode word counter |
| Design | HEX/RGB/HSL converter, CSS gradient generator with preview |

Use **Load example** to explore a tool. Generator controls have sensible defaults. Copy and reset are available without accounts. Every tool remains free. Loading an example also restores that tool’s default settings so the example is ready to run.

## Developer utilities

- **cURL to fetch** accepts commands up to 50,000 characters and produces copyable JavaScript without executing the command or sending a request. It supports one absolute HTTP(S) URL; common methods; `-X`/`--request`, `-H`/`--header`, `-d`/`--data`, `--data-raw`, inline `--data-binary`, `--url`, `-I`/`--head`, and `-L`/`--location`; and harmless silent/compression flags. POSIX single/double quotes and backslash line continuations are accepted. Shell expansion/operators, file/stdin uploads, multipart forms, proxy options, empty/removal headers, and unsupported flags produce explicit errors. Repeated data arguments are joined with `&`, matching the [curl data option](https://curl.se/docs/manpage.html#-d). The generated code preserves header tuples and explicitly sets redirect handling. Browser CORS, cookies, and forbidden-header behavior still apply when copied code is executed elsewhere; see [Fetch request options](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit).
- **URL inspector** accepts up to 16,000 characters and breaks an absolute HTTP(S) URL into its origin, hostname, effective port, path, fragment, and decoded query parameters without fetching it. Duplicate and empty query parameters are retained in an array. Credentials present in the input remain visible in the normalized URL output; neither input nor output is persisted.
- **Number base converter** converts signed whole integers between binary, octal, decimal, and hexadecimal using `BigInt`, preserving values beyond JavaScript's safe integer range. Matching `0b`, `0o`, and `0x` prefixes are supported. Limits are 4,096 input characters; fractions, separators, and exponents are rejected.

## Privacy and security design

- Tool inputs and results live only in component memory. They are cleared when switching tools or reloading, and are never added to a URL, local storage, session storage, telemetry, or a network request.
- Zustand persists an explicit allowlist: theme and favorite tool IDs. No input history exists. Preferences are local to each app origin; they do not sync between web and extension.
- UUIDs, passwords, random strings and hashes use Web Crypto. Random alphabet indices use rejection sampling to avoid modulo bias. Passwords include each selected group and use a cryptographic shuffle.
- JWT output is **decoded, not verified**. Both UI and output explicitly warn against trusting claims.
- Regexes execute only in a fresh bundled worker. A 750 ms timer terminates the worker, including catastrophic backtracking. Editing, resetting or leaving the workspace cancels execution. Results are capped at 1,000 matches.
- The extension requests only `sidePanel`. No host, storage, clipboard, activeTab, or tabs permission is requested. `tabs.create` only opens the extension workspace; it does not read tab data. Clipboard writes use the user-triggered browser Clipboard API with error handling.
- Production MV3 CSP permits only local scripts/workers, forbids objects and network connections, and contains no `unsafe-eval` or inline scripts. No content scripts are installed.
- The static website has Cloudflare `_headers` restricting connections, framing, and browser capabilities. Next.js static hydration requires inline scripts; the web policy allows these. The extension has a separate, stricter MV3 policy. The static test server sends the same web CSP.
- React escapes textual outputs. QR SVG is encoded into an image URL, never injected as HTML. Color and gradient values are normalized by the engine before reaching CSS.

Read [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). Hosting providers still receive normal page/asset requests. Your operating system or clipboard manager can retain copied data.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| Ctrl / ⌘ + K | Focus global search |
| Ctrl / ⌘ + Enter | Run active tool |
| Ctrl / ⌘ + Shift + Backspace | Reset active tool |
| ? | Open shortcut guide outside text inputs |
| Escape | Close dialog or clear search |

The layout supports keyboard navigation, visible focus, accessible names, native modal focus handling, screen-reader notifications, reduced motion, and narrow screens. Automated accessibility checks are included; manual screen-reader review is still recommended before release.

## Donations

Set `donationUrl` in `packages/config/src/index.ts` to your own HTTPS Buy Me a Coffee profile URL, for example `https://www.buymeacoffee.com/your-handle`. The shared validator rejects other hosts, credentials, ports, and non-profile paths. An empty or invalid value hides all donation links. Links open only after a click; no widgets, popups, paywalls, or remote donation scripts exist. The donation recipient is controlled entirely by this shared configuration.

## Cloudflare Pages

The website exports to `apps/web/out`; there is no server runtime or database to provision.

For Cloudflare's Git integration:

- Repository root: this monorepo's root.
- Build command: `npm ci && npm run lint && npm test && npm run build --workspace @devkit/web`.
- Output directory: `apps/web/out`.
- Environment: `NODE_VERSION=24` and `SKIP_DEPENDENCY_INSTALL=true`.
- Framework preset: None; production branch: `main`.
- Repository: `Abhisharma08/devkit`.

Or build locally and upload `apps/web/out` using Cloudflare Pages Direct Upload. `_headers` ships with the output. Worker scripts and all JavaScript must be served from the same origin; do not move them to a CDN with a different origin.

The optional `Deploy Cloudflare Pages` workflow is **manual**. Create a Pages project, configure `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets and the `CLOUDFLARE_PAGES_PROJECT` variable, and use the `production` environment for reviewer gates if desired. The token should have only the Pages access required for that account. No deploy runs simply by cloning or building.

Next.js static export reference: https://nextjs.org/docs/app/guides/static-exports

## Chrome Web Store

```sh
pnpm build
node scripts/verify-artifacts.mjs
pnpm test:e2e
pnpm package:extension
```

Load `apps/extension/.output/chrome-mv3` to test the production extension. The WXT ZIP appears in `apps/extension/.output/`. `npm run release:package` also creates clearly named upload ZIPs and checksums under `release/`. Generated icons cover 16, 32, 48 and 128 px; regenerate with `node scripts/generate-icons.mjs`.

Before submission:

1. Complete all verification and run manual popup, native side-panel, full-page and offline smoke checks in stable Chrome 116+.
2. Host the privacy policy at a public URL. Supply the actual project URL and support contact in your store listing.
3. Prepare store screenshots and the required promotional images. These are listing assets, not extension package contents.
4. Explain the sole `sidePanel` permission and declare that tool data is not collected or sold.
5. Upload the production ZIP in your Chrome Web Store developer account and complete Google's review.

Store account fees, domain registration, and optional hosting costs are maintainer costs; DevKit never charges users. Account-side deployment and Chrome Store submission are separate steps; see [the publishing guide](docs/PUBLISHING.md).

WXT entrypoint reference: https://wxt.dev/guide/essentials/entrypoints

## Deliberate limits

Tool operations have bounded inputs to keep a browser workspace usable: most accept up to 1,000,000 UTF-16 code units; SQL and each diff input accept 50,000; JWT 100,000; regex patterns 2,000 and text 100,000; QR content 2,000 (actual byte capacity varies). Generators validate their own limits. JSON uses JavaScript numbers, so integers beyond the safe integer range may lose precision when formatted or minified. Avoid these tools for lossless arbitrary-precision JSON transformations.

Base64 supports standard padded UTF-8 text, not arbitrary files. URL conversion handles components, not form-urlencoded `+` substitution. JWT supports the three-part compact format, not encrypted JWE. Cron is five-field UTC, not Quartz. Color conversion supports opaque HEX/RGB/HSL, not CSS named colors, alpha, or wide-gamut color. Diff is line-based. Password generation guarantees selected classes and does not claim uniform distribution over all strings satisfying that constraint. The web app has no service worker/offline-install cache; the installed extension is the supported offline surface.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Released under the [MIT license](LICENSE).

### Search discovery

Each web tool has a static `/tools/<slug>/` page with unique metadata, task guidance, and related links. Set `NEXT_PUBLIC_SITE_URL` to your actual production HTTPS origin before building to populate canonical URLs, sitemap entries, and absolute share-image URLs. Cloudflare Pages builds on `main` can infer the origin from `CF_PAGES_URL`; explicit configuration is recommended. The shared configuration defaults to `https://devkit.opervia.tech`. Forks should replace this origin. Builds with no configured origin intentionally omit canonical URLs and produce an empty sitemap.

See [keyword research and launch measurement](docs/SEO-RESEARCH.md) and the [Chrome Web Store listing copy](docs/chrome-store-listing.md). Neither website deployment nor store publication happens merely by editing these files.
