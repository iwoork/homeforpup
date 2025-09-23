'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href={`/users/${user?.userId}`}>My Profile</Link>,
    },
    {
      key: 'edit',
      icon: <SettingOutlined />,
      label: <Link href={`/users/${user?.userId}/edit`}>Edit Profile</Link>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: signOut,
    },
  ];

  return (
    <AntHeader style={{ 
      position: 'fixed', 
      zIndex: 1, 
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: '#08979C' }}>
          home for pup
        </Link>
      </div>
      
      <Space>
        {user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ marginLeft: 8 }}>{user.name}</span>
            </Button>
          </Dropdown>
        ) : (
          <Button type="primary" href="/auth/callback">
            Sign In
          </Button>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;
