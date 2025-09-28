'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from '@homeforpup/shared-auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth/');
  const { user, isAuthenticated, loading, signIn, signOut } = useAuth();

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        user={user}
        isAuthenticated={isAuthenticated}
        loading={loading}
        onLogin={signIn}
        onLogout={signOut}
        unreadCount={0}
      />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
