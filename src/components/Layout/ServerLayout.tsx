import React from 'react';
import { Layout as AntLayout } from 'antd';
import ClientHeader from './ClientHeader';
import Footer from './Footer';

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const ServerLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <ClientHeader />
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        {children}
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default ServerLayout;
