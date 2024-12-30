"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FunFactCardProps {
  id?: string
  title: string
  description: string | null
  isHighlighted?: boolean
}

export function FunFactCard({ id, title, description, isHighlighted }: FunFactCardProps) {
  return (
    <motion.div
      id={id ? `funfact-${id}` : undefined}
      whileHover={{ scale: 1.02, y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isHighlighted ? [1, 1.05, 1] : 1,
      }}
      transition={{
        scale: isHighlighted ? {
          duration: 0.5,
          repeat: 2,
        } : undefined,
      }}
      className="relative group"
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-lg blur ${
        isHighlighted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'
      } transition duration-1000`} />
      <Card className="relative glass border-accent/20">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-4">
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="gradient-text">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
} 