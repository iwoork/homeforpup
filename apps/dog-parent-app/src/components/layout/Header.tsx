'use client';

import React from 'react';
import { Layout, Button, Avatar, Dropdown, Badge, Drawer, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MessageOutlined, DashboardOutlined, HeartOutlined, TeamOutlined, HomeOutlined, BookOutlined, MenuOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  user?: any;
  isAuthenticated?: boolean;
  loading?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  isAuthenticated = false, 
  loading = false, 
  onLogin, 
  onLogout,
  unreadCount = 0 
}) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get display name from user data
  const displayName = user?.name || 'User';

  // Create menu items
  const getUserMenuItems = React.useMemo(() => {
    const menuItems: any[] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link href={`/users/${user?.userId}`}>Profile</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href={`/users/${user?.userId}/edit`}>Settings</Link>,
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: <Link href="/dashboard/favorites">My Favorites</Link>,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: onLogout,
      }
    ];

    return menuItems;
  }, [user?.userId, unreadCount, onLogout]);

  // Mobile drawer menu items
  const getMobileMenuItems = React.useMemo(() => {
    if (!isAuthenticated) return [];

    const mobileItems: any[] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      {
        key: 'browse',
        icon: <HeartOutlined />,
        label: <Link href="/browse">Browse Puppies</Link>,
      },
      {
        key: 'breeds',
        icon: <TeamOutlined />,
        label: <Link href="/breeds">Dog Breeds</Link>,
      },
      {
        key: 'adoption-guide',
        icon: <HomeOutlined />,
        label: <Link href="/adoption-guide">Adoption Guide</Link>,
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link href={`/users/${user?.userId}`}>Profile</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href={`/users/${user?.userId}/edit`}>Settings</Link>,
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: <Link href="/dashboard/favorites">My Favorites</Link>,
      },
      {
        key: 'activity',
        icon: <MessageOutlined />,
        label: <Link href="/dashboard/activity">My Activity</Link>,
      },
      {
        key: 'messages',
        icon: <MessageOutlined />,
        label: (
          <Link href="/dashboard/messages">
            <Badge count={unreadCount} size="small">
              Messages
            </Badge>
          </Link>
        ),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: onLogout,
      }
    ];

    return mobileItems;
  }, [user?.userId, unreadCount, onLogout, isAuthenticated]);

  const headerStyle = {
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: isMobile ? '0 16px' : '0 24px',
    height: isMobile ? '60px' : '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  };

  const logoStyle = {
    height: isMobile ? '32px' : '40px',
    width: 'auto',
    marginRight: '16px',
  };

  const buttonStyle = {
    height: isMobile ? '36px' : '40px',
    fontSize: isMobile ? '12px' : '14px',
    padding: isMobile ? '4px 12px' : '6px 16px',
  };

  return (
    <AntHeader style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img 
            src="/logo.png" 
            alt="Home for Pup" 
            style={logoStyle}
          />
          <span style={{ 
            fontSize: isMobile ? '16px' : '20px', 
            fontWeight: 'bold', 
            color: '#08979C',
            whiteSpace: 'nowrap'
          }}>
            Home for Pup
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
        {/* Mobile hamburger menu */}
        {isMobile && isAuthenticated && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerVisible(true)}
            style={{
              height: '40px',
              width: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px'
            }}
          />
        )}

        {/* Navigation - desktop only */}
        {isAuthenticated && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            <Link href="/browse">
              <Button 
                type="text" 
                icon={<HeartOutlined />}
                style={{
                  ...buttonStyle,
                  height: '36px',
                  fontSize: '13px',
                  padding: '4px 8px',
                  color: '#666',
                  border: 'none'
                }}
              >
                Browse Puppies
              </Button>
            </Link>
            <Link href="/breeds">
              <Button 
                type="text" 
                icon={<TeamOutlined />}
                style={{
                  ...buttonStyle,
                  height: '36px',
                  fontSize: '13px',
                  padding: '4px 8px',
                  color: '#666',
                  border: 'none'
                }}
              >
                Dog Breeds
              </Button>
            </Link>
            <Link href="/adoption-guide">
              <Button 
                type="text" 
                icon={<HomeOutlined />}
                style={{
                  ...buttonStyle,
                  height: '36px',
                  fontSize: '13px',
                  padding: '4px 8px',
                  color: '#666',
                  border: 'none'
                }}
              >
                Adoption Guide
              </Button>
            </Link>
          </div>
        )}

        {isAuthenticated ? (
          <>
            {/* Messages button - desktop only */}
            {!isMobile && (
              <Link href="/dashboard/messages">
                <Badge count={unreadCount} size="small">
                  <Button 
                    type="text" 
                    icon={<MessageOutlined />}
                    style={buttonStyle}
                  >
                    Messages
                  </Button>
                </Badge>
              </Link>
            )}
            
            {/* User dropdown - desktop only */}
            {!isMobile && (
              <Dropdown
                menu={{ items: getUserMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button type="text" style={{ padding: '4px', height: 'auto' }}>
                  <Avatar 
                    size="default"
                    src={user?.profileImage || undefined}
                    icon={<UserOutlined />}
                    style={{ marginRight: '8px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ 
                      fontSize: '14px',
                      maxWidth: '120px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {displayName}
                    </span>
                  </div>
                </Button>
              </Dropdown>
            )}

            {/* Mobile user info */}
            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Avatar 
                  size="small"
                  src={user?.profileImage || undefined}
                  icon={<UserOutlined />}
                />
                <span style={{ 
                  fontSize: '12px',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {displayName}
                </span>
              </div>
            )}
          </>
        ) : (
          <Button 
            type="primary" 
            onClick={onLogin}
            loading={loading}
            style={buttonStyle}
          >
            Sign In
          </Button>
        )}
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              size="small"
              src={user?.profileImage || undefined}
              icon={<UserOutlined />}
            />
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {displayName}
            </span>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          items={getMobileMenuItems}
          style={{ border: 'none' }}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>
    </AntHeader>
  );
};

export default Header;
