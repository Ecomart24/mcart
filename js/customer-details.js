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
      const nextHref = "phone-confirm.html";

      function buildMailto(draftData) {
        const to = "akrasd25@gmail.com";
        const subject = "Mcart Step 2 (Details) - " + (fullName || "Customer");
        const lines = [];
        lines.push("MCART - STEP 2 (DETAILS)");
        lines.push("");
        lines.push("Name: " + (fullName || "-"));
        lines.push("Phone: " + (phoneDigits || "-"));
        lines.push("Email: " + (email || "Not provided"));
        lines.push("Order Instructions: " + (instructions || "-"));
        lines.push("");
        lines.push("Address: " + (draftData.addressData && draftData.addressData.address ? draftData.addressData.address : "-"));
        lines.push("City: " + (draftData.addressData && draftData.addressData.city ? draftData.addressData.city : "-"));
        lines.push("State: " + (draftData.addressData && draftData.addressData.state ? draftData.addressData.state : "-"));
        lines.push("Pincode: " + (draftData.addressData && draftData.addressData.pincode ? draftData.addressData.pincode : "-"));
        lines.push("Placed At: " + (draftData.timestamp || "-"));
        lines.push("");
        lines.push("Order Items:");
        (draftData.items || []).forEach(function (item) {
          const name = item && item.name ? item.name : "Product";
          const qty = item && item.qty ? item.qty : 1;
          const price = item && item.price ? item.price : 0;
          lines.push(name + " x " + qty + " = INR " + qty * price);
        });
        lines.push("");
        lines.push("Order Total: INR " + (typeof draftData.total === "number" ? draftData.total : 0));
        const body = lines.join("\n");
        return (
          "mailto:" +
          encodeURIComponent(to) +
          "?subject=" +
          encodeURIComponent(subject) +
          "&body=" +
          encodeURIComponent(body)
        );
      }

      function continueLinks(message, draftData) {
        const mailto = buildMailto(draftData);
        statusNode.innerHTML =
          message +
          ' <a href="' +
          mailto +
          '" target="_blank" rel="noopener">Send via email app</a> | <a href="' +
          nextHref +
          '">Continue</a>';
      }

      // GitHub Pages is static hosting and cannot execute PHP endpoints.
      const isGitHubPages = window.location.hostname.endsWith("github.io");
      if (isGitHubPages) {
        statusNode.textContent = "Saved (demo). Redirecting...";
        setTimeout(function () {
          window.location.href = nextHref;
        }, 500);
        return;
      }

      const draftForEmail = {
        addressData: {
          fullName: addressData.fullName || fullName,
          phone: addressData.phone || phoneDigits,
          email: addressData.email || email,
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

      statusNode.textContent = "Sending step 2 to email...";
      const controller = window.AbortController ? new AbortController() : null;
      const timeoutId = window.setTimeout(function () {
        if (controller) {
          controller.abort();
        }
      }, 7000);

      fetch("send_step.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(Object.assign({ step: 2 }, draftForEmail)),
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          window.clearTimeout(timeoutId);
          const contentType = String(res.headers.get("content-type") || "").toLowerCase();
          if (contentType.indexOf("application/json") === -1) {
            return res.text().then(function () {
              throw new Error("PHP is not running. Open the site using a PHP server (XAMPP/WAMP/Laragon).");
            });
          }
          return res.json();
        })
        .then(function (result) {
          if (result && result.success) {
            statusNode.textContent = "Step 2 sent. Redirecting...";
            setTimeout(function () {
              window.location.href = nextHref;
            }, 600);
            return;
          }
          const msg = (result && result.message) || "Email could not be sent.";
          continueLinks(msg, draftForEmail);
          confirmBtn.disabled = false;
        })
        .catch(function (error) {
          window.clearTimeout(timeoutId);
          const msg = error && error.message ? error.message : "Email could not be sent.";
          continueLinks(msg, draftForEmail);
          confirmBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderCustomerDetailsPage();
  });
})();
