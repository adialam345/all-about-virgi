"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Tag, Sparkles } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface RecentActivity {
  id: string
  type: 'like' | 'dislike' | 'tag' | 'fun_fact'
  content: string
  created_at: string
}

interface RecentTag {
  id: string
  name: string
  description: string | null
  item_count: number
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLikes: 0,
    totalDislikes: 0,
    totalTags: 0,
    totalFunFacts: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [recentTags, setRecentTags] = useState<RecentTag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchStats = async () => {
    try {
      // Fetch likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('is_like', true)

      // Fetch dislikes count
      const { count: dislikesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('is_like', false)

      // Fetch tags count
      const { count: tagsCount } = await supabase
        .from('tags')
        .select('*', { count: 'exact', head: true })

      // Fetch fun facts count
      const { count: funFactsCount } = await supabase
        .from('fun_facts')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalLikes: likesCount || 0,
        totalDislikes: dislikesCount || 0,
        totalTags: tagsCount || 0,
        totalFunFacts: funFactsCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Fetch recent likes/dislikes
      const { data: likes } = await supabase
        .from('likes')
        .select('id, item_name, is_like, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      if (!likes) return []

      return likes.map(like => ({
        id: like.id,
        content: like.item_name,
        type: like.is_like ? 'like' as const : 'dislike' as const,
        created_at: like.created_at
      }))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return []
    }
  }

  const fetchRecentTags = async () => {
    try {
      const { data: tags } = await supabase
        .from('tags')
        .select(`
          id,
          name,
          description,
          created_at,
          item_tags (
            count
          )
        `)
        .order('created_at', { ascending: false })
        .limit(6)

      if (!tags) return []

      return tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        description: tag.description,
        item_count: tag.item_tags?.length || 0,
        created_at: tag.created_at
      }))
    } catch (error) {
      console.error('Error fetching recent tags:', error)
      return []
    }
  }

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch stats
        await fetchStats()

        // Fetch recent activity
        const activity = await fetchRecentActivity()
        if (mounted) setRecentActivity(activity)

        // Fetch recent tags
        const tags = await fetchRecentTags()
        if (mounted) setRecentTags(tags)

      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscriptions
    const likesChannel = supabase
      .channel('likes-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'likes' }, 
        () => {
          fetchStats()
          fetchRecentActivity().then(activity => {
            if (mounted) setRecentActivity(activity)
          })
        }
      )
      .subscribe()

    const tagsChannel = supabase
      .channel('tags-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tags' }, 
        () => {
          fetchStats()
          fetchRecentTags().then(tags => {
            if (mounted) setRecentTags(tags)
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false
      likesChannel.unsubscribe()
      tagsChannel.unsubscribe()
    }
  }, [supabase])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB')
  }

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/likes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalLikes}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/likes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dislikes</CardTitle>
              <ThumbsDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalDislikes}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/tags">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalTags}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/funfacts">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fun Facts</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : stats.totalFunFacts}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center text-muted-foreground">No recent activity</div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{activity.content}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                    <Badge variant={activity.type === 'like' ? 'default' : 'destructive'}>
                      {activity.type === 'like' ? 'Like' : 'Dislike'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tags</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : recentTags.length === 0 ? (
              <div className="text-center text-muted-foreground">No tags added yet</div>
            ) : (
              <div className="space-y-4">
                {recentTags.map((tag) => (
                  <div key={tag.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{tag.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {tag.description || 'No description'}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {tag.item_count} items
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}