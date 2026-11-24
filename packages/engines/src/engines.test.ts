import { describe, expect, it } from 'vitest';
import * as e from './core';
import { matchRegex } from './regex-core';

describe('JSON formatter', () => {
  it('formats nested values and keeps valid primitives', () => { expect(e.formatJSON('{"b":[true,null]}')).toBe('{\n  "b": [\n    true,\n    null\n  ]\n}'); expect(e.formatJSON('null')).toBe('null'); });
  it('validates indentation and syntax', () => { expect(() => e.formatJSON('{}', 8)).toThrow(); expect(() => e.formatJSON('{')).toThrow(); });
});
describe('JSON validator', () => {
  it('accepts all JSON values', () => { for (const value of ['{}', '[]', 'true', '42', 'null', '"a"']) expect(e.validateJSON(value)).toBe('Valid JSON'); });
  it('rejects trailing commas, empty input and oversized input', () => { for (const value of ['', '{"a":1,}', 'x'.repeat(e.MAX_INPUT + 1)]) expect(() => e.validateJSON(value)).toThrow(); });
});
describe('JSON minifier', () => {
  it('removes whitespace while preserving string content', () => expect(e.minifyJSON('{ "a": "a b" }')).toBe('{"a":"a b"}'));
  it('rejects malformed JSON', () => expect(() => e.minifyJSON('undefined')).toThrow());
});

