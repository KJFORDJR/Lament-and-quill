-- Create a function to update thread category (bypasses schema cache issues)
CREATE OR REPLACE FUNCTION update_thread_category(
  thread_id UUID,
  new_category_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE forum_threads 
  SET category_id = new_category_id
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_thread_category(UUID, UUID) TO authenticated;
