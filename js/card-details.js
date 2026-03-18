(function () {
  function renderDetailsPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("details-form");
    const statusNode = document.getElementById("details-status");
    const proceedBtn = document.getElementById("proceed-to-otp-btn");
    const addressSummaryNode = document.getElementById("address-summary");

    if (!cartNode || !totalNode || !form) {
      return;
    }

    // Get order data from sessionStorage
    const addressData = JSON.parse(sessionStorage.getItem("addressData") || "{}");
    
    if (!addressData.cartItems || !addressData.cartItems.length) {
      statusNode.textContent = "Order data not found. Please start checkout again.";
      proceedBtn.disabled = true;
      return;
    }

    if (addressSummaryNode) {
      const parts = [];
      parts.push("<strong>Delivery Address</strong>");
      parts.push("<div>" + (addressData.fullName || "-") + "</div>");
      parts.push("<div>" + (addressData.phone || "-") + "</div>");
      if (addressData.email) {
        parts.push("<div>" + addressData.email + "</div>");
      }
      parts.push("<div>" + (addressData.address || "-") + "</div>");
      const cityState = [addressData.city, addressData.state].filter(Boolean).join(", ");
      if (cityState) {
        parts.push("<div>" + cityState + "</div>");
      }
      if (addressData.pincode) {
        parts.push("<div>Pincode: " + addressData.pincode + "</div>");
      }
      addressSummaryNode.innerHTML =
        '<div class="address-box">' + parts.join("") + "</div>";
    }

    function paintOrder() {
      const items = addressData.cartItems || [];
      const total = addressData.orderTotal || 0;
      totalNode.textContent = window.formatInr(total);

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        proceedBtn.disabled = true;
        return;
      }

      proceedBtn.disabled = false;
      cartNode.innerHTML = items
        .map(function (item) {
          return (
            '<div class="checkout-item">' +
            "<span>" + item.name + " x " + item.qty + "</span>" +
            "<strong>" + window.formatInr(item.price * item.qty) + "</strong>" +
            "</div>"
          );
        })
        .join("");
    }

    paintOrder();

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const paymentMethod = (form.paymentMethod && form.paymentMethod.value) || "COD";

      proceedBtn.disabled = true;
      statusNode.textContent = "Redirecting to OTP...";

      sessionStorage.setItem(
        "orderData",
        JSON.stringify({
          addressData: addressData,
          items: addressData.cartItems,
          total: addressData.orderTotal || 0,
          paymentMethod: paymentMethod,
          timestamp: new Date().toLocaleString()
        })
      );

      setTimeout(function () {
        window.location.href = "otp-verification.html";
      }, 600);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderDetailsPage();
  });
})();
