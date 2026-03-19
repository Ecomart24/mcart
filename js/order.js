(function () {
  // Paste your Google Form "Embed HTML" iframe src here:
  // Example: "https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true"
  var GOOGLE_FORM_EMBED_URL = "";

  function buildOrderSummary(items, total) {
    var lines = [];
    lines.push("MCART ORDER SUMMARY");
    lines.push("");
    (items || []).forEach(function (item) {
      var name = item && item.name ? item.name : "Product";
      var qty = item && item.qty ? item.qty : 1;
      var price = item && item.price ? item.price : 0;
      lines.push(name + " x " + qty + " = INR " + (qty * price));
    });
    lines.push("");
    lines.push("TOTAL: INR " + total);
    return lines.join("\n");
  }

  function renderOrderPage() {
    var cartNode = document.getElementById("order-cart-items");
    var totalNode = document.getElementById("order-total");
    var copyBtn = document.getElementById("copy-order-btn");
    var statusNode = document.getElementById("order-status");
    var iframe = document.getElementById("google-form-iframe");

    if (!cartNode || !totalNode || !copyBtn || !statusNode || !iframe) {
      return;
    }

    var items = window.CartAPI && window.CartAPI.getItems ? window.CartAPI.getItems() : [];
    var total = window.CartAPI && window.CartAPI.getTotal ? window.CartAPI.getTotal() : 0;

    totalNode.textContent = window.formatInr ? window.formatInr(total) : "INR " + total;

    if (!items.length) {
      cartNode.innerHTML = '<p class="empty-note">No products in cart.</p>';
      statusNode.textContent = "Add products to cart first.";
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
      statusNode.textContent = "";
    }

    // Load the Google Form if configured.
    if (GOOGLE_FORM_EMBED_URL && GOOGLE_FORM_EMBED_URL.indexOf("docs.google.com/forms") !== -1) {
      iframe.src = GOOGLE_FORM_EMBED_URL;
    } else {
      iframe.classList.add("is-empty");
      iframe.src = "about:blank";
      statusNode.textContent = "Google Form link not set yet.";
    }

    copyBtn.addEventListener("click", function () {
      var text = buildOrderSummary(items, total);
      if (!items.length) {
        statusNode.textContent = "Your cart is empty.";
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () {
            statusNode.textContent = "Order summary copied.";
          })
          .catch(function () {
            statusNode.textContent = "Copy failed. Please copy manually.";
          });
        return;
      }

      // Fallback copy
      var textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        statusNode.textContent = "Order summary copied.";
      } catch (e) {
        statusNode.textContent = "Copy failed. Please copy manually.";
      }
      document.body.removeChild(textarea);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderOrderPage();
  });
})();

