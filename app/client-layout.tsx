"use client"

import { Navbar } from '@/components/navbar'
import { Toaster } from "@/components/ui/toaster"
import { useMotion } from './providers'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isReducedMotion } = useMotion();
  
  return (
    <div className={isReducedMotion ? 'reduced-motion' : ''}>
      <Navbar />
      {children}
      <Toaster />
    </div>
  )
} 