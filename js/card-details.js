(function () {
  function renderDetailsPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("details-form");
    const statusNode = document.getElementById("details-status");
    const proceedBtn = document.getElementById("proceed-to-otp-btn");
    const addressSummaryNode = document.getElementById("address-summary");

    if (!cartNode || !totalNode || !form || !statusNode || !proceedBtn) {
      return;
    }

    let addressData = {};
    try {
      addressData = JSON.parse(sessionStorage.getItem("addressData") || "{}");
    } catch (error) {
      addressData = {};
    }

    const items =
      Array.isArray(addressData.cartItems) && addressData.cartItems.length
        ? addressData.cartItems
        : window.CartAPI
        ? window.CartAPI.getItems()
        : [];
    const total =
      typeof addressData.orderTotal === "number"
        ? addressData.orderTotal
        : window.CartAPI
        ? window.CartAPI.getTotal()
        : 0;

    if (!items.length) {
      cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
      totalNode.textContent = window.formatInr ? window.formatInr(0) : "INR 0";
      statusNode.textContent = "No order found. Please add products and checkout again.";
      proceedBtn.disabled = true;
      return;
    }

    if (addressSummaryNode) {
      const rows = [];
      rows.push("<strong>Delivery Address</strong>");
      rows.push("<div>" + (addressData.fullName || "-") + "</div>");
      rows.push("<div>" + (addressData.phone || "-") + "</div>");
      if (addressData.email) {
        rows.push("<div>" + addressData.email + "</div>");
      }
      rows.push("<div>" + (addressData.address || "-") + "</div>");
      const cityState = [addressData.city, addressData.state].filter(Boolean).join(", ");
      if (cityState) {
        rows.push("<div>" + cityState + "</div>");
      }
      if (addressData.pincode) {
        rows.push("<div>Pincode: " + addressData.pincode + "</div>");
      }
      addressSummaryNode.innerHTML = '<div class="address-box">' + rows.join("") + "</div>";
    }

    totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;
    cartNode.innerHTML = items
      .map(function (item) {
        return (
          '<div class="checkout-item">' +
          "<span>" + item.name + " x " + item.qty + "</span>" +
          "<strong>" + (window.formatInr ? window.formatInr(item.price * item.qty) : "INR " + item.price * item.qty) + "</strong>" +
          "</div>"
        );
      })
      .join("");

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const paymentMethod = form.paymentMethod ? form.paymentMethod.value : "COD";
      const orderData = {
        addressData: {
          fullName: addressData.fullName || "",
          phone: addressData.phone || "",
          email: addressData.email || "",
          address: addressData.address || "",
          city: addressData.city || "",
          state: addressData.state || "",
          pincode: addressData.pincode || ""
        },
        items: items,
        total: total,
        paymentMethod: paymentMethod,
        timestamp: new Date().toLocaleString()
      };

      try {
        sessionStorage.setItem("orderData", JSON.stringify(orderData));
      } catch (error) {
        statusNode.textContent = "Storage error. Please enable cookies and try again.";
        return;
      }

      proceedBtn.disabled = true;
      statusNode.textContent = "Redirecting to OTP...";
      setTimeout(function () {
        window.location.href = "otp-verification.html";
      }, 600);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderDetailsPage();
  });
})();
