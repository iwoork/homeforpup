import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import ConditionalHeader from '@/components/ConditionalHeader'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Prevent FOUC with font loading
})

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'HomeForPup Breeders - Manage Your Kennel',
  description: 'Professional tools for dog breeders to manage kennels, dogs, and connect with potential families',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={inter.className} style={{margin: 0, padding: 0}} suppressHydrationWarning>
        <Providers>
          <ConditionalHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
