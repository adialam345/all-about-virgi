"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, Loader2, Plus } from "lucide-react"
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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"

export function AddTagDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    try {
      setIsSubmitting(true)

      const { error } = await supabase
        .from('tags')
        .insert({
          name,
          description
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Tag has been added successfully",
      })

      // Invalidate and refetch tags data
      queryClient.invalidateQueries({ queryKey: ['tags'] })

      form.reset()
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
            Add Tag
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-accent/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Star className="h-5 w-5" />
            Add New Tag
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new tag to categorize content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground/80">Tag Name</Label>
            <Input 
              name="name"
              placeholder="Enter tag name..." 
              className="glass border-accent/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Description (Optional)</Label>
            <Textarea 
              name="description"
              placeholder="Add tag description..." 
              className="glass border-accent/20 min-h-[100px]"
            />
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
                Creating Tag...
              </div>
            ) : (
              'Create Tag'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 