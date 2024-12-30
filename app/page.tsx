"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User, Sparkles, Star, Heart, Twitter, Instagram } from "lucide-react"
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
import { useState } from "react"
import { motion } from "framer-motion"

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
    >
      {children}
    </motion.div>
  )
}

const RotatingElement = ({ children, delay = 0 }: AnimatedElementProps) => {
  return (
    <motion.div
      animate={{
        rotate: 360,
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('about')

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('tab', value)
    router.push(`${window.location.pathname}?${searchParams.toString()}`)
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-6 text-center mb-12">
        <div className="relative">
          <FloatingElement>
            <Avatar className="h-48 w-48 overflow-hidden ring-4 ring-background">
              <Image
                src="/astrella.jpg"
                alt="Astrella Virgi"
                width={240}
                height={240}
                className="aspect-square rounded-full object-cover scale-110"
                priority
              />
              <AvatarFallback>
                <User className="h-24 w-24" />
              </AvatarFallback>
            </Avatar>
          </FloatingElement>

          {/* Decorative Elements */}
          <motion.div 
            className="absolute -top-4 -right-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <RotatingElement delay={0.1}>
              <Sparkles className="h-8 w-8 text-yellow-500" />
            </RotatingElement>
          </motion.div>

          <motion.div 
            className="absolute -bottom-2 -left-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <RotatingElement delay={0.3}>
              <Star className="h-6 w-6 text-pink-500" />
            </RotatingElement>
          </motion.div>

          <motion.div 
            className="absolute top-0 -left-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <RotatingElement delay={0.5}>
              <Heart className="h-7 w-7 text-red-500" />
            </RotatingElement>
          </motion.div>

          <motion.div
            className="absolute bottom-0 right-0 rounded-full bg-background p-2 ring-4 ring-background"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Badge variant="secondary" className="animate-pulse">13th&nbsp;GEN</Badge>
          </motion.div>
        </div>
        <div>
          <h1 className="text-4xl font-bold">Astrella Virgi</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Suka berekspresi melalui kreasi, Tara! Aku Virgi
          </p>
        </div>
        <div className="flex gap-4">
          <AddLikeDislikeDialog />
        </div>
      </section>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-5 h-14">
          <TabsTrigger 
            value="about"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            About
          </TabsTrigger>
          <TabsTrigger 
            value="likes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Likes
          </TabsTrigger>
          <TabsTrigger 
            value="dislikes"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Dislikes
          </TabsTrigger>
          <TabsTrigger 
            value="tags"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Tags
          </TabsTrigger>
          <TabsTrigger 
            value="funfacts"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
          >
            Fun Facts
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About Astrella</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Nama</h3>
                    <p className="text-muted-foreground rounded-lg bg-secondary/50 p-3">
                      Astrella Virgiananda
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Nama Panggilan</h3>
                    <p className="text-muted-foreground">Virgi</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Tanggal Lahir</h3>
                    <p className="text-muted-foreground">6 Agustus 2010</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Golongan Darah</h3>
                    <p className="text-muted-foreground">AB</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Horoskop</h3>
                    <p className="text-muted-foreground">Leo</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Tinggi Badan</h3>
                    <p className="text-muted-foreground">162cm</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Social Media</h3>
                  <div className="flex flex-col gap-2">
                    <a 
                      href="https://x.com/A_VirgiJKT48" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-500 hover:underline"
                    >
                      <Twitter className="h-4 w-4" />
                      @A_VirgiJKT48
                    </a>
                    
                    <a 
                      href="https://www.instagram.com/virgi.jkt48/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-pink-500 hover:underline"
                    >
                      <Instagram className="h-4 w-4" />
                      @virgi.jkt48
                    </a>
                    
                    <a 
                      href="https://www.tiktok.com/@jkt48.virgi" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-800 hover:underline"
                    >
                      <svg 
                        className="h-4 w-4" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M19.321 5.562a5.122 5.122 0 0 1 0 7.245a5.122 5.122 0 0 1-7.245 0a5.122 5.122 0 0 1 0-7.245a5.122 5.122 0 0 1 7.245 0"/>
                      </svg>
                      @jkt48.virgi
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="likes">
            <LikesList />
          </TabsContent>
          <TabsContent value="dislikes">
            <DislikesList />
          </TabsContent>
          <TabsContent value="tags">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>View and manage tags</CardDescription>
                </div>
                <SuggestTagDialog />
              </CardHeader>
              <CardContent>
                <TagsList />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="funfacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Fun Facts About Astrella
                  </CardTitle>
                  <CardDescription>Interesting and unique things about Astrella</CardDescription>
                </div>
                <AddFunFactDialog />
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <FunFactsList />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}