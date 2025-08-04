import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get poll analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('id')

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 })
    }

    // Get poll with options and votes
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          option_text,
          display_order,
          poll_votes (
            id,
            user_id,
            voted_at
          )
        )
      `)
      .eq('id', pollId)
      .single()

    if (pollError) {
      return NextResponse.json({ error: pollError.message }, { status: 400 })
    }

    // Calculate analytics
    const totalVotes = poll.poll_options.reduce((sum: number, option: any) => 
      sum + option.poll_votes.length, 0
    )

    const analytics = poll.poll_options.map((option: any) => ({
      id: option.id,
      text: option.option_text,
      votes: option.poll_votes.length,
      percentage: totalVotes > 0 ? Math.round((option.poll_votes.length / totalVotes) * 100) : 0
    }))

    // Get voting timeline
    const allVotes = poll.poll_options.flatMap((option: any) => 
      option.poll_votes.map((vote: any) => ({
        ...vote,
        option_text: option.option_text
      }))
    ).sort((a: any, b: any) => new Date(a.voted_at).getTime() - new Date(b.voted_at).getTime())

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        is_active: poll.is_active,
        created_at: poll.created_at,
        expires_at: poll.expires_at
      },
      analytics,
      totalVotes,
      votingTimeline: allVotes.slice(-10) // Last 10 votes
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch poll analytics' }, { status: 500 })
  }
}
