import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e6fffb 0%, #f0f5ff 100%)',
    }}>
      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#08979C',
          },
        }}
      />
    </div>
  );
}
