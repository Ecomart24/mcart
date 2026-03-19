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
      '<span class="old-price">' + window.formatInr(product.oldPrice) + "</span>" +
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
      '<span class="old-price">' + window.formatInr(product.oldPrice) + "</span>" +
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

    function paintOrder() {
      const items = window.CartAPI.getItems();
      const total = window.CartAPI.getTotal();
      totalNode.textContent = window.formatInr(total);

      if (!items.length) {
        cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
        placeOrderBtn.disabled = true;
        return;
      }

      placeOrderBtn.disabled = false;
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

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const items = window.CartAPI.getItems();
      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      // Validate required fields
      const address = form.address.value.trim();

      if (!address) {
        statusNode.textContent = "Please fill in all required fields.";
        return;
      }

      // Store address details in sessionStorage for next steps
      const addressData = {
        address: address,
        city: form.city.value.trim(),
        state: form.state.value.trim(),
        pincode: form.pincode.value.trim(),
        cartItems: items,
        orderTotal: window.CartAPI.getTotal(),
        placedAt: new Date().toLocaleString()
      };

      sessionStorage.setItem("addressData", JSON.stringify(addressData));

      placeOrderBtn.disabled = true;
      statusNode.textContent = "Address saved. Redirecting...";
      setTimeout(function () {
        window.location.href = "customer-details.html";
      }, 500);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderFeatured();
    renderProductsPage();
    renderProductDetail();
    renderCheckoutPage();
  });
})();
