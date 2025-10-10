import Link from 'next/link';
import { Button } from 'antd';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', color: '#1890ff' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', margin: '0 0 24px 0', color: '#666' }}>
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link href="/">
        <Button type="primary" size="large">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
