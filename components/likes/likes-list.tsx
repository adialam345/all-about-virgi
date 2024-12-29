"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Like {
  id: string
  item_name: string
  description: string
  tags: {
    id: string
    name: string
  }[]
}

interface TagItem {
  tag: {
    id: string
    name: string
  }
}

export function LikesList() {
  const [likes, setLikes] = useState<Like[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  useEffect(() => {
    async function getLikes() {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select(`
            *,
            tags:item_tags(
              tag:tags(
                id,
                name
              )
            )
          `)
          .eq('is_like', true)

        if (error) throw error

        const transformedData = data?.map(like => ({
          ...like,
          tags: like.tags
            ?.map((t: TagItem) => t.tag)
            .filter(Boolean) || []
        }))

        setLikes(transformedData || [])
      } catch (error) {
        console.error('Error fetching likes:', error)
      } finally {
        setLoading(false)
      }
    }

    getLikes()
  }, [])

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(highlightId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [highlightId, likes])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ThumbsUp className="h-5 w-5 text-green-500" />
        <div>
          <CardTitle>Likes</CardTitle>
          <CardDescription>Things that Astrella loves</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {likes.map((like) => (
              <div
                key={like.id}
                id={like.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  highlightId === like.id && "bg-muted"
                )}
              >
                <h3 className="font-semibold">{like.item_name}</h3>
                {like.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3 max-w-[65ch]">
                    {like.description}
                  </p>
                )}
                {like.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {like.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {likes.length === 0 && (
              <p className="text-muted-foreground">No likes added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}