(function () {
  function renderOTPPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("otp-form");
    const statusNode = document.getElementById("otp-status");
    const verifyBtn = document.getElementById("verify-otp-btn");
    const resendBtn = document.getElementById("resend-otp-btn");
    const otpInput = document.getElementById("otp");

    if (!cartNode || !totalNode || !form) {
      return;
    }

    // Get order data from sessionStorage
    let orderData = {};
    try {
      orderData = JSON.parse(sessionStorage.getItem("orderData") || "{}");
    } catch (error) {
      orderData = {};
    }
    
    if (!orderData.items || !orderData.addressData) {
      statusNode.textContent = "Order data not found. Please start checkout again.";
      verifyBtn.disabled = true;
      return;
    }

    function paintOrder() {
      const items = orderData.items || [];
      const total = orderData.total || 0;
      totalNode.textContent = window.formatInr(total);

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        verifyBtn.disabled = true;
        return;
      }

      verifyBtn.disabled = false;
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

    // Generate OTP on page load (demo)
    let generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    statusNode.textContent = "Demo OTP: " + generatedOTP;
    
    // Only allow numbers in OTP input
    otpInput.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const enteredOTP = otpInput.value.trim();
      
      if (!enteredOTP) {
        statusNode.textContent = "Please enter the OTP.";
        return;
      }

      if (enteredOTP.length !== 6) {
        statusNode.textContent = "OTP must be 6 digits.";
        return;
      }

      verifyBtn.disabled = true;
      statusNode.textContent = "Verifying OTP...";

      // Verify OTP (no server call - just check against generated OTP)
      setTimeout(function() {
        if (enteredOTP === generatedOTP) {
          statusNode.textContent = "OTP verified successfully. Redirecting to confirmation...";
          // Store verified order data for thank you page
          sessionStorage.setItem("verifiedOrderData", JSON.stringify({
            addressData: orderData.addressData,
            items: orderData.items,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod || "COD",
            verified: true,
            timestamp: new Date().toLocaleString()
          }));
          setTimeout(function() {
            window.location.href = "thank-you.html";
          }, 1500);
        } else {
          statusNode.textContent = "Invalid OTP. Please try again.";
          verifyBtn.disabled = false;
        }
      }, 1000);
    });

    resendBtn.addEventListener("click", function () {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      statusNode.textContent = "New demo OTP: " + generatedOTP;
      otpInput.value = "";
      otpInput.focus();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOTPPage();
  });
})();
