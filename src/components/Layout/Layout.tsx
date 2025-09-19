'use client';

import React from 'react';
import { App, Layout as AntLayout } from 'antd';
import Header from './Header';
import Footer from './Footer';

const { Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header />
      <Content style={{ flex: 1 }}>
        <App>
          {children}
        </App>
      </Content>
      <Footer />
    </AntLayout>
  );
};

export default Layout;