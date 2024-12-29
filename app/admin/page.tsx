"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const supabase = createClientComponentClient()

type DashboardStats = {
  totalLikes: number
  totalDislikes: number
  totalTags: number
  recentActivity: {
    id: string
    item_name: string
    is_like: boolean
    created_at: string
  }[]
  recentTags: {
    id: string
    name: string
    description: string | null
    created_at: string
    item_count: number
  }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLikes: 0,
    totalDislikes: 0,
    totalTags: 0,
    recentActivity: [],
    recentTags: []
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      // Get total likes and dislikes
      const { data: likesData } = await supabase
        .from('likes')
        .select('is_like')

      const totalLikes = likesData?.filter(like => like.is_like).length || 0
      const totalDislikes = likesData?.filter(like => !like.is_like).length || 0

      // Get tags with item counts
      const { data: tagsData } = await supabase
        .from('tags')
        .select(`
          *,
          item_count:item_tags(count)
        `)
        .order('created_at', { ascending: false })

      const recentTags = tagsData?.map(tag => ({
        ...tag,
        item_count: tag.item_count?.[0]?.count || 0
      })) || []

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('likes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      setStats({
        totalLikes,
        totalDislikes,
        totalTags: recentTags.length,
        recentActivity: recentActivity || [],
        recentTags
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Set up real-time subscriptions for all relevant tables
    const channels = supabase.channel('dashboard-changes')
      
    // Subscribe to likes changes
    channels.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'likes' },
      () => fetchDashboardData()
    )
    
    // Subscribe to tags changes
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tags' },
      () => fetchDashboardData()
    )
    
    // Subscribe to item_tags changes
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'item_tags' },
      () => fetchDashboardData()
    )
    .subscribe()

    return () => {
      channels.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return <div className="p-8">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-4 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dislikes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDislikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTags}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{activity.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-sm ${
                    activity.is_like ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {activity.is_like ? 'Like' : 'Dislike'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {tag.description || 'No description'}
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-secondary text-sm">
                    {tag.item_count} items
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}