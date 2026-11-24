import type { Metadata, Viewport } from 'next';
import '@devkit/ui/styles.css';
export const metadata: Metadata = { title: 'DevKit — Local developer tools', description: '23 free, privacy-first developer tools. JSON, SQL, encoders, generators, regex, and more. Everything runs locally in your browser.', icons: { icon: '/icon.svg' } };
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#181818' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark" suppressHydrationWarning><body>{children}</body></html>; }
