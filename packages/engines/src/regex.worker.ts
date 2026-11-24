import { matchRegex, type RegexRequest } from './regex-core';
self.onmessage = (event: MessageEvent<RegexRequest>) => {
  try { self.postMessage({ result: matchRegex(event.data) }); }
  catch (error) { self.postMessage({ error: error instanceof Error ? error.message : 'Regex failed.' }); }
};
