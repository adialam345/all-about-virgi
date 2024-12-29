"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { FunFact } from "@/types"
import { AddFunFactDialog } from "@/components/funfacts/add-funfact-dialog"

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
      .channel('fun_facts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'fun_facts' 
        }, 
        () => {
          fetchFunFacts() // Refresh data when changes occur
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe()
    }
  }, [])

  const handleNewFunFact = (newFact: FunFact) => {
    setFunFacts(prev => [newFact, ...prev])
  }

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h1 className="text-2xl font-bold text-white">Fun Facts About Astrella</h1>
          </div>
          <AddFunFactDialog onSuccess={handleNewFunFact} />
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
            <div
              key={fact.id}
              className="p-6 rounded-lg bg-card border"
            >
              <h3 className="text-lg font-semibold mb-2">{fact.title}</h3>
              {fact.description && (
                <p className="text-muted-foreground">{fact.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 