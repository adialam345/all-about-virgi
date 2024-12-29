"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Tag } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  selectedTags: z.array(z.string()).min(1, {
    message: "Please select at least one tag.",
  }),
})

type AddTagDialogProps = {
  likeId: string
  existingTags?: string[]
}

export function AddTagDialog({ likeId, existingTags = [] }: AddTagDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string }>>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedTags: [],
    },
  })

  const loadTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name')

      if (error) throw error
      setAvailableTags((data || []) as Array<{ id: string; name: string }>)
    } catch (error) {
      console.error('Error loading tags:', error)
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Prepare the item_tags entries
      const itemTags = values.selectedTags.map(tagId => ({
        like_id: likeId,
        tag_id: tagId
      }))

      // Insert the item_tags
      const { error } = await supabase
        .from('item_tags')
        .insert(itemTags)

      if (error) throw error

      toast({
        title: "Success",
        description: "Tags added successfully",
      })
      setIsOpen(false)
      form.reset()
    } catch (error) {
      console.error('Error adding tags:', error)
      toast({
        title: "Error",
        description: "Failed to add tags",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (open) loadTags()
      if (!open) form.reset()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Tag className="h-4 w-4" />
          Suggest Tags
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tags</DialogTitle>
          <DialogDescription>
            Select tags that describe this item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="selectedTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {availableTags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 rounded-lg border p-3 hover:bg-secondary"
                        >
                          <input
                            type="checkbox"
                            value={tag.id}
                            checked={field.value.includes(tag.id)}
                            onChange={(e) => {
                              const value = e.target.value
                              const newValue = e.target.checked
                                ? [...field.value, value]
                                : field.value.filter((v) => v !== value)
                              field.onChange(newValue)
                            }}
                          />
                          {tag.name}
                        </label>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 