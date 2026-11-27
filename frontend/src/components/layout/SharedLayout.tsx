import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface SharedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function SharedLayout({ children, className = '' }: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-surface-canvas text-zinc-900">
      <Navbar />
      <main id="main-content" className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
