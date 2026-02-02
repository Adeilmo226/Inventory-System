import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Inventory Management System',
  description: 'Professional inventory tracking across multiple warehouses with layaway management',
  keywords: ['inventory', 'warehouse', 'management', 'furniture', 'layaway'],
  authors: [{ name: 'Your Business Name' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e293b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
