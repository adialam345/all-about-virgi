'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FunFact } from "@/types";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddFunFactDialogProps {
  onSuccess?: (newFact: FunFact) => void;
}

export function AddFunFactDialog({ onSuccess }: AddFunFactDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function onSubmit(values: FormData) {
    const newFunFact: FunFact = {
      id: crypto.randomUUID(),
      title: values.title,
      description: values.description || null,
      created_at: new Date().toISOString()
    }

    try {
      setIsSubmitting(true)
      
      // Notify parent component for optimistic update
      onSuccess?.(newFunFact)
      
      const { data, error } = await supabase
        .from('fun_facts')
        .insert([{
          title: values.title,
          description: values.description || null,
        }])
        .select('*')
        .single()

      if (error) {
        console.error('Supabase error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('Success:', data)

      toast({
        title: "Success!",
        description: "Fun fact has been added.",
      })

      form.reset()
      setOpen(false)
    } catch (error: any) {
      console.error('Error adding fun fact:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to add fun fact. Please try again.",
        variant: "destructive",
      })
      
      // Rollback optimistic update if needed
      if (onSuccess) {
        // You might want to implement a rollback mechanism here
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Fun Fact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Fun Fact</DialogTitle>
          <DialogDescription>
            Add an interesting fact about Astrella
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter fun fact title" {...field} />
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
                      placeholder="Add more details about this fun fact..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Fun Fact'
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 