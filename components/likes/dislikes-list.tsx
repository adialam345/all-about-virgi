"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsDown } from "lucide-react"

interface Dislike {
  id: string
  item_name: string
  description: string
}

export function DislikesList() {
  const [dislikes, setDislikes] = useState<Dislike[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getDislikes() {
      try {
        const { data, error } = await supabase
          .from('likes')
          .select('*')
          .eq('is_like', false)

        if (error) throw error
        setDislikes(data || [])
      } catch (error) {
        console.error('Error fetching dislikes:', error)
      } finally {
        setLoading(false)
      }
    }

    getDislikes()
  }, [])

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
              <div key={dislike.id} className="rounded-lg border p-4">
                <h3 className="font-semibold">{dislike.item_name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 max-w-[65ch]">
                  {dislike.description}
                </p>
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