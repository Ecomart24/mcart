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
    const orderData = JSON.parse(sessionStorage.getItem("orderData") || "{}");
    
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

    // Generate and send OTP on page load
    let generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    function sendOTP() {
      const isGitHubPages = window.location.hostname.endsWith("github.io");
      const otpData = {
        otp: generatedOTP,
        email: (orderData.addressData && orderData.addressData.email) || "",
        fullName: (orderData.addressData && orderData.addressData.fullName) || "",
        phone: (orderData.addressData && orderData.addressData.phone) || "",
        orderTotal: orderData.total,
        timestamp: new Date().toLocaleString()
      };

      if (isGitHubPages) {
        statusNode.textContent = "Demo OTP: " + generatedOTP;
        return;
      }

      fetch("send_otp.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(otpData)
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (result) {
          if (result.success) {
            statusNode.textContent = "OTP sent. For demo, use: " + generatedOTP;
          } else {
            statusNode.textContent = "Failed to send OTP. Please try again.";
          }
        })
        .catch(function () {
          statusNode.textContent = "Demo OTP: " + generatedOTP + " (Server unavailable)";
        });
    }

    // Send OTP on page load
    sendOTP();

    // Only allow numbers in OTP input
    otpInput.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/\D/g, "");
    });

    // Resend OTP functionality
    resendBtn.addEventListener("click", function () {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      sendOTP();
      statusNode.textContent = "New OTP sent. For demo, use: " + generatedOTP;
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

      // Verify OTP (in production, this would be server-side)
      setTimeout(function() {
        if (enteredOTP === generatedOTP) {
          statusNode.textContent = "OTP verified! Completing order...";

          const isGitHubPages = window.location.hostname.endsWith("github.io");
          if (isGitHubPages) {
            sessionStorage.removeItem("orderData");
            window.location.href = "thank-you.html";
            return;
          }
          
          // Send OTP verification confirmation
          const verificationData = {
            otp: enteredOTP,
            verified: true,
            orderData: orderData,
            timestamp: new Date().toLocaleString()
          };

          fetch("verify_otp.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(verificationData)
          })
            .then(function (res) {
              return res.json();
            })
            .then(function (result) {
              if (result.success) {
                // Clear sessionStorage and redirect to thank you page
                sessionStorage.removeItem("orderData");
                window.location.href = "thank-you.html";
              } else {
                statusNode.textContent = "Order completion failed. Please try again.";
                verifyBtn.disabled = false;
              }
            })
            .catch(function () {
              // Even if server fails, proceed to thank you page for demo
              sessionStorage.removeItem("orderData");
              window.location.href = "thank-you.html";
            });
        } else {
          statusNode.textContent = "Invalid OTP. Please try again.";
          verifyBtn.disabled = false;
        }
      }, 1000);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOTPPage();
  });
})();
