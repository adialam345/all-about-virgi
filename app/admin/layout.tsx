import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Heart, Tag, Sparkles } from "lucide-react"

const sidebarNavItems = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Likes & Dislikes",
    href: "/admin/likes",
    icon: Heart,
  },
  {
    title: "Tags",
    href: "/admin/tags", 
    icon: Tag,
  },
  {
    title: "Fun Facts",
    href: "/admin/funfacts",
    icon: Sparkles,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:w-64">
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center border-b px-4 font-semibold">
            Admin Dashboard
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-2 text-sm font-medium">
              {sidebarNavItems.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                      "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          {children}
        </div>
      </div>
    </div>
  )
}