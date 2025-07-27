# SMTP Configuration Guide for Lament and Quill

This file contains SMTP configuration options to replace Supabase's default email service with your own SMTP provider.

## Environment Variables to Add to .env.local:

```bash
# SMTP Configuration for Custom Email Delivery
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@lamentandquill.com
SMTP_FROM_NAME=Lament and Quill
SMTP_USE_TLS=true
```

## Popular SMTP Providers:

### 1. Gmail (Google Workspace)
- Host: smtp.gmail.com
- Port: 587 (TLS) or 465 (SSL)
- Requires App Password (not regular password)
- Free tier: 500 emails/day
- Paid tier: Much higher limits

### 2. SendGrid
- Host: smtp.sendgrid.net
- Port: 587
- Free tier: 100 emails/day
- Better deliverability than Gmail

### 3. Mailgun
- Host: smtp.mailgun.org
- Port: 587
- Free tier: 5,000 emails/month
- Great for transactional emails

### 4. Amazon SES
- Host: email-smtp.region.amazonaws.com
- Port: 587
- Very cost-effective for high volume
- Requires AWS setup

## Setup Instructions:

### For Gmail:
1. Enable 2-factor authentication on your Google account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → App passwords
   - Generate password for "Mail"
3. Use the generated password in SMTP_PASSWORD

### Configuration in Supabase Dashboard:
1. Go to Supabase Dashboard → Authentication → Settings
2. Scroll to "SMTP Settings"
3. Enable "Enable custom SMTP"
4. Enter your SMTP details:
   - Host: smtp.gmail.com
   - Port: 587
   - Username: your-email@gmail.com
   - Password: your-app-password
   - Sender name: Lament and Quill
   - Sender email: your-email@gmail.com

### Benefits of Custom SMTP:
- Higher email limits
- Better deliverability
- Custom "from" address
- Professional appearance
- No Supabase branding in emails
- More control over email content

## Email Templates Location:
After configuring SMTP, you can customize email templates in:
Supabase Dashboard → Authentication → Email Templates

This allows you to:
- Brand verification emails with Lament and Quill theme
- Use custom HTML/CSS styling
- Add Dark Neo-Gothic design elements
- Include proper site links and branding
