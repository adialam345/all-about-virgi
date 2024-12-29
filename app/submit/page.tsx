"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  itemName: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  isLike: z.boolean(),
})

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      description: "",
      isLike: true,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      // Insert into likes table
      const { data: likeData, error: likeError } = await supabase
        .from('likes')
        .insert([
          {
            item_name: values.itemName,
            description: values.description || null,
            is_like: values.isLike,
          }
        ])
        .select()
        .single()

      if (likeError) throw likeError

      toast({
        title: "Success!",
        description: "Your fun fact has been submitted.",
      })

      // Reset form
      form.reset({
        itemName: "",
        description: "",
        isLike: true,
      })

    } catch (error) {
      console.error('Error submitting:', error)
      toast({
        title: "Error",
        description: "Failed to submit your fun fact. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Submit Fun Fact</h1>
          <p className="text-muted-foreground">
            Share something you like or dislike!
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is it?</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the thing you want to share.
                  </FormDescription>
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
                      placeholder="Tell us more about it..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Add more details about why you like/dislike it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isLike"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do you like it?</FormLabel>
                  <FormControl>
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant={field.value ? "default" : "outline"}
                        onClick={() => field.onChange(true)}
                      >
                        Like
                      </Button>
                      <Button
                        type="button"
                        variant={!field.value ? "default" : "outline"}
                        onClick={() => field.onChange(false)}
                      >
                        Dislike
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
} 