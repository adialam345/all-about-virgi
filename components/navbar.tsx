"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Star, Heart, Tags, Search, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SearchDialog } from '@/components/search-dialog'

export function Navbar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Star className="h-6 w-6" />
            <span className="font-bold">Astrella Archive</span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/likes"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/likes" ? "text-foreground" : "text-foreground/60"
            )}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Likes & Dislikes</span>
            </div>
          </Link>
          <Link
            href="/tags"
            className={cn(
              "transition-colors hover:text-foreground/80",
              pathname === "/tags" ? "text-foreground" : "text-foreground/60"
            )}
          >
            <div className="flex items-center space-x-2">
              <Tags className="h-4 w-4" />
              <span>Tags</span>
            </div>
          </Link>
        </nav>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t">
          <div className="container py-2 space-y-2">
            <Link
              href="/likes"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-accent",
                pathname === "/likes" ? "bg-accent" : ""
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Heart className="h-4 w-4" />
              <span>Likes & Dislikes</span>
            </Link>
            <Link
              href="/tags"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-md transition-colors hover:bg-accent",
                pathname === "/tags" ? "bg-accent" : ""
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tags className="h-4 w-4" />
              <span>Tags</span>
            </Link>
          </div>
        </nav>
      )}
      <SearchDialog open={searchOpen} setOpen={setSearchOpen} />
    </header>
  )
}