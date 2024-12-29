'use client';

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { AddFunFactDialog } from "@/components/funfacts/add-funfact-dialog"
import { FunFactsTable } from "@/components/funfacts/fun-facts-table"

interface FunFact {
  id: string
  title: string
  description: string | null
  created_at: string
}

export default function ManageFunFacts() {
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [searchQuery, setSearchQuery] = useState("")
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
  }, [supabase, toast])

  const filteredFunFacts = funFacts.filter(fact => 
    fact.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fact.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  )

  const handleSuccess = (newFact: FunFact) => {
    setFunFacts(prev => [newFact, ...prev])
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Fun Facts</h1>
          <p className="text-muted-foreground mt-2">
            View, edit, and delete fun facts about Astrella
          </p>
        </div>
        <AddFunFactDialog onSuccess={handleSuccess} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Fun Facts List
          </CardTitle>
          <CardDescription>
            View, edit, and delete fun facts about Astrella
          </CardDescription>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fun facts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredFunFacts.length} results
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                <span>Loading fun facts...</span>
              </div>
            </div>
          ) : filteredFunFacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No fun facts found matching your search' : 'No fun facts added yet'}
              </p>
            </div>
          ) : (
            <FunFactsTable funFacts={filteredFunFacts} onRefresh={fetchFunFacts} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}