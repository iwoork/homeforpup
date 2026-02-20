'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Drawer, Menu } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MessageOutlined, DashboardOutlined, SwapOutlined, HeartOutlined, ShopOutlined, TeamOutlined, HomeOutlined, BellOutlined, BookOutlined, MenuOutlined, EnvironmentOutlined, GlobalOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { useAuth } from '@/hooks';

const unreadFetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(res => res.ok ? res.json() : { unreadCount: 0 });

const ClientHeader: React.FC = () => {
  const {
    user,
    signOut: logout,
    signIn: login,
    isAuthenticated,
    loading
  } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [forceLoading, setForceLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  // Fetch unread message count using SWR with auto-refresh
  const { data: unreadData } = useSWR(
    isAuthenticated ? '/api/messages/unread-count' : null,
    unreadFetcher,
    { refreshInterval: 30000, revalidateOnFocus: true }
  );
  const unreadCount = unreadData?.unreadCount || 0;

  // Get display name from user data
  const displayName = user?.name || 'User';

  console.log('Header render - Auth state:', {
    user: user ? { userId: user.userId?.substring(0, 10) + '...', name: user.name, userType: user.userType } : null,
    displayName,
    isAuthenticated,
    loading
  });

  // Force loading to false after timeout to prevent stuck spinner
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (forceLoading) {
        console.log('Header: Force setting loading to false after timeout');
        setForceLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeout);
  }, [forceLoading]);

  // Update force loading when auth loading changes
  React.useEffect(() => {
    if (!loading) {
      setForceLoading(false);
    }
  }, [loading]);

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Derive userType from the local useAuth hook
  const userType = user?.userType;

  // Generate profile-specific navigation items
  const getProfileNavigationItems = React.useMemo(() => {
    if (!user) return [];

    if (userType === 'breeder') {
      return [
        {
          key: 'kennels',
          icon: <HomeOutlined />,
          label: <Link href="/kennel-management">Manage Kennels</Link>,
        },
        {
          key: 'dogs',
          icon: <TeamOutlined />,
          label: <Link href="/dogs">My Dogs</Link>,
        },
        {
          key: 'litters',
          icon: <ShopOutlined />,
          label: <Link href="/litters">My Litters</Link>,
        },
      ];
    }

    // dog-parent or default — keep nav focused on the two core actions
    return [
      {
        key: 'browse',
        icon: <HeartOutlined />,
        label: <Link href="/browse">Find Puppies</Link>,
      },
      {
        key: 'kennels',
        icon: <ShopOutlined />,
        label: <Link href="/kennels">Explore Breeders</Link>,
      },
    ];
  }, [user, userType]);

  // Create menu items as a function to ensure they re-render when state changes
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
        label: <Link href={`/users/${user?.userId}`}>View Profile</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href={`/users/${user?.userId}/edit`}>Edit Profile</Link>,
      },
    ];

    if (userType === 'breeder') {
      menuItems.push(
        {
          key: 'kennels',
          icon: <HomeOutlined />,
          label: <Link href="/kennel-management">Manage Kennels</Link>,
        },
        {
          key: 'dogs',
          icon: <TeamOutlined />,
          label: <Link href="/dogs">My Dogs</Link>,
        },
        {
          key: 'litters',
          icon: <ShopOutlined />,
          label: <Link href="/litters">My Litters</Link>,
        },
      );
    } else {
      menuItems.push(
        {
          key: 'favorites',
          icon: <HeartOutlined />,
          label: <Link href="/dashboard/favorites">My Favorites</Link>,
        },
      );
    }

    menuItems.push(
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: logout,
      }
    );

    return menuItems;
  }, [user?.userId, userType, logout]);

  const userMenuItems = getUserMenuItems;

  // Mobile drawer menu items
  const getMobileMenuItems = React.useMemo(() => {
    if (!isAuthenticated) return [];

    const mobileItems: any[] = [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
      ...getProfileNavigationItems,
      {
        type: 'divider' as const,
      },
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: <Link href={`/users/${user?.userId}`}>View Profile</Link>,
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: <Link href={`/users/${user?.userId}/edit`}>Edit Profile</Link>,
      },
    ];

    // Role-specific mobile menu items
    if (userType === 'breeder') {
      mobileItems.push(
        {
          key: 'verification',
          icon: <GlobalOutlined />,
          label: <Link href="/verification">Verification</Link>,
        },
      );
    } else {
      mobileItems.push(
        {
          key: 'favorites',
          icon: <HeartOutlined />,
          label: <Link href="/dashboard/favorites">My Favorites</Link>,
        },
      );
    }

    mobileItems.push(
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
        onClick: logout,
      }
    );

    return mobileItems;
  }, [user, userType, getProfileNavigationItems, unreadCount, logout]);


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
    overflow: 'visible', // Changed from 'hidden' to 'visible' to prevent logo clipping
    boxSizing: 'border-box' as const,
  };

  const logoStyle = {
    height: isMobile ? '32px' : '40px',
    width: 'auto',
    marginRight: '16px',
    display: 'block', // Ensure it's visible
    maxWidth: '100%', // Prevent overflow
  };

  const buttonStyle = {
    height: isMobile ? '36px' : '40px',
    fontSize: isMobile ? '12px' : '14px',
    padding: isMobile ? '4px 12px' : '6px 16px',
  };

  // Debug: Log header render
  console.log('ClientHeader render - isMobile:', isMobile, 'logoStyle:', logoStyle);

  return (
    <Layout.Header style={headerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="Home for Pup"
            width={isMobile ? 32 : 40}
            height={isMobile ? 32 : 40}
            style={{
              marginRight: '16px',
              display: 'block',
              maxWidth: '100%'
            }}
            priority
            onError={(e) => {
              console.error('Logo failed to load:', e);
            }}
            onLoad={() => {
              console.log('Logo loaded successfully');
            }}
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

        {/* Profile-specific navigation - desktop only */}
        {isAuthenticated && !isMobile && getProfileNavigationItems.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            {getProfileNavigationItems.map((item) => (
              <Link key={item.key} href={item.label.props.href}>
                <Button 
                  type="text" 
                  icon={item.icon}
                  style={{
                    ...buttonStyle,
                    height: '36px',
                    fontSize: '13px',
                    padding: '4px 8px',
                    color: '#666',
                    border: 'none'
                  }}
                >
                  {item.label.props.children}
                </Button>
              </Link>
            ))}
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
                menu={{ items: userMenuItems }}
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

           
          </>
        ) : (
          <Button 
            type="primary" 
            onClick={() => login()}
            loading={loading && forceLoading}
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
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        zIndex={1001}
        maskClosable={true}
        keyboard={true}
        destroyOnHidden={false}
      >
        <Menu
          mode="inline"
          items={getMobileMenuItems}
          style={{ border: 'none', height: '100%' }}
          onClick={() => setDrawerVisible(false)}
        />
      </Drawer>
    </Layout.Header>
  );
};

export default ClientHeader;