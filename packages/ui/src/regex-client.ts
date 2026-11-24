export function runRegex(pattern: string, flags: string, input: string, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new Error('Cancelled.')); return; }
    const worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' });
    const finish = (error?: string, value?: string) => {
      clearTimeout(timer); worker.terminate(); signal?.removeEventListener('abort', cancel);
      if (error) reject(new Error(error)); else resolve(value!);
    };
    const cancel = () => finish('Cancelled.');
    const timer = setTimeout(() => finish('Regex exceeded the 750 ms limit. Worker terminated. Simplify your pattern or reduce the input.'), 750);
    signal?.addEventListener('abort', cancel, { once: true });
    worker.onmessage = event => finish(event.data.error, JSON.stringify(event.data.result, null, 2));
    worker.onerror = () => finish('Regex worker failed to start or execute.');
    worker.postMessage({ pattern, flags, input });
  });
}
