import { DevKitApp } from '@devkit/ui';
import { projectConfig } from '@devkit/config';
import { pageMetadata } from '../../lib/seo';
export const metadata = pageMetadata('Free Offline Developer Tools Chrome Extension | DevKit', 'DevKit brings JSON formatting, JWT decoding, Base64, UUIDs, regex, and 18 more local tools to a Chrome popup, side panel, and full-page workspace.', '/chrome-extension/');
export default function ChromeExtension() {
  return <DevKitApp pageHeading="DevKit Chrome extension"><section className="tool-guide" aria-labelledby="extension-title">
    <h2 id="extension-title">DevKit: an offline developer toolbox for Chrome</h2>
    <p>Use the same 23 developer tools in a toolbar popup, Chrome side panel, or a full-page workspace. The installed production extension processes data locally and works offline. No accounts, tracking, ads, or paywalls.</p>
    <p><a className="button button-outline" href={projectConfig.chromeStoreUrl} target="_blank" rel="noopener noreferrer">Add to Chrome — free</a></p>
    <p>Open the Chrome Web Store listing, select Add to Chrome, and confirm installation. Pin DevKit from Chrome’s Extensions menu for quick access.</p>
    <h2>Everyday developer workflows</h2>
    <ul><li><a href="/tools/json-formatter/">Format JSON</a>, validate syntax, minify payloads, and beautify SQL.</li><li><a href="/tools/jwt-decoder/">Decode JWT claims</a>, convert Base64 and URL components, and inspect URLs.</li><li>Generate UUID v4 values, random strings, passwords, QR codes, and SHA hashes.</li><li>Test regex patterns, compare text, convert timestamps, and build cron schedules.</li></ul>
    <h2>Build from source instead</h2>
    <p>Developers can also build and load the open-source version locally:</p>
    <ol><li>Download the <a href="https://github.com/Abhisharma08/devkit">DevKit source repository</a> and follow its build instructions, or use a verified Chrome ZIP from the project’s release artifacts when available.</li><li>Extract the Chrome ZIP. For a source build, use <code>apps/extension/.output/chrome-mv3</code>.</li><li>Open <code>chrome://extensions</code>, enable Developer mode, and select Load unpacked.</li><li>Select the folder containing <code>manifest.json</code>. Pin DevKit through Chrome’s Extensions menu.</li></ol>
    <h2>Minimal browser permissions</h2>
    <p>DevKit requests only the sidePanel permission to open its side panel. It has no host permissions or content scripts and cannot read the pages you visit. Inputs are never saved by default; only favorites and your theme persist.</p>
    <p>JWT decoding does not verify signatures. The cURL converter generates code without sending requests. See the <a href="/privacy/">privacy policy</a> and <a href="https://github.com/Abhisharma08/devkit/blob/main/docs/PUBLISHING.md">installation and publishing documentation</a>.</p>
  </section></DevKitApp>;
}
