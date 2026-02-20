import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f5f5f5',
    }}>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#52c41a',
          },
        }}
      />
    </div>
  );
}
