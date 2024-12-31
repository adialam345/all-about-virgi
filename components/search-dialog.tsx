"use client"

import { useEffect, useState } from "react"
import { ThumbsUp, ThumbsDown, Tag, Sparkles, Search } from "lucide-react"
import supabase from "@/utils/supabase"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface SearchDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
}

interface SearchResult {
  id: string
  type: 'like' | 'dislike' | 'tag' | 'fun_fact'
  title: string
  description?: string
  matchedBy: 'name'
  tags?: {
    id: string
    name: string
  }[]
  relatedItems?: {
    id: string
    title: string
    type: 'like' | 'dislike'
  }[]
}

function getResultIcon(type: 'like' | 'dislike' | 'tag' | 'fun_fact') {
  switch (type) {
    case 'like':
      return <ThumbsUp className="h-4 w-4 text-green-500" />
    case 'dislike':
      return <ThumbsDown className="h-4 w-4 text-red-500" />
    case 'tag':
      return <Tag className="h-4 w-4 text-blue-500" />
    case 'fun_fact':
      return <Sparkles className="h-4 w-4 text-yellow-500 sparkle" />
  }
}

export function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!searchTerm) {
      setResults([])
      return
    }

    setIsLoading(true)
    const fetchData = async () => {
      // Fetch likes and dislikes
      const { data: likes, error: likesError } = await supabase
        .from('likes')
        .select(`
          id,
          item_name,
          description,
          is_like,
          tags:item_tags(
            tag:tags(
              id,
              name
            )
          )
        `)
        .ilike('item_name', `%${searchTerm}%`)

      // Fetch tags
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          description,
          items:item_tags(
            like:likes(
              id,
              item_name,
              is_like
            )
          )
        `)
        .ilike('name', `%${searchTerm}%`)

      // Fetch fun facts
      const { data: funFacts, error: funFactsError } = await supabase
        .from('fun_facts')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)

      if (likesError || tagsError || funFactsError) {
        console.error(likesError || tagsError || funFactsError)
        return
      }

      const formattedResults: SearchResult[] = [
        // Format likes/dislikes results
        ...(likes?.map((like: any) => ({
          id: like.id,
          type: like.is_like ? ("like" as const) : ("dislike" as const),
          title: like.item_name,
          description: like.description,
          matchedBy: "name" as const,
          tags: like.tags?.map((tagWrapper: any) => ({
            id: tagWrapper.tag.id,
            name: tagWrapper.tag.name
          }))
        })) || []),
        
        // Format tags results
        ...(tags?.map((tag: any) => ({
          id: tag.id,
          type: "tag" as const,
          title: tag.name,
          description: tag.description,
          matchedBy: "name" as const,
          relatedItems: tag.items?.map((item: any) => ({
            id: item.like.id,
            title: item.like.item_name,
            type: item.like.is_like ? ("like" as const) : ("dislike" as const)
          }))
        })) || []),

        // Format fun facts results
        ...(funFacts?.map((fact: any) => ({
          id: fact.id,
          type: "fun_fact" as const,
          title: fact.title,
          description: fact.description,
          matchedBy: "name" as const
        })) || [])
      ]

      setResults(formattedResults)
      setIsLoading(false)
    }

    const debounce = setTimeout(() => {
      fetchData()
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleSelect = (item: any) => {
    setOpen(false)
    
    // Navigate based on result type
    switch (item.type) {
      case 'like':
      case 'dislike':
        router.push(`/likes?highlight=${item.id}`)
        // Add a small delay to ensure the navigation completes
        setTimeout(() => {
          const element = document.getElementById(`like-${item.id}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        break
      case 'tag':
        router.push(`/tags/${item.id}`)
        break
      case 'fun_fact':
        router.push(`/funfacts?highlight=${item.id}`)
        // Add a small delay to ensure the navigation completes
        setTimeout(() => {
          const element = document.getElementById(`funfact-${item.id}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass sm:max-w-[300px] border-none shadow-2xl bg-gradient-to-br from-background/80 via-background/50 to-background/80 fixed top-[10%] translate-y-0 p-3">
        <DialogHeader className="space-y-0 pb-1">
          <DialogTitle className="text-base font-bold flex items-center gap-1">
            <div className="p-0.5 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl shadow-lg">
              <Search className="h-3 w-3 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
              Search
            </span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/90 font-medium">
            Search for likes, dislikes, tags, and fun facts
          </DialogDescription>
        </DialogHeader>
        
        <Command className="rounded-md border-none bg-background/30 backdrop-blur-xl shadow-xl">
          <CommandInput
            placeholder="Type to search..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-none focus:ring-0 h-7 text-xs font-medium bg-transparent"
          />
          <CommandEmpty className="py-3 text-center text-muted-foreground">
            {isLoading ? (
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="text-primary"
                >
                  <Search className="h-3 w-3" />
                </motion.div>
                Searching...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-xs">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-muted-foreground/70"
                >
                  <Search className="h-6 w-6" />
                </motion.div>
                No results found.
              </div>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-y-auto px-1 pb-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <CommandItem
                    value={`${result.type}-${result.id}-${result.title}`}
                    onSelect={() => handleSelect(result)}
                    className="flex flex-col items-start gap-1 p-1.5 rounded-md hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 group"
                  >
                    <div className="flex w-full items-center gap-1.5">
                      <div className="p-0.5 rounded-md bg-gradient-to-br from-background/80 to-background/40 shadow-lg group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300">
                        {getResultIcon(result.type)}
                      </div>
                      <span className="flex-1 font-medium text-xs">{result.title}</span>
                      <Badge 
                        variant="secondary" 
                        className="ml-auto glass bg-gradient-to-br from-primary/10 to-secondary/10 group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300 text-[9px] font-medium px-1.5 py-0"
                      >
                        {result.type === 'fun_fact' ? 'Fun Fact' : result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-[9px] text-muted-foreground/80 line-clamp-2 pl-5 pr-1">
                        {result.description}
                      </p>
                    )}
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-5">
                        {result.tags.map(tag => (
                          <Badge 
                            key={tag.id}
                            variant="outline" 
                            className="bg-background/50 text-[8px] hover:bg-primary/10 transition-colors duration-300 px-1 py-0"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {result.relatedItems && result.relatedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-5">
                        {result.relatedItems.map(item => (
                          <Badge 
                            key={item.id}
                            variant="outline" 
                            className="bg-background/50 text-[8px] hover:bg-primary/10 transition-colors duration-300 px-1 py-0"
                          >
                            {item.title}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CommandItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  )
} 