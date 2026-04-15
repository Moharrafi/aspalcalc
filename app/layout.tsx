import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BituCalc - Sales & Analysis',
  description: 'Mobile-friendly sales calculator and analysis tool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
