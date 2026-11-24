import { notFound } from 'next/navigation';
import { DevKitApp } from '@devkit/ui';
import { serializeJsonLd } from '@devkit/config';
import { findToolPage, toolPages } from '../../../lib/tool-content';
import { applicationSchema, origin, pageMetadata } from '../../../lib/seo';

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return toolPages.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const tool = findToolPage((await params).slug);
  if (!tool) notFound();
  return pageMetadata(`${tool.title} | DevKit`, tool.description, tool.path);
}
export default async function ToolPage({ params }: Props) {
  const tool = findToolPage((await params).slug);
  if (!tool) notFound();
  const related = toolPages.filter(item => tool.related.includes(item.id));
  const schema = applicationSchema(tool.title, tool.description, tool.path);
  const breadcrumbs = origin ? {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'DevKit', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: tool.title, item: `${origin}${tool.path}` },
    ],
  } : undefined;
  return <DevKitApp initialToolId={tool.id} toolHeading={tool.title}>
    <section className="tool-guide" aria-labelledby="guide-title">
      <h2 id="guide-title">How to use this tool</h2>
      <p>{tool.intro}</p>
      <ol>{tool.steps.map(step => <li key={step}>{step}</li>)}</ol>
      <h2>Example</h2><pre>{tool.example}</pre>
      <h2>{tool.question}</h2><p>{tool.answer}</p>
      <h2>Is my input uploaded or saved?</h2>
      <p>No. Processing happens locally in your browser. Tool inputs and results remain in memory and clear when you switch tools or reload. Only theme and favorite IDs are stored. Your clipboard and web host have their own behavior, explained in the <a href="/privacy/">privacy policy</a>.</p>
      <nav aria-label="Related tools"><h2>Related tools</h2><ul>{related.map(item => <li key={item.id}><a href={item.path}>{item.title}</a></li>)}</ul></nav>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs ? [schema, breadcrumbs] : schema) }} />
  </DevKitApp>;
}
