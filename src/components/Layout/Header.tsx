'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Row, Col, Alert, Drawer } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  PlusOutlined, 
  HeartOutlined, 
  TeamOutlined,
  MenuOutlined,
  CloseOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { user, signIn, signOut, error } = useAuth();
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleMenuClick = (e: any) => {
    const key = e.key || e;
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

  // Navigation items - organized properly for logged in vs logged out users
  const getNavigationItems = () => {
    const publicItems = [
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

    if (user) {
      // For logged in users, add dashboard items
      return [
        ...publicItems,
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
    }

    return publicItems;
  };

  const navigationItems = getNavigationItems();

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleMenuItemClick = () => {
    // Close drawer when a menu item is clicked on mobile
    setDrawerVisible(false);
  };

  // Mobile menu items for drawer (with click handlers)
  const mobileNavigationItems = navigationItems.map(item => ({
    ...item,
    label: (
      <div onClick={handleMenuItemClick}>
        {item.label}
      </div>
    )
  }));

  return (
    <>
      <AntHeader style={{ 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 24px'
      }}>
        <style jsx global>{`
          @media (min-width: 992px) {
            .desktop-auth {
              display: block !important;
            }
            .mobile-menu {
              display: none !important;
            }
            .desktop-nav {
              display: flex !important;
            }
          }
          @media (max-width: 991px) {
            .desktop-auth {
              display: none !important;
            }
            .mobile-menu {
              display: block !important;
            }
            .desktop-nav {
              display: none !important;
            }
            .logo-text {
              font-size: 18px !important;
            }
          }
          @media (max-width: 480px) {
            .logo-text {
              font-size: 16px !important;
            }
          }
          
          /* Fix for Menu component to ensure all items are visible */
          .ant-menu-horizontal {
            line-height: 64px;
            border-bottom: none !important;
          }
          .ant-menu-horizontal > .ant-menu-item,
          .ant-menu-horizontal > .ant-menu-submenu {
            border-bottom: 2px solid transparent !important;
            margin: 0 8px;
            position: relative;
          }
          .ant-menu-horizontal > .ant-menu-item::after,
          .ant-menu-horizontal > .ant-menu-submenu::after {
            display: none !important;
          }
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item:hover,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu:hover,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-active,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-active,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-open,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-open,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-item-selected,
          .ant-menu-horizontal:not(.ant-menu-dark) > .ant-menu-submenu-selected {
            color: #08979C !important;
            border-bottom: 2px solid #08979C !important;
          }
          .ant-menu-horizontal::after {
            display: none !important;
          }
        `}</style>
        <Row justify="space-between" align="middle" style={{ height: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Col flex="none">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#08979C",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <Image
                  src="/logo.png"
                  alt="HomeForPup Logo"
                  width={48}
                  height={48}
                  style={{ flexShrink: 0 }}
                />
                <span className="logo-text" style={{ 
                  whiteSpace: "nowrap"
                }}>
                  home for pup
                </span>
              </div>
            </Link>
          </Col>
              
          {/* Desktop Navigation */}
          <Col className="desktop-nav" flex="auto" style={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 0, // Allow flex item to shrink
          }}>
            <Menu 
              mode="horizontal" 
              style={{ 
                border: 'none', 
                background: 'transparent',
                minWidth: 0, // Allow menu to shrink if needed
              }}
              selectedKeys={[pathname]}
              items={navigationItems}
              overflowedIndicator={null}
              triggerSubMenuAction="click"
            />
          </Col>

          <Col flex="none">
            {/* Desktop Auth Section */}
            <div className="desktop-auth" style={{ display: 'block' }}>
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
            </div>

            {/* Mobile Menu Button */}
            <div className="mobile-menu" style={{ display: 'none' }}>
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: '18px', padding: '4px 8px' }}
              />
            </div>
          </Col>
        </Row>
      </AntHeader>
      
      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" onClick={handleDrawerClose} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#08979C",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="HomeForPup Logo"
                  width={32}
                  height={32}
                />
                home for pup
              </div>
            </Link>
          </div>
        }
        placement="right"
        onClose={handleDrawerClose}
        open={drawerVisible}
        width={280}
        closeIcon={<CloseOutlined />}
        styles={{
          header: {
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '16px',
          }
        }}
      >
        {/* User Section in Drawer */}
        {user && (
          <div style={{ 
            padding: '16px 0', 
            borderBottom: '1px solid #f0f0f0', 
            marginBottom: '16px' 
          }}>
            <Row align="middle" gutter={12}>
              <Col>
                <Avatar icon={<UserOutlined />} size={40} />
              </Col>
              <Col flex={1}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.name}</div>
                <Button 
                  type="link" 
                  size="small" 
                  style={{ padding: '0', height: 'auto', color: '#666' }}
                  onClick={() => {
                    handleDrawerClose();
                    // Navigate to profile
                  }}
                >
                  View Profile
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={mobileNavigationItems}
          style={{ border: 'none', background: 'transparent' }}
        />

        {/* Auth Buttons for Non-authenticated Users */}
        {!user && (
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px' 
          }}>
            <Row gutter={[0, 12]} style={{ width: '100%' }}>
              <Col span={24}>
                <Button 
                  block 
                  size="large" 
                  onClick={() => {
                    handleDrawerClose();
                    signIn();
                  }}
                >
                  Login
                </Button>
              </Col>
              <Col span={24}>
                <Button 
                  type="primary" 
                  block 
                  size="large"
                  onClick={() => {
                    handleDrawerClose();
                    signIn();
                  }}
                  style={{ background: '#ff6b35', borderColor: '#ff6b35' }}
                >
                  Join as Breeder
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {/* Logout Button for Authenticated Users */}
        {user && (
          <div style={{ 
            position: 'absolute', 
            bottom: '24px', 
            left: '24px', 
            right: '24px' 
          }}>
            <Button 
              block 
              size="large" 
              icon={<LogoutOutlined />}
              onClick={() => {
                handleDrawerClose();
                signOut();
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </Drawer>
      
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