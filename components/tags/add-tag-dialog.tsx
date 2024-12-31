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

      // Check for duplicate tag name
      const { data: existingTags } = await supabase
        .from('tags')
        .select('name')
        .eq('name', name)
        .limit(1)

      if (existingTags && existingTags.length > 0) {
        toast({
          title: "Duplicate Tag",
          description: "A tag with this name already exists.",
          variant: "destructive",
        })
        return
      }

      // If no duplicate, proceed with insertion
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tag</DialogTitle>
          <DialogDescription>
            Add a new tag to categorize content
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter tag name"
              required
              minLength={2}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter tag description"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 