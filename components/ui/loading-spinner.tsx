"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-t-primary border-r-primary border-b-accent/30 border-l-accent/30"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-t-transparent border-r-transparent border-b-secondary/50 border-l-secondary/50"
        animate={{ rotate: -180 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  )
} 