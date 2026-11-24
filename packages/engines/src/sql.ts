import { format, type SqlLanguage } from 'sql-formatter';
import { limitInput } from './core';
export function formatSQL(input: string, language: SqlLanguage = 'sql'): string {
  limitInput(input, 50_000);
  return format(input, { language, keywordCase: 'upper', tabWidth: 2 });
}
