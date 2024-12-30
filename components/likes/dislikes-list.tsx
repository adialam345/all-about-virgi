"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ThumbsDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Dislike {
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

export function DislikesList() {
  const [dislikes, setDislikes] = useState<Dislike[]>([])
  const [loading, setLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const fetchDislikes = async () => {
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
        .order('created_at', { ascending: sortOrder === 'asc' })

      if (error) throw error

      const transformedData = data?.map(dislike => ({
        ...dislike,
        tags: dislike.tags
          ?.map((t: TagItem) => t.tag)
          .filter(Boolean) || []
      }))

      setDislikes(transformedData || [])
    } catch (error) {
      console.error('Error fetching dislikes:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDislikes()

    // Set up real-time subscription
    const channel = supabase
      .channel('dislikes_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes' }, 
        () => fetchDislikes()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(highlightId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [highlightId, dislikes])

  useEffect(() => {
    fetchDislikes()
  }, [sortOrder])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-1">
          <ThumbsDown className="h-10 w-10 text-red-500" />
          <div>
            <CardDescription>Things that Astrella doesn't like</CardDescription>
          </div>
        </div>
        <Select
          value={sortOrder}
          onValueChange={(value: 'desc' | 'asc') => setSortOrder(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Newest First</SelectItem>
            <SelectItem value="asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
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