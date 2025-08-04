import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// GET - Get current active poll for users
export async function GET() {
  try {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          option_text,
          display_order
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!poll) {
      return NextResponse.json({ poll: null })
    }

    // Sort options by display_order
    if (poll.poll_options) {
      poll.poll_options.sort((a: any, b: any) => a.display_order - b.display_order)
    }

    return NextResponse.json({ poll })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch active poll' }, { status: 500 })
  }
}

// POST - Submit vote
export async function POST(request: NextRequest) {
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

    const { pollId, optionId } = await request.json()

    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: 'Poll ID and option ID are required' },
        { status: 400 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Check if poll is active using admin client
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .select('is_active, expires_at')
      .eq('id', pollId)
      .single()

    if (pollError || !poll.is_active) {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 })
    }

    // Check if poll has expired
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 })
    }

    // Check if user has already voted using admin client
    const { data: existingVote, error: voteCheckError } = await supabaseAdmin
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', user.id)
      .single()

    if (voteCheckError && voteCheckError.code !== 'PGRST116') {
      return NextResponse.json({ error: voteCheckError.message }, { status: 400 })
    }

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted in this poll' }, { status: 400 })
    }

    // Submit vote using admin client
    const { data: vote, error: voteError } = await supabaseAdmin
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        option_id: optionId,
        user_id: user.id
      })
      .select()
      .single()

    if (voteError) {
      return NextResponse.json({ error: voteError.message }, { status: 400 })
    }

    return NextResponse.json({ vote }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
  }
}
