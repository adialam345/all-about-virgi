"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface FunFact {
  id: string
  title: string
  description: string | null
  created_at: string
}

export function FunFactsList() {
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const highlightedId = searchParams.get('highlight')

  useEffect(() => {
    async function fetchFunFacts() {
      try {
        const { data, error } = await supabase
          .from('fun_facts')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setFunFacts(data || [])
      } catch (error) {
        console.error('Error fetching fun facts:', error)
        toast({
          title: "Error",
          description: "Failed to fetch fun facts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFunFacts()

    // Set up real-time subscription
    const channel = supabase
      .channel('fun_facts-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fun_facts' }, 
        () => fetchFunFacts()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2">
          <span className="animate-spin">✨</span>
          <span>Loading fun facts...</span>
        </div>
      </div>
    )
  }

  if (funFacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No fun facts available yet. Be the first to add one!
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {funFacts.map((fact) => (
        <Card 
          key={fact.id}
          id={`funfact-${fact.id}`}
          className={cn(
            "p-4 border-2 transition-all duration-300",
            highlightedId === fact.id 
              ? "border-primary bg-primary/5 shadow-lg" 
              : "border-primary/20 hover:border-primary/40"
          )}
        >
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {fact.title}
          </h3>
          {fact.description && (
            <p className="text-muted-foreground">
              {fact.description}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
} 