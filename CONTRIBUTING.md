# Contributing to DevKit

DevKit welcomes bug fixes, accessible interfaces, well-tested tools, and documentation improvements. Be respectful and constructive. The product must remain entirely free; optional donations are its only revenue mechanism.

## Development

Use Node 24 and the pnpm version declared in package.json. Run `pnpm install`, then `pnpm dev:web` or `pnpm dev:extension`. After the first network-enabled installation, commit pnpm-lock.yaml and require frozen installs in CI.

Keep pure operations in `packages/engines`, shared UI in `packages/ui`, product settings in `packages/config`, and platform code in the apps. Add registry metadata and a component mapping for each new tool. Prefer existing shared controls and theme tokens.

## Pull requests

Explain the user-facing problem, resulting behavior, and validation performed. Keep changes focused. Add engine tests for new operations and meaningful edge cases; add browser tests for new user workflows. Do not submit real tokens, passwords, proprietary SQL, or personal data as fixtures.

Before review, run:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
node scripts/verify-artifacts.mjs
pnpm exec playwright install chromium
pnpm test:e2e
pnpm package:extension
```

Check both themes, a narrow viewport, keyboard-only use, the popup, native side panel, and full-page extension. Confirm that processing emits no external requests. Keep security warnings specific and understandable. Do not add telemetry, accounts, a backend, remote executable code, broad browser permissions, paid APIs, or saved inputs by default.

## Security reports

Follow SECURITY.md. Avoid public disclosure of exploitable vulnerabilities or sensitive inputs.

## Licensing

By contributing, you agree to make your contribution available under the project's MIT license. Preserve third-party copyright notices and verify dependency licenses before adding them.
