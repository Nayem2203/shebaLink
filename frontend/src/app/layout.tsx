import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ShebaLink — Local Service Discovery & Booking',
  description:
    'Find trusted local professionals for everyday household repairs, cleaning, and delivery in Rajshahi, Dhaka, and Chattogram.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <RoleProvider>
          <ToastProvider>{children}</ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
