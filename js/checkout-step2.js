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

  function maskBankingId(value) {
    if (!value) {
      return "-";
    }
    if (value.length <= 2) {
      return value;
    }
    return value.slice(0, 2) + "****";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var step1Raw = sessionStorage.getItem("checkoutStep1");
    var form = document.getElementById("payment-form");
    var payBtn = document.getElementById("pay-btn");
    var statusNode = document.getElementById("payment-status");
    var cartNode = document.getElementById("checkout-cart-items");
    var totalNode = document.getElementById("checkout-total");
    var contactNode = document.getElementById("contact-summary");
    var paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    var cardFields = document.getElementById("card-fields");
    var bankFields = document.getElementById("bank-fields");
    var bankName = document.getElementById("bank-name");
    var bankingId = document.getElementById("banking-id");
    var bankingPassword = document.getElementById("banking-password");

    if (!form) {
      return;
    }

    if (!step1Raw) {
      setStatus(statusNode, "error", "Please complete step 1 first.");
      if (payBtn) {
        payBtn.disabled = true;
      }
      return;
    }

    var step1Data;
    try {
      step1Data = JSON.parse(step1Raw);
    } catch (error) {
      setStatus(statusNode, "error", "Step 1 data is invalid. Please start again.");
      if (payBtn) {
        payBtn.disabled = true;
      }
      return;
    }

    var items = getCartItems();
    var total = getCartTotal();

    if (contactNode) {
      contactNode.innerHTML =
        "<p><strong>Name:</strong> " + step1Data.fullName + "</p>" +
        "<p><strong>Email:</strong> " + step1Data.email + "</p>" +
        "<p><strong>Phone:</strong> " + step1Data.countryCode + " " + step1Data.phone + "</p>" +
        "<p><strong>Address:</strong> " + step1Data.address + (step1Data.address2 ? ", " + step1Data.address2 : "") + "</p>" +
        "<p><strong>City:</strong> " + step1Data.city + ", " + step1Data.state + " " + step1Data.pincode + "</p>";
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

    function getSelectedMethod() {
      var selected = document.querySelector('input[name="payment_method"]:checked');
      return selected ? selected.value : "credit_card";
    }

    function syncPaymentFields() {
      var selectedMethod = getSelectedMethod();
      var usingBanking = selectedMethod === "net_banking";

      if (cardFields) {
        cardFields.hidden = usingBanking;
      }
      if (bankFields) {
        bankFields.hidden = !usingBanking;
      }

      form.card_name.required = !usingBanking;
      form.card_number.required = !usingBanking;
      form.expiry.required = !usingBanking;
      form.cvv.required = !usingBanking;

      if (bankName) {
        bankName.required = usingBanking;
      }
      if (bankingId) {
        bankingId.required = usingBanking;
      }
      if (bankingPassword) {
        bankingPassword.required = usingBanking;
      }
    }

    paymentRadios.forEach(function (radio) {
      radio.addEventListener("change", syncPaymentFields);
    });
    syncPaymentFields();

    if (form.card_number) {
      form.card_number.addEventListener("input", function (event) {
        var digits = String(event.target.value || "").replace(/\D/g, "").slice(0, 19);
        var parts = digits.match(/.{1,4}/g) || [];
        event.target.value = parts.join(" ");
      });
    }

    if (form.expiry) {
      form.expiry.addEventListener("input", function (event) {
        var digits = String(event.target.value || "").replace(/\D/g, "").slice(0, 4);
        if (digits.length > 2) {
          digits = digits.slice(0, 2) + "/" + digits.slice(2);
        }
        event.target.value = digits;
      });
    }

    if (form.cvv) {
      form.cvv.addEventListener("input", function (event) {
        event.target.value = String(event.target.value || "").replace(/\D/g, "").slice(0, 4);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!items.length) {
        setStatus(statusNode, "error", "Your cart is empty. Please add products first.");
        return;
      }

      var selectedMethod = getSelectedMethod();
      var paymentData;

      if (selectedMethod === "net_banking") {
        var bank = String(bankName.value || "").trim();
        var bankId = String(bankingId.value || "").trim();
        var bankPassword = String(bankingPassword.value || "").trim();

        if (!bank || !bankId || !bankPassword) {
          setStatus(statusNode, "error", "Please fill in all net banking details.");
          return;
        }

        paymentData = {
          method: selectedMethod,
          bankName: bank,
          bankingId: bankId,
          bankingIdMasked: maskBankingId(bankId)
        };
      } else {
        var cardName = String(form.card_name.value || "").trim();
        var cardNumber = String(form.card_number.value || "").replace(/\D/g, "");
        var expiry = String(form.expiry.value || "").trim();
        var cvv = String(form.cvv.value || "").replace(/\D/g, "");

        if (!cardName || !cardNumber || !expiry || !cvv) {
          setStatus(statusNode, "error", "Please fill in all payment details.");
          return;
        }

        if (cardNumber.length < 13 || cardNumber.length > 19) {
          setStatus(statusNode, "error", "Please enter a valid card number.");
          return;
        }

        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
          setStatus(statusNode, "error", "Please enter expiry date in MM/YY format.");
          return;
        }

        if (cvv.length < 3 || cvv.length > 4) {
          setStatus(statusNode, "error", "Please enter a valid CVV.");
          return;
        }

        paymentData = {
          method: selectedMethod,
          cardName: cardName,
          cardLast4: cardNumber.slice(-4),
          expiry: expiry
        };
      }

      paymentData.savedAt = new Date().toISOString();
      paymentData.orderTotal = total;
      sessionStorage.setItem("checkoutStep2", JSON.stringify(paymentData));

      if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = "Please wait 40 seconds...";
      }
      setStatus(statusNode, "", "Processing payment information. Maybe your internet is slow, please be patient.");

      window.setTimeout(function () {
        window.location.href = "checkout-step3-new.html";
      }, 40000);
    });
  });
})();
