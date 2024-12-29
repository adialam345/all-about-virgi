"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Heart, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Tag {
  id: string
  name: string
}

const formSchema = z.object({
  itemName: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  type: z.enum(["like", "dislike"], {
    required_error: "Please select whether this is a like or dislike.",
  }),
  selectedTags: z.array(z.string()).optional(),
})

export function AddLikeDislikeDialog() {
  const [open, setOpen] = useState(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      description: "",
      type: "like",
      selectedTags: [],
    },
  })

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

    fetchTags()
  }, [])

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Insert the like/dislike
      const { data: likeData, error: likeError } = await supabase
        .from('likes')
        .insert({
          item_name: values.itemName,
          description: values.description,
          is_like: values.type === 'like',
        })
        .select()
        .single()

      if (likeError) throw likeError

      // If there are selected tags, insert them into item_tags
      if (selectedTags.length > 0) {
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
        description: "Item added successfully",
      })

      form.reset()
      setSelectedTags([])
      setOpen(false)
      
      // Refresh the page to show new data
      window.location.reload()
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Heart className="mr-2 h-4 w-4" />
          Add Like/Dislike
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Like/Dislike</DialogTitle>
          <DialogDescription>
            Add something that Astrella likes or dislikes
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="like" />
                        </FormControl>
                        <FormLabel className="font-normal">Like</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem value="dislike" />
                        </FormControl>
                        <FormLabel className="font-normal">Dislike</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="selectedTags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleTag(tag.id)}
                          >
                            <Tag className="mr-1 h-3 w-3" />
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}