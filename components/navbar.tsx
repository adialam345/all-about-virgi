"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, Heart, Star, Tags } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Star className="h-6 w-6" />
            <span className="font-bold">Astrella Archive</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
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
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}