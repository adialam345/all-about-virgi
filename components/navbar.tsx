"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Menu, Search, Star, Tag, Moon, Sun } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SearchDialog } from "@/components/search-dialog"
import { useTheme } from "next-themes"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

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

          <nav className="hidden md:flex items-center gap-3">
            <NavLink href="/likes" icon={Heart}>
              Likes & Dislikes
            </NavLink>
            <NavLink href="/tags" icon={Tag}>
              Tags
            </NavLink>
            <NavLink href="/funfacts" icon={Star}>
              Fun Facts
            </NavLink>
          </nav>

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
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t glass"
        >
          <div className="container py-4 space-y-2">
            <MobileNavLink href="/likes" icon={Heart}>
              Likes & Dislikes
            </MobileNavLink>
            <MobileNavLink href="/tags" icon={Tag}>
              Tags
            </MobileNavLink>
            <MobileNavLink href="/funfacts" icon={Star}>
              Fun Facts
            </MobileNavLink>
          </div>
        </motion.nav>
      )}
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
        "flex items-center gap-3 p-3 rounded-lg transition-colors text-base",
        isActive 
          ? "text-primary font-medium bg-gradient-to-r from-pink-400/20 via-pink-500/20 to-pink-400/20 shadow-lg" 
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