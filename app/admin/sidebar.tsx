"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Database, Heart, Tags, Users } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  
  const links = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Database
    },
    {
      href: "/admin/likes",
      label: "Likes Management",
      icon: Heart  
    },
    {
      href: "/admin/tags",
      label: "Tags Management", 
      icon: Tags
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Users
    }
  ]

  return (
    <aside className="border-r bg-muted/40 pb-12">
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="space-y-1 px-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant={pathname === link.href ? "secondary" : "ghost"}
              className="w-full justify-start"
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  )
}