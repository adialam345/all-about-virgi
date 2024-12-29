'use client';

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
import { Pencil, Trash2 } from "lucide-react"
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

export default function ManageFunFacts() {
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const fetchFunFacts = async () => {
    try {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setFunFacts(data || [])
    } catch (error) {
      console.error('Error fetching fun facts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch fun facts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFunFacts()

    // Set up real-time subscription
    const channel = supabase
      .channel('fun_facts_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'fun_facts' }, 
        () => fetchFunFacts()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('fun_facts')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Optimistic update
      setFunFacts(prev => prev.filter(fact => fact.id !== id))

      toast({
        title: "Success",
        description: "Fun fact deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting fun fact:', error)
      toast({
        title: "Error",
        description: "Failed to delete fun fact",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Fun Facts</h1>
          <p className="text-muted-foreground">
            View, edit, and delete fun facts about Astrella
          </p>
        </div>
        <AddFunFactDialog onSuccess={fetchFunFacts} />
      </div>

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
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {/* Handle edit */}}
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </div>
  )
}