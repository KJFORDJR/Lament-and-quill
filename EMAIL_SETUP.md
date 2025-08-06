# Email Service Setup Guide

## Resend Configuration

To enable actual email sending for newsletters, you need to set up Resend:

### 1. Sign up for Resend
- Go to https://resend.com
- Create a free account (100 emails/day free tier)
- Verify your account

### 2. Get API Key
- In your Resend dashboard, go to API Keys
- Create a new API key
- Copy the API key (starts with `re_`)

### 3. Domain Setup (Optional but Recommended)
- In Resend dashboard, go to Domains
- Add your domain (e.g., lamentandquill.com)
- Follow DNS verification steps
- Or use the sandbox domain for testing

### 4. Add Environment Variables
Add these to your `.env.local` file:

```bash
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=newsletter@lamentandquill.com  # Or your verified domain email
NEXT_PUBLIC_SITE_URL=https://lamentandquill.com  # Your site URL for unsubscribe links
```

### 5. Testing
- Use a test email address you own
- Start with the sandbox domain if you haven't verified your own domain yet
- Check the delivery logs in both Resend dashboard and your admin panel

### Development vs Production
- **Development**: Use sandbox domain and test emails
- **Production**: Use your verified domain

### Email Limits
- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Tier**: $20/month for 50,000 emails/month
- Choose based on your subscriber count

### Troubleshooting
- Check Resend dashboard for delivery status
- Verify your domain setup if using custom domain
- Check spam folders for test emails
- Monitor the newsletter delivery logs in admin panel
