'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AddFunFactDialog } from './add-funfact-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

interface FunFact {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export function FunFactsSection() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();

  const { data: funFacts, isLoading } = useQuery({
    queryKey: ['funfacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fun_facts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FunFact[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('fun_facts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fun_facts',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['funfacts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Fun Facts</h2>
        <AddFunFactDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['funfacts'] })} />
      </div>
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading fun facts...</div>
        ) : funFacts && funFacts.length > 0 ? (
          funFacts.map((fact) => (
            <motion.div
              key={fact.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-lg border border-accent/20 bg-card p-6 glass"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-medium leading-none flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    {fact.title}
                  </h3>
                  {fact.description && (
                    <p className="text-sm text-muted-foreground">
                      {fact.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-muted-foreground">No fun facts added yet.</div>
        )}
      </div>
    </div>
  );
} 