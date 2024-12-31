"use client"

import { useEffect, useState } from "react"
import { Trash2, Loader2, Pencil } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
  item_name: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

type Like = {
  id: string
  item_name: string
  description: string | null
  is_like: boolean
  created_at: string
}

export default function ManageLikes() {
  const [likes, setLikes] = useState<Like[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Like | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Like | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      item_name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (editingItem) {
      form.setValue('item_name', editingItem.item_name)
      form.setValue('description', editingItem.description || '')
    }
  }, [editingItem, form])

  const handleEdit = (like: Like) => {
    setEditingItem(like)
    setIsEditDialogOpen(true)
    form.reset({
      item_name: like.item_name,
      description: like.description || "",
    })
  }

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!editingItem) return

    try {
      setIsDeleting(true)

      // First verify admin status
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      if (profile?.role !== 'admin') {
        throw new Error('Unauthorized: Admin privileges required')
      }

      // Then proceed with the update
      const { error } = await supabase
        .from('likes')
        .update({
          item_name: values.item_name,
          description: values.description || null,
        })
        .eq('id', editingItem.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Item updated successfully",
      })
      
      setIsEditDialogOpen(false)
      setEditingItem(null)
      form.reset()
      await fetchLikes()
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to update item. Please ensure you have admin privileges.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLikes((data || []) as Like[])
    } catch (error) {
      console.error('Error fetching likes:', error)
      toast({
        title: "Error",
        description: "Failed to fetch likes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLikes()
  }, [])

  const handleDelete = async (like: Like) => {
    try {
      setIsDeleting(true)

      // First try to delete related tags
      const { error: tagsError } = await supabase
        .from('item_tags')
        .delete()
        .eq('like_id', like.id)

      if (tagsError) throw tagsError

      // Then delete the like
      const { error: likeError } = await supabase
        .from('likes')
        .delete()
        .eq('id', like.id)

      if (likeError) throw likeError

      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
      
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
      await fetchLikes()
    } catch (error) {
      console.error('Error deleting like:', error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full -mx-6">
      <div className="py-4 bg-background px-6">
        <h1 className="text-2xl font-bold">Manage Likes</h1>
        <p className="text-muted-foreground">
          View and manage likes and dislikes
        </p>
      </div>

      <div className="flex-1">
        <div className="py-3 border-b bg-card px-6">
          <h2 className="text-lg font-semibold">All Items ({likes.length})</h2>
        </div>

        <div className="md:hidden">
          {likes.map((like) => (
            <div key={like.id} className="border-b bg-card">
              <div className="py-3 px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{like.item_name}</div>
                    {like.description && (
                      <div className="text-sm text-muted-foreground">{like.description}</div>
                    )}
                    <div className="flex justify-between items-center text-sm mt-2">
                      <Badge
                        variant={like.is_like ? "default" : "destructive"}
                        className="rounded-sm"
                      >
                        {like.is_like ? "Like" : "Dislike"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {new Date(like.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(like)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setItemToDelete(like)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {likes.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No items found
            </div>
          )}
        </div>

        <div className="hidden md:block px-6">
          <Card>
            <CardHeader>
              <CardTitle>All Items ({likes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {likes.map((like) => (
                    <TableRow key={like.id}>
                      <TableCell className="font-medium">{like.item_name}</TableCell>
                      <TableCell>{like.description || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={like.is_like ? "default" : "destructive"}
                        >
                          {like.is_like ? "Like" : "Dislike"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(like.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(like)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setItemToDelete(like)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isDeleteDialogOpen && itemToDelete !== null}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open) setItemToDelete(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{itemToDelete?.item_name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setItemToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingItem(null)
            form.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Make changes to the item details below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
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
                        placeholder="Add item description..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isDeleting}>
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}