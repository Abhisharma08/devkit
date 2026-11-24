# Security policy

Security fixes target the latest release. Until a verified first release is published, this repository is unreleased software.

Use the repository's **Security → Report a vulnerability** private reporting feature, if enabled, for sensitive findings. Maintainers must enable private reporting or publish a monitored security contact before release. If no private channel is available, open an issue asking for one without including exploit details or secrets. Do not publish real tokens, passwords, personal data, or proprietary inputs.

Provide affected versions, reproduction steps with synthetic data, expected impact, and any suggested mitigation. Do not probe third-party systems or other users' data.

## Security invariants

- Tool contents never enter persistent storage, URLs, logs, or network requests.
- No telemetry, authentication, backend, remote tool API, remote executable code, or advertising.
- Browser permissions remain minimal; additions require an explicit documented need.
- Native regex evaluation runs only inside a disposable, time-limited worker.
- Security-sensitive generation and hashes use Web Crypto.
- JWT decoding must never be represented as signature verification.
- User content is escaped; generated SVG is rendered as an image, never HTML.

Review dependency updates, run verification, inspect production CSP and permissions, and test real browser surfaces before release. Automated tests are evidence, not a substitute for code review or Chrome Web Store review.
