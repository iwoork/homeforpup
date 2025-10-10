// components/ConnectionStatus.tsx
'use client';

import React from 'react';
import { Badge, Tooltip, Button } from 'antd';
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  LoadingOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  onReconnect?: () => void;
  showText?: boolean;
  size?: 'small' | 'default' | 'large';
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isConnecting,
  error,
  onReconnect,
  showText = true,
  size = 'default'
}) => {
  const getStatusColor = () => {
    if (error) return 'red';
    if (isConnected) return 'green';
    if (isConnecting) return 'blue';
    return 'gray';
  };

  const getStatusIcon = () => {
    if (error) return <ExclamationCircleOutlined />;
    if (isConnected) return <WifiOutlined />;
    if (isConnecting) return <LoadingOutlined spin />;
    return <DisconnectOutlined />;
  };

  const getStatusText = () => {
    if (error) return 'Connection Error';
    if (isConnected) return 'Connected';
    if (isConnecting) return 'Connecting...';
    return 'Disconnected';
  };

  const getTooltipText = () => {
    if (error) return `Error: ${error}`;
    if (isConnected) return 'Real-time messaging is active';
    if (isConnecting) return 'Establishing connection...';
    return 'Not connected to server';
  };

  const statusElement = (
    <Badge 
      status={getStatusColor() as any}
      text={showText ? getStatusText() : undefined}
      style={{ 
        fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {getStatusIcon()}
    </Badge>
  );

  if (onReconnect && (error || !isConnected)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Tooltip title={getTooltipText()}>
          {statusElement}
        </Tooltip>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={onReconnect}
          loading={isConnecting}
          style={{ 
            padding: '0 4px',
            height: 'auto',
            minWidth: 'auto'
          }}
        />
      </div>
    );
  }

  return (
    <Tooltip title={getTooltipText()}>
      {statusElement}
    </Tooltip>
  );
};

export default ConnectionStatus;
