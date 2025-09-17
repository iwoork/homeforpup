'use client';

import React from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Row, Col, Alert } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, PlusOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, signIn, signOut, error } = useAuth();
  const pathname = usePathname();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      signOut();
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link href="/dashboard/profile">Profile</Link>,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
      },
    ],
    onClick: handleMenuClick,
  };

  // Public navigation items (always visible)
  const publicNavigationItems = [
    {
      key: '/browse',
      icon: <HeartOutlined />,
      label: <Link href="/browse">Puppies</Link>,
    },
    {
      key: '/b',
      icon: <TeamOutlined />,
      label: <Link href="/b">Breeders</Link>,
    },
    {
      key: '/about',
      icon: <UserOutlined />,
      label: <Link href="/about">About</Link>,
    },
  ];

  // Authenticated user navigation items (only when logged in)
  const authNavigationItems = [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/dashboard/litters',
      icon: <PlusOutlined />,
      label: <Link href="/dashboard/litters">My Litters</Link>,
    },
  ];

  // Combine navigation items based on authentication status
  const navigationItems = user 
    ? [...publicNavigationItems, ...authNavigationItems]
    : publicNavigationItems;

  return (
    <>
      <AntHeader style={{ 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px'
      }}>
        <Row justify="space-between" align="middle" style={{ height: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Col>
            <Row align="middle" gutter={32}>
              <Col>
                <Link href="/" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#08979C",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Image
                    src="/logo.png" // put your transparent vector logo here in /public
                    alt="HomeForPup Logo"
                    width={48}
                    height={48}
                  />
                  home for pup
                </div>
                </Link>
              </Col>
              
              <Col>
                <Menu 
                  mode="horizontal" 
                  style={{ 
                    border: 'none', 
                    background: 'transparent',
                    minWidth: '300px' // Ensure enough space for all items
                  }}
                  selectedKeys={[pathname]}
                  items={navigationItems}
                  overflowedIndicator={null} // Disable the collapse behavior
                />
              </Col>
            </Row>
          </Col>

          <Col>
            {user ? (
              <Dropdown menu={userMenu} placement="bottomRight">
                <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user.name}</span>
                </Button>
              </Dropdown>
            ) : (
              <Row gutter={8}>
                <Col>
                  <Button onClick={signIn}>Login</Button>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    onClick={signIn}
                    style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                  >
                    Join as Breeder
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </AntHeader>
      
      {error && (
        <Alert
          message="Authentication Error"
          description={error}
          type="error"
          closable
          style={{ margin: '8px 24px' }}
        />
      )}
    </>
  );
};

export default Header;