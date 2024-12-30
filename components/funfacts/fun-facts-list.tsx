"use client"

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FunFactCard } from './fun-fact-card';

interface FunFactsListProps {
  highlightId?: string | null;
}

interface FunFact {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export function FunFactsList({ highlightId }: FunFactsListProps) {
  const supabase = createClientComponentClient();

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isLoading ? (
        <div className="col-span-full flex items-center justify-center text-muted-foreground">
          Loading fun facts...
        </div>
      ) : funFacts && funFacts.length > 0 ? (
        funFacts.map((fact) => (
          <FunFactCard
            key={fact.id}
            id={fact.id}
            title={fact.title}
            description={fact.description}
            isHighlighted={highlightId === fact.id}
          />
        ))
      ) : (
        <div className="col-span-full flex items-center justify-center text-muted-foreground">
          No fun facts added yet
        </div>
      )}
    </div>
  );
} 