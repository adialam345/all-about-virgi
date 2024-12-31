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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 max-w-screen-2xl items-center">
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
            >
              <Star className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="font-bold text-xl gradient-text">About Virgi</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Search</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size={isSmallDevice ? "icon" : "default"}
                  className={cn(
                    isSmallDevice ? "h-10 w-10 p-0" : "h-10 px-4 py-2"
                  )}
                >
                  <span className="hidden md:inline">Menu</span>
                  <Menu className="h-4 w-4 md:ml-2" />
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
        "relative flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm sm:text-base",
        isActive 
          ? "text-primary font-medium bg-gradient-to-r from-pink-400/20 via-pink-500/20 to-pink-400/20 shadow-lg" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 sm:h-5 sm:w-5",
        isActive && "text-pink-500"
      )} />
      <span>{children}</span>
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 via-pink-500/20 to-pink-400/20 border border-pink-500/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-base",
        isActive 
          ? "text-primary font-medium bg-gradient-to-r from-pink-400/20 via-pink-500/20 to-pink-400/20 shadow-sm" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
      )}
    >
      <Icon className={cn(
        "h-5 w-5",
        isActive && "text-pink-500"
      )} />
      <span>{children}</span>
    </Link>
  )
}