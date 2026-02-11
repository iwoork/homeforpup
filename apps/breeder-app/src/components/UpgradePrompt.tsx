'use client';

import React from 'react';
import { Alert, Button } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface UpgradePromptProps {
  resource: string;
  currentCount: number;
  limit: number;
  tier: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  resource,
  currentCount,
  limit,
  tier,
}) => {
  return (
    <Alert
      message={`${resource} Limit Reached`}
      description={`Your ${tier} plan allows up to ${limit} ${resource.toLowerCase()}. You currently have ${currentCount}. Upgrade your plan to add more.`}
      type="warning"
      showIcon
      icon={<CrownOutlined />}
      style={{ borderRadius: '8px', marginBottom: '16px' }}
      action={
        <Link href="/pricing">
          <Button type="primary" size="small" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
            Upgrade Plan
          </Button>
        </Link>
      }
    />
  );
};

export default UpgradePrompt;
