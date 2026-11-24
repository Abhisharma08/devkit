# Release verification

Date: November 24, 2026. Target release: 1.0.0.

## Verified locally

- All 23 tools are wired through the shared registry. Engine/configuration and registry/preference tests pass: **163 tests in seven files**.
- Repository ESLint passes with zero warnings.
- All five packages pass the orchestrated type check. Next.js route types and WXT types are generated before checking clean checkouts.
- The Next.js 16.4.6 website compiles and exports static pages to `apps/web/out`.
- The WXT extension builds to `apps/extension/.output/chrome-mv3` and can be packaged as a Chrome upload ZIP. Its optional React plugin was removed in favor of Vite's built-in automatic JSX transform, resolving the Vite/plugin mismatch. Development uses WXT page reloads rather than React Fast Refresh.
- Artifact validation confirms MV3, the sole `sidePanel` permission, no host permissions/content scripts, local scripts/workers, required icons and entrypoints, and the website privacy page and headers.
- Release packaging validates ZIP root paths, archive integrity, version agreement, and SHA-256 checksums. Website and extension ZIPs are separate.
- The configured donation profile appears in the static website. The local website returned HTTP 200.
- `npm ci --dry-run --ignore-scripts --offline` validates the committed npm lockfile against the manifests. Linux native-package entries are present in that lockfile.

## Required outside this sandbox

- Browser tests cannot run locally because the sandbox prevents the test server from listening on port 4173 and prevents Chromium's macOS Mach-port registration. GitHub Actions is configured to run the real desktop/mobile/offline-extension suite on Linux.
- Store screenshots must be captured from the actual extension, then visually reviewed. `npm run release:screenshots` is configured after the browser tests in CI; no mock screenshots are supplied.
- Manually check toolbar popup expansion, native side-panel opening, full-page tools, clipboard failures, and offline use in stable Chrome before submission.
- The current dependency-audit retry failed because the npm advisory endpoint could not resolve in the sandbox. A fresh audit still needs completion; a successful build does not establish that all dependencies are vulnerability-free.
- A canonical pnpm lockfile cannot be generated here because `pnpm import` needs registry metadata. pnpm is pinned to 10.34.9. CI and the Cloudflare build use the committed npm lockfile with `npm ci` for reproducible installation, then retain the pnpm/Turborepo workspace scripts.

## Publishing status

The Cloudflare Pages and Chrome upload ZIPs are prepared under `release/`. Instructions and store listing copy are in `docs/PUBLISHING.md` and `docs/chrome-store-listing.md`.

Source publication to `Abhisharma08/devkit`, the CI result, the actual Cloudflare URL, and the Chrome listing/submission must be checked independently. A built ZIP or a configured workflow does not mean the site or extension is publicly live.
