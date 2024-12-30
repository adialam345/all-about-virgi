"use client"

import { FunFactsList } from "@/components/funfacts/fun-facts-list"
import { useSearchParams } from "next/navigation"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function FunFactsPage() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fun Facts</h1>
      </div>
      <FunFactsList highlightId={highlightId} />
    </div>
  )
} 