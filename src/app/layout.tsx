import type { Metadata } from 'next';
// TypeScript may complain about side-effect imports for global CSS in some configs.
// @ts-ignore
import './globals.css';

export const metadata: Metadata = {
  title: 'Petpooja – Fine Dine POS',
  description: 'Fine Dine Point of Sale System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-[#f0f2f5] text-[#1e2433]"
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px' }}
      >
        {children}
      </body>
    </html>
  );
}