import QRCode from 'qrcode';
import { diffLines } from 'diff';

export const MAX_INPUT = 1_000_000;
export function limitInput(input: string, max = MAX_INPUT): void {
  if (input.length > max) throw new Error(`Input exceeds the ${max.toLocaleString('en-US')} character limit.`);
}
export function formatJSON(input: string, indent = 2): string {
  limitInput(input);
  if (![2, 4].includes(indent)) throw new Error('Indent must be 2 or 4 spaces.');
  return JSON.stringify(JSON.parse(input), null, indent);
}
export function validateJSON(input: string): string {
  limitInput(input); JSON.parse(input); return 'Valid JSON';
}
export function minifyJSON(input: string): string { limitInput(input); return JSON.stringify(JSON.parse(input)); }
export function encodeBase64(input: string): string {
  limitInput(input);
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export function decodeBase64(input: string): string {
  limitInput(input);
  const clean = input.replace(/\s/g, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(clean)) throw new Error('Invalid Base64. Use the standard alphabet and padding.');
  try {
    const binary = atob(clean);
    if (btoa(binary) !== clean) throw new Error('Noncanonical Base64.');
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
  } catch { throw new Error('Base64 does not contain valid UTF-8 text.'); }
}
export function encodeURL(input: string): string { limitInput(input); return encodeURIComponent(input); }
export function decodeURL(input: string): string { limitInput(input); return decodeURIComponent(input); }
function decodeSegment(segment: string): unknown {
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) throw new Error('Invalid JWT Base64url segment.');
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const value: unknown = JSON.parse(decodeBase64(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JWT header and payload must be JSON objects.');
  return value;
}
export function decodeJWT(input: string): string {
  limitInput(input, 100_000);
  const segments = input.trim().split('.');
  if (segments.length !== 3 || !/^[A-Za-z0-9_-]*$/.test(segments[2]!)) throw new Error('Expected a JWT with three dot-separated segments.');
  return JSON.stringify({ warning: 'Decoded only. Signature NOT verified. Never trust these claims without verification.', header: decodeSegment(segments[0]!), payload: decodeSegment(segments[1]!) }, null, 2);
}
function integer(value: number, min: number, max: number, label: string): void {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${label} must be an integer from ${min} to ${max}.`);
}
export function generateUUIDs(count = 1): string { integer(count, 1, 100, 'Count'); return Array.from({ length: count }, () => crypto.randomUUID()).join('\n'); }
function randomIndex(size: number): number {
  const range = 0x100000000;
  const cutoff = range - range % size;
  const buffer = new Uint32Array(1);
  do { crypto.getRandomValues(buffer); } while (buffer[0]! >= cutoff);
  return buffer[0]! % size;
}
export function randomString(length = 32, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  integer(length, 1, 4096, 'Length');
  const chars = [...new Set([...alphabet])];
  integer(chars.length, 2, 256, 'Unique alphabet characters');
  return Array.from({ length }, () => chars[randomIndex(chars.length)]).join('');
}
export const passwordGroups = { upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', digits: '0123456789', symbols: '!@#$%^&*()-_=+[]{};:,.?' };
export function generatePassword(length = 24, groups: (keyof typeof passwordGroups)[] = ['upper', 'lower', 'digits', 'symbols']): string {
  const selected = [...new Set(groups)];
  if (!selected.length || selected.some(g => !(g in passwordGroups))) throw new Error('Select at least one valid character group.');
  integer(length, Math.max(4, selected.length), 256, 'Password length');
  const chars = selected.map(g => randomString(1, passwordGroups[g]));
  chars.push(...randomString(length - selected.length || 1, selected.map(g => passwordGroups[g]).join('')).slice(0, length - selected.length));
  for (let i = chars.length - 1; i > 0; i--) { const j = randomIndex(i + 1); [chars[i], chars[j]] = [chars[j]!, chars[i]!]; }
  return chars.join('');
}
export async function generateQR(input: string, correction: 'L' | 'M' | 'Q' | 'H' = 'M'): Promise<string> {
  if (!input) throw new Error('Enter some text to generate a QR code.');
  limitInput(input, 2000);
  if (!['L', 'M', 'Q', 'H'].includes(correction)) throw new Error('Invalid error correction level.');
  return QRCode.toString(input, { type: 'svg', errorCorrectionLevel: correction, margin: 4, width: 300 });
}
export async function hashText(input: string, algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'): Promise<string> {
  limitInput(input);
  if (!['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].includes(algorithm)) throw new Error('Unsupported SHA algorithm.');
  const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function convertTimestamp(input: string, unit: 'seconds' | 'milliseconds' = 'seconds'): string {
  const clean = input.trim();
  if (!clean) throw new Error('Enter a Unix timestamp or an ISO 8601 date with a timezone.');
  if (!['seconds', 'milliseconds'].includes(unit)) throw new Error('Invalid timestamp unit.');
  let ms: number;
  if (/^-?\d+(?:\.\d+)?$/.test(clean)) ms = Number(clean) * (unit === 'seconds' ? 1000 : 1);
  else {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(clean)) throw new Error('Use ISO 8601 with a timezone, e.g. 2026-01-01T00:00:00Z.');
    const [year, month, day] = clean.slice(0, 10).split('-').map(Number);
    const calendar = new Date(0); calendar.setUTCFullYear(year!, month!, 0);
    if (month! < 1 || month! > 12 || day! < 1 || day! > calendar.getUTCDate()) throw new Error('Invalid calendar date.');
    ms = Date.parse(clean);
  }
  const date = new Date(ms);
  if (!Number.isFinite(ms) || Number.isNaN(date.getTime())) throw new Error('Timestamp is outside the supported date range.');
  return JSON.stringify({ iso: date.toISOString(), unixSeconds: Math.floor(date.getTime() / 1000), unixMilliseconds: date.getTime(), local: date.toString() }, null, 2);
}
export function textDiff(before: string, after: string): string {
  limitInput(before, 50_000); limitInput(after, 50_000);
  const changes = diffLines(before, after, { timeout: 500, maxEditLength: 5000 });
  if (!changes) throw new Error('Diff is too complex. Try smaller inputs.');
  return changes.map(part => part.value.split('\n').filter((line, i, lines) => i < lines.length - 1 || line !== '').map(line => `${part.added ? '+' : part.removed ? '-' : ' '} ${line}`).join('\n')).filter(Boolean).join('\n');
}
export type CaseMode = 'camel' | 'pascal' | 'snake' | 'kebab' | 'upper' | 'lower' | 'title' | 'sentence';
export function convertCase(input: string, mode: CaseMode): string {
  limitInput(input);
  if (mode === 'upper') return input.toUpperCase();
  if (mode === 'lower') return input.toLowerCase();
  const words = input.replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2').replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, '$1 $2').match(/[\p{L}\p{N}]+/gu)?.map(w => w.toLowerCase()) ?? [];
  const title = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  switch (mode) {
    case 'camel': return words.map((w, i) => i ? title(w) : w).join('');
    case 'pascal': return words.map(title).join('');
    case 'snake': return words.join('_');
    case 'kebab': return words.join('-');
    case 'title': return words.map(title).join(' ');
    case 'sentence': return words.map((w, i) => i ? w : title(w)).join(' ');
    default: throw new Error('Unsupported case mode.');
  }
}
export function countWords(input: string): string {
  limitInput(input);
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
  const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  const words = [...segmenter.segment(input)].filter(s => s.isWordLike).length;
  return JSON.stringify({ words, characters: [...input].length, graphemes: [...graphemes.segment(input)].length, charactersWithoutWhitespace: [...input.replace(/\s/gu, '')].length, lines: input ? input.split(/\r\n|\r|\n/).length : 0, bytes: new TextEncoder().encode(input).length, readingTimeMinutes: Math.ceil(words / 200) }, null, 2);
}
function bounded(value: number, max: number, name: string) { if (!Number.isFinite(value) || value < 0 || value > max) throw new Error(`${name} must be between 0 and ${max}.`); return value; }
export function convertColor(input: string): { hex: string; rgb: string; hsl: string } {
  const value = input.trim();
  let rgb: number[];
  const hex = /^#([a-f\d]{3}|[a-f\d]{6})$/i.exec(value);
  const rgbMatch = /^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i.exec(value);
  const hsl = /^hsl\(\s*([\d.+-]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i.exec(value);
  if (hex) { const h = hex[1]!.length === 3 ? [...hex[1]!].map(c => c + c).join('') : hex[1]!; rgb = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  else if (rgbMatch) rgb = rgbMatch.slice(1).map(c => Math.round(bounded(Number(c), 255, 'RGB channel')));
  else if (hsl) {
    const hue = Number(hsl[1]); if (!Number.isFinite(hue)) throw new Error('Invalid hue.');
    const h = ((hue % 360) + 360) % 360 / 360, s = bounded(Number(hsl[2]), 100, 'Saturation') / 100, l = bounded(Number(hsl[3]), 100, 'Lightness') / 100;
    const a = s * Math.min(l, 1 - l);
    rgb = [0, 8, 4].map(n => { const k = (n + h * 12) % 12; return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255); });
  } else throw new Error('Use #RGB, #RRGGBB, rgb(r, g, b), or hsl(h, s%, l%). Alpha and named colors are not supported.');
  const [r, g, b] = rgb.map(c => c / 255) as [number, number, number];
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min, light = (max + min) / 2;
  let hue = 0;
  if (delta) hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  const sat = delta ? delta / (1 - Math.abs(2 * light - 1)) : 0;
  return { hex: '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join(''), rgb: `rgb(${rgb.join(', ')})`, hsl: `hsl(${Math.round((hue * 60 + 360) % 360)}, ${Math.round(sat * 100)}%, ${Math.round(light * 100)}%)` };
}
export function generateGradient(start: string, end: string, angle = 135): string {
  bounded(angle, 360, 'Angle');
  return `background: linear-gradient(${angle}deg, ${convertColor(start).hex} 0%, ${convertColor(end).hex} 100%);`;
}
