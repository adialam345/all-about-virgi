"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ThumbsUp, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface TagItem {
  like: {
    id: string
    item_name: string
    description: string | null
    is_like: boolean
  }
}

interface Tag {
  id: string
  name: string
  description: string | null
  items?: {
    id: string
    item_name: string
    description: string | null
    is_like: boolean
  }[]
}

export function TagsList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [openTags, setOpenTags] = useState<string[]>([])

  useEffect(() => {
    async function getTags() {
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

        // Transform data to flatten the structure
        const transformedData = data?.map(tag => ({
          ...tag,
          items: tag.items
            ?.map((item: TagItem) => ({
              id: item.like.id,
              item_name: item.like.item_name,
              description: item.like.description,
              is_like: item.like.is_like
            }))
            .filter(Boolean) || []
        }))

        setTags(transformedData || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(false)
      }
    }

    getTags()
  }, [])

  const toggleTag = (tagId: string) => {
    setOpenTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Tag className="h-5 w-5" />
        <div>
          <CardTitle>Tags</CardTitle>
          <CardDescription>Categories and labels</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <Collapsible
                key={tag.id}
                open={openTags.includes(tag.id)}
                onOpenChange={() => toggleTag(tag.id)}
              >
                <CollapsibleTrigger asChild>
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 flex items-center gap-2"
                  >
                    <Tag className="h-3 w-3" />
                    {tag.name}
                    {tag.items && tag.items.length > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({tag.items.length})
                      </span>
                    )}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 ml-4 space-y-2">
                    {tag.items && tag.items.length > 0 ? (
                      tag.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 p-2 rounded-md border">
                          {item.is_like ? (
                            <ThumbsUp className="h-4 w-4 mt-1 text-green-500" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mt-1 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{item.item_name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No items using this tag</p>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            {tags.length === 0 && (
              <p className="text-muted-foreground">No tags added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 