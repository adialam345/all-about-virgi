"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Tag {
  id: string
  name: string
  description: string | null
}

export function TagsList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getTags() {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error
        setTags(data || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setLoading(false)
      }
    }

    getTags()
  }, [])

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
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                title={tag.description || undefined}
              >
                {tag.name}
              </Badge>
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