"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tag, ChevronDown, ChevronRight } from "lucide-react" 
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const supabase = createClientComponentClient()

type TagWithItems = {
  id: string
  name: string
  description: string | null
  items: {
    id: string
    item_name: string
    description: string | null
    is_like: boolean
  }[]
}

interface TagResponse {
  id: string
  name: string
  description: string | null
  items: {
    like: {
      id: string
      item_name: string
      description: string | null
      is_like: boolean
    }
  }[]
}

export function TagsList() {
  const [tags, setTags] = useState<TagWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedTags, setExpandedTags] = useState<string[]>([])

  useEffect(() => {
    const getTags = async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select(`
            *,
            items:item_tags(
              like:likes(
                id,
                item_name,
                description,
                is_like
              )
            )
          `)
          .order('name', { ascending: true })

        if (error) throw error

        // Transform the data to flatten the nested structure
        const transformedTags = (data || []).map((tag: TagResponse) => ({
          ...tag,
          items: tag.items
            ?.map((item: { like: TagResponse['items'][0]['like'] }) => item.like)
            .filter(Boolean) || []
        }))

        setTags(transformedTags)
      } catch (error) {
        console.error('Error fetching tags:', error)
        setError('Failed to load tags')
      } finally {
        setIsLoading(false)
      }
    }

    getTags()
  }, [])

  const toggleTag = (tagId: string) => {
    setExpandedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Tag className="h-4 w-4" />
        Loading tags...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Tag className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Tag className="h-4 w-4" />
        No tags added yet
      </div>
    )
  }

  return (
    <div className="space-y-2">

      <div className="flex flex-col gap-2">
        {tags.map((tag) => (
          <div key={tag.id} className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "flex w-full items-center justify-between p-2",
                "hover:bg-secondary/80 transition-colors",
                "group relative overflow-hidden",
                expandedTags.includes(tag.id) && "bg-secondary"
              )}
              onClick={() => toggleTag(tag.id)}
            >
              <div className="flex items-center gap-2 relative z-10">
                <Tag className="h-4 w-4" />
                <span>{tag.name}</span>
                <Badge variant="secondary" className="ml-2 transition-colors group-hover:bg-background/80">
                  {tag.items.length}
                </Badge>
              </div>
              {expandedTags.includes(tag.id) ? (
                <ChevronDown className="h-4 w-4 transition-transform" />
              ) : (
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              )}
            </Button>
            
            {expandedTags.includes(tag.id) && tag.items.length > 0 && (
              <div className="ml-6 space-y-1 border-l pl-4">
                {tag.items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.is_like ? "bg-green-500" : "bg-red-500"
                    )} />
                    <span>{item.item_name}</span>
                    {item.description && (
                      <span className="text-muted-foreground">
                        - {item.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 