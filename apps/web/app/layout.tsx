import type { Metadata, Viewport } from 'next';
import '@devkit/ui/styles.css';
import { origin } from '../lib/seo';
export const metadata: Metadata = { metadataBase: origin ? new URL(origin) : undefined, applicationName: 'DevKit', icons: { icon: '/icon.svg' }, robots: { index: true, follow: true }, referrer: 'no-referrer' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#181818' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark" suppressHydrationWarning><body>{children}</body></html>; }
