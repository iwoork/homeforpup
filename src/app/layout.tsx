import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/ConditionalLayout';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import StructuredData from '@/components/StructuredData';
import { generateMetadata as createMetadata, PAGE_METADATA, generateOrganizationSchema } from '@/lib/utils/seo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = createMetadata(PAGE_METADATA.home);


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData data={generateOrganizationSchema()} />
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0, backgroundColor: '#fafafa' }}>
        <GoogleAnalytics />
        <Providers>
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}