import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '72px', margin: '0 0 20px 0', color: '#08979C' }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ fontSize: '16px', color: '#666' }}>
        {statusCode === 404
          ? 'Page not found'
          : 'An error occurred'}
      </p>
      <a href="/" style={{
        display: 'inline-block',
        marginTop: '24px',
        padding: '8px 24px',
        backgroundColor: '#08979C',
        color: '#fff',
        borderRadius: '6px',
        fontSize: '16px',
        textDecoration: 'none',
      }}>
        Go Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
