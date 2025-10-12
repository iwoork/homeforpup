'use client';

import React, { useState } from 'react';
import { Drawer, Menu, Button, Space, Avatar, Divider } from 'antd';
import {
  MenuOutlined,
  DashboardOutlined,
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  BookOutlined,
  BarChartOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import type { MenuProps } from 'antd';

interface NavigationProps {
  isMobile?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({ isMobile = false }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleMenuClick = (path: string) => {
    router.push(path);
    setDrawerVisible(false);
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => handleMenuClick('/dashboard'),
    },
    {
      key: '/kennels',
      icon: <HomeOutlined />,
      label: 'Kennels',
      onClick: () => handleMenuClick('/kennels'),
    },
    {
      key: '/dogs',
      icon: <TeamOutlined />,
      label: 'Dogs',
      onClick: () => handleMenuClick('/dogs'),
    },
    {
      key: '/dashboard/messages',
      icon: <MessageOutlined />,
      label: 'Messages',
      onClick: () => handleMenuClick('/dashboard/messages'),
    },
    {
      type: 'divider',
    },
    {
      key: 'quick-actions',
      label: 'Quick Actions',
      type: 'group',
      children: [
        {
          key: '/kennels/new',
          icon: <PlusOutlined />,
          label: 'Add Kennel',
          onClick: () => handleMenuClick('/kennels/new'),
        },
        {
          key: '/dogs/new',
          icon: <TeamOutlined />,
          label: 'Add Dog',
          onClick: () => handleMenuClick('/dogs'),
        },
      ],
    },
    {
      type: 'divider',
    },
    {
      key: '/docs',
      icon: <BookOutlined />,
      label: 'Documentation',
      onClick: () => handleMenuClick('/docs'),
    },
  ];

  const drawerContent = (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      {user && (
        <div style={{ padding: '16px', textAlign: 'center', background: '#fafafa' }}>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#52c41a', marginBottom: '8px' }}
          />
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {user.name || user.email}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Breeder Account
          </div>
        </div>
      )}

      <Divider style={{ margin: '0' }} />

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ border: 'none' }}
        />
      </div>

      {/* Footer Actions */}
      <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="text"
            danger
            icon={<LogoutOutlined />}
            style={{ width: '100%', textAlign: 'left' }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </div>
    </div>
  );

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setDrawerVisible(true)}
        style={{ 
          fontSize: '18px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        styles={{
          body: { padding: 0 },
          header: { borderBottom: '1px solid #f0f0f0' }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Navigation;
