(function () {
  function productCard(product) {
    return (
      '<article class="product-card">' +
      '<a class="card-link" href="product.html?id=' + product.id + '" aria-label="View ' + product.name + '">' +
      '<img src="' + product.image + '" alt="' + product.name + '" />' +
      '<div class="card-body">' +
      '<p class="tag">' + product.category + "</p>" +
      '<h3 class="card-title">' + product.name + "</h3>" +
      '<p class="card-desc">' + product.short + "</p>" +
      '<div class="price-row">' +
      '<span class="price">' + window.formatInr(product.price) + "</span>" +
      (product.oldPrice && product.oldPrice > product.price
        ? '<span class="old-price">' + window.formatInr(product.oldPrice) + "</span>"
        : "") +
      "</div>" +
      "</div>" +
      "</a>" +
      '<div class="card-actions">' +
      '<button class="btn btn-primary full" type="button" data-add-to-cart="' + product.id + '">Add to Cart</button>' +
      "</div>" +
      "</article>"
    );
  }

  function renderFeatured() {
    const root = document.querySelector("[data-featured-products]");
    if (!root) {
      return;
    }
    const items = (window.PRODUCTS || [])
      .filter(function (item) {
        return item.featured;
      })
      .slice(0, 6);
    root.innerHTML = items.map(productCard).join("");
  }

  function renderProductsPage() {
    const root = document.querySelector("[data-products-grid]");
    if (!root) {
      return;
    }
    root.innerHTML = (window.PRODUCTS || []).map(productCard).join("");
  }

  function renderProductDetail() {
    const root = document.querySelector("[data-product-detail]");
    if (!root) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const product = window.getProductById(id) || (window.PRODUCTS || [])[0];

    if (!product) {
      root.innerHTML = "<p>Product not found.</p>";
      return;
    }

    root.innerHTML =
      '<article class="product-layout">' +
      '<div class="panel product-media">' +
      '<img class="product-main-img" id="product-main-img" src="' + product.image + '" alt="' + product.name + '" />' +
      '<div class="thumb-row">' +
      product.images
        .map(function (img, index) {
          const active = index === 0 ? " is-active" : "";
          const label = "View image " + (index + 1);
          const alt = product.name + " thumbnail " + (index + 1);
          return (
            '<button class="thumb-btn' +
            active +
            '" type="button" data-thumb-src="' +
            img +
            '" aria-label="' +
            label +
            '">' +
            '<img src="' +
            img +
            '" alt="' +
            alt +
            '" />' +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      "</div>" +
      '<div class="panel product-info">' +
      '<p class="tag">' + product.category + "</p>" +
      "<h1>" + product.name + "</h1>" +
      '<div class="price-row">' +
      '<span class="price">' + window.formatInr(product.price) + "</span>" +
      (product.oldPrice && product.oldPrice > product.price
        ? '<span class="old-price">' + window.formatInr(product.oldPrice) + "</span>"
        : "") +
      "</div>" +
      "<p>" + product.description + "</p>" +
      '<ul class="spec-list">' +
      product.specs
        .map(function (line) {
          return "<li>" + line + "</li>";
        })
        .join("") +
      "</ul>" +
      '<div class="action-row">' +
      '<label class="qty-pill">Qty <input id="detail-qty" type="number" min="1" value="1" /></label>' +
      '<button class="btn btn-primary" type="button" data-add-to-cart="' + product.id + '" data-qty-input="detail-qty">Add to Cart</button>' +
      '<button class="btn btn-accent" type="button" data-buy-now="' + product.id + '" data-qty-input="detail-qty">Checkout Now</button>' +
      "</div>" +
      "</div>" +
      "</article>";

    const mainImg = root.querySelector("#product-main-img");
    const thumbRow = root.querySelector(".thumb-row");
    if (mainImg && thumbRow) {
      thumbRow.addEventListener("click", function (event) {
        const btn = event.target.closest("[data-thumb-src]");
        if (!btn) {
          return;
        }
        const src = btn.getAttribute("data-thumb-src");
        if (src) {
          mainImg.src = src;
        }
        thumbRow.querySelectorAll(".thumb-btn").forEach(function (node) {
          node.classList.remove("is-active");
        });
        btn.classList.add("is-active");
      });
    }
  }

  function renderCheckoutPage() {
    const cartNode = document.getElementById("checkout-cart-items");
    const totalNode = document.getElementById("checkout-total");
    const form = document.getElementById("checkout-form");
    const statusNode = document.getElementById("checkout-status");
    const placeOrderBtn = document.getElementById("place-order-btn");

    if (!cartNode || !totalNode || !form) {
      return;
    }

    // We handle validation and messaging ourselves for a smoother demo flow.
    form.noValidate = true;

    function getCartItemsSafe() {
      return window.CartAPI && typeof window.CartAPI.getItems === "function"
        ? window.CartAPI.getItems()
        : [];
    }

    function getCartTotalSafe() {
      return window.CartAPI && typeof window.CartAPI.getTotal === "function"
        ? window.CartAPI.getTotal()
        : 0;
    }

    function paintOrder() {
      const items = getCartItemsSafe();
      const total = getCartTotalSafe();
      totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        // Keep the button enabled so we can show a clear message on submit.
        placeOrderBtn.disabled = false;
        if (statusNode) {
          statusNode.textContent = "Your cart is empty. Please add products first.";
        }
        return;
      }

      placeOrderBtn.disabled = false;
      if (statusNode) {
        statusNode.textContent = "";
      }
      cartNode.innerHTML = items
        .map(function (item) {
          return (
            '<div class="checkout-item">' +
            "<span>" + item.name + " x " + item.qty + "</span>" +
            "<strong>" + (window.formatInr ? window.formatInr(item.price * item.qty) : "INR " + item.price * item.qty) + "</strong>" +
            "</div>"
          );
        })
        .join("");
    }

    paintOrder();

    const pincodeInput = form.querySelector("#pincode");
    if (pincodeInput) {
      pincodeInput.addEventListener("input", function (e) {
        e.target.value = String(e.target.value || "")
          .replace(/\D/g, "")
          .slice(0, 6);
      });
    }

    const phoneInput = form.querySelector("#phone");
    if (phoneInput) {
      phoneInput.addEventListener("input", function (e) {
        e.target.value = String(e.target.value || "")
          .replace(/\D/g, "")
          .slice(0, 10);
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const items = getCartItemsSafe();
      if (!items.length) {
        if (statusNode) {
          statusNode.textContent = "Your cart is empty. Please add products first.";
        }
        return;
      }

      // Validate required fields
      const address = form.address ? form.address.value.trim() : "";

      if (!address) {
        if (statusNode) {
          statusNode.textContent = "Please enter your address.";
        }
        return;
      }

      // Store address details in sessionStorage for next steps
      const addressData = {
        fullName: String(form.fullName ? form.fullName.value : "").trim(),
        phone: String(form.phone ? form.phone.value : "")
          .trim()
          .replace(/\D/g, "")
          .slice(0, 10),
        email: String(form.email ? form.email.value : "").trim(),
        address: address,
        city: form.city ? form.city.value.trim() : "",
        state: form.state ? form.state.value.trim() : "",
        pincode: String(form.pincode ? form.pincode.value : "")
          .trim()
          .replace(/\D/g, "")
          .slice(0, 6),
        cartItems: items,
        orderTotal: getCartTotalSafe(),
        placedAt: new Date().toLocaleString()
      };

      sessionStorage.setItem("addressData", JSON.stringify(addressData));

      placeOrderBtn.disabled = true;
      const nextHref = "customer-details.html";

      function buildMailto() {
        const to = "support@indicart.store";
        const subject = "Indicart Step 1 (Address) - " + (addressData.fullName || "Customer");
        const lines = [];
        lines.push("INDICART - STEP 1 (ADDRESS)");
        lines.push("");
        lines.push("Name: " + (addressData.fullName || "-"));
        lines.push("Phone: " + (addressData.phone || "-"));
        lines.push("Email: " + (addressData.email || "Not provided"));
        lines.push("");
        lines.push("Address: " + (addressData.address || "-"));
        lines.push("City: " + (addressData.city || "-"));
        lines.push("State: " + (addressData.state || "-"));
        lines.push("Pincode: " + (addressData.pincode || "-"));
        lines.push("Placed At: " + (addressData.placedAt || "-"));
        lines.push("");
        lines.push("Order Items:");
        (addressData.cartItems || []).forEach(function (item) {
          const name = item && item.name ? item.name : "Product";
          const qty = item && item.qty ? item.qty : 1;
          const price = item && item.price ? item.price : 0;
          lines.push(name + " x " + qty + " = INR " + qty * price);
        });
        lines.push("");
        lines.push("Order Total: INR " + (typeof addressData.orderTotal === "number" ? addressData.orderTotal : 0));
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

      function continueLinks(message) {
        const mailto = buildMailto();
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

      statusNode.textContent = "Sending step 1 to email...";
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
        body: JSON.stringify({
          step: 1,
          addressData: {
            fullName: addressData.fullName,
            phone: addressData.phone,
            email: addressData.email,
            address: addressData.address,
            city: addressData.city,
            state: addressData.state,
            pincode: addressData.pincode
          },
          items: addressData.cartItems,
          total: addressData.orderTotal,
          timestamp: addressData.placedAt
        }),
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
            statusNode.textContent = "Step 1 sent. Redirecting...";
            setTimeout(function () {
              window.location.href = nextHref;
            }, 600);
            return;
          }
          const msg = (result && result.message) || "Email could not be sent.";
          continueLinks(msg);
          placeOrderBtn.disabled = false;
        })
        .catch(function (error) {
          window.clearTimeout(timeoutId);
          const msg = error && error.message ? error.message : "Email could not be sent.";
          continueLinks(msg);
          placeOrderBtn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderFeatured();
    renderProductsPage();
    renderProductDetail();
    renderCheckoutPage();
  });
})();
