"use client"

import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createContext, useContext, useState } from "react"

type MotionContextType = {
  isReducedMotion: boolean;
  toggleReducedMotion: () => void;
};

export const MotionContext = createContext<MotionContextType>({
  isReducedMotion: false,
  toggleReducedMotion: () => {},
});

export const useMotion = () => useContext(MotionContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const toggleReducedMotion = () => {
    setIsReducedMotion(prev => !prev);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <MotionContext.Provider value={{ isReducedMotion, toggleReducedMotion }}>
          {children}
        </MotionContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
} 