export type SongLanguage = 'yue' | 'zh' | 'en' | '粤语' | '国语' | '英语' | string;

export function normalizeLanguage(input?: string): string | undefined {
  if (!input) return undefined;
  const value = input.trim().toLowerCase();
  if (value === 'yue' || input === '粤语') return '粤语';
  if (value === 'zh' || input === '国语') return '国语';
  if (value === 'en' || input === '英语') return '英语';
  return input;
}
