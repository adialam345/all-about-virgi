import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddLikeDislikeDialog } from "@/components/likes/add-like-dislike-dialog"
import { AddTagDialog } from "@/components/tags/add-tag-dialog"
import { LikesList } from "@/components/likes/likes-list"
import { DislikesList } from "@/components/likes/dislikes-list"
import { TagsList } from "@/components/tags/tags-list"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-6 text-center">
        <Avatar className="h-48 w-48 overflow-hidden">
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
        <div>
          <h1 className="text-4xl font-bold">Astrella Virgi</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Indonesian idol and content creator
          </p>
        </div>
        <div className="flex gap-4">
          <AddLikeDislikeDialog />
          <AddTagDialog />
        </div>
      </section>

      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
          <TabsTrigger value="dislikes">Dislikes</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Astrella</CardTitle>
              <CardDescription>Basic information and quick facts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Nama</h3>
                <p className="text-muted-foreground">Astrella Virgiananda</p>
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
          <TagsList />
        </TabsContent>
      </Tabs>
    </div>
  )
}