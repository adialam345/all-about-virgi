"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp } from "lucide-react"

interface Like {
  id: string
  item_name: string
  description: string
}

export function LikesList() {
  const [likes, setLikes] = useState<Like[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getLikes() {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('*')
          .eq('is_like', true)

        if (error) throw error
        setLikes(data || [])
      } catch (error) {
        console.error('Error fetching likes:', error)
      } finally {
        setLoading(false)
      }
    }

    getLikes()
  }, [])

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
              <div key={like.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{like.item_name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 max-w-[65ch]">
                  {like.description}
                </p>
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