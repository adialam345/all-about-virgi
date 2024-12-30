import { LikesDislikesGrid } from "@/components/likes/likes-dislikes-grid"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function LikesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Likes & Dislikes</h1>
      </div>
      <LikesDislikesGrid />
    </div>
  )
} 