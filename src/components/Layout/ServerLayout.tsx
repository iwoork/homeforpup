import React from 'react';
import ClientHeader from './ClientHeader';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const ServerLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ClientHeader />
      <main style={{ flex: 1, padding: '0 50px', marginTop: 64 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ServerLayout;
