import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { Layout } from '@/components/layout'
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema } from '@/lib/utils/seo'
import StructuredData from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateSEOMetadata({
  title: 'HomeForPup - Find Your Perfect Puppy from Trusted Dog Professionals',
  description: 'Connect with ethical breeders and loving families. HomeForPup helps you find puppies and build lasting community connections through our trusted platform.',
  keywords: [
    'find puppies',
    'breeders',
    'puppy matching',
    'ethical breeding',
    'puppy adoption',
    'dog community',
    'responsible breeders',
    'family raised puppies',
    'puppy parents',
    'dog professionals'
  ],
  url: '/',
  type: 'website'
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData data={generateOrganizationSchema()} />
        <GoogleAnalytics />
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0, backgroundColor: '#fafafa' }}>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  )
}
