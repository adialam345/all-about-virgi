"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, ThumbsDown, Tag } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  type: "like" | "dislike" | "tag"
  title: string
  description?: string
  matchedBy?: string
  relatedItems?: {
    id: string
    title: string
    type: "like" | "dislike"
  }[]
}

export function SearchDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function search() {
      if (!query) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        // Search in likes/dislikes
        const { data: likes } = await supabase
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
          .or(`item_name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5)

        // Search in tags
        const { data: tags } = await supabase
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
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(5)

        const formattedResults: SearchResult[] = [
          ...(likes?.map(like => ({
            id: like.id,
            type: like.is_like ? "like" as const : "dislike" as const,
            title: like.item_name,
            description: like.description,
            matchedBy: like.item_name.toLowerCase().includes(query.toLowerCase()) 
              ? "name" 
              : "description",
            tags: like.tags?.map(t => ({
              id: t.tag.id,
              name: t.tag.name
            })) || []
          })) || []),
          ...(tags?.map(tag => ({
            id: tag.id,
            type: "tag" as const,
            title: tag.name,
            description: tag.description,
            matchedBy: tag.name.toLowerCase().includes(query.toLowerCase()) 
              ? "name" 
              : "description",
            relatedItems: tag.items?.map(item => ({
              id: item.like.id,
              title: item.like.item_name,
              type: item.like.is_like ? "like" : "dislike"
            })) || []
          })) || [])
        ]

        setResults(formattedResults)
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  function handleSelect(result: SearchResult) {
    setOpen(false)
    setQuery("")
    
    switch (result.type) {
      case "like":
      case "dislike":
        router.push(`/likes?highlight=${result.id}`)
        break
      case "tag":
        router.push(`/tags/${result.id}`)
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search likes, dislikes, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10"
          />
          <ScrollArea className="h-[300px] rounded-md border p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleSelect(result)}
                    >
                      <div className="flex items-center gap-2">
                        {result.type === "like" && <ThumbsUp className="h-4 w-4 text-green-500" />}
                        {result.type === "dislike" && <ThumbsDown className="h-4 w-4 text-red-500" />}
                        {result.type === "tag" && <Tag className="h-4 w-4" />}
                        <div className="text-left">
                          <p className="font-medium">{result.title}</p>
                          {result.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Button>
                    
                    {/* Show related items for tags */}
                    {result.type === "tag" && result.relatedItems && result.relatedItems.length > 0 && (
                      <div className="ml-6 pl-2 border-l space-y-1">
                        <p className="text-xs text-muted-foreground">Related items:</p>
                        {result.relatedItems.map(item => (
                          <div key={item.id} className="flex items-center gap-2 text-sm">
                            {item.type === "like" ? (
                              <ThumbsUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <ThumbsDown className="h-3 w-3 text-red-500" />
                            )}
                            <span>{item.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">No results found</p>
              </div>
            ) : null}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 