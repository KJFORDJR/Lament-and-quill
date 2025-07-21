import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  // Check if the route is an admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Get the access token from cookies
    const accessToken = req.cookies.get('sb-kechblfqfvcvodwvxgiv-auth-token')?.value

    if (!accessToken) {
      // No auth token, redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }

    try {
      // Create a Supabase client for server-side operations
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      // Parse the token (Supabase stores it as JSON)
      const tokenData = JSON.parse(accessToken)
      const jwt = tokenData.access_token

      // Get user from token
      const { data: { user }, error } = await supabase.auth.getUser(jwt)
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/login', req.url))
      }

      // Check user role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.user_role !== 'admin') {
        // User is not an admin, redirect to home
        return NextResponse.redirect(new URL('/', req.url))
      }

      // User is admin, allow access
      return NextResponse.next()
    } catch (error) {
      // Error checking auth, redirect to login
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
