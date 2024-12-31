import Link from "next/link"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Heart, Tag, Sparkles } from "lucide-react"
import { headers } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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

async function checkAdminAccess() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await checkAdminAccess()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-background">
        <ScrollArea className="max-w-[600px] lg:max-w-none">
          <div className="flex items-center px-4">
            {sidebarNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
          <nav className="space-y-1 px-2">
            {sidebarNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'