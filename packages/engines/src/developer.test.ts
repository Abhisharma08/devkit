import { describe, expect, it, vi } from 'vitest';
import { convertNumberBase, curlToFetch, inspectURL } from './developer';

function generatedRequest(command: string) {
  const output = curlToFetch(command);
  const match = /const response = await fetch\(("(?:[^"\\]|\\.)*"), ([\s\S]*)\);$/.exec(output);
  expect(match).not.toBeNull();
  return { url: JSON.parse(match![1]!) as string, options: JSON.parse(match![2]!) as { method: string; redirect: string; headers?: [string, string][]; body?: string } };
}

describe('URL inspector', () => {
  it('exposes path, query, fragment and effective port', () => {
    const result = JSON.parse(inspectURL('https://api.example.com:8443/v1/users?page=2#results'));
    expect(result).toMatchObject({ origin: 'https://api.example.com:8443', protocol: 'https', hostname: 'api.example.com', port: '8443', pathname: '/v1/users', hash: '#results', queryParameters: [{ name: 'page', value: '2' }] });
  });
  it('preserves repeated and empty query parameters while decoding values', () => {
    expect(JSON.parse(inspectURL('https://example.com/?tag=a&tag=b&empty=&q=hello+world&emoji=%F0%9F%91%8B')).queryParameters).toEqual([{ name: 'tag', value: 'a' }, { name: 'tag', value: 'b' }, { name: 'empty', value: '' }, { name: 'q', value: 'hello world' }, { name: 'emoji', value: '👋' }]);
  });
  it('supports IPv6 and default ports', () => {
    expect(JSON.parse(inspectURL('http://[::1]/')).hostname).toBe('[::1]');
    expect(JSON.parse(inspectURL('http://localhost/')).port).toBe('80');
    expect(JSON.parse(inspectURL('https://example.com/')).port).toBe('443');
  });
  it.each(['', '/relative', 'hello', 'javascript:alert(1)', 'file:///etc/passwd', 'https://'])('rejects invalid or unsupported URL %s', input => expect(() => inspectURL(input)).toThrow());
  it('bounds input size', () => expect(() => inspectURL('https://example.com/' + 'x'.repeat(16_000))).toThrow(/limit/));
});

describe('Number base converter', () => {
  it.each([['11111111', 2], ['377', 8], ['255', 10], ['ff', 16], ['0xFF', 16], ['0B11111111', 2], ['0o377', 8]])('converts %s from base %s', (input, base) => {
    expect(JSON.parse(convertNumberBase(input, base))).toEqual({ binary: '11111111', octal: '377', decimal: '255', hexadecimal: 'FF' });
  });
  it('handles negatives, explicit plus, zero and leading zeros', () => {
    expect(JSON.parse(convertNumberBase('-0xff', 16)).decimal).toBe('-255');
    expect(JSON.parse(convertNumberBase(' +0010 ', 10)).decimal).toBe('10');
    expect(JSON.parse(convertNumberBase('-0', 10)).decimal).toBe('0');
  });
  it('accepts hexadecimal values starting with 0B without treating them as a binary prefix', () => {
    expect(JSON.parse(convertNumberBase('0B', 16)).decimal).toBe('11');
    expect(JSON.parse(convertNumberBase('0badc0de', 16)).decimal).toBe('195936478');
    expect(JSON.parse(convertNumberBase('0b10', 16)).decimal).toBe('2832');
  });
  it('preserves integer precision beyond JavaScript Number limits', () => {
    expect(JSON.parse(convertNumberBase('9007199254740993')).hexadecimal).toBe('20000000000001');
    expect(JSON.parse(convertNumberBase('20000000000001', 16)).decimal).toBe('9007199254740993');
  });
  it.each([['102', 2], ['8', 8], ['1.5', 10], ['1e3', 10], ['0xff', 10], ['1_000', 10], ['', 10], ['-0x', 16], ['--1', 10], ['abc', 10], ['z', 16], ['1', 3], ['1', NaN]])('rejects %s in base %s', (input, base) => expect(() => convertNumberBase(input, base)).toThrow());
  it('bounds large integers', () => expect(() => convertNumberBase('1'.repeat(4097))).toThrow(/limit/));
});

