import { FunFactsList } from "@/components/funfacts/fun-facts-list"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function FunFactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fun Facts</h1>
      </div>
      <FunFactsList />
    </div>
  )
} 