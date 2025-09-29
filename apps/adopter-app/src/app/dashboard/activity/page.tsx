'use client';

import React from 'react';
import { Typography, Card } from 'antd';
import { useAuth } from '@homeforpup/shared-auth';
import { ActivityFeed, ActivityStats } from '@homeforpup/shared-activity';

const { Title, Paragraph } = Typography;

const ActivityPage: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

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
          Track your adoption journey and engagement with breeders
        </Paragraph>
      </div>

      {/* Activity Stats */}
      <div style={{ marginBottom: '32px' }}>
        <ActivityStats
          userId={user.userId}
          userType="adopter"
          period="month"
        />
      </div>

      {/* Activity Feed */}
      <ActivityFeed
        userId={user.userId}
        userType="adopter"
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

export default ActivityPage;
