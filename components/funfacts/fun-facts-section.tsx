'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AddFunFactDialog } from './add-funfact-dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useCallback, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';

interface FunFact {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

export function FunFactsSection() {
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const debouncedInvalidate = useMemo(
    () =>
      debounce(() => {
        queryClient.invalidateQueries({ queryKey: ['funfacts'] });
      }, 1000),
    [queryClient]
  );

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
    staleTime: 10000, // Cache data for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
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
        debouncedInvalidate
      )
      .subscribe();

    return () => {
      debouncedInvalidate.cancel();
      supabase.removeChannel(channel);
    };
  }, [supabase, debouncedInvalidate]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight">Fun Facts</h2>
        <AddFunFactDialog onSuccess={() => queryClient.invalidateQueries({ queryKey: ['funfacts'] })} />
      </div>
      <div className="grid gap-3 md:gap-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading fun facts...</div>
        ) : funFacts && funFacts.length > 0 ? (
          funFacts.map((fact, index) => (
            <motion.div
              key={fact.id}
              initial={{ opacity: 0, y: isMobile ? 10 : 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: isMobile ? 0.2 : 0.3,
                delay: isMobile ? index * 0.05 : index * 0.1,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              className="group relative rounded-lg border border-accent/20 bg-card p-4 md:p-6 glass"
              style={{
                willChange: 'transform, opacity',
                transform: 'translate3d(0,0,0)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 md:space-y-2">
                  <h3 className="font-medium leading-none flex items-center gap-1.5 md:gap-2">
                    <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-pink-500" />
                    {fact.title}
                  </h3>
                  {fact.description && (
                    <p className="text-xs md:text-sm text-muted-foreground">
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