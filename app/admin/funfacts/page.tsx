'use client';

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useToast } from "@/components/ui/use-toast"
import { FunFact } from "@/types"
import { AddFunFactDialog } from "@/components/funfacts/add-funfact-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
})

export default function ManageFunFacts() {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editingFact, setEditingFact] = useState<FunFact | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: funFacts = [], isLoading } = useQuery({
    queryKey: ['funfacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0,
    cacheTime: 0
  })

  useEffect(() => {
    // Subscribe to realtime changes
    const channel = supabase
      .channel('fun_facts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fun_facts'
        },
        async (payload) => {
          // Force an immediate refetch when data changes
          await queryClient.invalidateQueries({ queryKey: ['funfacts'] })
          await queryClient.refetchQueries({ queryKey: ['funfacts'], exact: true })
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  useEffect(() => {
    if (editingFact) {
      form.setValue('title', editingFact.title)
      form.setValue('description', editingFact.description || "")
    }
  }, [editingFact, form])

  const handleEdit = (fact: FunFact) => {
    setEditingFact(fact)
    setIsEditDialogOpen(true)
    form.reset({
      title: fact.title,
      description: fact.description || "",
    })
  }

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

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

      if (editingFact) {
        const { error } = await supabase
          .from('fun_facts')
          .update({
            title: values.title,
            description: values.description || null,
          })
          .match({ id: editingFact.id })

        if (error) throw error

        toast({
          title: "Success",
          description: "Fun fact updated successfully",
        })
      }

      form.reset()
      setEditingFact(null)
      setIsEditDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['funfacts'] })
    } catch (error) {
      console.error('Error updating fun fact:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to update fun fact. Please ensure you have admin privileges.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
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

      // Then proceed with deletion
      const { error } = await supabase
        .from('fun_facts')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Fun fact deleted successfully",
      })

      queryClient.invalidateQueries({ queryKey: ['funfacts'] })
    } catch (error) {
      console.error('Error deleting fun fact:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to delete fun fact. Please ensure you have admin privileges.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-full -mx-6">
      <div className="py-4 bg-background px-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Fun Facts</h1>
            <p className="text-muted-foreground">
              Manage fun facts
            </p>
          </div>
          <AddFunFactDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['funfacts'] })} />
        </div>
      </div>

      <div className="flex-1">
        <div className="py-3 border-b bg-card px-6">
          <h2 className="text-lg font-semibold">All Fun Facts ({funFacts.length})</h2>
        </div>

        <div className="md:hidden">
          {funFacts.map((fact) => (
            <div key={fact.id} className="border-b bg-card">
              <div className="py-3 px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{fact.title}</div>
                    <div className="text-sm text-muted-foreground">{fact.description}</div>
                    <div className="flex justify-end items-center text-sm mt-2">
                      <span className="text-muted-foreground">
                        {new Date(fact.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(fact)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(fact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {funFacts.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              No fun facts found
            </div>
          )}
        </div>

        <div className="hidden md:block px-6">
          <Card>
            <CardHeader>
              <CardTitle>All Fun Facts ({funFacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funFacts.map((fact) => (
                    <TableRow key={fact.id}>
                      <TableCell>{fact.title}</TableCell>
                      <TableCell>{fact.description}</TableCell>
                      <TableCell>{new Date(fact.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(fact)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(fact.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fun fact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) {
            setEditingFact(null)
            form.reset()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fun Fact</DialogTitle>
            <DialogDescription>
              Make changes to the fun fact below.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
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
                        placeholder="Add description..."
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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