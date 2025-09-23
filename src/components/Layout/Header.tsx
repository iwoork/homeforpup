'use client';

import React from 'react';
import { Layout, Button, Dropdown, Avatar, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, MessageOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useAuth } from '@/components/auth/SimpleAuthProvider';

const Header: React.FC = () => {
  const { user, logout, login, isAuthenticated, loading, refreshAuth } = useAuth();
  const [isMobile, setIsMobile] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);
  
  console.log('Header render - Auth state:', {
    user: user ? { userId: user.userId?.substring(0, 10) + '...', name: user.name, userType: user.userType } : null,
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
      // Get the access token for authentication
      const token = localStorage.getItem('cognito_tokens');
      const accessToken = token ? JSON.parse(token).accessToken : null;
      
      if (!accessToken) {
        console.log('No access token available for unread count fetch');
        setUnreadCount(0);
        return;
      }

      const response = await fetch('/api/messages/threads', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Threads data for unread count:', data);
        
        // Count unread messages across all threads
        // unreadCount is a Record<string, number> where key is userId
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
  }, [isAuthenticated, user]);

  // Force refresh auth state when header mounts
  React.useEffect(() => {
    console.log('🔄 Header mounted, refreshing auth state...');
    refreshAuth();
  }, [refreshAuth]);

  // Fetch unread count when user changes
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setUnreadCount(0);
      return;
    }
    
    fetchUnreadCount();
    // Set up polling for unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
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

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link href={`/users/${user?.userId}`}>My Profile</Link>,
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: (
        <Link href="/dashboard/messages">
          <Badge count={unreadCount} size="small" offset={[8, 0]}>
            Messages
          </Badge>
        </Link>
      ),
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
      onClick: logout,
    },
  ];

  return (
    <Layout.Header style={{ 
      position: 'fixed', 
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000, 
      width: '100vw',
      height: isMobile ? '60px' : '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: isMobile ? '0 12px' : '0 16px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        flex: 1, 
        minWidth: 0,
        maxWidth: 'calc(100vw - 200px)'
      }}>
        <Link 
          href="/" 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <img 
            src="/logo.png" 
            alt="Home for Pup" 
            style={{
              height: isMobile ? '28px' : '48px',
              width: 'auto',
              marginRight: isMobile ? '6px' : '8px',
              objectFit: 'contain'
            }}
          />
          <span style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: 'bold',
            color: '#08979C'
          }}>
            home for pup
          </span>
        </Link>
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        flexShrink: 0,
        minWidth: isMobile ? '140px' : '180px',
        justifyContent: 'flex-end',
        gap: isMobile ? '4px' : '8px'
      }}>
        {loading ? (
          <Button type="text" loading size={isMobile ? 'small' : 'middle'}>
            {isMobile ? '' : 'Loading...'}
          </Button>
        ) : isAuthenticated && user ? (
          <>
            <Link href="/dashboard/messages">
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button 
                  type="text" 
                  size={isMobile ? 'small' : 'middle'}
                  icon={<MessageOutlined />}
                  style={{ 
                    display: isMobile ? 'none' : 'flex',
                    alignItems: 'center',
                    height: isMobile ? '32px' : '36px',
                    padding: isMobile ? '0 6px' : '0 8px'
                  }}
                >
                  {isMobile ? '' : 'Messages'}
                </Button>
              </Badge>
            </Link>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button 
                type="text" 
                size={isMobile ? 'small' : 'middle'}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: isMobile ? '36px' : '40px',
                  maxWidth: isMobile ? '120px' : '150px',
                  padding: isMobile ? '0 6px' : '0 8px'
                }}
              >
                <Avatar size={isMobile ? 'small' : 'default'} icon={<UserOutlined />} />
                <span style={{ 
                  marginLeft: isMobile ? 4 : 6, 
                  maxWidth: isMobile ? '80px' : '100px', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  fontSize: isMobile ? '12px' : '14px'
                }}>
                  {user.name}
                </span>
              </Button>
            </Dropdown>
          </>
        ) : (
          <Button 
            type="primary" 
            size={isMobile ? 'small' : 'middle'}
            onClick={() => {
              console.log('Sign In button clicked');
              login();
            }}
          >
            Sign In
          </Button>
        )}
      </div>
    </Layout.Header>
  );
};

export default Header;
