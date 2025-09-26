'use client';

import React, { useEffect } from 'react';
import { Layout, Button, Dropdown, Avatar, Badge, Divider, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MessageOutlined, DashboardOutlined, SwapOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/hooks';

const ClientHeader: React.FC = () => {
  const { 
    user, 
    logout, 
    login, 
    isAuthenticated, 
    loading, 
    getToken,
    canSwitchProfiles,
    activeProfileType,
    switchProfileType,
    effectiveUserType,
    isSwitchingProfile
  } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  
  console.log('Header render - Auth state:', {
    user: user ? { userId: user.userId?.substring(0, 10) + '...', name: user.name, userType: user.userType } : null,
    isAuthenticated,
    loading,
    canSwitchProfiles,
    activeProfileType,
    effectiveUserType
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

  // Create menu items as a function to ensure they re-render when state changes
  const getUserMenuItems = React.useMemo(() => [
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
    ...(isAuthenticated ? [
      {
        type: 'divider' as const,
      },
      {
        key: 'switch-profile',
        icon: <SwapOutlined />,
        label: 'Switch Profile',
        children: [
          {
            key: 'switch-to-adopter',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Puppy Parent Profile</span>
                {activeProfileType === 'puppy-parent' && <span style={{ color: '#08979C' }}>✓</span>}
              </div>
            ),
            onClick: () => {
              if (!isSwitchingProfile) {
                console.log('Switching to puppy parent profile');
                switchProfileType('puppy-parent');
              }
            },
          },
          {
            key: 'switch-to-dog-professional',
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Dog Professional Profile</span>
                {activeProfileType === 'dog-professional' && <span style={{ color: '#08979C' }}>✓</span>}
              </div>
            ),
            onClick: () => {
              if (!isSwitchingProfile) {
                console.log('Switching to dog professional profile');
                switchProfileType('dog-professional');
              }
            },
          },
        ],
      },
    ] : []),
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sign Out',
      onClick: logout,
    },
  ], [user?.userId, unreadCount, isAuthenticated, activeProfileType, switchProfileType, logout]);

  const userMenuItems = getUserMenuItems;

  // Debug logging (reduced)
  if (process.env.NODE_ENV === 'development') {
    console.log('Header state:', { 
      menuItems: userMenuItems.length, 
      isSwitchingProfile, 
      disabledItems: 0 
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

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px' }}>
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
                    {user?.name || 'User'}
                  </span>
                  {canSwitchProfiles && (
                    <span style={{ 
                      fontSize: '10px',
                      color: '#08979C',
                      textTransform: 'capitalize',
                      fontWeight: '500'
                    }}>
                      {activeProfileType}
                    </span>
                  )}
                </div>
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button 
            type="primary" 
            onClick={login}
            loading={loading}
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