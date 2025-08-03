import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/forgot-password?error=auth_error', requestUrl.origin))
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(new URL('/forgot-password?error=auth_error', requestUrl.origin))
    }
  }

  // Redirect to reset password page
  return NextResponse.redirect(new URL('/reset-password', requestUrl.origin))
}
