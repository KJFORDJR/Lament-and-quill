import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE reply (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const replyId = params.id;
    const body = await request.json();
    const { author_id } = body;

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Verify reply ownership or admin role
    const { data: reply } = await supabaseAdmin
      .from('forum_replies')
      .select(`
        author_id,
        profiles:author_id(user_role)
      `)
      .eq('id', replyId)
      .single();

    const profile = Array.isArray(reply?.profiles) ? reply.profiles[0] : reply?.profiles;
    if (!reply || (reply.author_id !== author_id && profile?.user_role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Soft delete the reply
    const { error } = await supabaseAdmin
      .from('forum_replies')
      .update({ is_deleted: true })
      .eq('id', replyId);

    if (error) {
      console.error('Error deleting reply:', error);
      return NextResponse.json({ error: 'Failed to delete reply' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reply deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting reply:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
