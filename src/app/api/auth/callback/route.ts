import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback received:', { code: !!code, type, next })

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/forgot-password?error=invalid_code', request.url))
      }

      console.log('Successfully exchanged code for session')
      
      // Check if this is a password reset flow
      if (type === 'recovery') {
        console.log('Redirecting to reset-password page')
        // Create response with redirect
        const response = NextResponse.redirect(new URL('/reset-password', request.url))
        
        // Set session cookies
        if (data.session) {
          response.cookies.set('sb-access-token', data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
          })
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30 // 30 days
          })
        }
        
        return response
      }
      
    } catch (error) {
      console.error('Unexpected error during code exchange:', error)
      return NextResponse.redirect(new URL('/forgot-password?error=unexpected', request.url))
    }
  }

  // Default redirect for other auth flows or missing code
  console.log('Redirecting to default:', next)
  return NextResponse.redirect(new URL(next, request.url))
}
