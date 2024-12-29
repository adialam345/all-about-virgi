import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, ThumbsUp, ThumbsDown } from "lucide-react"

export default async function TagDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  // Fetch tag details
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('*')
    .eq('id', params.id)
    .single()

  if (tagError || !tag) {
    return notFound()
  }

  // Fetch items using this tag
  const { data: items } = await supabase
    .from('likes')
    .select(`
      id,
      item_name,
      description,
      is_like,
      item_tags!inner(tag_id)
    `)
    .eq('item_tags.tag_id', params.id)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Tag className="h-5 w-5" />
          <div>
            <CardTitle>{tag.name}</CardTitle>
            {tag.description && (
              <CardDescription>{tag.description}</CardDescription>
            )}
          </div>
        </CardHeader>
      </Card>

      {items && items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tagged Items</CardTitle>
            <CardDescription>Items tagged with {tag.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-2 p-4 rounded-lg border">
                  {item.is_like ? (
                    <ThumbsUp className="h-4 w-4 mt-1 text-green-500" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 mt-1 text-red-500" />
                  )}
                  <div>
                    <h3 className="font-medium">{item.item_name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 