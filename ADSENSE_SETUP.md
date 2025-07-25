# Google AdSense Integration Setup

## Overview
I've added Google AdSense integration to your site with an easy toggle system. The AdSense script will only load when enabled, giving you full control.

## Quick Setup

### Method 1: Environment Variable Control (Immediate)
Add this line to your `.env.local` file:
```bash
NEXT_PUBLIC_ADS_ENABLED=false
```

Set to `true` to enable ads, `false` to disable.

### Method 2: Admin Panel Control (Requires Database Update)
The admin panel now has an "Google AdSense" toggle, but it requires adding a column to your database.

## Files Added/Modified

### 1. AdSense Script Component
- **File**: `src/components/AdSenseScript.tsx`
- **Purpose**: Conditionally loads Google AdSense script based on configuration
- **Features**: 
  - Checks system config API first
  - Falls back to environment variable
  - Only loads when enabled
  - Uses Next.js Script component for optimal loading

### 2. Layout Integration
- **File**: `src/app/layout.tsx` 
- **Changes**: Added `<AdSenseScript />` component to `<head>`

### 3. System Configuration API
- **File**: `src/app/api/system-config/route.ts`
- **Changes**: Added `ads_enabled` to default config and env variable fallback

### 4. Admin Settings Panel
- **File**: `src/app/admin/settings/page.tsx`
- **Changes**: Added Google AdSense toggle in Feature Controls section

## How to Enable/Disable Ads

### Option A: Environment Variable (Works Now)
1. Edit your `.env.local` file
2. Add or change: `NEXT_PUBLIC_ADS_ENABLED=true` 
3. Restart your development server
4. Ads will load on all pages

### Option B: Admin Panel (After Database Update)
1. Go to your admin panel → System Settings
2. Find "Google AdSense" toggle in Feature Controls
3. Toggle on/off as needed
4. Click "Save All"

## Database Column Addition (Optional)
To use the admin panel toggle, you need to add an `ads_enabled` column to your `system_config` table.

**Via Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to Database → Tables → system_config
3. Add new column: `ads_enabled` (boolean, default: false)

**Or use the SQL Editor:**
```sql
ALTER TABLE system_config 
ADD COLUMN ads_enabled BOOLEAN DEFAULT false;
```

## AdSense Configuration Details
- **Client ID**: `ca-pub-9483812306598147` (your Google AdSense publisher ID)
- **Script Strategy**: `afterInteractive` (optimal for performance)
- **Cross-Origin**: `anonymous` (required by Google)

## Testing
1. Enable ads using either method above
2. Check browser developer tools → Network tab
3. Look for `adsbygoogle.js` script loading
4. When disabled, the script should not load at all

## Security & Performance
- Script only loads when explicitly enabled
- Uses Next.js Script component for optimal loading
- No impact on site performance when disabled
- Environment variable provides immediate control without database changes

## Troubleshooting
- If ads don't show: Check browser ad blockers
- If script doesn't load: Verify `NEXT_PUBLIC_ADS_ENABLED=true` and restart server
- If admin toggle doesn't work: Add the database column as described above
