(function () {
  function getCartItems() {
    return window.CartAPI && typeof window.CartAPI.getItems === "function"
      ? window.CartAPI.getItems()
      : [];
  }

  function getCartTotal() {
    return window.CartAPI && typeof window.CartAPI.getTotal === "function"
      ? window.CartAPI.getTotal()
      : 0;
  }

  function renderOrderSummary() {
    var cartNode = document.getElementById("checkout-cart-items");
    var totalNode = document.getElementById("checkout-total");
    if (!cartNode || !totalNode) {
      return;
    }

    var items = getCartItems();
    var total = getCartTotal();
    totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;

    if (!items.length) {
      cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
      return;
    }

    cartNode.innerHTML = items
      .map(function (item) {
        var lineTotal = item.price * item.qty;
        return (
          '<div class="checkout-item">' +
          "<span>" + item.name + " x " + item.qty + "</span>" +
          "<strong>" + (window.formatInr ? window.formatInr(lineTotal) : "INR " + lineTotal) + "</strong>" +
          "</div>"
        );
      })
      .join("");
  }

  function setStatus(node, type, message) {
    if (!node) {
      return;
    }
    node.textContent = message;
    node.className = "form-status" + (type ? " " + type : "");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("checkout-form");
    var continueBtn = document.getElementById("continue-btn");
    var statusNode = document.getElementById("form-status");
    var phoneInput = document.getElementById("phone");
    var pincodeInput = document.getElementById("pincode");

    if (!form) {
      return;
    }

    renderOrderSummary();

    if (phoneInput) {
      phoneInput.addEventListener("input", function (event) {
        event.target.value = String(event.target.value || "").replace(/\D/g, "").slice(0, 15);
      });
    }

    if (pincodeInput) {
      pincodeInput.addEventListener("input", function (event) {
        event.target.value = String(event.target.value || "").replace(/\D/g, "").slice(0, 6);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var items = getCartItems();
      if (!items.length) {
        setStatus(statusNode, "error", "Your cart is empty. Please add products first.");
        return;
      }

      var fullName = String(form.fullName.value || "").trim();
      var email = String(form.email.value || "").trim();
      var phone = String(form.phone.value || "").replace(/\D/g, "").trim();
      var address = String(form.address.value || "").trim();
      var address2 = String(form.address2.value || "").trim();
      var city = String(form.city.value || "").trim();
      var state = String(form.state.value || "").trim();
      var pincode = String(form.pincode.value || "").replace(/\D/g, "").trim();
      var countryCode = String(form.countryCode.value || "+91").trim();

      if (!fullName || !email || !phone || !address || !city || !state || !pincode) {
        setStatus(statusNode, "error", "Please fill in all required fields.");
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus(statusNode, "error", "Please enter a valid email address.");
        return;
      }

      if (phone.length < 10) {
        setStatus(statusNode, "error", "Please enter a valid phone number.");
        return;
      }

      if (!/^\d{6}$/.test(pincode)) {
        setStatus(statusNode, "error", "Please enter a valid 6-digit PIN code.");
        return;
      }

      var checkoutStep1 = {
        fullName: fullName,
        email: email,
        countryCode: countryCode,
        phone: phone,
        address: address,
        address2: address2,
        city: city,
        state: state,
        pincode: pincode,
        cartItems: items,
        orderTotal: getCartTotal(),
        savedAt: new Date().toISOString()
      };

      sessionStorage.setItem("checkoutStep1", JSON.stringify(checkoutStep1));
      setStatus(statusNode, "success", "Details saved. Moving to payment...");
      if (continueBtn) {
        continueBtn.disabled = true;
      }

      window.setTimeout(function () {
        window.location.href = "checkout-step2-new.html";
      }, 500);
    });
  });
})();
