# Email Verification Setup Guide

## 🐛 Issues Fixed

### 1. **Invalid Path Error**
- **Problem**: Users clicking verification emails got `{"error":"requested path is invalid"}`
- **Cause**: Registration wasn't specifying a redirect URL for email confirmation
- **Fix**: Added `emailRedirectTo: '${window.location.origin}/verify-email'` to registration

### 2. **Better Error Handling**
- **Problem**: Verification page couldn't handle different Supabase URL parameter formats
- **Fix**: Enhanced verification page to handle multiple parameter formats:
  - `token_hash` (newer Supabase format)
  - `token` (older format)
  - `access_token` & `refresh_token` (session-based)
  - Error parameters in URL

### 3. **Generic Supabase Emails**
- **Problem**: Emails have no Lament and Quill branding
- **Status**: Partially addressed (see Custom Email Templates section below)

## ✅ Current Status

### What Works Now:
1. **Registration Flow**: Users register → get branded redirect URL
2. **Email Links**: Click verification email → taken to `/verify-email` page
3. **Verification Page**: Handles various URL parameter formats
4. **Success Flow**: After verification → redirected to login with success message
5. **Error Handling**: Clear error messages for expired/invalid links

### Files Modified:
- `src/app/register/page.tsx` - Added `emailRedirectTo` parameter
- `src/app/verify-email/page.tsx` - Enhanced parameter handling and error states

## 🎨 Custom Email Templates (Requires Supabase Dashboard)

To fully brand the verification emails, you need to configure custom email templates in your Supabase project:

### Steps:
1. **Login to Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project

2. **Access Email Templates**
   - Go to Authentication → Email Templates
   - Select "Confirm signup" template

3. **Custom Template Example**:
```html
<h1>Welcome to Lament and Quill</h1>
<p>Two cities. Two Ghosts. One reckoning.</p>

<p>Welcome to the convergence, {{ .Email }}!</p>

<p>Please verify your chronicle by clicking the link below:</p>

<p><a href="{{ .ConfirmationURL }}" style="background: #8B0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Activate Your Chronicle</a></p>

<p>If you didn't create an account with us, you can safely ignore this email.</p>

<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666;">
  <p>From the shadows of the Neo-Gothic realm,<br>
  The Lament and Quill Team</p>
</div>
```

4. **Available Variables**:
   - `{{ .Email }}` - User's email address
   - `{{ .ConfirmationURL }}` - The verification link
   - `{{ .SiteURL }}` - Your site URL

5. **Styling Options**:
   - Use inline CSS for better email client compatibility
   - Dark Neo-Gothic theme with red/silver accents
   - Include your site logo/branding

## 🧪 Testing the Fix

### To Test Email Verification:

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Register New User**:
   - Go to `/register`
   - Use a real email address you can access
   - Fill out the form and submit

3. **Check Email**:
   - Look for Supabase confirmation email
   - Click the verification link
   - Should be taken to `/verify-email` page

4. **Verify Success**:
   - Should see success message
   - Automatically redirected to login after 3 seconds
   - Can then login with verified account

### Expected Behavior:
- ✅ No more "invalid path" errors
- ✅ Proper verification page with Dark Gothic styling
- ✅ Clear success/error messages
- ✅ Automatic redirect to login
- ✅ Console logging for debugging

## 🔧 Additional Configuration

### Environment Variables:
Make sure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Auth Settings:
In your Supabase project settings, ensure:
- **Site URL**: Set to your production domain
- **Redirect URLs**: Include your domains (e.g., `https://lamentandquill.com/verify-email`)

### Resend SMTP Configuration (Recommended):
Since you're already using Resend, configure it as your SMTP provider for professional email delivery:

1. **Configure Supabase Dashboard** (External Setup Required):
   - Go to Authentication → Settings → SMTP Settings
   - Enable "Enable custom SMTP"
   - Configure with these Resend settings:
     - **SMTP Host**: `smtp.resend.com`
     - **SMTP Port**: `587`
     - **SMTP User**: `resend`
     - **SMTP Password**: Your Resend API key
     - **SMTP Sender Name**: `Lament and Quill`
     - **SMTP Sender Email**: `noreply@lamentandquill.com`

2. **Test Configuration**: Use `/admin/settings` to test Resend SMTP connectivity

3. **Verify Environment Variables**: Ensure your `.env.local` has:
```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@lamentandquill.com
```

#### Resend Setup Steps (External):
1. **Get Resend API Key**:
   - Go to [resend.com](https://resend.com) and login to your account
   - Navigate to "API Keys" in your dashboard
   - Create new API key for "Lament and Quill"
   - Copy the API key (starts with `re_`)

2. **Configure Domain (Optional but Recommended)**:
   - Add your domain `lamentandquill.com` in Resend dashboard
   - Verify DNS records for better deliverability
   - Use `noreply@lamentandquill.com` as sender

#### Benefits of Resend SMTP:
- **3,000 emails/month free** (much higher than Supabase default)
- **99.9% uptime SLA** with professional infrastructure
- **Superior deliverability** rates and inbox placement
- **Real-time analytics** and delivery tracking
- **Custom domain support** for branded emails
- **Already integrated** in your codebase

## 🚨 Troubleshooting

### Common Issues:

1. **"Token has expired" errors**:
   - Verification links expire after 24 hours
   - Users need to register again or request new verification

2. **Still getting generic emails**:
   - Custom templates must be configured in Supabase Dashboard
   - Default templates will be used until custom ones are set

3. **Redirect not working**:
   - Check that `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Ensure Supabase project has correct Site URL configured

4. **Console errors during verification**:
   - Check browser console for detailed error messages
   - Verification parameters are logged for debugging

## 📝 Next Steps

1. **Configure Custom Email Templates** in Supabase Dashboard
2. **Test with real email addresses** to ensure delivery
3. **Set up SMTP** for production (optional, Supabase handles by default)
4. **Configure domain-specific settings** for production deployment

The core email verification flow is now fixed and should work properly!
