# Email Setup for Indicart

## Problem
The current email system uses PHP's basic `mail()` function which often doesn't work on local development environments.

## Solutions

### Option 1: Use PHPMailer (Recommended)

1. **Install PHPMailer:**
   ```bash
   composer install
   ```

2. **Configure Gmail SMTP:**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Update the email credentials in `send_order_fixed.php`:
     ```php
     $mail->Username   = 'your-email@gmail.com';
     $mail->Password   = 'your-app-password';
     ```

3. **Update your frontend to use the fixed files:**
   - Replace `send_order.php` with `send_order_fixed.php`
   - Replace `send_order_confirmation.php` with a similar fixed version

### Option 2: Use a Local Mail Server

1. **Install MailHog (for local development):**
   ```bash
   # Using Docker
   docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
   
   # Or download from: https://github.com/mailhog/MailHog/releases
   ```

2. **Configure PHP to use MailHog:**
   Add to your `php.ini`:
   ```ini
   SMTP = localhost
   smtp_port = 1025
   sendmail_path = "\"C:\path\to\sendmail.exe\" -t -i"
   ```

### Option 3: Use an Email Service API

1. **SendGrid:**
   - Sign up for SendGrid
   - Install: `composer require sendgrid/sendgrid`
   - Use their API instead of SMTP

2. **Mailgun:**
   - Sign up for Mailgun
   - Install: `composer require mailgun/mailgun-php`
   - Use their API

## Testing

1. **Test the email system:**
   ```php
   <?php
   // Create a simple test file test_email.php
   $to = "support@indicart.store";
   $subject = "Test Email";
   $message = "This is a test email from Indicart.";
   $headers = "From: test@indicart.com";
   
   if (mail($to, $subject, $message, $headers)) {
       echo "Email sent successfully!";
   } else {
       echo "Email sending failed.";
   }
   ?>
   ```

2. **Check error logs:**
   - PHP error log: `error_log("Mail function result: " . ($sent ? "success" : "failed"));`
   - Web server logs

## Common Issues

1. **"Mail could not be sent" error:**
   - Check if mail server is running
   - Verify SMTP credentials
   - Check firewall settings

2. **Email goes to spam:**
   - Use proper SPF/DKIM records
   - Use a reputable SMTP service
   - Avoid using localhost in sender address

3. **Local development issues:**
   - Use MailHog for testing
   - Configure XAMPP/WAMP mail settings
   - Use an external SMTP service

## Quick Fix for Testing

If you just want to test quickly without setting up SMTP:

1. **Use MailHog** (Option 2)
2. **Or use a temporary email service** like Mailtrap.io
3. **Or log to file instead of email:**
   ```php
   file_put_contents('orders.log', $message . "\n\n", FILE_APPEND);
   ```

## Security Notes

- Never commit email passwords to version control
- Use environment variables for credentials
- Use app passwords instead of main passwords
- Consider using a professional email service for production
