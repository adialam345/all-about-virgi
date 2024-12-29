export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
        </div>
        <nav className="space-y-1 px-4">
          <a
            href="/admin"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Overview
          </a>
          <a
            href="/admin/likes"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Likes & Dislikes
          </a>
          <a
            href="/admin/tags"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
          >
            Tags
          </a>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}