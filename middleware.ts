import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session if exists
  const { data: { session } } = await supabase.auth.getSession()

  // List of public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/',
    '/about',
    '/funfacts',
    '/likes',
    '/tags',
    // Add other public paths here
  ]

  // Check if the current path is in the public paths list
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Allow access to public paths without authentication
  if (isPublicPath) {
    return res
  }

  // Redirect to login if no session and trying to access protected path
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return res
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}