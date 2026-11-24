import { describe, expect, it } from 'vitest';
import * as e from './sql';
describe('SQL formatter', () => {
  it.each(['sql', 'postgresql', 'mysql', 'sqlite'] as const)('formats the %s dialect', dialect => { const result = e.formatSQL('select id,name from users where id=1;', dialect); expect(result).toContain('SELECT'); expect(result).toContain('\nFROM'); });
  it('limits input', () => expect(() => e.formatSQL('a'.repeat(50_001))).toThrow());
});
