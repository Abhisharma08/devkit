export const projectConfig = {
  name: 'DevKit',
  // Optional. Example: https://www.buymeacoffee.com/your-handle
  donationUrl: 'https://buymeacoffee.com/abhimanyusharma',
} as const;

export function validDonationUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['buymeacoffee.com', 'www.buymeacoffee.com'].includes(url.hostname) || url.username || url.password || url.port || !/^\/[a-zA-Z0-9_-]+\/?$/.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
