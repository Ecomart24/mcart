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

  function setStatus(node, type, message) {
    if (!node) {
      return;
    }
    node.textContent = message;
    node.className = "form-status" + (type ? " " + type : "");
  }

  function generateOrderId() {
    return "MCR" + Date.now().toString().slice(-8);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var step1Raw = sessionStorage.getItem("checkoutStep1");
    var step2Raw = sessionStorage.getItem("checkoutStep2");
    var form = document.getElementById("otp-form");
    var verifyBtn = document.getElementById("verify-btn");
    var statusNode = document.getElementById("otp-status");
    var cartNode = document.getElementById("checkout-cart-items");
    var totalNode = document.getElementById("checkout-total");
    var contactNode = document.getElementById("contact-summary");
    var paymentNode = document.getElementById("payment-summary");
    var resendBtn = document.getElementById("resend-otp");
    var changePhoneBtn = document.getElementById("change-phone");
    var otpInputs = Array.prototype.slice.call(document.querySelectorAll(".otp-input"));
    var otpCodeInput = document.getElementById("otp-code");

    if (!form) {
      return;
    }

    if (!step1Raw || !step2Raw) {
      setStatus(statusNode, "error", "Please complete the previous steps first.");
      if (verifyBtn) {
        verifyBtn.disabled = true;
      }
      return;
    }

    var step1Data;
    var step2Data;
    try {
      step1Data = JSON.parse(step1Raw);
      step2Data = JSON.parse(step2Raw);
    } catch (error) {
      setStatus(statusNode, "error", "Checkout data is invalid. Please start again.");
      if (verifyBtn) {
        verifyBtn.disabled = true;
      }
      return;
    }

    var items = getCartItems();
    var total = step2Data.orderTotal || step1Data.orderTotal || getCartTotal();

    if (contactNode) {
      contactNode.innerHTML =
        "<p><strong>Name:</strong> " + step1Data.fullName + "</p>" +
        "<p><strong>Email:</strong> " + step1Data.email + "</p>" +
        "<p><strong>Phone:</strong> " + step1Data.countryCode + " " + step1Data.phone + "</p>" +
        "<p><strong>Address:</strong> " + step1Data.address + (step1Data.address2 ? ", " + step1Data.address2 : "") + "</p>" +
        "<p><strong>City:</strong> " + step1Data.city + ", " + step1Data.state + " " + step1Data.pincode + "</p>";
    }

    if (paymentNode) {
      if (step2Data.method === "net_banking") {
        paymentNode.innerHTML =
          "<p><strong>Method:</strong> Net Banking</p>" +
          "<p><strong>Bank:</strong> " + step2Data.bankName + "</p>" +
          "<p><strong>ID:</strong> " + step2Data.bankingIdMasked + "</p>";
      } else {
        paymentNode.innerHTML =
          "<p><strong>Method:</strong> " + (step2Data.method === "debit_card" ? "Debit Card" : "Credit Card") + "</p>" +
          "<p><strong>Card:</strong> **** **** **** " + step2Data.cardLast4 + "</p>" +
          "<p><strong>Name:</strong> " + step2Data.cardName + "</p>" +
          "<p><strong>Expiry:</strong> " + step2Data.expiry + "</p>";
      }
    }

    if (totalNode) {
      totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;
    }

    if (cartNode) {
      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
      } else {
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
    }

    function updateOtpValue() {
      var otpValue = otpInputs.map(function (input) {
        return input.value;
      }).join("");
      if (otpCodeInput) {
        otpCodeInput.value = otpValue;
      }
      return otpValue;
    }

    otpInputs.forEach(function (input, index) {
      input.addEventListener("input", function (event) {
        event.target.value = String(event.target.value || "").replace(/\D/g, "").slice(0, 1);
        if (event.target.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
        }
        updateOtpValue();
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "Backspace" && !event.target.value && index > 0) {
          otpInputs[index - 1].focus();
        }
      });

      input.addEventListener("paste", function (event) {
        event.preventDefault();
        var digits = String(event.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6).split("");
        digits.forEach(function (digit, digitIndex) {
          if (otpInputs[digitIndex]) {
            otpInputs[digitIndex].value = digit;
          }
        });
        updateOtpValue();
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var otpCode = updateOtpValue();
      if (!/^\d{6}$/.test(otpCode)) {
        setStatus(statusNode, "error", "Please enter a valid 6-digit verification code.");
        return;
      }

      var finalOrderData = {
        orderId: generateOrderId(),
        total: total,
        otp: otpCode,
        contact: step1Data,
        payment: step2Data,
        verifiedAt: new Date().toISOString()
      };

      sessionStorage.setItem("finalOrderData", JSON.stringify(finalOrderData));
      setStatus(statusNode, "success", "Verification complete. Finishing your order...");
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.textContent = "Completing...";
      }

      window.setTimeout(function () {
        window.location.href = "thank-you.html";
      }, 500);
    });

    if (resendBtn) {
      resendBtn.addEventListener("click", function () {
        otpInputs.forEach(function (input) {
          input.value = "";
        });
        updateOtpValue();
        if (otpInputs[0]) {
          otpInputs[0].focus();
        }
        setStatus(statusNode, "success", "New verification code sent for demo. Enter any 6 digits.");
      });
    }

    if (changePhoneBtn) {
      changePhoneBtn.addEventListener("click", function () {
        window.location.href = "checkout-step1-new.html";
      });
    }
  });
})();
