import { parseExpression } from 'cron-parser';
import { limitInput } from './core';
export function buildCron(fields: string[], from = new Date()): string {
  if (fields.length !== 5 || fields.some(f => !f.trim() || /\s/.test(f))) throw new Error('Provide five cron fields without spaces inside a field.');
  const expression = fields.join(' ');
  limitInput(expression, 200);
  const schedule = parseExpression(expression, { currentDate: from, tz: 'UTC' });
  return JSON.stringify({ expression, timezone: 'UTC', nextRuns: Array.from({ length: 5 }, () => schedule.next().toISOString()), note: 'Standard 5-field cron. Day-of-month and day-of-week use OR when both are restricted.' }, null, 2);
}
