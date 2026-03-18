(function () {
  const CART_KEY = "mcart_cart_v1";
  const cartDrawer = document.querySelector(".cart-drawer");
  const cartOverlay = document.querySelector(".cart-overlay");
  const cartItemsNode = document.getElementById("cart-items");
  const cartTotalNode = document.getElementById("cart-total");
  const toast = document.getElementById("toast");
  let cart = [];

  function parseQty(value) {
    const qty = Number(value);
    if (!Number.isFinite(qty) || qty < 1) {
      return 1;
    }
    return Math.floor(qty);
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      cart = raw ? JSON.parse(raw) : [];
    } catch (error) {
      cart = [];
    }
  }

  function getProduct(id) {
    return (window.PRODUCTS || []).find(function (product) {
      return product.id === id;
    });
  }

  function getItems() {
    return cart
      .map(function (item) {
        const product = getProduct(item.id);
        if (!product) {
          return null;
        }
        return {
          id: product.id,
          name: product.name,
          qty: item.qty,
          price: product.price
        };
      })
      .filter(Boolean);
  }

  function getTotal() {
    return getItems().reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  function getCount() {
    return getItems().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function showToast(message) {
    if (!toast) {
      return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(function () {
      toast.classList.remove("show");
    }, 1400);
  }

  function updateCartCount() {
    document.querySelectorAll("[data-cart-count]").forEach(function (node) {
      node.textContent = String(getCount());
    });
  }

  function renderCart() {
    if (!cartItemsNode || !cartTotalNode) {
      return;
    }

    const items = getItems();
    if (!items.length) {
      cartItemsNode.innerHTML = '<p class="empty-note">Your cart is empty.</p>';
    } else {
      cartItemsNode.innerHTML = items
        .map(function (item) {
          return (
            '<div class="cart-item">' +
            "<h4>" + item.name + "</h4>" +
            '<div class="cart-item-row">' +
            '<div class="qty-controls">' +
            '<button type="button" data-cart-action="decrease" data-product-id="' + item.id + '">-</button>' +
            "<span>" + item.qty + "</span>" +
            '<button type="button" data-cart-action="increase" data-product-id="' + item.id + '">+</button>' +
            "</div>" +
            "<strong>" + window.formatInr(item.qty * item.price) + "</strong>" +
            "</div>" +
            '<div class="cart-item-row">' +
            '<button class="remove-btn" type="button" data-cart-action="remove" data-product-id="' + item.id + '">Remove</button>' +
            "</div>" +
            "</div>"
          );
        })
        .join("");
    }

    cartTotalNode.textContent = window.formatInr(getTotal());
    updateCartCount();
  }

  function openCart() {
    if (!cartDrawer || !cartOverlay) {
      return;
    }
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
  }

  function closeCart() {
    if (!cartDrawer || !cartOverlay) {
      return;
    }
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
  }

  function addToCart(id, qty) {
    const parsedQty = parseQty(qty);
    const existing = cart.find(function (item) {
      return item.id === id;
    });

    if (existing) {
      existing.qty += parsedQty;
    } else {
      cart.push({ id: id, qty: parsedQty });
    }

    saveCart();
    renderCart();
    showToast("Added to cart");
  }

  function updateQty(id, delta) {
    const existing = cart.find(function (item) {
      return item.id === id;
    });
    if (!existing) {
      return;
    }
    existing.qty += delta;
    if (existing.qty <= 0) {
      cart = cart.filter(function (item) {
        return item.id !== id;
      });
    }
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(function (item) {
      return item.id !== id;
    });
    saveCart();
    renderCart();
  }

  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }

  function readQtyFromButton(button) {
    const inputId = button.getAttribute("data-qty-input");
    if (!inputId) {
      return 1;
    }
    const input = document.getElementById(inputId);
    if (!input) {
      return 1;
    }
    return parseQty(input.value);
  }

  function bindUi() {
    document.querySelectorAll("[data-open-cart]").forEach(function (button) {
      button.addEventListener("click", function () {
        openCart();
      });
    });

    document.querySelectorAll("[data-close-cart]").forEach(function (button) {
      button.addEventListener("click", function () {
        closeCart();
      });
    });

    document.body.addEventListener("click", function (event) {
      const addButton = event.target.closest("[data-add-to-cart]");
      if (addButton) {
        const productId = addButton.getAttribute("data-add-to-cart");
        const qty = readQtyFromButton(addButton);
        if (productId) {
          addToCart(productId, qty);
          openCart();
        }
      }

      const buyButton = event.target.closest("[data-buy-now]");
      if (buyButton) {
        const productId = buyButton.getAttribute("data-buy-now");
        const qty = readQtyFromButton(buyButton);
        if (productId) {
          addToCart(productId, qty);
        }
        window.location.href = "checkout.html";
      }

      const checkoutLink = event.target.closest("[data-checkout-link]");
      if (checkoutLink) {
        window.location.href = "checkout.html";
      }

      const cartActionButton = event.target.closest("[data-cart-action]");
      if (cartActionButton) {
        const action = cartActionButton.getAttribute("data-cart-action");
        const productId = cartActionButton.getAttribute("data-product-id");
        if (!productId) {
          return;
        }
        if (action === "increase") {
          updateQty(productId, 1);
        }
        if (action === "decrease") {
          updateQty(productId, -1);
        }
        if (action === "remove") {
          removeFromCart(productId);
        }
      }
    });
  }

  window.CartAPI = {
    getItems: getItems,
    getTotal: getTotal,
    getCount: getCount,
    addToCart: addToCart,
    clearCart: clearCart,
    refresh: renderCart
  };

  loadCart();
  bindUi();
  renderCart();
})();
