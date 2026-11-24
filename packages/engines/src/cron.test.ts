import { describe, expect, it } from 'vitest';
import * as e from './cron';
describe('Cron builder', () => {
  it('calculates five deterministic UTC runs', () => { const result = JSON.parse(e.buildCron(['*/15', '*', '*', '*', '*'], new Date('2026-01-01T00:00:00Z'))); expect(result.expression).toBe('*/15 * * * *'); expect(result.nextRuns).toHaveLength(5); expect(result.nextRuns[0]).toBe('2026-01-01T00:15:00.000Z'); });
  it('rejects invalid fields', () => { expect(() => e.buildCron(['61', '*', '*', '*', '*'])).toThrow(); expect(() => e.buildCron(['* *', '*', '*', '*', '*'])).toThrow(); expect(() => e.buildCron(['*'])).toThrow(); });
});
