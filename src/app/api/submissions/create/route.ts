import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the submission data
    const { title, content, is_anonymous, author_id, username } = await request.json();
    
    if (!title?.trim() || !content?.trim() || !author_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    console.log('API: Creating submission for user:', author_id);
    console.log('API: Author ID type:', typeof author_id);
    console.log('API: Author ID value:', JSON.stringify(author_id));

    // First, verify the user exists in profiles, create if not
    const { data: userCheck, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('id', author_id)
      .single();

    console.log('API: User verification query result:', { userCheck, userError });

    if (userError || !userCheck) {
      console.log('API: User profile not found, attempting to create...');
      
      // Try to create the profile if it doesn't exist
      if (username) {
        try {
          const { data: newProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: author_id,
              username: username,
              user_role: 'user',
              city_affiliation: 'neutral',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (profileError) {
            console.error('API: Profile creation failed:', profileError);
            return NextResponse.json({ 
              error: 'Could not create user profile',
              debug: { profileError: profileError.message }
            }, { status: 400 });
          }

          console.log('API: Profile created successfully:', newProfile);
        } catch (createErr) {
          console.error('API: Exception creating profile:', createErr);
          return NextResponse.json({ error: 'Failed to create user profile' }, { status: 400 });
        }
      } else {
        console.error('API: User verification failed and no username provided for profile creation');
        
        // Let's also check if there are any users in the profiles table
        const { data: allUsers, error: allUsersError } = await supabaseAdmin
          .from('profiles')
          .select('id, username')
          .limit(5);
        
        console.log('API: Sample users in profiles table:', { allUsers, allUsersError });
        
        return NextResponse.json({ 
          error: 'Invalid user - no profile found and cannot create without username',
          debug: {
            author_id,
            userError: userError?.message,
            userCheck,
            sampleUsers: allUsers
          }
        }, { status: 400 });
      }
    }

    // Create the submission using admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('lament_submissions')
      .insert({
        title: title.trim(),
        content: content.trim(),
        is_anonymous: is_anonymous || false,
        author_id: author_id,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('API: Submission creation error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('API: Submission created successfully:', data);

    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Submission created successfully'
    });

  } catch (error: any) {
    console.error('API: Create submission error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
