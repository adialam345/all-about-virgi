import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/toaster"
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Virgi',
  description: 'Suka berekspresi melalui kreasi, Tara! Aku Virgi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="relative min-h-screen bg-background">
            <div className="relative z-10">
              <Navbar />
              <main className="container py-6 md:py-8">{children}</main>
            </div>
            <div className="fixed inset-0 z-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}