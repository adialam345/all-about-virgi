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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, ThumbsUp, ThumbsDown, Tag as LucideTag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Database } from "@/lib/database.types"

interface Tag {
  id: string
  name: string
  description?: string | null
}

interface TagWrapper {
  tag: Tag
}

interface Like {
  id: string
  item_name: string
  description: string | null
  is_like: boolean
  tags: {
    tag: {
      id: string
      name: string
    }
  }[]
}

interface SearchResult {
  id: string
  type: "like" | "dislike" | "tag"
  title: string
  description?: string | null
  matchedBy: string
  tags?: {
    id: string
    name: string
  }[]
  relatedItems?: {
    id: string
    title: string
    type: "like" | "dislike"
  }[]
}

interface SearchDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  useEffect(() => {
    if (searchTerm.length === 0) {
      setResults([])
      return
    }

    const fetchData = async () => {
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

      if (likesError || tagsError) {
        console.error(likesError || tagsError)
        return
      }

      const formattedResults: SearchResult[] = [
        ...(likes?.map((like: any) => ({
          id: like.id,
          type: like.is_like ? ("like" as const) : ("dislike" as const),
          title: like.item_name,
          description: like.description,
          matchedBy: "name",
          tags: like.tags?.map((tagWrapper: any) => ({
            id: tagWrapper.tag.id,
            name: tagWrapper.tag.name
          }))
        })) || []),
        
        ...(tags?.map((tag: any) => ({
          id: tag.id,
          type: "tag" as const,
          title: tag.name,
          description: tag.description,
          matchedBy: "name",
          relatedItems: tag.items?.map((item: any) => ({
            id: item.like.id,
            title: item.like.item_name,
            type: item.like.is_like ? ("like" as const) : ("dislike" as const)
          }))
        })) || [])
      ]

      setResults(formattedResults)
    }

    const timeoutId = setTimeout(fetchData, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <Input
            placeholder="Search likes, dislikes, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2"
          />
        </DialogHeader>
        <ScrollArea className="mt-4 max-h-80">
          {results.length > 0 ? (
            results.map(result => (
              <div key={result.id} className="p-4 border-b last:border-b-0">
                <h3 className="text-lg font-semibold">{result.title}</h3>
                {result.description && (
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                )}
                {result.tags && result.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.tags.map(tag => (
                      <LucideTag key={tag.id} className="h-4 w-4 text-blue-500" />
                    ))}
                  </div>
                )}
                {result.relatedItems && result.relatedItems.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-semibold">Related Items:</h4>
                    <ul className="list-disc list-inside">
                      {result.relatedItems.map(item => (
                        <li key={item.id} className="flex items-center">
                          {item.type === "like" ? (
                            <ThumbsUp className="inline h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <ThumbsDown className="inline h-4 w-4 mr-1 text-red-500" />
                          )}
                          {item.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">No results found.</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 