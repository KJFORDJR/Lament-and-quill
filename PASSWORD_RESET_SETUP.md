# Password Reset Configuration Guide

## Summary
The password reset functionality has been implemented with the following components:

1. **Auth Callback API Route**: `/api/auth/callback` - Handles the authentication flow from Supabase
2. **Reset Password Page**: `/reset-password` - Where users enter their new password
3. **Forgot Password Page**: `/forgot-password` - Updated to use the new callback flow

## Supabase Configuration Required

To make the password reset work properly, you need to configure the following in your Supabase project:

### 1. Site URL Configuration
In your Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (for development) or your production domain
- **Redirect URLs**: Add these URLs to allow redirects:
  - `http://localhost:3000/api/auth/callback`
  - `http://localhost:3000/reset-password`
  - Your production domain equivalents

### 2. Email Templates (Already Configured)
The email templates have been customized with:
- **Subject**: "Welcome to Lament and Quill - Please Verify Your Account" (for confirmation)
- **Subject**: "Reset Your Lament and Quill Password" (for password reset)

## How the Flow Works

1. User enters email on `/forgot-password` page
2. Supabase sends email with link to `/api/auth/callback?type=recovery&code=...`
3. Auth callback exchanges the code for a session and redirects to `/reset-password`
4. User enters new password on `/reset-password` page
5. Password is updated via Supabase auth
6. User is redirected to login page

## Testing the Flow

1. Start the development server: `npm run dev`
2. Go to `/forgot-password`
3. Enter a valid email address
4. Check your email for the reset link
5. Click the link - you should be redirected to `/reset-password`
6. Enter a new password and confirm
7. Should redirect to login page

## Troubleshooting

If the flow doesn't work:

1. **Check Supabase URL Configuration**: Make sure the redirect URLs are properly configured
2. **Check Email Delivery**: Verify emails are being sent and not in spam
3. **Check Browser Console**: Look for any JavaScript errors
4. **Check Network Tab**: Verify the auth callback is being called
5. **Check Supabase Logs**: Look for any auth errors in Supabase dashboard

## Important Notes

- The auth callback uses PKCE flow which is more secure than the old hash-based approach
- Sessions are properly managed through Supabase's auth system
- The reset password page checks for an active session before allowing password updates
- Error handling is implemented for various failure scenarios
