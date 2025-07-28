const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfilesFetch() {
  console.log('Testing profiles table access...');
  
  try {
    // Test basic select
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, user_role, city_affiliation, created_at')
      .limit(5);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log('Successfully fetched profiles:');
    console.log('Count:', data?.length || 0);
    if (data && data.length > 0) {
      console.log('Sample user:', data[0]);
    }

    // Test if email column exists
    const { data: emailTest, error: emailError } = await supabase
      .from('profiles')
      .select('email')
      .limit(1);

    if (emailError) {
      console.log('Email column does not exist yet:', emailError.message);
    } else {
      console.log('Email column exists and accessible');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testProfilesFetch();
