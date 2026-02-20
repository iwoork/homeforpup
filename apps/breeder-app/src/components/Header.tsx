'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Button, Space, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  SettingOutlined,
  DashboardOutlined,
  CreditCardOutlined,
  HomeOutlined,
  TeamOutlined,
  HeartOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import type { MenuProps } from 'antd';
import Navigation from './Navigation';

const { Header: AntHeader } = Layout;

export const Header: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const isAuthenticated = !!isSignedIn;
  const loading = !isLoaded;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleLogout = async () => {
    await signOut({ redirectUrl: '/' });
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
      key: 'billing',
      icon: <CreditCardOutlined />,
      label: 'Billing',
      onClick: () => router.push('/dashboard/billing'),
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

      {/* Desktop Navigation Links */}
      {!isMobile && isAuthenticated && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { href: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { href: '/kennels', icon: <HomeOutlined />, label: 'Kennels' },
            { href: '/dogs', icon: <TeamOutlined />, label: 'Dogs' },
            { href: '/litters', icon: <HeartOutlined />, label: 'Litters' },
            { href: '/dashboard/messages', icon: <MessageOutlined />, label: 'Messages' },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button
                type={pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ? 'link' : 'text'}
                icon={item.icon}
                style={{
                  fontWeight: pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ? 600 : 400,
                  color: pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href)) ? '#52c41a' : '#595959',
                }}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}

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
                  {user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress}
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
          
          </Space>
        ) : (
          <Space>
            <Link href="/sign-in">
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

