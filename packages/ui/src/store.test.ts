import { expect, it } from 'vitest';
import { tools } from './registry';
import { mergePreferences, usePreferences } from './store';
it('rehydrates every registered favorite, including tools beyond the original 20', () => {
  const ids = tools.map(tool => tool.id);
  const restored = mergePreferences({ theme: 'light', favorites: ids }, usePreferences.getState());
  expect(restored.favorites).toEqual(ids);
  expect(restored.theme).toBe('light');
});
it('drops unknown and duplicate favorite identifiers while preserving registered tools', () => {
  const restored = mergePreferences({ favorites: ['unknown-tool', 'curl-to-fetch', 'curl-to-fetch', null, 7, 'url-inspector'] }, usePreferences.getState());
  expect(restored.favorites).toEqual(['curl-to-fetch', 'url-inspector']);
});
it('restores only allowed preferences, never tool contents', () => {
  const restored = mergePreferences({ theme: 'light', favorites: ['curl-to-fetch'], input: 'secret-input', output: 'secret-result' }, usePreferences.getState());
  expect(restored).not.toHaveProperty('input');
  expect(restored).not.toHaveProperty('output');
});
