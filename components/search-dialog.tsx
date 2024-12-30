"use client"

import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown, Tag, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface SearchDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

interface SearchResult {
  id: string
  type: 'like' | 'dislike' | 'tag' | 'fun_fact'
  title: string
  description?: string
  matchedBy: 'name'
  tags?: {
    id: string
    name: string
  }[]
  relatedItems?: {
    id: string
    title: string
    type: 'like' | 'dislike'
  }[]
}

function getResultIcon(type: 'like' | 'dislike' | 'tag' | 'fun_fact') {
  switch (type) {
    case 'like':
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    case 'dislike':
      return <ThumbsDown className="h-4 w-4 text-red-500" />
    case 'tag':
      return <Tag className="h-4 w-4 text-blue-500" />
    case 'fun_fact':
      return <Sparkles className="h-4 w-4 text-yellow-500" />
  }
}

export function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  useEffect(() => {
    if (!searchTerm) {
      setResults([])
      return
    }

    const fetchData = async () => {
      // Fetch likes and dislikes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select(`
          id,
          item_name,
          description,
          is_like,
          tags:item_tags(
            tag:tags(
              id,
              name
            )
          )
        `)
        .ilike('item_name', `%${searchTerm}%`)

      // Fetch tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          description,
          items:item_tags(
            like:likes(
              id,
              item_name,
              is_like
            )
          )
        `)
        .ilike('name', `%${searchTerm}%`)

      // Fetch fun facts
      const { data: funFacts, error: funFactsError } = await supabase
        .from('fun_facts')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

      if (likesError || tagsError || funFactsError) {
        console.error(likesError || tagsError || funFactsError)
        return
      }

      const formattedResults: SearchResult[] = [
        // Format likes/dislikes results
        ...(likes?.map((like: any) => ({
          id: like.id,
          type: like.is_like ? ("like" as const) : ("dislike" as const),
          title: like.item_name,
          description: like.description,
          matchedBy: "name" as const,
          tags: like.tags?.map((tagWrapper: any) => ({
            id: tagWrapper.tag.id,
            name: tagWrapper.tag.name
          }))
        })) || []),
        
        // Format tags results
        ...(tags?.map((tag: any) => ({
          id: tag.id,
          type: "tag" as const,
          title: tag.name,
          description: tag.description,
          matchedBy: "name" as const,
          relatedItems: tag.items?.map((item: any) => ({
            id: item.like.id,
            title: item.like.item_name,
            type: item.like.is_like ? ("like" as const) : ("dislike" as const)
          }))
        })) || []),

        // Format fun facts results
        ...(funFacts?.map((fact: any) => ({
          id: fact.id,
          type: "fun_fact" as const,
          title: fact.title,
          description: fact.description,
          matchedBy: "name" as const
        })) || [])
      ]

      setResults(formattedResults)
    }

    fetchData()
  }, [searchTerm])

  const handleSelect = (item: any) => {
    setOpen(false)
    
    // Navigate based on result type
    switch (item.type) {
      case 'like':
      case 'dislike':
        router.push(`/likes?highlight=${item.id}`)
        // Add a small delay to ensure the navigation completes
        setTimeout(() => {
          const element = document.getElementById(`like-${item.id}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        break
      case 'tag':
        router.push(`/tags/${item.id}`)
        break
      case 'fun_fact':
        router.push(`/funfacts?highlight=${item.id}`)
        // Add a small delay to ensure the navigation completes
        setTimeout(() => {
          const element = document.getElementById(`funfact-${item.id}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search for likes, dislikes, tags, and fun facts
          </DialogDescription>
        </DialogHeader>
        
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Type to search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-y-auto p-2">
            {results.map((result) => (
              <CommandItem
                key={result.id}
                value={`${result.type}-${result.id}-${result.title}`}
                onSelect={() => handleSelect(result)}
                className="flex flex-col items-start gap-1 px-4 py-2"
              >
                <div className="flex w-full items-center gap-2">
                  {getResultIcon(result.type)}
                  <span className="flex-1">{result.title}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {result.type === 'fun_fact' ? 'Fun Fact' : result.type}
                  </Badge>
                </div>
                {result.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1 pl-6">
                    {result.description}
                  </p>
                )}
                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pl-6">
                    {result.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  )
} 