import { expect, it } from 'vitest';
import { validDonationUrl } from './index';
it.each(['', 'http://buymeacoffee.com/devkit', 'https://evil.com/devkit', 'https://buymeacoffee.com.evil.com/devkit', 'javascript:alert(1)', 'https://user@buymeacoffee.com/devkit', 'https://buymeacoffee.com/'])('hides invalid donation URL %s', url => expect(validDonationUrl(url)).toBeNull());
it('accepts a secure Buy Me a Coffee profile', () => expect(validDonationUrl('https://www.buymeacoffee.com/devkit')).toBe('https://www.buymeacoffee.com/devkit'));
