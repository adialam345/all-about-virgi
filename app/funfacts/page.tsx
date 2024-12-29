"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FunFactCard } from "@/components/funfacts/fun-fact-card"
import { useToast } from "@/components/ui/use-toast"

interface FunFact {
  id: string
  title: string
  description: string | null
  created_at: string
}

export default function FunFactsPage() {
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const fetchFunFacts = async () => {
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

  useEffect(() => {
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
  }, [])

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10">
        <div className="flex items-center gap-2">
          <span className="animate-spin">✨</span>
          <span>Loading fun facts...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✨</span>
          <h1 className="text-2xl font-bold text-white">Fun Facts About Astrella</h1>
        </div>
        <p className="text-[#a1a1aa]">Interesting and unique things about Astrella</p>
      </div>

      {funFacts.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No fun facts available yet
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {funFacts.map((fact) => (
            <FunFactCard
              key={fact.id}
              title={fact.title}
              description={fact.description}
            />
          ))}
        </div>
      )}
    </div>
  )
} 