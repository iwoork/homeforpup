'use client';

import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Row, Col, Alert, Drawer, Badge } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  HomeOutlined, 
  PlusOutlined, 
  TeamOutlined,
  MenuOutlined,
  CloseOutlined,
  MessageOutlined,
  BellOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages'; // Add this import
import UserTypeModal from '@/components/UserTypeModal';

const { Header: AntHeader } = Layout;

// Interface for menu click events
interface MenuClickEvent {
  key: string;
}

const Header: React.FC = () => {
  const { user, signIn, signOut, error } = useAuth();
  const pathname = usePathname();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userTypeModalVisible, setUserTypeModalVisible] = useState(false);
  
  // Get real unread message count from useMessages hook
  const { unreadCount } = useMessages({
    userId: user?.userId || '',
    userName: user?.name || '',
    pollingInterval: 5000
  });

  const handleMenuClick = (e: MenuClickEvent) => {
    const key = e.key;
    if (key === 'logout') {
      signOut();
    }
  };

  const handleJoinAsBreeder = () => {
    if (user) {
      // User is already logged in, redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      // Show user type selection modal
      setUserTypeModalVisible(true);
    }
  };

  const handleLogin = () => {
    signIn();
  };

  const handleUserTypeSelection = (_userType: 'breeder' | 'adopter') => {
    setUserTypeModalVisible(false);
    signIn();
  };

  const userMenu = {
    items: [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link href="/dashboard/profile">Profile</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href="/dashboard/settings">Settings</Link>,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
      },
    ],
    onClick: handleMenuClick,
  };

  // Navigation items for public (non-authenticated) users
  const getPublicNavigationItems = () => [
    {
      key: '/browse',
      icon: <SearchOutlined />,
      label: <Link href="/browse">Find Puppies</Link>,
    },
    {
      key: '/breeders',
      icon: <TeamOutlined />,
      label: <Link href="/breeders">Dog Families</Link>,
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: <Link href="/about">About</Link>,
    },
  ];

  // Navigation items for authenticated users
  const getAuthenticatedNavigationItems = () => [
    {
      key: '/dashboard',
      icon: <HomeOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: '/dashboard/messages',
      icon: unreadCount > 0 ? (
        <Badge count={unreadCount} size="small" offset={[4, -4]}>
          <MessageOutlined />
        </Badge>
      ) : (
        <MessageOutlined />
      ),
      label: <Link href="/dashboard/messages">Messages</Link>,
    },
    {
      key: '/dashboard/announcements',
      icon: <BellOutlined />,
      label: <Link href="/dashboard/announcements">Community</Link>,
    },
    {
      key: '/browse',
      icon: <SearchOutlined />,
      label: <Link href="/browse">Browse</Link>,
    },
  ];

  const navigationItems = user ? getAuthenticatedNavigationItems() : getPublicNavigationItems();

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleMenuItemClick = () => {
    setDrawerVisible(false);
  };

  // Mobile menu items for drawer
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
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
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
          
          /* Enhanced Menu styling */
          .ant-menu-horizontal {
            line-height: 64px;
            border-bottom: none !important;
          }
          .ant-menu-horizontal > .ant-menu-item,
          .ant-menu-horizontal > .ant-menu-submenu {
            border-bottom: 2px solid transparent !important;
            margin: 0 4px;
            position: relative;
            transition: all 0.2s ease;
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
            background-color: rgba(8, 151, 156, 0.05) !important;
          }
          .ant-menu-horizontal::after {
            display: none !important;
          }
          
          /* Badge styling for messages */
          .ant-badge-count {
            background-color: #ff4d4f;
            border-color: #ff4d4f;
          }
        `}</style>
        
        <Row justify="space-between" align="middle" style={{ height: '100%', maxWidth: 1200, margin: '0 auto' }}>
          <Col flex="none">
            <Link href={user ? "/dashboard" : "/"} style={{ textDecoration: 'none' }}>
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
            minWidth: 0,
          }}>
            <Menu 
              mode="horizontal" 
              style={{ 
                border: 'none', 
                background: 'transparent',
                minWidth: 0,
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
                <Row align="middle" gutter={12}>
                  {/* Quick Action Buttons for Authenticated Users */}
            
                  <Col>
                    <Dropdown menu={userMenu} placement="bottomRight">
                      <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar icon={<UserOutlined />} />
                        <span>{user.name}</span>
                      </Button>
                    </Dropdown>
                  </Col>
                </Row>
              ) : (
                <Row gutter={8}>
                  <Col>
                    <Button onClick={handleLogin}>Login</Button>
                  </Col>
                  <Col>
                    <Button 
                      type="primary" 
                      onClick={handleJoinAsBreeder}
                      style={{ background: '#08979C', borderColor: '#08979C' }}
                    >
                      Join
                    </Button>
                  </Col>
                </Row>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="mobile-menu" style={{ display: 'none' }}>
              <Button
                type="text"
                icon={
                  user && unreadCount > 0 ? (
                    <Badge count={unreadCount} size="small" offset={[4, -4]}>
                      <MenuOutlined />
                    </Badge>
                  ) : (
                    <MenuOutlined />
                  )
                }
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
            <Link href={user ? "/dashboard" : "/"} onClick={handleDrawerClose} style={{ textDecoration: 'none' }}>
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
        width={300}
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
                <Avatar icon={<UserOutlined />} size={48} />
              </Col>
              <Col flex={1}>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  Breeder Account
                </div>
                
              </Col>
            </Row>
          </div>
        )}

        {/* Quick Actions for Authenticated Users */}
        {user && (
          <div style={{ 
            padding: '16px 0', 
            borderBottom: '1px solid #f0f0f0', 
            marginBottom: '16px' 
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              color: '#666', 
              marginBottom: '12px' 
            }}>
              Quick Actions
            </div>
            <Row gutter={[0, 8]}>
              <Col span={24}>
                <Link href="/dashboard/litters/new">
                  <Button 
                    block 
                    icon={<PlusOutlined />}
                    onClick={handleDrawerClose}
                    style={{ textAlign: 'left' }}
                  >
                    Add New Litter
                  </Button>
                </Link>
              </Col>
              <Col span={24}>
                <Link href="/dashboard/announcements/new">
                  <Button 
                    block 
                    icon={<FileTextOutlined />}
                    onClick={handleDrawerClose}
                    style={{ textAlign: 'left' }}
                  >
                    Create Announcement
                  </Button>
                </Link>
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
            <div style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              Join our community of responsible dog breeders
            </div>
            <Row gutter={[0, 12]} style={{ width: '100%' }}>
              <Col span={24}>
                <Button 
                  block 
                  size="large" 
                  onClick={() => {
                    handleDrawerClose();
                    handleLogin();
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
                    handleJoinAsBreeder();
                  }}
                  style={{ background: '#08979C', borderColor: '#08979C' }}
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
              style={{ 
                color: '#ff4d4f',
                borderColor: '#ff4d4f'
              }}
            >
              Logout
            </Button>
          </div>
        )}
      </Drawer>
      
      {/* User Type Selection Modal */}
      <UserTypeModal
        visible={userTypeModalVisible}
        onClose={() => setUserTypeModalVisible(false)}
        onUserTypeSelect={handleUserTypeSelection}
        onLogin={handleLogin}
      />
      
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