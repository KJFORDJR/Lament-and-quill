import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Check if user has voted in a specific poll
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('pollId')

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Check if user has already voted using admin client
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from('poll_votes')
      .select('id, option_id, voted_at')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      return NextResponse.json({ error: voteCheckError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      hasVoted: !!existingVote,
      vote: existingVote || null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
  }
}
