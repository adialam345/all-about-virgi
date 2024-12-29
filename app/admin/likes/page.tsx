"use client"

import { useEffect, useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

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
  const { toast } = useToast()

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

  useEffect(() => {
    fetchLikes()

    const channel = supabase
      .channel('likes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes' }, 
        () => fetchLikes()
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading items...
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Manage Likes & Dislikes</h2>

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
                    <Dialog
                      open={isDeleteDialogOpen && itemToDelete?.id === like.id}
                      onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open)
                        if (!open) setItemToDelete(null)
                      }}
                    >
                      <DialogTrigger asChild>
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
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Item</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{like.item_name}"? 
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
                            onClick={() => handleDelete(like)}
                            disabled={isDeleting}
                          >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {likes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No items found
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