describe('Base64', () => {
  it.each(['', 'hello', '你好 👋 café', '\u0000\n'])('round trips %j as UTF-8', value => expect(e.decodeBase64(e.encodeBase64(value))).toBe(value));
  it('uses standard encoding', () => expect(e.encodeBase64('hello')).toBe('aGVsbG8='));
  it.each(['@@@=', 'Zg', 'Zh==', '/w=='])('rejects invalid Base64 or UTF-8: %s', value => expect(() => e.decodeBase64(value)).toThrow());
});
describe('URL components', () => {
  it('round trips Unicode and reserved characters', () => { const value = 'a+b /?你好'; expect(e.decodeURL(e.encodeURL(value))).toBe(value); expect(e.decodeURL('a+b')).toBe('a+b'); });
  it('rejects malformed escapes and invalid UTF-16', () => { expect(() => e.decodeURL('%ZZ')).toThrow(); expect(() => e.encodeURL('\ud800')).toThrow(); });
});
describe('JWT decoder', () => {
  it('decodes objects with an explicit authenticity warning', () => { const token = 'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZXZraXQifQ.'; const decoded = JSON.parse(e.decodeJWT(token)); expect(decoded.payload.sub).toBe('devkit'); expect(decoded.warning).toContain('NOT verified'); });
  it.each(['a.b', '@.a.b', 'W10.e30.', 'bnVsbA.e30.'])('rejects invalid compact tokens: %s', token => expect(() => e.decodeJWT(token)).toThrow());
});
describe('UUID generator', () => {
  it('generates unique RFC v4 UUIDs', () => { const ids = e.generateUUIDs(100).split('\n'); expect(new Set(ids).size).toBe(100); ids.forEach(id => expect(id).toMatch(/^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/)); });
  it.each([0, 101, 1.1, NaN])('rejects invalid count %s', count => expect(() => e.generateUUIDs(count)).toThrow());
});
describe('Password generator', () => {
  it('includes every requested character class', () => { for (let i = 0; i < 20; i++) { const password = e.generatePassword(24); expect(password).toHaveLength(24); expect(password).toMatch(/[A-Z]/); expect(password).toMatch(/[a-z]/); expect(password).toMatch(/\d/); expect(password).toMatch(/[^A-Za-z0-9]/); } });
  it('supports a minimum password and letters only', () => { expect(e.generatePassword(4)).toHaveLength(4); expect(e.generatePassword(16, ['lower'])).toMatch(/^[a-z]{16}$/); });
  it('rejects invalid length and no groups', () => { expect(() => e.generatePassword(3)).toThrow(); expect(() => e.generatePassword(24, [])).toThrow(); });
});
describe('QR generator', () => {
  it('produces a complete local SVG', async () => { const svg = await e.generateQR('https://example.com'); expect(svg).toContain('<svg'); expect(svg).toContain('<path'); expect(svg).not.toContain('<script'); });
  it('rejects empty and oversized content', async () => { await expect(e.generateQR('')).rejects.toThrow(); await expect(e.generateQR('x'.repeat(2001))).rejects.toThrow(); });
});
describe('SHA hashing', () => {
  it('matches the SHA-256 known-answer vector', async () => expect(await e.hashText('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'));
  it.each([['SHA-1', 40], ['SHA-256', 64], ['SHA-384', 96], ['SHA-512', 128]] as const)('supports %s', async (algorithm, length) => expect(await e.hashText('', algorithm)).toHaveLength(length));
});
describe('Random string', () => {
  it('respects length, alphabets and Unicode characters', () => { expect(e.randomString(100, 'aab')).toMatch(/^[ab]{100}$/); expect([...e.randomString(12, '👋🌍')]).toHaveLength(12); });
  it('rejects degenerate alphabets and invalid lengths', () => { expect(() => e.randomString(10, 'a')).toThrow(); expect(() => e.randomString(0)).toThrow(); });
});
describe('Unix timestamp converter', () => {
  it('converts epoch, milliseconds, negative times, and explicit offsets', () => { expect(JSON.parse(e.convertTimestamp('0')).iso).toBe('1970-01-01T00:00:00.000Z'); expect(JSON.parse(e.convertTimestamp('1000', 'milliseconds')).unixSeconds).toBe(1); expect(JSON.parse(e.convertTimestamp('-1')).unixSeconds).toBe(-1); expect(JSON.parse(e.convertTimestamp('2026-01-01T05:30:00+05:30')).iso).toBe('2026-01-01T00:00:00.000Z'); });
  it.each(['', '2026-02-30T00:00:00Z', '2026-01-01', '9999999999999999999', 'NaN'])('rejects invalid date %s', value => expect(() => e.convertTimestamp(value)).toThrow());
});

describe('Regex worker engine (safe fixtures only)', () => {
  it('returns capture groups and positions', () => { const result = matchRegex({ pattern: '(?<word>hello)', flags: 'g', input: 'hello hello' }); expect(result.matches.map(m => m.index)).toEqual([0, 6]); expect(result.matches[0]!.namedGroups).toEqual({ word: 'hello' }); });
  it('handles zero-width matches, Unicode and result caps', () => { expect(matchRegex({ pattern: '(?:)', flags: 'gu', input: '👋' }).matches).toHaveLength(2); expect(matchRegex({ pattern: '.', flags: 'g', input: 'a'.repeat(2000) }).truncated).toBe(true); });
  it.each(['gg', 'uv', 'z'])('rejects unsupported or duplicate flags: %s', flags => expect(() => matchRegex({ pattern: '.', flags, input: 'a' })).toThrow());
  it('rejects invalid syntax', () => expect(() => matchRegex({ pattern: '[', flags: '', input: 'a' })).toThrow());
});
describe('Text diff', () => {
  it('marks added, removed and unchanged lines', () => { const result = e.textDiff('old\nkeep\n', 'new\nkeep\n'); expect(result).toContain('- old'); expect(result).toContain('+ new'); expect(result).toContain('  keep'); });
  it('accepts empty inputs and enforces limits', () => { expect(e.textDiff('', '')).toBe(''); expect(() => e.textDiff('x'.repeat(50_001), '')).toThrow(); });
});
describe('Case converter', () => {
  it.each([['camel', 'helloWorld'], ['pascal', 'HelloWorld'], ['snake', 'hello_world'], ['kebab', 'hello-world'], ['upper', 'HELLO WORLD'], ['lower', 'hello world'], ['title', 'Hello World'], ['sentence', 'Hello world']] as const)('converts %s', (mode, expected) => expect(e.convertCase('hello world', mode)).toBe(expected));
  it('splits acronyms and camel case', () => expect(e.convertCase('XMLHttpRequest', 'snake')).toBe('xml_http_request'));
});
describe('Word counter', () => {
  it('counts Unicode words, graphemes and bytes', () => { const result = JSON.parse(e.countWords('Hello world 👋')); expect(result.words).toBe(2); expect(result.characters).toBe(13); expect(result.bytes).toBe(16); expect(JSON.parse(e.countWords('')).lines).toBe(0); expect(JSON.parse(e.countWords('a\r\nb')).lines).toBe(2); });
});
describe('Color converter', () => {
  it('converts equivalent RGB, HEX and HSL', () => { for (const input of ['#f00', '#ff0000', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)']) expect(e.convertColor(input)).toEqual({ hex: '#ff0000', rgb: 'rgb(255, 0, 0)', hsl: 'hsl(0, 100%, 50%)' }); expect(e.convertColor('hsl(-120, 100%, 50%)').hex).toBe('#0000ff'); });
  it('handles achromatic colors', () => expect(e.convertColor('#ffffff').hsl).toBe('hsl(0, 0%, 100%)'));
  it.each(['rgb(256,0,0)', '#ffff', 'red', 'hsl(0,101%,0%)', 'rgb(1..2,0,0)'])('rejects invalid color %s', value => expect(() => e.convertColor(value)).toThrow());
});
describe('CSS gradient', () => {
  it('generates a validated linear gradient', () => expect(e.generateGradient('#f00', '#00f', 90)).toBe('background: linear-gradient(90deg, #ff0000 0%, #0000ff 100%);'));
  it('rejects invalid colors and angles', () => { expect(() => e.generateGradient('url(x)', '#fff')).toThrow(); expect(() => e.generateGradient('#000', '#fff', 361)).toThrow(); });
});
