# Email Service Setup Guide for Mcart

Your checkout system now includes email functionality for steps 2 and 3! Here's how to configure it:

## Current Implementation
- **Step 2**: Sends payment confirmation email when payment details are submitted
- **Step 3**: Sends order confirmation email when verification is completed
- **Fallback**: Demo mode that logs emails to console if EmailJS is not configured

## Option 1: Quick Setup (Recommended - EmailJS)

1. **Sign up for EmailJS** (free tier available):
   - Go to https://www.emailjs.com/
   - Create a free account

2. **Create Email Service**:
   - In EmailJS dashboard, click "Add Email Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the connection process

3. **Create Email Templates**:

   **Payment Confirmation Template** (for Step 2):
   ```
   Subject: Mcart - Payment Confirmation for {{to_name}}
   
   Hello {{to_name}},
   
   Thank you for your payment! Here are your details:
   
   Order Information:
   - Order Date: {{order_date}}
   - Order Time: {{order_time}}
   - Total Amount: {{order_total}}
   
   Payment Method: {{payment_method}}
   Payment Details: {{payment_details}}
   
   Items Ordered:
   {{items}}
   
   Billing Address:
   {{billing_address}}
   
   Contact: {{customer_phone}}
   
   You will receive a final confirmation once your order is verified.
   
   Thank you for shopping with Mcart!
   ```

   **Order Confirmation Template** (for Step 3):
   ```
   Subject: Mcart - Order Confirmed #{{order_id}}
   
   Hello {{to_name}},
   
   Great news! Your order has been confirmed and is being processed.
   
   Order Details:
   - Order ID: {{order_id}}
   - Order Date: {{order_date}}
   - Order Time: {{order_time}}
   - Total Amount: {{order_total}}
   - Verification Code: {{verification_code}}
   
   Payment Method: {{payment_method}}
   Payment Details: {{payment_details}}
   
   Items Ordered:
   {{items}}
   
   Billing Address:
   {{billing_address}}
   
   Shipping Address:
   {{shipping_address}}
   
   Contact: {{customer_phone}}
   
   Your order is now being processed and will be shipped soon.
   
   Thank you for shopping with Mcart!
   ```

4. **Update Configuration**:
   Open `js/email-service.js` and replace the placeholder values:
   ```javascript
   config: {
     serviceID: 'your_service_id',        // From EmailJS dashboard
     templateID_payment: 'your_payment_template_id',  // From EmailJS dashboard
     templateID_order: 'your_order_template_id',      // From EmailJS dashboard
     publicKey: 'your_public_key_here'     // From EmailJS dashboard
   }
   ```

## Option 2: Demo Mode (Already Working)

The system automatically falls back to demo mode if EmailJS is not configured:
- Emails are logged to browser console
- Emails are stored in localStorage for viewing
- Checkout process continues normally

To view demo emails in console:
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for "=== DEMO EMAIL ===" messages

## Option 3: Custom Email Service

If you prefer a different email service, modify the `email-service.js` file:
- Replace EmailJS calls with your preferred service API
- Keep the same interface for compatibility

## Testing

1. Complete a test checkout process
2. Check browser console for email logs
3. If using EmailJS, check your email inbox
4. Verify all email content is correct

## Troubleshooting

- **Emails not sending**: Check EmailJS configuration and API keys
- **Template errors**: Verify template IDs match exactly in EmailJS dashboard
- **Missing variables**: Ensure all template variables are correctly spelled

The system is designed to work even if email service fails - users can complete checkout regardless of email status.
