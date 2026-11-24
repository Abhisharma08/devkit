import { DevKitApp } from '@devkit/ui';
import { serializeJsonLd } from '@devkit/config';
import { applicationSchema, homeDescription, homeTitle, pageMetadata } from '../lib/seo';
export const metadata = pageMetadata(homeTitle, homeDescription, '/');
export default function Home() {
  return <DevKitApp>
    <section className="tool-guide" aria-labelledby="about-title">
      <h2 id="about-title">Free developer tools, with local processing</h2>
      <p>Format JSON and SQL, decode Base64 or JWT claims, generate identifiers, and compare text in one workspace. All 23 tools run in your browser. Inputs and results stay in memory; only your theme and favorite tool IDs are saved.</p>
      <p>Choose a tool above, load an example, adjust its options, and run it. Copy the result when you need it, or reset to clear the workspace. Search and keyboard shortcuts help you switch tasks quickly.</p>
      <p>DevKit is free and <a href="https://github.com/Abhisharma08/devkit" rel="noopener noreferrer" target="_blank">open source under the MIT license</a>. There are no accounts, ads, tracking, or paid features. Optional donations support the project.</p>
      <h2>Prefer an offline Chrome toolbox?</h2>
      <p>The <a href="/chrome-extension/">DevKit Chrome extension</a> provides the same tools in a toolbar popup, side panel, and full-page workspace. The installed production extension works offline. The website requires an initial page load; tool operations then execute locally.</p>
      <p>Read the <a href="/privacy/">privacy policy</a> for details about local preferences, clipboard handling, and normal hosting requests.</p>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(applicationSchema('DevKit', homeDescription, '/')) }} />
  </DevKitApp>;
}
