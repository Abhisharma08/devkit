import { expect, it } from 'vitest';
import { tools } from './registry';
it.each(['curl-to-fetch', 'url-inspector', 'number-base'])('%s runs through the shared registry with its visible example and defaults', async id => {
  const tool = tools.find(tool => tool.id === id)!;
  const values = Object.fromEntries(tool.fields?.map(field => [field.key, field.defaultValue]) ?? []);
  const result = await tool.run(tool.sample!, values, '');
  if (id === 'curl-to-fetch') {
    expect(result).toContain('const response = await fetch(');
    expect(result).toContain('"method": "POST"');
  } else if (id === 'url-inspector') {
    expect(JSON.parse(result).queryParameters.filter((param: { name: string }) => param.name === 'tag')).toHaveLength(2);
  } else {
    expect(JSON.parse(result).hexadecimal).toBe('FF');
  }
});
