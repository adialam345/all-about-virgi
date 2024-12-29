"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { EditFunFactDialog } from "./edit-funfact-dialog"
import { FunFact } from "@/types"

interface FunFactsTableProps {
  funFacts: FunFact[]
  onRefresh: () => void
}

export function FunFactsTable({ funFacts, onRefresh }: FunFactsTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedFunFact, setSelectedFunFact] = useState<FunFact | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const handleDelete = async (funFactId: string) => {
    try {
      setIsDeleting(true)
      const { error } = await supabase
        .from('fun_facts')
        .delete()
        .eq('id', funFactId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Fun fact deleted successfully",
      })
      onRefresh()
    } catch (error) {
      console.error('Error deleting fun fact:', error)
      toast({
        title: "Error",
        description: "Failed to delete fun fact",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {funFacts.map((fact) => (
            <TableRow key={fact.id}>
              <TableCell className="font-medium">{fact.title}</TableCell>
              <TableCell>{fact.description}</TableCell>
              <TableCell>{new Date(fact.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <EditFunFactDialog funFact={fact} onSuccess={onRefresh}>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </EditFunFactDialog>
                  <Dialog open={isDeleteDialogOpen && selectedFunFact?.id === fact.id} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedFunFact(fact)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Fun Fact</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this fun fact? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="ghost"
                          onClick={() => setIsDeleteDialogOpen(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => selectedFunFact && handleDelete(selectedFunFact.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 