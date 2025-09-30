'use client';

import React, { Suspense } from 'react';
import { Typography, Card, Spin } from 'antd';
import { useSession } from 'next-auth/react';
import { ActivityFeed, ActivityStats } from '@homeforpup/shared-activity';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const { Title, Paragraph } = Typography;

const ActivityContent: React.FC = () => {
  const { data: session, status } = useSession();
  
  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div>Loading activity...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={3}>Authentication Required</Title>
            <Paragraph>Please sign in to view your activity.</Paragraph>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Title level={1}>My Activity</Title>
        <Paragraph style={{ fontSize: '1.1rem' }}>
          Track your breeding business activities and engagement with potential families
        </Paragraph>
      </div>

      {/* Activity Stats */}
      <div style={{ marginBottom: '32px' }}>
        <ActivityStats
          userId={(user as any)?.id || (user as any)?.sub || user?.email}
          userType="breeder"
          period="month"
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed
        userId={(user as any)?.id || (user as any)?.sub || user?.email}
        userType="breeder"
        limit={50}
        showFilters={true}
        showStats={false}
        onActivityClick={(activity) => {
          console.log('Activity clicked:', activity);
          // Handle activity click - could navigate to relevant page
        }}
      />
    </div>
  );
};

const BreederActivityPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <Spin size="large" />
        <Paragraph style={{ marginTop: '16px' }}>Loading activity...</Paragraph>
      </div>
    }>
      <ActivityContent />
    </Suspense>
  );
};

export default BreederActivityPage;
