"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Dislike {
  id: string
  item_name: string
  description: string
  tags: {
    id: string
    name: string
  }[]
}

export function DislikesList() {
  const [dislikes, setDislikes] = useState<Dislike[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  useEffect(() => {
    async function getDislikes() {
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
          .eq('is_like', false)

        if (error) throw error

        const transformedData = data?.map(dislike => ({
          ...dislike,
          tags: dislike.tags
            ?.map(t => t.tag)
            .filter(Boolean) || []
        }))

        setDislikes(transformedData || [])
      } catch (error) {
        console.error('Error fetching dislikes:', error)
      } finally {
        setLoading(false)
      }
    }

    getDislikes()
  }, [])

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(highlightId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [highlightId, dislikes])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <ThumbsDown className="h-5 w-5 text-red-500" />
        <div>
          <CardTitle>Dislikes</CardTitle>
          <CardDescription>Things that Astrella doesn't like</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {dislikes.map((dislike) => (
              <div
                key={dislike.id}
                id={dislike.id}
                className={cn(
                  "rounded-lg border p-4 transition-colors",
                  highlightId === dislike.id && "bg-muted"
                )}
              >
                <h3 className="font-semibold">{dislike.item_name}</h3>
                {dislike.description && (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3 max-w-[65ch]">
                    {dislike.description}
                  </p>
                )}
                {dislike.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dislike.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {dislikes.length === 0 && (
              <p className="text-muted-foreground">No dislikes added yet</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}