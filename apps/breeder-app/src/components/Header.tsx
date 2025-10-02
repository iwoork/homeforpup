'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  LoginOutlined,
  SettingOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';
import Navigation from './Navigation';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async () => {
    await signIn('cognito', { callbackUrl: '/dashboard' });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => router.push('/dashboard'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Left Section - Navigation + Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile Navigation Drawer - only show for authenticated users */}
        {isMobile && isAuthenticated && (
          <Navigation isMobile={true} />
        )}
        
        {/* Logo and Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="HomeForPup Logo" 
            style={{ 
              height: '40px', 
              width: 'auto' 
            }} 
          />
          <span className="brand-name" style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: '#262626'
          }}>
            HomeForPup Breeders
          </span>
        </Link>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .brand-name {
            display: none;
          }
          .user-name {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .brand-name {
            display: none;
          }
        }
      `}</style>

      {/* User Actions */}
      <div>
        {loading ? (
          <Button loading disabled>
            Loading...
          </Button>
        ) : isAuthenticated && user ? (
          <Space size="middle">
            {/* Desktop: Show user name and dropdown */}
            {!isMobile && (
              <>
                <span className="user-name" style={{ color: '#595959' }}>
                  {user.name || user.email}
                </span>
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Button icon={<UserOutlined />} type="text" style={{ padding: '4px 8px' }}>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </Button>
                </Dropdown>
              </>
            )}
            {/* Mobile: Just show avatar (user menu is in drawer) */}
            {isMobile && (
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                style={{ backgroundColor: '#52c41a' }}
              />
            )}
          </Space>
        ) : (
          <Space>
            <Link href="/auth/login">
              <Button type="primary" icon={<LoginOutlined />}>
                Sign In
              </Button>
            </Link>
          </Space>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;

