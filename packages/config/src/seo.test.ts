import { describe, expect, it } from 'vitest';
import { siteOrigin, serializeJsonLd, toolPath, toolRoutes, pagesProductionOrigin } from './index';
import { tools } from '../../ui/src/registry';
import { toolPages } from '../../../apps/web/lib/tool-content';

describe('public tool discovery', () => {
  it('gives every working engine one unique static route and task guide', () => {
    expect(toolRoutes.map(([id]) => id).sort()).toEqual(tools.map(tool => tool.id).sort());
    expect(new Set(toolPages.map(tool => tool.path)).size).toBe(tools.length);
    expect(new Set(toolPages.map(tool => tool.description)).size).toBe(tools.length);
    expect(new Set(toolPages.map(tool => tool.title)).size).toBe(tools.length);
    for (const tool of toolPages) {
      expect(tool.path).toBe(toolPath(tool.id));
      expect(tool.steps.length).toBeGreaterThanOrEqual(3);
      expect(tool.related).not.toContain(tool.id);
      for (const related of tool.related) expect(() => toolPath(related)).not.toThrow();
    }
    expect(() => toolPath('missing')).toThrow('Unknown tool');
  });
  it('keeps JWT search copy explicit about lack of verification', () => {
    expect(toolPages.find(tool => tool.id === 'jwt')?.description).toContain('does not verify signatures');
  });
});
describe('production URL configuration', () => {
  it('omits unknown origins rather than inventing a deployment address', () => {
    expect(siteOrigin('')).toBeUndefined();
    expect(siteOrigin(undefined)).toBeUndefined();
  });
  it('normalizes a configured production origin', () => {
    expect(siteOrigin('https://devkit.pages.dev/')).toBe('https://devkit.pages.dev');
  });
  it('uses a stable Pages alias for main instead of a unique deployment URL', () => {
    expect(pagesProductionOrigin('https://123abc.devkit.pages.dev', 'main')).toBe('https://devkit.pages.dev');
    expect(pagesProductionOrigin('https://devkit.pages.dev', 'main')).toBe('https://devkit.pages.dev');
    expect(pagesProductionOrigin('https://123abc.devkit.pages.dev', 'feature')).toBeUndefined();
    expect(pagesProductionOrigin('https://other.example.org', 'main')).toBeUndefined();
  });
  it.each(['http://devkit.pages.dev', 'https://user:secret@devkit.pages.dev', 'https://devkit.pages.dev/tools/', 'https://devkit.pages.dev/?token=x', 'https://devkit.pages.dev/#x', 'https://devkit.pages.dev:444', 'https://localhost', 'https://example.com', 'not a url'])('rejects invalid canonical origin %s', value => {
    expect(() => siteOrigin(value)).toThrow();
  });
  it('prevents structured content from terminating a script element', () => {
    const content = { name: '</script><script>alert(1)</script>', symbols: '& >' };
    const json = serializeJsonLd(content);
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual(content);
  });
});
