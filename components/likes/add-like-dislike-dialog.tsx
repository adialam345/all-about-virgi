"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Heart, ThumbsDown, Loader2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

interface Tag {
  id: string
  name: string
}

interface AddLikeDislikeDialogProps {
  variant?: 'like' | 'dislike'
}

export function AddLikeDislikeDialog({ variant = 'like' }: AddLikeDislikeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const Icon = variant === 'like' ? Heart : ThumbsDown
  const title = variant === 'like' ? 'Add Like' : 'Add Dislike'

  useEffect(() => {
    async function fetchTags() {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('id, name')
          .order('name')

        if (error) throw error
        setAvailableTags(data || [])
      } catch (error) {
        console.error('Error fetching tags:', error)
      }
    }

    if (isOpen) {
      fetchTags()
    }
  }, [isOpen])

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    try {
      setIsSubmitting(true)

      const { data: likeData, error: likeError } = await supabase
        .from('likes')
        .insert({
          item_name: title,
          description: description,
          is_like: variant === 'like',
        })
        .select()
        .single()

      if (likeError) throw likeError

      // If there are selected tags, insert them into item_tags
      if (selectedTags.length > 0 && likeData) {
        const itemTagsToInsert = selectedTags.map(tagId => ({
          like_id: likeData.id,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase
          .from('item_tags')
          .insert(itemTagsToInsert)

        if (tagError) throw tagError
      }

      toast({
        title: "Success",
        description: `Your ${variant} has been added successfully`,
      })

      form.reset()
      setSelectedTags([])
      setIsOpen(false)

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:opacity-90 text-white gap-2 rounded-full px-4 shadow-md"
          >
            <Plus className="h-4 w-4" />
            {title}
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-accent/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {variant === 'like' ? 'Add something Astrella likes' : 'Add something Astrella dislikes'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground/80">Title</Label>
            <Input 
              name="title"
              placeholder="Enter title..." 
              className="glass border-accent/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Description (Optional)</Label>
            <Textarea 
              name="description"
              placeholder="Add more details..." 
              className="glass border-accent/20 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Tags (Optional)</Label>
            <ScrollArea className="h-[120px] w-full rounded-md border p-4">
              <div className="space-y-2">
                {availableTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="mr-2 cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-500/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
                Creating...
              </div>
            ) : (
              'Create'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}