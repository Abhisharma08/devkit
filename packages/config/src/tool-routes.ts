// Public URLs are stable even when the shorter workspace IDs change.
export const toolRoutes = [
  ['json-formatter', 'json-formatter'], ['json-validator', 'json-validator'],
  ['json-minifier', 'json-minifier'], ['sql-formatter', 'sql-formatter'],
  ['number-base', 'number-base-converter'], ['base64', 'base64-encoder-decoder'],
  ['url', 'url-encoder-decoder'], ['curl-to-fetch', 'curl-to-fetch'],
  ['url-inspector', 'url-parser'], ['jwt', 'jwt-decoder'], ['uuid', 'uuid-generator'],
  ['password', 'password-generator'], ['qr', 'qr-code-generator'], ['sha', 'sha-hash-generator'],
  ['random-string', 'random-string-generator'], ['timestamp', 'unix-timestamp-converter'],
  ['cron', 'cron-expression-builder'], ['regex', 'regex-tester'], ['diff', 'text-diff'],
  ['case', 'case-converter'], ['word-count', 'word-counter'], ['color', 'color-converter'],
  ['gradient', 'css-gradient-generator'],
] as const;

export function toolPath(id: string): string {
  const route = toolRoutes.find(([toolId]) => toolId === id);
  if (!route) throw new Error(`Unknown tool: ${id}`);
  return `/tools/${route[1]}/`;
}
