import { limitInput } from './core';

function httpURL(input: string): URL {
  let url: URL;
  try { url = new URL(input); } catch { throw new Error('Enter an absolute HTTP or HTTPS URL.'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP and HTTPS URLs are supported.');
  return url;
}

export function inspectURL(input: string): string {
  limitInput(input, 16_000);
  const url = httpURL(input.trim());
  return JSON.stringify({
    url: url.href,
    origin: url.origin,
    protocol: url.protocol.slice(0, -1),
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? '443' : '80'),
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    queryParameters: [...url.searchParams].map(([name, value]) => ({ name, value })),
  }, null, 2);
}

export function convertNumberBase(input: string, base = 10): string {
  limitInput(input, 4096);
  if (![2, 8, 10, 16].includes(base)) throw new Error('Choose input base 2, 8, 10, or 16.');
  let digits = input.trim();
  const negative = digits.startsWith('-');
  if (/^[+-]/.test(digits)) digits = digits.slice(1);
  const prefix = /^0([box])/i.exec(digits);
  // In base 16, a leading 0B is also a valid pair of hexadecimal digits.
  if (prefix && !(base === 16 && prefix[1]!.toLowerCase() === 'b')) {
    const prefixBase = ({ b: 2, o: 8, x: 16 } as Record<string, number>)[prefix[1]!.toLowerCase()];
    if (base !== prefixBase) throw new Error('The numeric prefix does not match the selected input base.');
    digits = digits.slice(2);
  }
  const digitPatterns: Record<number, RegExp> = { 2: /^[01]+$/, 8: /^[0-7]+$/, 10: /^\d+$/, 16: /^[\da-f]+$/i };
  const validDigits = digitPatterns[base]!;
  if (!validDigits.test(digits)) throw new Error(`Enter a whole number using only base-${base} digits. Fractions and separators are not supported.`);
  const prefixes: Record<number, string> = { 2: '0b', 8: '0o', 10: '', 16: '0x' };
  const magnitude = BigInt(prefixes[base]! + digits);
  const value = negative ? -magnitude : magnitude;
  return JSON.stringify({ binary: value.toString(2), octal: value.toString(8), decimal: value.toString(10), hexadecimal: value.toString(16).toUpperCase() }, null, 2);
}

// A limited POSIX-style tokenizer. It never evaluates a shell command or expands variables.
function tokenizeCurl(source: string): string[] {
  const tokens: string[] = [];
  let token = '', quote: "'" | '"' | null = null, started = false;
  const push = () => { if (started) tokens.push(token); token = ''; started = false; };
  for (let index = 0; index < source.length; index++) {
    const character = source[index]!;
    if (quote === "'") {
      if (character === "'") quote = null;
      else token += character;
      continue;
    }
    if (character === '\\') {
      const next = source[index + 1];
      if (next === undefined) throw new Error('The command ends with an incomplete backslash escape.');
      if (next === '\n') { index++; continue; }
      if (next === '\r' && source[index + 2] === '\n') { index += 2; continue; }
      if (quote === '"' && !['"', '\\', '$', '`'].includes(next)) token += '\\';
      token += next; index++; started = true; continue;
    }
    if (character === '$' || character === '`') throw new Error('Shell expansion is not supported. Replace variables with literal values or use single quotes.');
    if (quote === '"') {
      if (character === '"') quote = null;
      else token += character;
      continue;
    }
    if (character === "'" || character === '"') { quote = character; started = true; continue; }
    if (/\s/.test(character)) { push(); continue; }
    if (/[;|&<>]/.test(character) || (character === '#' && !started)) throw new Error('Use one cURL command without shell operators or comments. Quote URLs containing &.');
    token += character; started = true;
  }
  if (quote) throw new Error('The command contains an unclosed quote.');
  push();
  return tokens;
}

export function curlToFetch(input: string): string {
  limitInput(input, 50_000);
  const tokens = tokenizeCurl(input.trim());
  if (tokens.shift() !== 'curl') throw new Error('Start with a single curl command using POSIX-style quotes.');
  let urlText: string | undefined, explicitMethod: string | undefined, head = false, follow = false;
  const headers: [string, string][] = [];
  const data: string[] = [];
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]!;
    let flag = token, inline: string | undefined;
    if (token.startsWith('--') && token.includes('=')) { const equals = token.indexOf('='); flag = token.slice(0, equals); inline = token.slice(equals + 1); }
    else if (/^-[HXd].+/.test(token)) { flag = token.slice(0, 2); inline = token.slice(2); }
    const argument = () => {
      if (inline !== undefined) return inline;
      const next = tokens[++index];
      if (next === undefined) throw new Error(`Missing value after ${flag}.`);
      return next;
    };
    if (['-X', '--request'].includes(flag)) { explicitMethod = argument().toUpperCase(); continue; }
    if (flag === '--url') {
      if (urlText !== undefined) throw new Error('Only one URL can be converted at a time.');
      urlText = argument(); continue;
    }
    if (['-H', '--header'].includes(flag)) {
      const value = argument(), colon = value.indexOf(':');
      const name = value.slice(0, colon).trim(), content = value.slice(colon + 1).trim();
      if (colon <= 0 || !/^[!#$%&'*+.^_`|~\da-z-]+$/i.test(name) || !content || /[\r\n\0]/.test(value)) throw new Error('Use headers in the form Name: value. Header files, removals, and empty headers are not supported.');
      headers.push([name, content]); continue;
    }
    if (['-d', '--data', '--data-raw', '--data-binary'].includes(flag)) {
      const value = argument();
      if (flag !== '--data-raw' && value.startsWith('@')) throw new Error('File and stdin data are not supported. Paste inline data or use --data-raw for a literal @.');
      data.push(value); continue;
    }
    if (inline !== undefined) throw new Error(`Unsupported option: ${flag}.`);
    if (['-I', '--head'].includes(flag)) { head = true; continue; }
    if (['-L', '--location'].includes(flag)) { follow = true; continue; }
    if (['--silent', '--show-error', '--compressed'].includes(flag)) continue;
    if (/^-[sSL]+$/.test(flag)) { if (flag.includes('L')) follow = true; continue; }
    if (flag.startsWith('-')) throw new Error(`Unsupported option: ${flag}. Supported options: -X, -H, -d, -I, -L, --url, --data-raw, --data-binary, --compressed, and silent flags.`);
    if (urlText !== undefined) throw new Error('Only one URL can be converted at a time.');
    urlText = token;
  }
  if (!urlText) throw new Error('Include an absolute HTTP or HTTPS URL.');
  const url = httpURL(urlText);
  if (url.username || url.password) throw new Error('Fetch cannot use credentials in a URL. Supply an Authorization header instead.');
  const method = explicitMethod ?? (head ? 'HEAD' : data.length ? 'POST' : 'GET');
  if (!['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'].includes(method)) throw new Error('Use GET, HEAD, POST, PUT, PATCH, DELETE, or OPTIONS.');
  if (data.length && (head || ['GET', 'HEAD'].includes(method))) throw new Error('Fetch cannot send a body with GET or HEAD. Choose a body-capable method or move the data into the URL.');
  if (data.length && !headers.some(([name]) => name.toLowerCase() === 'content-type')) headers.push(['Content-Type', 'application/x-www-form-urlencoded']);
  const options: { method: string; redirect: string; headers?: [string, string][]; body?: string } = { method, redirect: follow ? 'follow' : 'manual' };
  if (headers.length) options.headers = headers;
  if (data.length) options.body = data.join('&');
  return '// Generated code only. Review before running.\n// Browser CORS, cookie, and forbidden-header rules still apply.\n' + `const response = await fetch(${JSON.stringify(url.href)}, ${JSON.stringify(options, null, 2)});`;
}
