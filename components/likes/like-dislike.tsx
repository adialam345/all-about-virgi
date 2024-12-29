"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type LikeDislikeProps = {
  itemName: string
  description?: string
}

export function LikeDislike({ itemName, description }: LikeDislikeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInteraction = async (isLike: boolean) => {
    try {
      setIsSubmitting(true)

      // Insert new like/dislike
      const { error } = await supabase
        .from('likes')
        .insert([
          {
            item_name: itemName,
            description: description || null,
            is_like: isLike,
          }
        ])

      if (error) throw error

      toast({
        title: "Success!",
        description: `${isLike ? 'Like' : 'Dislike'} recorded successfully.`,
      })

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to record your response.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteraction(true)}
        disabled={isSubmitting}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleInteraction(false)}
        disabled={isSubmitting}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
} 