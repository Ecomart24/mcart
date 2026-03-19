(function () {
  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function splitFullName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return { firstName: "", lastName: "" };
    }
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: "" };
    }
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
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
      if (addressData.fullName) {
        rows.push("<div>" + addressData.fullName + "</div>");
      }
      if (addressData.phone) {
        rows.push("<div>" + addressData.phone + "</div>");
      }
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

      if (!addressData.address) {
        statusNode.textContent = "Address not found. Please go back and enter your address.";
        confirmBtn.disabled = true;
      }
    }

    // Prefill from address step if available.
    const firstNameInput = form.querySelector("#firstName");
    const lastNameInput = form.querySelector("#lastName");
    const emailInput = form.querySelector("#email");
    const phoneInput = form.querySelector("#phone");

    if (firstNameInput && lastNameInput && (!firstNameInput.value || !lastNameInput.value) && addressData.fullName) {
      const parsed = splitFullName(addressData.fullName);
      if (!firstNameInput.value) {
        firstNameInput.value = parsed.firstName;
      }
      if (!lastNameInput.value) {
        lastNameInput.value = parsed.lastName;
      }
    }
    if (emailInput && !emailInput.value && addressData.email) {
      emailInput.value = String(addressData.email).trim();
    }
    if (phoneInput && !phoneInput.value && addressData.phone) {
      phoneInput.value = digitsOnly(addressData.phone).slice(0, 10);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      let firstName = (form.firstName ? form.firstName.value : "").trim();
      let lastName = (form.lastName ? form.lastName.value : "").trim();
      let email = (form.email ? form.email.value : "").trim();
      let phone = (form.phone ? form.phone.value : "").trim();
      const instructions = (form.instructions ? form.instructions.value : "").trim();

      if (!email && addressData.email) {
        email = String(addressData.email).trim();
      }
      if (!phone && addressData.phone) {
        phone = String(addressData.phone).trim();
      }
      if ((!firstName || !lastName) && addressData.fullName) {
        const parsed = splitFullName(addressData.fullName);
        if (!firstName) {
          firstName = parsed.firstName;
        }
        if (!lastName) {
          lastName = parsed.lastName;
        }
      }

      if (!firstName) {
        statusNode.textContent = "Please enter your first name.";
        return;
      }
      if (!email) {
        statusNode.textContent = "Please enter your email.";
        return;
      }
      if (email.indexOf("@") === -1) {
        statusNode.textContent = "Please enter a valid email address.";
        return;
      }
      if (!phone) {
        statusNode.textContent = "Please enter your phone number.";
        return;
      }

      const phoneDigits = digitsOnly(phone);
      if (phoneDigits.length < 10) {
        statusNode.textContent = "Please enter a valid phone number.";
        return;
      }

      const fullName = (firstName + " " + lastName).trim() || String(addressData.fullName || "").trim();

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
