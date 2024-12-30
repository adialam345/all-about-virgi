"use client"

import { useQuery } from '@tanstack/react-query'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TagCard } from './tag-card'

interface TagItem {
  id: string
  item_name: string
  description: string | null
  is_like: boolean
}

interface Tag {
  id: string
  name: string
  description: string | null
  items: { count: number }[]
  likes: TagItem[]
}

export function TagsList() {
  const supabase = createClientComponentClient()

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          description,
          items:item_tags(count),
          likes:item_tags(
            like:likes(
              id,
              item_name,
              description,
              is_like
            )
          )
        `)
        .order('name')

      if (error) throw error

      return data.map((tag: any) => ({
        ...tag,
        likes: tag.likes
          ?.map((item: any) => item.like)
          .filter(Boolean) || []
      })) as Tag[]
    },
  })

  return (
    <div className="space-y-2">
      {isLoading ? (
        <div className="text-muted-foreground">Loading tags...</div>
      ) : tags && tags.length > 0 ? (
        tags.map((tag) => (
          <TagCard
            key={tag.id}
            id={tag.id}
            name={tag.name}
            description={tag.description}
            count={tag.items[0]?.count ?? 0}
            items={tag.likes}
          />
        ))
      ) : (
        <div className="text-muted-foreground">No tags found</div>
      )}
    </div>
  )
} 