# Merchandise Customer Notes Feature - Implementation Summary

## What We've Added

### 1. Admin Interface Updates
- **File**: `src/app/admin/merchandise/page.tsx`
- **Changes**:
  - Added `allow_customer_notes` field to `MerchandiseItem` interface
  - Added `toggleCustomerNotes()` function to toggle the setting per product
  - Added `MessageSquare` icon import from lucide-react
  - Added a new "Custom Notes" button in the product cards that toggles ON/OFF

### 2. Database Schema Updates
- **Files**: 
  - `database/merchandise_customer_notes_migration.sql` (combined migration)
  - `database/add_merchandise_customer_notes.sql` (merchandise table)
  - `database/add_order_items_customer_notes.sql` (order_items table)

- **Changes**:
  - Added `allow_customer_notes BOOLEAN DEFAULT false` to `merchandise` table
  - Added `customer_notes TEXT` to `order_items` table
  - Added appropriate indexes and documentation

## How It Works

1. **Admin Setup**: In the merchandise admin panel, admins can toggle "Custom Notes" for any product
2. **Customer Purchase**: When a customer buys a product that allows notes, they'll see a text input
3. **Order Storage**: Customer notes are stored per item in the `order_items.customer_notes` field
4. **Admin Viewing**: Admins can see customer notes when viewing orders

## Next Steps Required

### 1. Run Database Migration
Execute the SQL script in your Supabase dashboard:
```sql
-- Copy and run the contents of database/merchandise_customer_notes_migration.sql
```

### 2. Update Purchase Flow
- Modify checkout/cart pages to show notes input for qualifying items
- Update the order creation process to save customer notes

### 3. Update Order Admin View
- Modify `src/app/admin/orders/page.tsx` to display customer notes
- Add notes to order confirmation emails

### 4. Test the Feature
- Set a product to allow customer notes in admin
- Test purchasing with notes in customer flow
- Verify notes appear in admin order view

## Technical Details

- **UI State**: The admin interface uses a blue button when notes are enabled, gray when disabled
- **Database Design**: Notes are stored per order item, not per order, allowing different notes for different products
- **Performance**: Added database indexes for efficient queries
- **Security**: Uses existing RLS policies, no additional security concerns

## Files Modified
1. `src/app/admin/merchandise/page.tsx` - Admin interface updates
2. `database/merchandise_customer_notes_migration.sql` - Database schema updates

## Current Status
✅ Admin interface complete and compiling
✅ Database migration scripts ready
🔄 Needs: Database migration execution
🔄 Needs: Customer purchase flow updates
🔄 Needs: Admin order viewing updates
