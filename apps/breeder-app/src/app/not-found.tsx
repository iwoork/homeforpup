import Link from 'next/link';

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
      <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', color: '#52c41a' }}>404</h1>
      <h2 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>Page Not Found</h2>
      <p style={{ fontSize: '16px', margin: '0 0 24px 0', color: '#666' }}>
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Link href="/" style={{
        display: 'inline-block',
        padding: '8px 24px',
        backgroundColor: '#52c41a',
        color: '#fff',
        borderRadius: '6px',
        fontSize: '16px',
        textDecoration: 'none',
      }}>
        Go Home
      </Link>
    </div>
  );
}
