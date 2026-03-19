(function () {
  function generateOrderNumber() {
    const prefix = "MCR";
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

    // Get order data from sessionStorage
    let verifiedOrder = {};
    try {
      const raw =
        sessionStorage.getItem("finalOrderData") ||
        sessionStorage.getItem("verifiedOrderData") ||
        "{}";
      verifiedOrder = JSON.parse(raw);
    } catch (error) {
      verifiedOrder = {};
    }

    const orderTotal =
      (verifiedOrder && typeof verifiedOrder.total === "number" ? verifiedOrder.total : 0) ||
      (window.CartAPI ? window.CartAPI.getTotal() : 0);

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

    console.log("Order confirmed (demo)");

    // Clear cart if CartAPI is available
    if (window.CartAPI) {
      window.CartAPI.clearCart();
    }

    // Update cart count in header
    const cartCountEl = document.querySelector("[data-cart-count]");
    if (cartCountEl) {
      cartCountEl.textContent = "0";
    }

    // Clear sessionStorage
    sessionStorage.removeItem("finalOrderData");
    sessionStorage.removeItem("verifiedOrderData");
    sessionStorage.removeItem("orderData");
    sessionStorage.removeItem("addressData");
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderThankYouPage();
  });
})();
