import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Star, User } from "lucide-react"
import { LikesList } from "@/components/likes/likes-list"
import { DislikesList } from "@/components/likes/dislikes-list"
import { AddLikeDislikeDialog } from "@/components/likes/add-like-dislike-dialog"
import { AddTagDialog } from "@/components/tags/add-tag-dialog"
import { TagsList } from "@/components/tags/tags-list"

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-6 text-center">
        <Avatar className="h-32 w-32">
          <User className="h-16 w-16" />
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
                <h3 className="font-semibold">Nicknames</h3>
                <p className="text-muted-foreground">Astrella, Virgi</p>
              </div>
              <div>
                <h3 className="font-semibold">Bio</h3>
                <p className="text-muted-foreground">
                  Indonesian idol and content creator
                </p>
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