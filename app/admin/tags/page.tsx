"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tag, Pencil, Trash2, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useToast } from "@/components/ui/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tag name must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

type TagType = {
  id: string
  name: string
  description: string | null
  created_at: string
  item_count: number
}

export default function ManageTags() {
  const [tags, setTags] = useState<TagType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tagToDelete, setTagToDelete] = useState<TagType | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (!isAddDialogOpen && !editingTag) {
      form.reset()
    }
  }, [isAddDialogOpen, editingTag, form])

  useEffect(() => {
    if (editingTag) {
      form.setValue('name', editingTag.name)
      form.setValue('description', editingTag.description || '')
    }
  }, [editingTag, form])

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select(`
          *,
          item_count:item_tags(count)
        `)
        .order('name', { ascending: true })

      if (error) throw error

      const formattedTags = data.map(tag => ({
        ...tag,
        item_count: tag.item_count?.[0]?.count || 0
      }))

      setTags(formattedTags)
    } catch (error) {
      console.error('Error fetching tags:', error)
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()

    const channel = supabase
      .channel('tags-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tags' }, 
        () => fetchTags()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      if (editingTag) {
        // Update existing tag
        const { error } = await supabase
          .from('tags')
          .update({
            name: values.name,
            description: values.description || null,
          })
          .eq('id', editingTag.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Tag updated successfully",
        })
        setEditingTag(null)
      } else {
        // Create new tag
        const { error } = await supabase
          .from('tags')
          .insert([{
            name: values.name,
            description: values.description || null,
          }])

        if (error) throw error

        toast({
          title: "Success",
          description: "Tag created successfully",
        })
        setIsAddDialogOpen(false)
      }

      form.reset()
      await fetchTags()
    } catch (error) {
      console.error('Error saving tag:', error)
      toast({
        title: "Error",
        description: "Failed to save tag",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag)
    form.reset({
      name: tag.name,
      description: tag.description || "",
    })
  }

  const handleDelete = async (tag: TagType) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tag.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Tag deleted successfully",
      })
      
      setIsDeleteDialogOpen(false)
      setTagToDelete(null)
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 animate-spin" />
          Loading tags...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Tags</h2>
        
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) form.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button 
              className="gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add New Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
              <DialogDescription>
                Enter the details for the new tag.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tag name" {...field} />
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
                          placeholder="Enter tag description"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Tag
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tags ({tags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell>{tag.description || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {tag.item_count} items
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(tag.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(tag)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog open={isDeleteDialogOpen && tagToDelete?.id === tag.id}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setTagToDelete(tag)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Tag</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the tag "{tag.name}"? 
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDeleteDialogOpen(false)
                                setTagToDelete(null)
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(tag)}
                            >
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No tags found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}