'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useQueryClient } from "@tanstack/react-query"

export function AddFunFactDialog() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    try {
      setIsSubmitting(true)

      // Check for duplicate title
      const { data: existingFunFacts } = await supabase
        .from("fun_facts")
        .select("title")
        .eq("title", title)
        .limit(1)

      if (existingFunFacts && existingFunFacts.length > 0) {
        toast({
          title: "Duplicate Fun Fact",
          description: "A fun fact with this title already exists.",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase
        .from('fun_facts')
        .insert({
          title,
          description: description || null
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Fun fact has been added successfully",
      })

      // Invalidate and refetch fun facts data
      queryClient.invalidateQueries({ queryKey: ['funfacts'] })

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
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-pink-400 to-pink-500 hover:opacity-90 text-white gap-2 rounded-full px-4 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Fun Fact
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-accent/20">
        <DialogHeader>
          <DialogTitle className="gradient-text flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Add New Fun Fact
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share an interesting fact about Astrella
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground/80">Title</Label>
            <Input 
              name="title"
              placeholder="Enter title..." 
              className="glass border-accent/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground/80">Description (Optional)</Label>
            <Textarea 
              name="description"
              placeholder="Add more details..." 
              className="glass border-accent/20 min-h-[100px]"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-500/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="h-4 w-4" />
                </motion.div>
                Creating Fun Fact...
              </div>
            ) : (
              'Create Fun Fact'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 