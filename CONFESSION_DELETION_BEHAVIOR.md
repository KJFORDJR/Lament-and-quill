# Confession Deletion Behavior

## Current Implementation: Soft Delete

When an admin deletes a confession from the admin panel:

### What Happens:
✅ **Confession is marked as deleted** (`is_deleted = true`)
✅ **Deletion timestamp recorded** (`deleted_at`)
✅ **Admin who deleted it is tracked** (`deleted_by`)
✅ **Status changed to 'deleted'**
✅ **Data is preserved** in the database

### User Experience:
- ❌ **User will NOT see their confession** in their submission list
- ❌ **Confession will NOT appear** in public confessions
- ✅ **Tips and interaction data preserved** for records
- ✅ **Can be restored by admin** if needed

### Admin Features:
- 🔍 **View deleted confessions** with "Show Deleted" toggle
- 🔄 **Restore deleted confessions** with restore button
- 👁️ **Visual indicators** for deleted items (grayed out, "DELETED" badge)
- 📊 **Proper stats counting** (excludes deleted from counts)

## Database Schema Changes Required:

Run this SQL in Supabase:

```sql
ALTER TABLE crimson_confessions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);
```

## Benefits of Soft Delete:

1. **Data Recovery**: Admins can restore accidentally deleted confessions
2. **Audit Trail**: Track who deleted what and when
3. **User Privacy**: Users don't see deleted content but data exists for legal compliance
4. **Analytics**: Maintain historical data for reporting
5. **Mistake Prevention**: Reversible deletions reduce support requests

## Alternative: Hard Delete

If you prefer permanent deletion, change the delete function back to:

```tsx
const { error } = await supabase
  .from('crimson_confessions')
  .delete()
  .eq('id', confessionId);
```

But **soft delete is recommended** for production applications.
