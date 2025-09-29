'use client';

import React, { useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Divider, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MessageOutlined, DashboardOutlined, SwapOutlined, HeartOutlined, ShopOutlined, TeamOutlined, HomeOutlined, BellOutlined, BookOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { useSession } from 'next-auth/react';

const ClientHeader: React.FC = () => {
  const { 
    user, 
    signOut: logout, 
    signIn: login, 
    isAuthenticated, 
    loading, 
    getToken
  } = useAuth();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [forceLoading, setForceLoading] = React.useState(true);

  // Get display name from user data or fallback to session
  const displayName = user?.name || session?.user?.name || 'User';
  
  console.log('Header render - Auth state:', {
    user: user ? { userId: user.userId?.substring(0, 10) + '...', name: user.name, userType: user.userType } : null,
    session: session ? { name: session.user?.name, email: session.user?.email } : null,
    displayName,
    isAuthenticated,
    loading
  });

  // Fetch unread message count
  const fetchUnreadCount = React.useCallback(async () => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }

    try {
      const token = await getToken();
      
      if (!token) {
        console.log('No access token available for unread count fetch');
        setUnreadCount(0);
        return;
      }

      const response = await fetch('/api/messages/threads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Threads data for unread count:', data);
        
        // Count unread messages across all threads
        const unread = data.threads?.reduce((total: number, thread: any) => {
          const threadUnread = thread.unreadCount?.[user.userId] || 0;
          console.log(`Thread ${thread.id} unread for user ${user.userId}:`, threadUnread);
          return total + threadUnread;
        }, 0) || 0;
        
        console.log('Total unread count:', unread);
        setUnreadCount(unread);
      } else {
        console.error('Failed to fetch threads:', response.status, response.statusText);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user, getToken]);

  // Header mounted
  React.useEffect(() => {
    console.log('🔄 Header mounted');
  }, []);

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

  // Fetch unread count when user changes
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    
    fetchUnreadCount();
    
    // Set up polling for unread count
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user, fetchUnreadCount]);

  // Check for mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate profile-specific navigation items
  const getProfileNavigationItems = React.useMemo(() => {
    if (!user) return [];

    const baseItems = [
      {
        key: 'browse',
        icon: <HeartOutlined />,
        label: <Link href="/browse">Browse Puppies</Link>,
      },
    ];

    // Add profile-specific items based on user type
    if (user.userType === 'adopter' || user.userType === 'both') {
      baseItems.push(
        {
          key: 'breeds',
          icon: <TeamOutlined />,
          label: <Link href="/breeds">Dog Breeds</Link>,
        },
        {
          key: 'adoption-guide',
          icon: <HomeOutlined />,
          label: <Link href="/adoption-guide">Adoption Guide</Link>,
        }
      );
    }

    if (user.userType === 'breeder' || user.userType === 'both') {
      baseItems.push(
        {
          key: 'breeders',
          icon: <ShopOutlined />,
          label: <Link href="/breeders">Find Breeders</Link>,
        },
        {
          key: 'kennel-management',
          icon: <TeamOutlined />,
          label: <Link href="/kennel-management">Kennel Management</Link>,
        },
        {
          key: 'breeder-resources',
          icon: <BookOutlined />,
          label: <Link href="/breeder-resources">Breeder Resources</Link>,
        }
      );
    }

    return baseItems;
  }, [user]);

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
              icon: <BellOutlined />,
              label: <Link href="/dashboard/activity">My Activity</Link>,
            },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Sign Out',
        onClick: logout,
      }
    ];

    return menuItems;
  }, [user?.userId, logout]);

  const userMenuItems = getUserMenuItems;

  // Debug logging (reduced)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header state:', { 
      menuItems: userMenuItems.length
    });
  }

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
    <Layout.Header style={headerStyle}>
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
            
            {/* User dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="text" style={{ padding: '4px', height: 'auto' }}>
                <Avatar 
                  size={isMobile ? 'small' : 'default'}
                  src={user?.profileImage || undefined}
                  icon={<UserOutlined />}
                  style={{ marginRight: '8px' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ 
                    fontSize: isMobile ? '12px' : '14px',
                    maxWidth: isMobile ? '80px' : '120px',
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
    </Layout.Header>
  );
};

export default ClientHeader;