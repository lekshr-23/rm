import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rental Asset Scheduler',
  description: 'Rental operations scheduling and booking management.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
