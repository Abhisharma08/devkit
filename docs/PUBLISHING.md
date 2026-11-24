# Publish DevKit

Repository: https://github.com/Abhisharma08/devkit

The website uses Cloudflare Pages; the extension is submitted separately to the Chrome Web Store. Publishing the website does not publish the extension.

## Cloudflare Pages: connect GitHub

Use this route for automatic updates from the supplied repository. In the [Cloudflare dashboard](https://dash.cloudflare.com/), open Workers & Pages and create a **Pages** application connected to GitHub. Authorize access to **Abhisharma08/devkit**, then select that repository.

Use these settings:

| Setting | Value |
| --- | --- |
| Project name | `devkit-abhisharma08` (or another available name) |
| Production branch | `main` |
| Framework preset | None |
| Root directory | Repository root; leave blank |
| Build command | `npm ci && npm run lint && npm test && npm run build --workspace @devkit/web` |
| Build output directory | `apps/web/out` |
| Environment variable | `NODE_VERSION=24` |
| Environment variable | `SKIP_DEPENDENCY_INSTALL=true` |

The explicit `npm ci` uses the committed lockfile; skip Cloudflare's separate automatic dependency installation. pnpm workspaces and Turborepo remain available for local orchestration. Do not select a server-rendered Next.js adapter or provision a database: this app exports static files.

Click **Save and Deploy**. Cloudflare assigns the actual `https://<project>.pages.dev` address after deployment; the suggested project name has not been reserved. Check the homepage and `/privacy/` over HTTPS, run a tool, and check the donation link. No app environment secrets are required.

Save the actual public website URL. The Chrome listing privacy URL will be that address followed by `/privacy/`.

Cloudflare's [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/) automatically rebuilds connected branches. Its [build image documentation](https://developers.cloudflare.com/pages/configuration/build-image/) explains the dependency-install setting.

## Alternative: upload the prebuilt ZIP

`release/devkit-cloudflare-pages-1.0.0.zip` contains the website with `index.html` and `_headers` at its root. Create a Pages **Direct Upload** project and upload that ZIP. It does not contain the source repository or extension.

Choose the project type deliberately: Cloudflare does not allow a Direct Upload project to be converted to Git integration. A new project is needed for that change. See the [Direct Upload documentation](https://developers.cloudflare.com/pages/get-started/direct-upload/).

An optional manual GitHub Actions workflow also supports Wrangler deployment. It needs `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets and the `CLOUDFLARE_PAGES_PROJECT` variable. Configure these in GitHub/Cloudflare, not in chat or source files. The token needs only the Pages permissions for the intended account. The workflow does not run automatically.

## Chrome Web Store

1. Confirm the **Verify DevKit** workflow passes, including browser and offline-extension tests. Download its `devkit-release` artifact; it includes the ZIPs and real screenshots generated on the Linux runner.
2. Before submission, inspect the screenshots and manually load `apps/extension/.output/chrome-mv3` using `chrome://extensions` → Developer mode → Load unpacked. Check popup expansion, native side-panel opening, full-page tools, and the donation link. Test offline with synthetic inputs.
3. In the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole), choose **Add new item** and upload `release/devkit-chrome-1.0.0.zip`. Upload the ZIP with `manifest.json` at its root; do not upload the website ZIP, a `.crx`, or the source repository.
4. Use [chrome-store-listing.md](chrome-store-listing.md) for the description, single-purpose statement, side-panel justification, and privacy answers. Supply the actual deployed Pages URL and its `/privacy/` page. Use the developer account's real support email and verify it if prompted.
5. Upload the 128 px store icon and at least one actual screenshot from `release/store-assets`. The capture script creates 1280×800 screenshots; inspect them for layout issues and avoid real credentials or personal data. Promo tiles and videos are optional.
6. Select the intended distribution/visibility settings and submit for Google's review. Review approval and public listing availability are controlled by Google; uploading a ZIP is not approval or publication.

The [official listing guide](https://developer.chrome.com/docs/webstore/cws-dashboard-listing) specifies required icons and screenshots. See the [publishing guide](https://developer.chrome.com/docs/webstore/publish) for the complete dashboard flow.

## Rebuild the release

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run release:package
pnpm exec playwright install chromium
npm run test:e2e
npm run release:screenshots
```

Node 24, pnpm 10.34.9, and Python 3 are required. CI installs pnpm from `package.json`. The Chrome package is an MV3 extension with only the `sidePanel` permission. `release/SHA256SUMS.txt` records the ZIP checksums. `release/` is generated output and is not committed.

Once a normal registry-enabled pnpm installation generates `pnpm-lock.yaml`, commit it and switch CI installation to `pnpm install --frozen-lockfile`. The npm lockfile currently records the verified dependency graph; no fabricated or partial pnpm lockfile is supplied.
