# Stripe Payment Integration Setup Guide

## Overview
Your Lament & Quill marketplace now has Stripe payment processing integrated! This guide will walk you through setting up your Stripe account and configuring the payment system.

## 1. Stripe Account Setup

### Get Your Stripe Keys
1. Go to https://stripe.com and create an account (or log in if you already have one)
2. Navigate to **Developers > API Keys** in your Stripe dashboard
3. You'll need these keys:
   - **Publishable Key** (starts with `pk_test_` for test mode)
   - **Secret Key** (starts with `sk_test_` for test mode)

### Environment Configuration
Update your `.env.local` file with your actual Stripe keys:

```bash
# Replace with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RnJRVKSQ0HKhlDSYfj9yJ0myHCl3KdvjTGYXvLF55fTZRK5gKAvZ1wp1rvxVckqZdtLDuszOqF8X0SrjwJbeAwa000Q3NHEjC
STRIPE_SECRET_KEY=sk_test_51RnJRVKSQ0HKhlDSWyHzFIGRsItJfY2tsHiWCWcZqUlXUavUCBVbdFpoxCPlvv1PiZvJ8iXx3VtmeXPUlalOhACW002pE05dKt
STRIPE_WEBHOOK_SECRET=whsec_leHf03qXbbH9xBEWRqTbQqgvL7hAMwm2
```

## 2. Database Updates

Run these SQL commands in your Supabase SQL Editor to add Stripe payment tracking and order number generation:

```sql
-- Add Stripe payment intent ID to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add order number column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id 
ON orders(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);

-- Add comments for documentation
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe Payment Intent ID for tracking payments';
COMMENT ON COLUMN orders.order_number IS 'Unique human-readable order identifier';

-- Create order number generation function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Generate a unique order number with format: ORD-YYYYMMDD-XXXX
    -- Where XXXX is a sequential number for the day
    
    -- Get today's count of orders
    SELECT COUNT(*) INTO counter 
    FROM orders 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- Increment for next order
    counter := counter + 1;
    
    -- Format: ORD-20250121-0001
    order_num := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 3. Webhook Setup (Important!)

### Create Webhook Endpoint
1. In your Stripe dashboard, go to **Developers > Webhooks**
2. Click **Add endpoint**
3. Use this URL: `https://yourdomain.com/api/stripe-webhook`
   - For development: `http://localhost:3000/api/stripe-webhook`
4. Select these events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Get Webhook Secret
1. After creating the webhook, click on it
2. In the **Signing secret** section, reveal and copy the secret
3. Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

## 4. Testing Your Integration

### Test Mode
- Use Stripe's test mode initially (keys starting with `pk_test_` and `sk_test_`)
- Test credit card numbers:
  - **Success**: `4242 4242 4242 4242` 
    - MM/YY: Any future date (e.g., `12/28`, `03/29`)
    - CVC: Any 3-digit number (e.g., `123`, `456`)
  - **Declined**: `4000 0000 0000 0002`
    - MM/YY: Any future date
    - CVC: Any 3-digit number
  - **Requires 3D Secure**: `4000 0025 0000 3155`
    - MM/YY: Any future date
    - CVC: Any 3-digit number

### Test the Flow
1. Add items to cart
2. Go to checkout
3. Fill in shipping information
4. Select "Credit Card" payment method
5. Use test card numbers above
6. Complete payment and verify order is created

## 5. Features Implemented

### Payment Processing
- ✅ Secure Stripe payment forms
- ✅ Real-time payment validation
- ✅ Digital goods (no shipping cost)
- ✅ Physical goods (with shipping calculation)
- ✅ Order tracking with payment status

### Security Features
- ✅ Payment data never touches your servers
- ✅ PCI compliance through Stripe
- ✅ Webhook signature verification
- ✅ SSL encryption required

### User Experience
- ✅ Gothic-themed payment forms
- ✅ Real-time payment status updates
- ✅ Error handling and user feedback
- ✅ Mobile-responsive payment forms

## 6. Going Live

### Production Setup
1. Complete Stripe account verification
2. Switch to live mode in Stripe dashboard
3. Get live API keys (starting with `pk_live_` and `sk_live_`)
4. Update environment variables with live keys
5. Update webhook URL to production domain
6. Test thoroughly in production environment

### Important Production Considerations
- Enable Strong Customer Authentication (SCA) for EU customers
- Set up proper error monitoring
- Configure email notifications for failed payments
- Implement proper logging for payment events

## 7. Advanced Features (Optional)

### Subscription Support
The current setup can be extended to support:
- Recurring payments for premium memberships
- Subscription-based services
- Trial periods

### Multi-Currency
- Add currency selection
- Automatic currency conversion
- Region-specific payment methods

### Additional Payment Methods
- PayPal integration
- Apple Pay / Google Pay
- Bank transfers (ACH)
- Buy now, pay later options

## 8. Support & Resources

### Stripe Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Webhooks Guide](https://stripe.com/docs/webhooks)

### Troubleshooting
- Check browser console for JavaScript errors
- Verify webhook endpoints are receiving data
- Check Stripe dashboard for payment event logs
- Ensure environment variables are properly set

---

## Quick Start Checklist

- [ ] Create Stripe account
- [ ] Get API keys from Stripe dashboard
- [ ] Update `.env.local` with your keys
- [ ] Run database migration in Supabase
- [ ] Set up webhook endpoint
- [ ] Test with card number 4242 4242 4242 4242
- [ ] Verify order creation in database
- [ ] Ready for production!

Your marketplace now has professional-grade payment processing! 🎉
