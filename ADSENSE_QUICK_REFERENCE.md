# Google AdSense Integration - Quick Reference

## ✅ Implementation Complete

Your Google AdSense script has been successfully integrated with easy enable/disable controls.

## 🎛️ How to Control Ads

### Method 1: Command Line (Recommended)
```bash
# Check current status
node scripts/check-ads-status.js

# Toggle ads on/off
node scripts/toggle-ads.js
```

### Method 2: Manual Environment Variable
Edit `.env.local` and change:
```bash
NEXT_PUBLIC_ADS_ENABLED=true   # Enable ads
NEXT_PUBLIC_ADS_ENABLED=false  # Disable ads
```

### Method 3: Admin Panel (Future)
Once the database column is added, use Admin → System Settings → Google AdSense toggle.

## 🔧 Current Status
- **AdSense Client ID**: `ca-pub-9483812306598147`
- **Default State**: DISABLED (for safety)
- **Current Method**: Environment variable control

## 🚀 Quick Commands

```bash
# Enable ads
node scripts/toggle-ads.js
# Restart your dev server
npm run dev

# Check if ads are working
# Look for adsbygoogle.js in browser Network tab

# Disable ads
node scripts/toggle-ads.js
```

## 📁 Files Modified

1. **`src/components/AdSenseScript.tsx`** - New component
2. **`src/app/layout.tsx`** - Added AdSense script to head
3. **`src/app/api/system-config/route.ts`** - Added ads config support
4. **`src/app/admin/settings/page.tsx`** - Added admin toggle (requires DB update)
5. **`.env.local`** - Added `NEXT_PUBLIC_ADS_ENABLED=false`

## 🔐 Security Features

- ✅ Ads completely disabled by default
- ✅ Script only loads when explicitly enabled
- ✅ No performance impact when disabled
- ✅ Environment variable override for instant control
- ✅ Admin panel integration ready

## 🧪 Testing

1. **Enable ads**: `node scripts/toggle-ads.js`
2. **Restart server**: `npm run dev`
3. **Check browser**: Open DevTools → Network → look for `adsbygoogle.js`
4. **Verify loading**: Script should appear in Network tab when enabled
5. **Test disable**: Toggle off and verify script disappears

The implementation is complete and ready to use! 🎉
