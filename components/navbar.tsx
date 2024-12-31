"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Menu, Search, Star, Tag, Moon, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchDialog } from "@/components/search-dialog"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isSmallDevice, setIsSmallDevice] = useState(false)

  useEffect(() => {
    setMounted(true)
    const checkDevice = () => {
      setIsSmallDevice(window.innerWidth <= 768)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (!mounted) {
    return (
      <Button variant="default" size="default">
        <span className="hidden md:inline">Menu</span>
        <Menu className="h-4 w-4 md:ml-2" />
        <span className="sr-only">Open menu</span>
      </Button>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 md:h-16 max-w-screen-2xl items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="hidden md:block"
            >
              <Star className="h-6 w-6 text-primary" />
            </motion.div>
            <Star className="h-5 w-5 md:hidden text-primary" />
            <span className="font-bold text-lg md:text-xl gradient-text">About Virgi</span>
          </Link>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-[1.1rem] w-[1.1rem] md:h-[1.2rem] md:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] md:h-[1.2rem] md:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-[1.1rem] w-[1.1rem] md:h-[1.2rem] md:w-[1.2rem]" />
              <span className="sr-only">Search</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size={isSmallDevice ? "icon" : "default"}
                  className={cn(
                    "h-9 md:h-10",
                    isSmallDevice ? "w-9 md:w-10 p-0" : "px-3 md:px-4 py-2"
                  )}
                >
                  <span className="hidden md:inline">Menu</span>
                  <Menu className="h-[1.1rem] w-[1.1rem] md:h-4 md:w-4 md:ml-2" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Menu</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center">
                    <Star className="mr-2 w-4" />
                    Beranda
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/likes" className="flex items-center">
                    <Heart className="mr-2 w-4" />
                    Likes & Dislikes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tags" className="flex items-center">
                    <Tag className="mr-2 w-4" />
                    Tags
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/funfacts" className="flex items-center">
                    <Star className="mr-2 w-4" />
                    Fun Facts
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <SearchDialog open={isSearchOpen} setOpen={setIsSearchOpen} />
    </header>
  )
}

function NavLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "nav-link inline-flex items-center rounded-md text-sm font-medium transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive ? "text-foreground" : "text-foreground/60",
        "relative group"
      )}
    >
      <motion.span
        initial={false}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-x-2"
      >
        <Icon className="h-4 w-4" />
        <span>{children}</span>
      </motion.span>
    </Link>
  )
}

function MobileNavLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link href={href}>
      <motion.div
        initial={false}
        animate={{ 
          scale: isActive ? 1.05 : 1,
          color: isActive ? "var(--foreground)" : "var(--foreground-60)"
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "nav-link flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium",
          isActive ? "text-foreground" : "text-foreground/60"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{children}</span>
      </motion.div>
    </Link>
  )
}