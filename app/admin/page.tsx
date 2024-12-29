export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Total Likes</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Total Dislikes</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Total Tags</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}