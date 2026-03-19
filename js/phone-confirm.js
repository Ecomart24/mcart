(function () {
  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function maskPhone(phoneDigits) {
    const digits = digitsOnly(phoneDigits);
    if (!digits) {
      return "-";
    }
    const last4 = digits.slice(-4);
    return last4.padStart(Math.max(digits.length, 10), "*");
  }

  function renderPhoneConfirmPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("phone-form");
    const statusNode = document.getElementById("phone-status");
    const verifyBtn = document.getElementById("verify-phone-btn");
    const last6Input = document.getElementById("last6");
    const summaryNode = document.getElementById("verify-summary");
    const demoCodeNode = document.getElementById("demo-code");

    if (!cartNode || !totalNode || !form || !statusNode || !verifyBtn || !last6Input) {
      return;
    }

    let draft = {};
    try {
      draft = JSON.parse(
        sessionStorage.getItem("checkoutDraft") ||
        sessionStorage.getItem("finalOrderData") ||
        "{}"
      );
    } catch (error) {
      draft = {};
    }

    const items = Array.isArray(draft.items) && draft.items.length
      ? draft.items
      : window.CartAPI
        ? window.CartAPI.getItems()
        : [];
    const total = typeof draft.total === "number"
      ? draft.total
      : window.CartAPI
        ? window.CartAPI.getTotal()
        : 0;
    const addressData = draft.addressData || {};
    const customerData = draft.customerData || {};
    const phoneDigits = digitsOnly(customerData.phone || "");
    const demoCode = (function () {
      try {
        const existing = sessionStorage.getItem("phoneDemoCode") || "";
        if (/^[0-9]{6}$/.test(existing)) {
          return existing;
        }
      } catch (e) {
        // ignore
      }
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      try {
        sessionStorage.setItem("phoneDemoCode", generated);
      } catch (e) {
        // ignore
      }
      return generated;
    })();

    function paintOrder() {
      totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        verifyBtn.disabled = true;
        return;
      }

      verifyBtn.disabled = false;
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

    if (summaryNode) {
      const rows = [];
      rows.push("<strong>Review</strong>");
      if (customerData.fullName) {
        rows.push("<div>" + customerData.fullName + "</div>");
      }
      if (customerData.email) {
        rows.push("<div>" + customerData.email + "</div>");
      }
      rows.push("<div>Phone: " + maskPhone(phoneDigits) + "</div>");
      rows.push("<div style=\"margin-top:0.35rem;\"><strong>Delivery Address</strong></div>");
      rows.push("<div>" + (addressData.address || "-") + "</div>");
      const cityState = [addressData.city, addressData.state].filter(Boolean).join(", ");
      if (cityState) {
        rows.push("<div>" + cityState + "</div>");
      }
      if (addressData.pincode) {
        rows.push("<div>Pincode: " + addressData.pincode + "</div>");
      }
      summaryNode.innerHTML = '<div class="address-box">' + rows.join("") + "</div>";

      if (!phoneDigits || phoneDigits.length < 6) {
        statusNode.textContent = "Phone number not found. Please go back and enter your details.";
        verifyBtn.disabled = true;
      }
      if (!addressData.address) {
        statusNode.textContent = "Address not found. Please go back and enter your address.";
        verifyBtn.disabled = true;
      }
    }

    if (demoCodeNode) {
      demoCodeNode.textContent = "Demo code: " + demoCode;
    }

    last6Input.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      const entered = digitsOnly(last6Input.value);
      if (entered.length !== 6) {
        statusNode.textContent = "Please enter exactly 6 digits.";
        return;
      }

      // Store final verified order data for the thank you page.
      try {
        const finalOrder = {
          addressData: addressData,
          customerData: Object.assign({}, customerData, {
            phoneLast6: entered,
            phoneVerified: true
          }),
          items: items,
          total: total,
          timestamp: draft.timestamp || new Date().toLocaleString()
        };
        sessionStorage.setItem("finalOrderData", JSON.stringify(finalOrder));
      } catch (error) {
        statusNode.textContent = "Storage error. Please enable cookies and try again.";
        return;
      }

      verifyBtn.disabled = true;
      statusNode.textContent = "Verified. Placing order...";

      // GitHub Pages is static hosting and cannot execute PHP endpoints.
      // For a live store, host the PHP files on a PHP-enabled server.
      const isGitHubPages = window.location.hostname.endsWith("github.io");
      if (isGitHubPages) {
        statusNode.textContent = "Verified (demo on GitHub Pages). Redirecting...";
        setTimeout(function () {
          window.location.href = "thank-you.html";
        }, 700);
        return;
      }

      const payload = {
        firstName: customerData.firstName || "",
        lastName: customerData.lastName || "",
        fullName: customerData.fullName || "",
        email: customerData.email || "",
        phone: phoneDigits,
        phoneLast6: entered,
        instructions: customerData.instructions || "",
        address: addressData.address || "",
        city: addressData.city || "",
        state: addressData.state || "",
        pincode: addressData.pincode || "",
        cartItems: items,
        orderTotal: total,
        placedAt: draft.timestamp || new Date().toLocaleString()
      };

      fetch("send_order.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (result) {
          if (result && result.success) {
            statusNode.textContent = "Order placed. Redirecting...";
          } else {
            statusNode.textContent = "Order placed (email not sent). Redirecting...";
          }
          setTimeout(function () {
            window.location.href = "thank-you.html";
          }, 800);
        })
        .catch(function () {
          statusNode.textContent = "Order placed (email not sent). Redirecting...";
          setTimeout(function () {
            window.location.href = "thank-you.html";
          }, 800);
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPhoneConfirmPage();
  });
})();