describe('cURL to fetch converter', () => {
  it('converts a GET without executing it', () => {
    const fetch = vi.spyOn(globalThis, 'fetch');
    try {
      expect(generatedRequest('curl https://example.com')).toEqual({ url: 'https://example.com/', options: { method: 'GET', redirect: 'manual' } });
      expect(fetch).not.toHaveBeenCalled();
    } finally { fetch.mockRestore(); }
  });
  it('converts quoted JSON requests and preserves duplicate headers', () => {
    const result = generatedRequest(`curl 'https://api.example.com/items' -X POST -H 'Content-Type: application/json' -H 'X-Tag: a' -H 'X-Tag: b' --data-raw '{"title":"Hello world"}'`);
    expect(result.options).toMatchObject({ method: 'POST', headers: [['Content-Type', 'application/json'], ['X-Tag', 'a'], ['X-Tag', 'b']], body: '{"title":"Hello world"}' });
  });
  it('supports attached arguments and long options with equals', () => {
    const result = generatedRequest('curl --url=https://example.com -XPATCH -HAccept:application/json --data-raw=hello');
    expect(result.options).toMatchObject({ method: 'PATCH', headers: [['Accept', 'application/json'], ['Content-Type', 'application/x-www-form-urlencoded']], body: 'hello' });
  });
  it('joins data sections and supplies cURL’s default content type', () => {
    expect(generatedRequest("curl https://example.com -d 'a=1' --data 'b=2'").options).toEqual({ method: 'POST', redirect: 'manual', headers: [['Content-Type', 'application/x-www-form-urlencoded']], body: 'a=1&b=2' });
  });
  it('treats empty data as a POST body', () => expect(generatedRequest("curl https://example.com -d ''").options.body).toBe(''));
  it('handles line continuations and escaped quotes', () => {
    const command = 'curl "https://example.com/?a=1&b=2" \\\n -H "X-Message: hello \\"friend\\"" \\\r\n --data-raw "body"';
    expect(generatedRequest(command).options.headers?.[0]).toEqual(['X-Message', 'hello "friend"']);
  });
  it('preserves literal backslashes and newlines inside single quotes', () => {
    const body = 'a\\b\nc';
    expect(generatedRequest(`curl https://example.com --data-raw '${body}'`).options.body).toBe(body);
  });
  it('leaves literal values and generated JavaScript strings escaped', () => {
    const body = '"; globalThis.unwanted = true; //';
    expect(generatedRequest(`curl https://example.com --data-raw '${body}'`).options.body).toBe(body);
    expect(generatedRequest("curl https://example.com --data-raw '$TOKEN'").options.body).toBe('$TOKEN');
    expect(generatedRequest("curl https://example.com --data-raw '@literal'").options.body).toBe('@literal');
  });
  it('supports HEAD, redirects and harmless output flags', () => {
    expect(generatedRequest('curl -sSL --compressed -I https://example.com').options).toEqual({ method: 'HEAD', redirect: 'follow' });
  });
  it.each([
    '', 'wget https://example.com', 'curl', 'curl https://a.example https://b.example',
    'curl https://example.com -X', "curl 'https://example.com", 'curl https://example.com \\',
    "curl https://example.com -d @payload.json", 'curl https://example.com --data-binary @-',
    'curl https://example.com -F file=@file.txt', 'curl https://example.com --proxy localhost',
    "curl https://example.com -H 'Malformed'", "curl https://example.com -H 'Accept:'", "curl https://example.com -H 'X-A: a\nb'",
    'curl https://user:secret@example.com', 'curl file:///etc/passwd',
    "curl https://example.com -X GET -d 'a=1'", "curl https://example.com -I -d 'a=1'", 'curl https://example.com -X TRACE',
    'curl https://example.com; echo unsafe', 'curl https://example.com | cat', 'curl https://example.com > output',
    'curl "$URL"', 'curl $(whoami)', 'curl `whoami`', 'curl https://example.com --silent=yes',
  ])('rejects unsupported or ambiguous commands: %s', command => expect(() => curlToFetch(command)).toThrow());
  it('bounds command size', () => expect(() => curlToFetch('curl ' + 'a'.repeat(50_000))).toThrow(/limit/));
});
