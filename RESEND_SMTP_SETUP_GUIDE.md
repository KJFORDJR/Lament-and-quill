# Resend SMTP Setup Guide for Lament and Quill

## 🚀 External Setup Steps (What You Need to Do)

### 1. **Resend Account Setup**

1. **Go to [resend.com](https://resend.com)**
2. **Sign up or login** to your Resend account
3. **Navigate to API Keys** in your dashboard
4. **Create a new API key**:
   - Click "Create API Key"
   - Name: "Lament and Quill SMTP"
   - Permission: "Sending access"
   - Copy the generated key (starts with `re_`)

### 2. **Update Environment Variables**

Add these to your `.env.local` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@lamentandquill.com
```

### 3. **Configure Supabase Dashboard**

1. **Go to your Supabase project dashboard**
2. **Navigate to**: Authentication → Settings → SMTP Settings
3. **Enable "Enable custom SMTP"**
4. **Configure with these exact settings**:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `resend`
   - **SMTP Password**: Your Resend API key (the one starting with `re_`)
   - **SMTP Sender Name**: `Lament and Quill`
   - **SMTP Sender Email**: `noreply@lamentandquill.com`

### 4. **Optional: Domain Configuration (Recommended)**

For better deliverability and professional emails:

1. **In Resend Dashboard**:
   - Go to "Domains"
   - Click "Add Domain"
   - Enter: `lamentandquill.com`

2. **Add DNS Records** (in your domain provider):
   Resend will provide you with DNS records to add:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)

3. **Verify Domain** in Resend dashboard
4. **Update FROM email** to use your domain: `noreply@lamentandquill.com`

## ✅ Verification Steps

### 1. **Test SMTP Connection**
1. Start your development server: `npm run dev`
2. Go to: `http://localhost:3001/admin/settings`
3. Scroll to "Resend SMTP Configuration"
4. Enter a test email address
5. Click "Test Resend"
6. Check your email for a branded test message

### 2. **Test Email Verification Flow**
1. Go to: `http://localhost:3001/register`
2. Register with a real email address
3. Check your email for verification message
4. Click the verification link
5. Should redirect to your verification page

## 🎯 Benefits You'll Get

### **Email Limits**
- **Free Tier**: 3,000 emails/month (vs Supabase's 30/hour)
- **Paid Tier**: Up to 50,000+ emails/month

### **Deliverability**
- **99.9% uptime SLA**
- **Industry-leading delivery rates**
- **Real-time bounce and complaint handling**

### **Professional Features**
- **Custom domain support** (`@lamentandquill.com`)
- **Real-time analytics** and delivery tracking
- **Advanced email templates** with variables
- **Webhook support** for delivery events

### **Developer Experience**
- **Modern REST API**
- **Excellent documentation**
- **React/Next.js SDKs**
- **TypeScript support**

## 🛠️ Technical Implementation

The following has been implemented in your codebase:

### **Files Updated**:
- `src/lib/resend-smtp.ts` - Resend SMTP utilities
- `src/app/api/test-smtp/route.ts` - Updated to use Resend
- `src/app/admin/settings/page.tsx` - Resend-specific UI
- `EMAIL_VERIFICATION_GUIDE.md` - Updated documentation

### **Features Added**:
- ✅ Resend SMTP testing functionality
- ✅ Branded Dark Gothic email templates
- ✅ Configuration validation
- ✅ Professional admin interface
- ✅ Real-time delivery confirmation

## 🚨 Troubleshooting

### **Common Issues**:

1. **"API key invalid" error**:
   - Ensure API key starts with `re_`
   - Check for extra spaces in `.env.local`
   - Restart development server after adding keys

2. **"Domain not verified" warnings**:
   - You can still send emails from unverified domains
   - Verification improves deliverability
   - Follow domain setup steps above

3. **Test emails not arriving**:
   - Check spam/junk folders
   - Verify email address format
   - Check Resend dashboard for delivery logs

4. **Supabase emails still using default**:
   - Ensure SMTP settings are enabled in Supabase dashboard
   - Check all SMTP fields are filled correctly
   - SMTP password should be your Resend API key

## 📊 Monitoring

### **Resend Dashboard Analytics**:
- Email delivery status
- Open rates
- Click rates
- Bounce rates
- Complaint rates

### **Your Admin Panel** (`/admin/settings`):
- SMTP connection testing
- Configuration validation
- Email sending logs

## 🔧 Production Deployment

When deploying to production:

1. **Add environment variables** to your hosting platform
2. **Update Supabase Site URL** to your production domain
3. **Configure redirect URLs** in Supabase dashboard
4. **Set up domain verification** in Resend (recommended)
5. **Update FROM email** to use your verified domain

Your Resend SMTP integration is now ready for professional email delivery with Dark Neo-Gothic branding!
