import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smart Civic AI',
  description: 'Civic Intelligence Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#090D16] text-white/90 min-h-screen antialiased flex flex-col`}>
        <Navbar />
        <main className="flex-1 w-full mx-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}
