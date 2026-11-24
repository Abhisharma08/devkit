// Call only inside a disposable worker: JavaScript regex cannot be interrupted in-process.
export interface RegexRequest { pattern: string; flags: string; input: string }
export function matchRegex({ pattern, flags, input }: RegexRequest) {
  if (pattern.length > 2000 || input.length > 100_000) throw new Error('Limit: 2,000 pattern and 100,000 input characters.');
  if (!/^[dgimsuvy]*$/.test(flags) || new Set(flags).size !== flags.length || (flags.includes('u') && flags.includes('v'))) throw new Error('Invalid or duplicate regex flags.');
  const expression = new RegExp(pattern, flags);
  const matches: { value: string; index: number; groups: (string | null)[]; namedGroups?: Record<string, string> }[] = [];
  let match: RegExpExecArray | null;
  while ((match = expression.exec(input)) !== null) {
    matches.push({ value: match[0], index: match.index, groups: match.slice(1).map(v => v ?? null), namedGroups: match.groups });
    if (!expression.global && !expression.sticky) break;
    if (matches.length >= 1000) return { matches, truncated: true };
    if (match[0] === '') {
      const index = expression.lastIndex;
      expression.lastIndex += (expression.unicode || flags.includes('v')) && (input.codePointAt(index) ?? 0) > 0xffff ? 2 : 1;
    }
  }
  return { matches, truncated: false };
}
