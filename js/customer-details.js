(function () {
  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function renderCustomerDetailsPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("customer-form");
    const statusNode = document.getElementById("customer-status");
    const confirmBtn = document.getElementById("confirm-order-btn");
    const addressSummaryNode = document.getElementById("address-summary");

    if (!cartNode || !totalNode || !form || !statusNode || !confirmBtn) {
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

    function paintOrder() {
      totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        confirmBtn.disabled = true;
        return;
      }

      confirmBtn.disabled = false;
      cartNode.innerHTML = items
        .map(function (item) {
          const lineTotal = item.price * item.qty;
          return (
            '<div class="checkout-item">' +
            "<span>" + item.name + " x " + item.qty + "</span>" +
            "<strong>" + (window.formatInr ? window.formatInr(lineTotal) : "INR " + lineTotal) + "</strong>" +
            "</div>"
          );
        })
        .join("");
    }

    paintOrder();

    if (addressSummaryNode) {
      const rows = [];
      rows.push("<strong>Delivery Address</strong>");
      rows.push("<div>" + (addressData.address || "-") + "</div>");
      const cityState = [addressData.city, addressData.state].filter(Boolean).join(", ");
      if (cityState) {
        rows.push("<div>" + cityState + "</div>");
      }
      if (addressData.pincode) {
        rows.push("<div>Pincode: " + addressData.pincode + "</div>");
      }
      addressSummaryNode.innerHTML = '<div class="address-box">' + rows.join("") + "</div>";

      if (!addressData.address) {
        statusNode.textContent = "Address not found. Please go back and enter your address.";
        confirmBtn.disabled = true;
      }
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      const firstName = (form.firstName ? form.firstName.value : "").trim();
      const lastName = (form.lastName ? form.lastName.value : "").trim();
      const email = (form.email ? form.email.value : "").trim();
      const phone = (form.phone ? form.phone.value : "").trim();
      const instructions = (form.instructions ? form.instructions.value : "").trim();

      if (!firstName || !lastName || !email || !phone) {
        statusNode.textContent = "Please fill in all required fields.";
        return;
      }

      const phoneDigits = digitsOnly(phone);
      if (phoneDigits.length < 10) {
        statusNode.textContent = "Please enter a valid phone number.";
        return;
      }

      const fullName = (firstName + " " + lastName).trim();

      const placedAt = new Date().toLocaleString();

      try {
        const draft = {
          addressData: {
            address: addressData.address || "",
            city: addressData.city || "",
            state: addressData.state || "",
            pincode: addressData.pincode || ""
          },
          customerData: {
            firstName: firstName,
            lastName: lastName,
            fullName: fullName,
            email: email,
            phone: phoneDigits,
            instructions: instructions
          },
          items: items,
          total: total,
          timestamp: placedAt
        };
        sessionStorage.setItem("checkoutDraft", JSON.stringify(draft));
        // Keep backward-compatible key used by thank-you page.
        sessionStorage.setItem("finalOrderData", JSON.stringify(draft));
      } catch (error) {
        statusNode.textContent = "Storage error. Please enable cookies and try again.";
        return;
      }

      confirmBtn.disabled = true;
      statusNode.textContent = "Saved. Redirecting to verification...";
      setTimeout(function () {
        window.location.href = "phone-confirm.html";
      }, 500);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCustomerDetailsPage();
  });
})();
