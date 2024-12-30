"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Sparkles, Star, Heart, Twitter, Instagram, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddLikeDislikeDialog } from "@/components/likes/add-like-dislike-dialog"
import { AddTagDialog } from "@/components/tags/add-tag-dialog"
import { LikesList } from "@/components/likes/likes-list"
import { DislikesList } from "@/components/likes/dislikes-list"
import { TagsList } from "@/components/tags/tags-list"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { AddFunFactDialog } from "@/components/funfacts/add-funfact-dialog"
import { SuggestTagDialog } from "@/components/tags/suggest-tag-dialog"
import { FunFactsList } from "@/components/funfacts/fun-facts-list"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
}

const FloatingElement = ({ children, delay = 0 }: AnimatedElementProps) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay,
      }}
      className="relative"
    >
      {children}
      <motion.div
        className="absolute -inset-2 rounded-full bg-primary/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.div>
  )
}

const RotatingElement = ({ children, delay = 0 }: AnimatedElementProps) => {
  return (
    <motion.div
      animate={{
        rotate: 360,
        scale: [1, 1.2, 1],
      }}
      transition={{
        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
        scale: { duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
        delay,
      }}
      className="relative"
    >
      {children}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-lg"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay,
        }}
      />
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('about')
  const [scrollPositions, setScrollPositions] = useState<Record<string, number>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  // Initialize active tab from URL on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl) {
      setActiveTab(tabFromUrl)
    }
  }, [])

  // Save scroll position when switching tabs
  const handleTabChange = (value: string) => {
    if (contentRef.current) {
      // Save current scroll position before switching
      setScrollPositions(prev => ({
        ...prev,
        [activeTab]: contentRef.current?.scrollTop || 0
      }))
    }
    setActiveTab(value)
    
    // Update URL with the new tab
    const newSearchParams = new URLSearchParams(window.location.search)
    newSearchParams.set('tab', value)
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false })
  }

  // Restore scroll position when tab changes with smooth animation
  useEffect(() => {
    if (contentRef.current) {
      const savedPosition = scrollPositions[activeTab] || 0
      contentRef.current.style.scrollBehavior = 'smooth'
      
      // Use RAF to ensure the scroll happens after content render
      requestAnimationFrame(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = savedPosition
          
          // Reset scroll behavior after animation
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.style.scrollBehavior = 'auto'
            }
          }, 300)
        }
      })
    }
  }, [activeTab, scrollPositions])

  return (
    <div className="flex flex-col gap-8 py-6 min-h-screen bg-gradient-to-b from-background/50 to-background">
      <section className="flex flex-col items-center gap-6 text-center mb-8 px-4 md:px-8">
        <div className="relative">
          <FloatingElement>
            <Avatar className="h-40 w-40 md:h-48 md:w-48 overflow-hidden ring-8 ring-primary/20 glass shadow-2xl hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-primary/10 to-secondary/10">
              <Image
                src="/astrella.jpg"
                alt="Astrella Virgi"
                width={240}
                height={240}
                className="aspect-square object-cover scale-[1.02] hover:scale-110 transition-transform duration-500"
                priority
                style={{ objectPosition: "center 15%" }}
              />
              <AvatarFallback>
                <User className="h-24 w-24" />
              </AvatarFallback>
            </Avatar>
          </FloatingElement>

          {/* Decorative Elements */}
          <motion.div 
            className="absolute -top-6 -right-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <RotatingElement delay={0.1}>
              <Sparkles className="h-10 w-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
            </RotatingElement>
          </motion.div>

          <motion.div 
            className="absolute -bottom-4 -left-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <RotatingElement delay={0.3}>
              <Star className="h-8 w-8 text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]" />
            </RotatingElement>
          </motion.div>

          <motion.div 
            className="absolute -top-2 -left-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <RotatingElement delay={0.5}>
              <Heart className="h-9 w-9 text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]" />
            </RotatingElement>
          </motion.div>

          <motion.div
            className="absolute bottom-0 right-0 rounded-full glass p-1.5 ring-2 ring-primary/20 shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Badge variant="secondary" className="animate-pulse font-medium text-xs bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient">
              13th&nbsp;GEN
            </Badge>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-normal bg-gradient-to-br from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient-slow pb-2">
            Astrella Virgiananda
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/90 font-medium">
            Suka berekspresi melalui kreasi, Tara! Aku Virgi
          </p>
        </motion.div>
      </section>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="flex-1 flex flex-col"
      >
        <div className="w-full sticky top-[4.5rem] z-10 bg-background/80 backdrop-blur-md">
          <div className="w-full max-w-[90rem] mx-auto px-4">
            <div className="md:block flex justify-center">
              <TabsList className="h-12 bg-muted/50 p-1 md:w-full md:grid md:grid-cols-5">
                <TabsTrigger 
                  value="about"
                  className="rounded px-4 data-[state=active]:bg-background transition-colors"
                >
                  About
                </TabsTrigger>
                <TabsTrigger 
                  value="likes"
                  className="rounded px-4 data-[state=active]:bg-background transition-colors"
                >
                  Likes
                </TabsTrigger>
                <TabsTrigger 
                  value="dislikes"
                  className="rounded px-4 data-[state=active]:bg-background transition-colors"
                >
                  Dislikes
                </TabsTrigger>
                <TabsTrigger 
                  value="tags"
                  className="rounded px-4 data-[state=active]:bg-background transition-colors"
                >
                  Tags
                </TabsTrigger>
                <TabsTrigger 
                  value="funfacts"
                  className="rounded px-4 data-[state=active]:bg-background transition-colors"
                >
                  Fun Facts
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[90rem] mx-auto">
          <div 
            ref={contentRef}
            className="h-[calc(100vh-13rem)] overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          >
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              <TabsContent value="about" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <Card className="glass border-0 shadow-2xl bg-gradient-to-br from-background/50 via-background/30 to-background/50 border border-primary/10">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">About Astrella</CardTitle>
                    <CardDescription className="text-base font-medium">Basic information and quick facts</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <motion.div 
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nama</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          Astrella Virgiananda
                        </p>
                      </motion.div>
                      <motion.div
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Nama Panggilan</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          Virgi
                        </p>
                      </motion.div>
                      <motion.div
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tanggal Lahir</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          6 Agustus 2010
                        </p>
                      </motion.div>
                      <motion.div
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Golongan Darah</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          AB
                        </p>
                      </motion.div>
                      <motion.div
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Horoskop</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          Leo
                        </p>
                      </motion.div>
                      <motion.div
                        className="space-y-3 group"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <h3 className="font-semibold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Tinggi Badan</h3>
                        <p className="text-foreground/90 glass p-4 rounded-xl shadow-lg backdrop-blur-sm bg-gradient-to-br from-primary/5 to-secondary/5 group-hover:from-primary/10 group-hover:to-secondary/10 transition-colors duration-300">
                          162cm
                        </p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="likes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Likes</h2>
                  <AddLikeDislikeDialog variant="like" />
                </div>
                <LikesList />
              </TabsContent>
              <TabsContent value="dislikes" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Dislikes</h2>
                  <AddLikeDislikeDialog variant="dislike" />
                </div>
                <DislikesList />
              </TabsContent>
              <TabsContent value="tags" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Tags</h2>
                  <AddTagDialog />
                </div>
                <TagsList />
              </TabsContent>
              <TabsContent value="funfacts" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Fun Facts</h2>
                  <AddFunFactDialog />
                </div>
                <FunFactsList />
              </TabsContent>
            </motion.div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}