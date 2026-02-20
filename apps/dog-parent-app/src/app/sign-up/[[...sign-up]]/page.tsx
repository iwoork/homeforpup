import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e6fffb 0%, #f0f5ff 100%)',
    }}>
      <SignUp
        appearance={{
          variables: {
            colorPrimary: '#08979C',
          },
        }}
      />
    </div>
  );
}
