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

// Helper function to separate text and emojis
function separateTextAndEmojis(input: string) {
  // Regex to match emoji characters
  const emojiRegex = /[\p{Emoji}\u200d]+/gu;
  const parts = [];
  let lastIndex = 0;

  for (const match of input.matchAll(emojiRegex)) {
    const textBefore = input.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push({ type: 'text', content: textBefore });
    }
    parts.push({ type: 'emoji', content: match[0] });
    lastIndex = match.index! + match[0].length;
  }

  const remainingText = input.slice(lastIndex);
  if (remainingText) {
    parts.push({ type: 'text', content: remainingText });
  }

  return parts;
}

export function FunFactCard({ id, title, description, isHighlighted }: FunFactCardProps) {
  const titleParts = separateTextAndEmojis(title);

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
        <CardHeader className="py-3">
          <div className="flex flex-col gap-0.5">
            <CardTitle className="flex items-center gap-4 text-base">
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
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.div>
              <span className="flex items-center gap-1">
                {titleParts.map((part, index) => (
                  part.type === 'text' ? (
                    <span key={index} className="gradient-text leading-relaxed">
                      {part.content}
                    </span>
                  ) : (
                    <span key={index} className="font-emoji">
                      {part.content}
                    </span>
                  )
                ))}
              </span>
            </CardTitle>
            {description && (
              <p className="text-muted-foreground font-emoji pl-8 text-sm -mt-0.5">
                {description}
              </p>
            )}
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  )
} 