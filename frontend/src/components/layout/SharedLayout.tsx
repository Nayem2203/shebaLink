'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export interface SharedLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
  className?: string;
}

export function SharedLayout({
  children,
  hideFooter = false,
  className = '',
}: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900">
      <Navbar />
      <main id="main-content" className={`flex-1 ${className}`}>
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}
