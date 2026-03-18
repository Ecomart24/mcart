(function () {
  function generateOrderNumber() {
    const prefix = "ECOM";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function renderThankYouPage() {
    const orderNumberEl = document.getElementById("order-number");
    const orderDateEl = document.getElementById("order-date");
    const deliveryDateEl = document.getElementById("delivery-date");
    const orderTotalEl = document.getElementById("order-total");

    // Generate order details
    const orderNumber = generateOrderNumber();
    const orderDate = new Date();
    const deliveryDate = addDays(orderDate, 5); // 5 days delivery estimate

    // Get order total from cart or use default
    const orderTotal = window.CartAPI ? window.CartAPI.getTotal() : 0;

    // Update the page with order details
    if (orderNumberEl) {
      orderNumberEl.textContent = orderNumber;
    }

    if (orderDateEl) {
      orderDateEl.textContent = formatDate(orderDate);
    }

    if (deliveryDateEl) {
      deliveryDateEl.textContent = formatDate(deliveryDate);
    }

    if (orderTotalEl) {
      orderTotalEl.textContent = window.formatInr(orderTotal);
    }

    // Send order confirmation with order number
    const orderData = {
      orderNumber: orderNumber,
      orderDate: orderDate.toLocaleString(),
      deliveryDate: deliveryDate.toLocaleDateString(),
      orderTotal: orderTotal,
      status: "COMPLETED",
      paymentStatus: "PAID",
      timestamp: new Date().toLocaleString()
    };

    // Send confirmation email
    fetch("send_order_confirmation.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (result) {
        if (result.success) {
          console.log("Order confirmation sent successfully");
        } else {
          console.log("Failed to send order confirmation:", result.message);
        }
      })
      .catch(function (error) {
        console.log("Error sending order confirmation:", error);
      });

    // Clear cart if CartAPI is available
    if (window.CartAPI) {
      window.CartAPI.clearCart();
    }

    // Update cart count in header
    const cartCountEl = document.querySelector("[data-cart-count]");
    if (cartCountEl) {
      cartCountEl.textContent = "0";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderThankYouPage();
  });
})();
