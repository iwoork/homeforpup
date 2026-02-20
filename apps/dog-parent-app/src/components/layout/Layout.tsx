'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ClientHeader from './ClientHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth/');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ClientHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
