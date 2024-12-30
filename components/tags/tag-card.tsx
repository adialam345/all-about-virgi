"use client"

import { useState } from "react"
import { Tag, ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagItem {
  id: string
  item_name: string
  description: string | null
  is_like: boolean
}

interface TagCardProps {
  id: string
  name: string
  description?: string | null
  count: number
  items: TagItem[]
  className?: string
}

export function TagCard({ id, name, description, count, items, className }: TagCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full group flex items-center justify-between p-4 rounded-lg bg-card hover:bg-accent/5 transition-colors border border-accent/20",
          className
        )}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5">
            <Tag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="space-y-1 text-left">
            <h3 className="font-medium leading-none">{name}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center min-w-[2rem] h-6 text-sm font-medium rounded-full bg-accent/10">
            {count}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && items.length > 0 && (
        <div className="ml-6 space-y-1 border-l pl-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 py-1 text-sm"
            >
              <div className={cn(
                "h-2 w-2 rounded-full",
                item.is_like ? "bg-green-500" : "bg-red-500"
              )} />
              <span>{item.item_name}</span>
              {item.description && (
                <span className="text-muted-foreground">
                  - {item.description}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 