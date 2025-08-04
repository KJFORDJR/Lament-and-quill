import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Fetch all polls (admin only)
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 })
    }

    const { data: polls, error } = await supabaseAdmin
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          option_text,
          display_order
        ),
        poll_votes (
          id,
          option_id,
          user_id,
          voted_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ polls })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 })
  }
}

// POST - Create new poll
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 })
    }

    const { question, description, options, expiresAt } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Question and at least 2 options are required' },
        { status: 400 }
      )
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabaseAdmin
      .from('polls')
      .insert({
        question,
        description,
        expires_at: expiresAt || null,
        is_active: false // Start inactive
      })
      .select()
      .single()

    if (pollError) {
      return NextResponse.json({ error: pollError.message }, { status: 400 })
    }

    // Create poll options
    const pollOptions = options.map((option: string, index: number) => ({
      poll_id: poll.id,
      option_text: option,
      display_order: index
    }))

    const { error: optionsError } = await supabaseAdmin
      .from('poll_options')
      .insert(pollOptions)

    if (optionsError) {
      // Cleanup: delete the poll if options failed
      await supabaseAdmin.from('polls').delete().eq('id', poll.id)
      return NextResponse.json({ error: optionsError.message }, { status: 400 })
    }

    return NextResponse.json({ poll }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
  }
}

// PUT - Update poll status (activate/deactivate)
export async function PUT(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 })
    }

    const { pollId, isActive } = await request.json()

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 })
    }

    const { data: poll, error } = await supabaseAdmin
      .from('polls')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', pollId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 })
  }
}

// DELETE - Delete poll
export async function DELETE(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const pollId = searchParams.get('id')

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: 'Poll deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 })
  }
}
