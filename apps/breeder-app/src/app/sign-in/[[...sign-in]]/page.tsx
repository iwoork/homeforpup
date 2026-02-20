import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
    }}>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#52c41a',
          },
        }}
      />
    </div>
  );
}
