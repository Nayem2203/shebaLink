import type { Metadata } from 'next';
import './globals.css';
import { RoleProvider } from '@/context/RoleContext';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'ShebaLink — Local Service Discovery & Booking',
  description:
    'Find verified local professionals for household repairs, cleaning, and moving across Rajshahi, Dhaka, and Chattogram.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface-canvas font-sans text-zinc-900 antialiased">
        <RoleProvider>
          <ToastProvider>{children}</ToastProvider>
        </RoleProvider>
      </body>
    </html>
  );
}
