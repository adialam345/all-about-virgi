import { TagsList } from "@/components/tags/tags-list"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tags</h1>
      </div>
      <TagsList />
    </div>
  )
} 