"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface LikeDislikeProps {
  itemId: string
  initialLikes: number
  initialDislikes: number
  userVote?: 'like' | 'dislike' | null
}

export function LikeDislike({ itemId, initialLikes, initialDislikes, userVote }: LikeDislikeProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [currentVote, setCurrentVote] = useState<'like' | 'dislike' | null>(userVote || null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient()

  async function handleVote(voteType: 'like' | 'dislike') {
    try {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to vote",
          variant: "destructive",
        })
        return
      }

      // Remove previous vote if exists
      if (currentVote) {
        if (currentVote === 'like') setLikes(prev => prev - 1)
        if (currentVote === 'dislike') setDislikes(prev => prev - 1)
      }

      // Add new vote
      if (voteType === currentVote) {
        // User is un-voting
        setCurrentVote(null)
      } else {
        // User is voting or changing vote
        setCurrentVote(voteType)
        if (voteType === 'like') setLikes(prev => prev + 1)
        if (voteType === 'dislike') setDislikes(prev => prev + 1)
      }

      // Update in database
      const { error } = await supabase
        .from('votes')
        .upsert({
          item_id: itemId,
          user_id: session.user.id,
          vote_type: voteType === currentVote ? null : voteType
        })

      if (error) throw error

      router.refresh()

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register vote. Please try again.",
        variant: "destructive",
      })
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative px-4 py-2 transition-all duration-300",
          "hover:bg-primary/10 hover:text-primary",
          "active:scale-95",
          currentVote === 'like' && "text-primary bg-primary/10 font-medium",
          !currentVote && "text-muted-foreground"
        )}
        onClick={() => handleVote('like')}
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <ThumbsUp className={cn(
            "h-4 w-4 transition-transform",
            currentVote === 'like' && "scale-110"
          )} />
          <span className={cn(
            "min-w-[1.5rem] text-sm",
            currentVote === 'like' && "text-glow"
          )}>
            {likes}
          </span>
        </div>
        {currentVote === 'like' && (
          <motion.div
            className="absolute inset-0 rounded-[var(--radius)] border border-primary/50"
            layoutId="voteBorder"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "relative px-4 py-2 transition-all duration-300",
          "hover:bg-destructive/10 hover:text-destructive",
          "active:scale-95",
          currentVote === 'dislike' && "text-destructive bg-destructive/10 font-medium",
          !currentVote && "text-muted-foreground"
        )}
        onClick={() => handleVote('dislike')}
        disabled={isLoading}
      >
        <div className="flex items-center gap-2">
          <ThumbsDown className={cn(
            "h-4 w-4 transition-transform",
            currentVote === 'dislike' && "scale-110"
          )} />
          <span className={cn(
            "min-w-[1.5rem] text-sm",
            currentVote === 'dislike' && "text-glow"
          )}>
            {dislikes}
          </span>
        </div>
        {currentVote === 'dislike' && (
          <motion.div
            className="absolute inset-0 rounded-[var(--radius)] border border-destructive/50"
            layoutId="voteBorder"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </Button>
    </div>
  )
} 