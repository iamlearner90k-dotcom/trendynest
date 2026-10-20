"use strict";

const WHATSAPP_NUMBER = "8801995461220";

const initialProducts = [
  {
    id: 1,
    name: "Classic Oversized Shirt",
    price: 850,
    category: "fashion",
    tag: "BESTSELLER",
    emoji: "👕",
    color: "#f9dce9",
    image: "images/oversized-shirt.jpg",
    gallery: [
      "images/oversized-shirt.jpg",
      "images/tote-bag.jpg",
      "images/necklace.jpg"
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White", "Pink"],
    description: "A relaxed fit for everyday comfort made from 100% breathable cotton.",
    stock: 10,
    reviews: [
      { rating: 5, comment: "Amazing quality shirt! Very comfortable.", name: "Anik" },
      { rating: 4, comment: "Looks great, nice color.", name: "Sumi" }
    ]
  },
  {
    id: 2,
    name: "Everyday Earrings",
    price: 350,
    category: "accessories",
    tag: "TRENDING",
    emoji: "💎",
    color: "#fce8cf",
    image: "images/earrings.jpg",
    gallery: ["images/earrings.jpg", "images/necklace.jpg"],
    sizes: ["One Size"],
    colors: ["Gold", "Silver"],
    description: "A little sparkle for your everyday look.",
    stock: 15,
    reviews: [{ rating: 5, comment: "So pretty!", name: "Nabila" }]
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    price: 1250,
    category: "tech",
    tag: "POPULAR",
    emoji: "🎧",
    color: "#e0e5f8",
    image: "images/earbuds.jpg",
    gallery: ["images/earbuds.jpg", "images/phone-accessories.jpg"],
    sizes: ["Standard"],
    colors: ["White", "Black"],
    description: "Your favourite sounds, wherever you go with noise isolation.",
    stock: 3,
    reviews: [{ rating: 5, comment: "Sound quality is awesome for this price.", name: "Tanvir" }]
  },
  {
    id: 4,
    name: "Aesthetic Desk Lamp",
    price: 950,
    category: "home",
    tag: "NEW",
    emoji: "💡",
    color: "#f8e5b8",
    image: "images/desk-lamp.jpg",
    gallery: ["images/desk-lamp.jpg"],
    sizes: ["Medium"],
    colors: ["Warm White", "Cold White"],
    description: "A cosy touch for your workspace with warm LED light.",
    stock: 8,
    reviews: []
  },
  {
    id: 5,
    name: "Everyday Tote Bag",
    price: 550,
    category: "fashion",
    tag: "EVERYDAY",
    emoji: "👜",
    color: "#e8ddcc",
    image: "images/tote-bag.jpg",
    gallery: ["images/tote-bag.jpg", "images/oversized-shirt.jpg"],
    sizes: ["Standard"],
    colors: ["Beige", "Black"],
    description: "Carry your essentials in style.",
    stock: 12,
    reviews: []
  },
  {
    id: 6,
    name: "Minimal Necklace",
    price: 450,
    category: "accessories",
    tag: "FAVOURITE",
    emoji: "📿",
    color: "#f7dce7",
    image: "images/necklace.jpg",
    gallery: ["images/necklace.jpg", "images/earrings.jpg"],
    sizes: ["Free Size"],
    colors: ["Rose Gold", "Silver"],
    description: "A delicate detail to complete your look.",
    stock: 0,
    reviews: []
  },
  {
    id: 7,
    name: "Phone Accessories",
    price: 300,
    category: "tech",
    tag: "TRENDING",
    emoji: "📱",
    color: "#dcebf4",
    image: "images/phone-accessories.jpg",
    gallery: ["images/phone-accessories.jpg"],
    sizes: ["Universal"],
    colors: ["Transparent", "Black"],
    description: "Useful little upgrades for your phone.",
    stock: 2,
    reviews: []
  },
  {
    id: 8,
    name: "Reusable Water Bottle",
    price: 400,
    category: "home",
    tag: "DAILY PICK",
    emoji: "🥤",
    color: "#d9eee7",
    image: "images/water-bottle.jpg",
    gallery: ["images/water-bottle.jpg"],
    sizes: ["750ml", "1000ml"],
    colors: ["Mint Green", "Sky Blue"],
    description: "A handy companion for your daily routine.",
    stock: 7,
    reviews: []
  }
];

let products = initialProducts;
let orderHistory = JSON.parse(localStorage.getItem("trendynest_order_history")) || [];
let cart = JSON.parse(localStorage.getItem("trendynest_cart")) || {}; 
let wishlist = JSON.parse(localStorage.getItem("trendynest_wishlist")) || [];

let currentUser = JSON.parse(localStorage.getItem("trendynest_current_user")) || null;
let registeredUsers = JSON.parse(localStorage.getItem("trendynest_users")) || [];

let searchQuery = "";
let activeCategory = "all";
let currentSort = "default";
let maxPriceFilter = 3000;
let discountAmount = 0;
let appliedCouponCode = "";
let toastTimer;

const savedTheme = localStorage.getItem("trendynest_theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

const DELIVERY_FEES = {
  inside_dhaka: 50,
  outside_dhaka: 120
};

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const floatingCartCount = document.getElementById("floating-cart-count");
const cartItemsElement = document.getElementById("cart-items");
const cartSubtotalElement = document.getElementById("cart-subtotal");
const cartPanel = document.getElementById("floating-cart-panel");
const checkoutSection = document.getElementById("checkout-section");
const checkoutItemsElement = document.getElementById("checkout-items");
const checkoutForm = document.getElementById("order-form");
const deliveryArea = document.getElementById("delivery-area");
const toastElement = document.getElementById("toast");

function money(amount) {
  return "৳" + Number(amount).toLocaleString("en-BD");
}

function saveProductsToStorage() {
  localStorage.setItem("trendynest_products", JSON.stringify(products));
}

function saveOrdersToStorage() {
  localStorage.setItem("trendynest_order_history", JSON.stringify(orderHistory));
}

function saveWishlistToStorage() {
  localStorage.setItem("trendynest_wishlist", JSON.stringify(wishlist));
}

function getCartCount() {
  return Object.values(cart).reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function getSubtotal() {
  return Object.values(cart).reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getDeliveryFee() {
  return DELIVERY_FEES[deliveryArea.value] ?? DELIVERY_FEES.inside_dhaka;
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2400);
}

function getAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
  return { avg: Number((sum / reviews.length).toFixed(1)), count: reviews.length };
}

// মোবাইল মেনু টগল (থ্রি-লাইন ক্লিক ইভেন্ট)
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinksContainer = document.getElementById("navLinks");
if (mobileMenuBtn && navLinksContainer) {
  mobileMenuBtn.addEventListener("click", () => {
    navLinksContainer.classList.toggle("mobile-active");
  });

  navLinksContainer.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinksContainer.classList.remove("mobile-active");
    });
  });
}

// মোবাইলের ড্রপডাউন থেকে এডমিন প্যানেল খোলার ফাংশন
window.toggleAdminPanelMobile = function() {
  if (navLinksContainer) navLinksContainer.classList.remove("mobile-active");
  const toggleAdminBtn = document.getElementById("toggle-admin-btn");
  if (toggleAdminBtn) toggleAdminBtn.click();
};

// ১00% ফিক্সড: ডায়রেক্ট PDF ইনভয়েস ডাউনলোড ফাংশন
window.downloadPDFInvoice = function() {
  const element = document.getElementById("printable-receipt");
  const orderIdEl = document.getElementById("receipt-order-id");
  const orderId = orderIdEl ? orderIdEl.textContent.trim() : "Invoice";
  
  if (!element) {
    showToast("❌ Receipt not found!");
    return;
  }

  showToast("📄 Downloading PDF...");

  const opt = {
    margin:       0.3,
    filename:     `Invoice_${orderId}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    showToast("✅ PDF Downloaded!");
  }).catch((err) => {
    console.error(err);
    showToast("❌ Download Failed!");
  });
};

// স্টক আউট নোটিফিকেশন
window.requestStockNotification = function(productId) {
  const email = prompt("Enter your email address to get notified when this item is back in stock:");
  if (email && email.includes("@")) {
    showToast("🔔 Thank you! We will email you once back in stock.");
  } else if (email) {
    showToast("❌ Invalid email address!");
  }
};

// লাইভ অর্ডার ট্র্যাকিং
const trackOrderForm = document.getElementById("track-order-form");
if (trackOrderForm) {
  trackOrderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputVal = document.getElementById("track-order-id-input").value.trim().toUpperCase();
    const resultContainer = document.getElementById("track-result-container");

    const foundOrder = orderHistory.find(o => o.id.toUpperCase() === inputVal);

    resultContainer.style.display = "block";

    if (!foundOrder) {
      resultContainer.innerHTML = `
        <div style="background: #fce8e6; color: #c0392b; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold;">
          ❌ Order not found! Please check your Order ID (e.g. #TN-123456).
        </div>
      `;
      return;
    }

    let statusColor = "#f39c12";
    let statusIcon = "⏳";
    let progressWidth = "30%";

    if (foundOrder.status === "Processing") {
      statusColor = "#3498db";
      statusIcon = "📦";
      progressWidth = "65%";
    } else if (foundOrder.status === "Delivered") {
      statusColor = "#27ae60";
      statusIcon = "✅";
      progressWidth = "100%";
    }

    resultContainer.innerHTML = `
      <div style="border: 2px solid ${statusColor}; border-radius: 12px; padding: 20px; background: var(--bg);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px dashed var(--border); padding-bottom: 10px; margin-bottom: 15px;">
          <div>
            <h3 style="margin:0; font-size:18px;">Order ${foundOrder.id}</h3>
            <small style="color:var(--muted);">Placed on: ${foundOrder.date}</small>
          </div>
          <span style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 50px; font-weight: bold; font-size: 13px;">
            ${statusIcon} ${foundOrder.status}
          </span>
        </div>

        <div style="background: var(--border); height: 8px; border-radius: 10px; overflow: hidden; margin-bottom: 15px;">
          <div style="background: ${statusColor}; height: 100%; width: ${progressWidth}; transition: width 0.5s ease;"></div>
        </div>

        <div style="font-size: 13px; display:flex; flex-direction:column; gap:5px;">
          <p style="margin:0;"><strong>Customer:</strong> ${foundOrder.customerName} (${foundOrder.phone})</p>
          <p style="margin:0;"><strong>Address:</strong> ${foundOrder.address}</p>
          <p style="margin:0;"><strong>Items:</strong> ${foundOrder.itemsSummary}</p>
          <p style="margin:0; font-size:15px; color:var(--pink); font-weight:bold; margin-top:5px;">Total: ${money(foundOrder.total)}</p>
        </div>
      </div>
    `;
  });
}

// সোশ্যাল শেয়ার
window.shareProduct = function(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const shareText = `Check out ${prod.name} on TrendyNest for ${money(prod.price)}! 🛍️`;
  const shareUrl = window.location.href;

  if (navigator.share) {
    navigator.share({
      title: prod.name,
      text: shareText,
      url: shareUrl
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    showToast("🔗 Product link copied to clipboard!");
  }
};

// হিরো ব্যানার স্লাইডার
let currentSlideIndex = 0;
const totalSlides = 3;

window.nextSlide = function() {
  currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
  updateSliderPosition();
};

window.prevSlide = function() {
  currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
  updateSliderPosition();
};

function updateSliderPosition() {
  const sliderContainer = document.getElementById("hero-slider-container");
  if (sliderContainer) {
    sliderContainer.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  }
}

setInterval(() => { nextSlide(); }, 5000);

// লাইভ চ্যাট উইজেট
window.openChatBox = function() { document.getElementById("chat-box-panel").style.display = "flex"; };
window.closeChatBox = function() { document.getElementById("chat-box-panel").style.display = "none"; };
window.toggleChatBox = function() {
  const panel = document.getElementById("chat-box-panel");
  panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "flex" : "none";
};

window.sendChatMessage = function(event) {
  event.preventDefault();
  const inputEl = document.getElementById("chat-user-input");
  const messagesArea = document.getElementById("chat-messages-area");
  const text = inputEl.value.trim();

  if (!text) return;

  messagesArea.innerHTML += `<div style="background: var(--pink); color: white; padding: 8px 12px; border-radius: 8px; max-width: 80%; align-self: flex-end;">${text}</div>`;
  inputEl.value = "";
  messagesArea.scrollTop = messagesArea.scrollHeight;

  setTimeout(() => {
    messagesArea.innerHTML += `<div style="background: var(--light-pink); padding: 8px 12px; border-radius: 8px; max-width: 80%;">Thank you for your message! Our team will connect with you soon. 🛒</div>`;
    messagesArea.scrollTop = messagesArea.scrollHeight;
  }, 1000);
};

// অথেন্টিকেশন
function updateHeaderUserUI() {
  const usernameSpan = document.getElementById("header-username");
  if (usernameSpan) {
    usernameSpan.textContent = currentUser ? currentUser.name.split(" ")[0] : "Login";
  }
}

window.openAuthModal = function() {
  const modal = document.getElementById("auth-modal");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const profileView = document.getElementById("user-profile-view");
  const tabsHeader = document.getElementById("auth-tabs-header");

  if (currentUser) {
    loginForm.style.display = "none";
    signupForm.style.display = "none";
    profileView.style.display = "block";
    if (tabsHeader) tabsHeader.style.display = "none";
    
    document.getElementById("profile-name").textContent = currentUser.name;
    document.getElementById("profile-email").textContent = currentUser.email;
    document.getElementById("profile-avatar").textContent = currentUser.name.charAt(0).toUpperCase();
  } else {
    if (tabsHeader) tabsHeader.style.display = "flex";
    profileView.style.display = "none";
    loginForm.style.display = "flex";
    signupForm.style.display = "none";
  }

  modal.hidden = false;
  modal.style.display = "flex";
};

window.closeAuthModal = function() {
  const modal = document.getElementById("auth-modal");
  modal.hidden = true;
  modal.style.display = "none";
};

window.switchAuthMode = function(mode) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  if (mode === "signup") {
    loginForm.style.display = "none";
    signupForm.style.display = "flex";
  } else {
    loginForm.style.display = "flex";
    signupForm.style.display = "none";
  }
};

const signupFormEl = document.getElementById("signup-form");
if (signupFormEl) {
  signupFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value.trim();

    if (registeredUsers.find(u => u.email === email)) {
      showToast("❌ Email already registered!");
      return;
    }

    const newUser = { name, email, password };
    registeredUsers.push(newUser);
    localStorage.setItem("trendynest_users", JSON.stringify(registeredUsers));

    currentUser = newUser;
    localStorage.setItem("trendynest_current_user", JSON.stringify(currentUser));

    updateHeaderUserUI();
    closeAuthModal();
    signupFormEl.reset();
    showToast(`🎉 Account created! Welcome, ${name}`);
  });
}

const loginFormEl = document.getElementById("login-form");
if (loginFormEl) {
  loginFormEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value.trim();

    const user = registeredUsers.find(u => u.email === email && u.password === password);
    if (!user) {
      showToast("❌ Invalid email or password!");
      return;
    }

    currentUser = user;
    localStorage.setItem("trendynest_current_user", JSON.stringify(currentUser));

    updateHeaderUserUI();
    closeAuthModal();
    loginFormEl.reset();
    showToast(`👋 Welcome back, ${user.name}!`);
  });
}

window.logoutUser = function() {
  currentUser = null;
  localStorage.removeItem("trendynest_current_user");
  updateHeaderUserUI();
  closeAuthModal();
  showToast("🔒 Logged out successfully.");
};

// থিম টগল
const themeToggleBtn = document.getElementById("theme-toggle-btn");
if (themeToggleBtn) {
  themeToggleBtn.textContent = savedTheme === "dark" ? "☀️" : "🌙";
  themeToggleBtn.addEventListener("click", () => {
    let theme = document.documentElement.getAttribute("data-theme");
    let nextTheme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("trendynest_theme", nextTheme);
    themeToggleBtn.textContent = nextTheme === "dark" ? "☀️" : "🌙";
  });
}

// উইশলিস্ট
window.toggleWishlist = function(productId) {
  const pId = Number(productId);
  const index = wishlist.indexOf(pId);

  if (index > -1) {
    wishlist.splice(index, 1);
    showToast("Removed from Wishlist!");
  } else {
    wishlist.push(pId);
    showToast("Added to Wishlist! ❤️");
  }

  saveWishlistToStorage();
  updateWishlistCount();
  renderProducts();
  renderWishlistModal();
};

function updateWishlistCount() {
  const countEl = document.getElementById("wishlist-count");
  if (countEl) countEl.textContent = wishlist.length;
}

function renderWishlistModal() {
  const wishlistItemsEl = document.getElementById("wishlist-items-list");
  if (!wishlistItemsEl) return;

  if (wishlist.length === 0) {
    wishlistItemsEl.innerHTML = "<p style='text-align:center; color:var(--muted); padding:20px;'>Your wishlist is empty! ❤️</p>";
    return;
  }

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  wishlistItemsEl.innerHTML = wishedProducts.map(p => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px solid var(--border);">
      <div>
        <strong>${p.name}</strong>
        <div style="font-size:13px; color:var(--pink); font-weight:bold;">${money(p.price)}</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button type="button" onclick="openProductDetailsModal(${p.id})" style="background:var(--pink); color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">View Options</button>
        <button type="button" onclick="toggleWishlist(${p.id})" style="background:none; border:1px solid var(--border); color:var(--dark); padding:6px 10px; border-radius:6px; cursor:pointer;">🗑️</button>
      </div>
    </div>
  `).join("");
}

window.openWishlistModal = function() {
  renderWishlistModal();
  const modal = document.getElementById("wishlist-modal");
  if (modal) { modal.hidden = false; modal.style.display = "flex"; }
};

window.closeWishlistModal = function() {
  const modal = document.getElementById("wishlist-modal");
  if (modal) { modal.hidden = true; modal.style.display = "none"; }
};

// প্রোডাক্ট মোডাল
window.openProductDetailsModal = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const isOutOfStock = product.stock <= 0;
  const ratingData = getAverageRating(product.reviews);
  const isWished = wishlist.includes(product.id);
  const galleryList = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  let stockBadgeHTML = `<span style="color:green; font-weight:bold;">In Stock (${product.stock} items)</span>`;
  if (isOutOfStock) {
    stockBadgeHTML = `<span style="color:red; font-weight:bold;">Out of Stock</span>`;
  } else if (product.stock <= 5) {
    stockBadgeHTML = `<span style="background: #e74c3c; color: white; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">⚡ Hurry! Only ${product.stock} left in stock!</span>`;
  }

  const container = document.getElementById("product-details-content");
  container.innerHTML = `
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="flex: 1; min-width: 220px; text-align: center;">
        <div style="background: ${product.color}; border-radius: 12px; display: flex; align-items: center; justify-content: center; min-height: 220px; font-size: 60px; padding: 10px;">
          <img id="main-gallery-img" src="${product.image}" alt="${product.name}" style="max-width: 100%; max-height: 220px; object-fit: contain;">
        </div>
        
        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px; overflow-x: auto; padding: 4px;">
          ${galleryList.map((imgUrl, index) => `
            <img src="${imgUrl}" onclick="switchMainModalImage('${imgUrl}')" style="width: 50px; height: 50px; border-radius: 8px; border: 2px solid ${index === 0 ? 'var(--pink)' : 'var(--border)'}; object-fit: cover; cursor: pointer;">
          `).join("")}
        </div>
      </div>

      <div style="flex: 1.2; min-width: 240px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <span style="background: var(--light-pink); color: var(--pink); font-size: 11px; font-weight: 800; padding: 4px 8px; border-radius: 4px;">${product.tag}</span>
          <h2 style="margin: 10px 0 5px; font-size: 22px;">${product.name}</h2>
          <p style="margin: 0 0 10px; color: #f39c12; font-size: 13px;">⭐ ${ratingData.avg > 0 ? ratingData.avg : 'No'} (${ratingData.count} reviews)</p>
          <p style="font-size: 22px; font-weight: 900; color: var(--pink); margin-bottom: 10px;">${money(product.price)}</p>
          <p style="font-size: 13px; color: var(--muted); margin-bottom: 15px;">${product.description}</p>
          
          <div style="margin-bottom: 12px;">
            <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">SELECT SIZE:</label>
            <select id="modal-size-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--dark); font-weight: bold;">
              ${(product.sizes || ["Standard"]).map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>

          <div style="margin-bottom: 15px;">
            <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">SELECT COLOR:</label>
            <select id="modal-color-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--bg); color: var(--dark); font-weight: bold;">
              ${(product.colors || ["Default"]).map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
          </div>

          <p style="font-size: 12px; margin-bottom: 15px;"><strong>Availability:</strong> ${stockBadgeHTML}</p>
        </div>

        <div style="display: flex; gap: 10px;">
          ${isOutOfStock ? `
            <button type="button" onclick="requestStockNotification(${product.id})" class="primary-button" style="flex: 1; padding: 10px; background: #e67e22;">🔔 Notify Me When Available</button>
          ` : `
            <button type="button" onclick="addVariantToCart(${product.id})" class="primary-button" style="flex: 1; padding: 10px;">+ Add to Bag</button>
          `}
          <button type="button" onclick="toggleWishlist(${product.id}); openProductDetailsModal(${product.id});" style="padding: 10px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--dark); cursor: pointer;">${isWished ? '❤️' : '🤍'}</button>
          <button type="button" onclick="shareProduct(${product.id})" style="padding: 10px 14px; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--dark); cursor: pointer; font-weight: bold;" title="Share Product">🔗 Share</button>
        </div>
      </div>
    </div>
  `;

  const modal = document.getElementById("product-details-modal");
  modal.hidden = false;
  modal.style.display = "flex";
};

window.switchMainModalImage = function(newSrc) {
  const mainImg = document.getElementById("main-gallery-img");
  if (mainImg) mainImg.src = newSrc;
};

window.closeProductDetailsModal = function() {
  const modal = document.getElementById("product-details-modal");
  modal.hidden = true;
  modal.style.display = "none";
};

window.addVariantToCart = function(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const selectedSize = document.getElementById("modal-size-select") ? document.getElementById("modal-size-select").value : "Standard";
  const selectedColor = document.getElementById("modal-color-select") ? document.getElementById("modal-color-select").value : "Default";

  const itemKey = `${productId}_${selectedSize}_${selectedColor}`;

  if (!cart[itemKey]) {
    cart[itemKey] = {
      productId,
      size: selectedSize,
      color: selectedColor,
      quantity: 0
    };
  }

  if (cart[itemKey].quantity + 1 > product.stock) {
    showToast(`Sorry! Limit reached. Only ${product.stock} items in stock.`);
    return;
  }

  cart[itemKey].quantity += 1;
  updateCart();
  closeProductDetailsModal();
  showToast(`${product.name} (${selectedSize} / ${selectedColor}) added to bag!`);
};

function renderProducts() {
  let filtered = [...products];

  if (activeCategory !== "all") {
    filtered = filtered.filter(product => product.category === activeCategory);
  }

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(q) || 
      product.description.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q)
    );
  }

  filtered = filtered.filter(product => product.price <= maxPriceFilter);

  if (currentSort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating-high") {
    filtered.sort((a, b) => getAverageRating(b.reviews).avg - getAverageRating(a.reviews).avg);
  }

  if (filtered.length === 0) {
    productGrid.innerHTML = '<p class="cart-empty" style="grid-column: 1 / -1; padding: 40px;">No products found matching your filters.</p>';
    return;
  }

  productGrid.innerHTML = filtered.map(product => {
    const isOutOfStock = product.stock <= 0;
    
    let stockBadge = `<span style="color: #27ae60; font-size: 12px; font-weight: 600;">Stock: ${product.stock}</span>`;
    if (isOutOfStock) {
      stockBadge = `<span style="background: #e74c3c; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">Out of Stock</span>`;
    } else if (product.stock <= 5) {
      stockBadge = `<span style="background: #e67e22; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">Only ${product.stock} left! ⚡</span>`;
    }

    const ratingData = getAverageRating(product.reviews);
    const ratingDisplay = ratingData.count > 0 
      ? `<span style="color: #f39c12; font-size: 13px;">⭐ ${ratingData.avg} (${ratingData.count})</span>`
      : `<span style="color: var(--muted); font-size: 12px;">No reviews yet</span>`;

    const isWished = wishlist.includes(product.id);
    const heartIcon = isWished ? "❤️" : "🤍";

    return `
      <article class="product-card">
        <div class="product-image" style="background:${product.color}; cursor:pointer;" onclick="openProductDetailsModal(${product.id})">
          <small>${product.tag}</small>
          <button type="button" onclick="event.stopPropagation(); toggleWishlist(${product.id});" style="position: absolute; top: 10px; right: 10px; background: var(--card-bg); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" title="Wishlist">
            ${heartIcon}
          </button>
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
          <span class="product-fallback" style="display:none">${product.emoji}</span>
        </div>
        <div class="product-info">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
            <p class="product-category" style="margin:0;">${product.category} • ${stockBadge}</p>
            ${ratingDisplay}
          </div>
          <h3 style="cursor:pointer;" onclick="openProductDetailsModal(${product.id})">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-price">${money(product.price)}</p>
          
          <div style="display:flex; gap: 8px; margin-top: 10px;">
            ${isOutOfStock ? `
              <button type="button" onclick="requestStockNotification(${product.id})" style="flex: 1; padding: 10px; background: #e67e22; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px;">🔔 Notify Me</button>
            ` : `
              <button class="add-to-cart" type="button" onclick="openProductDetailsModal(${product.id})" style="flex: 1;">Select Options ↗</button>
            `}
            <button type="button" onclick="openReviewModal(${product.id})" style="padding: 10px; background: var(--card-bg); color: var(--dark); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;" title="Add Review">💬</button>
            <button type="button" onclick="shareProduct(${product.id})" style="padding: 10px; background: var(--card-bg); color: var(--dark); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;" title="Share">🔗</button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderCartItems() {
  const entries = Object.entries(cart).filter(([, item]) => item.quantity > 0);

  if (entries.length === 0) {
    cartItemsElement.innerHTML = '<p class="cart-empty">Your bag is empty. Add something you love!</p>';
    return;
  }

  cartItemsElement.innerHTML = entries.map(([key, item]) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return "";

    return `
      <div class="cart-row">
        <div>
          <h4>${product.name}</h4>
          <small style="color:var(--muted);">Size: ${item.size} | Color: ${item.color}</small>
          <p>${money(product.price)} each</p>
          <strong>${money(product.price * item.quantity)}</strong>
        </div>
        <div class="cart-controls">
          <button type="button" data-action="decrease" data-key="${key}">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-key="${key}">+</button>
          <button type="button" class="remove-item" data-action="remove" data-key="${key}">Remove</button>
        </div>
      </div>
    `;
  }).join("");
}

function renderCheckoutItems() {
  const entries = Object.entries(cart).filter(([, item]) => item.quantity > 0);

  if (entries.length === 0) {
    checkoutItemsElement.innerHTML = '<p class="cart-empty">Your bag is empty.</p>';
    return;
  }

  checkoutItemsElement.innerHTML = entries.map(([, item]) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return "";

    return `
      <div class="checkout-item">
        <div>${product.name} <br><small>(${item.size} / ${item.color}) × ${item.quantity}</small></div>
        <strong>${money(product.price * item.quantity)}</strong>
      </div>
    `;
  }).join("");
}

function updateCart() {
  const count = getCartCount();
  const subtotal = getSubtotal();
  const delivery = getDeliveryFee();
  const finalTotal = Math.max(0, subtotal - discountAmount) + delivery;

  cartCount.textContent = count;
  floatingCartCount.textContent = count;
  cartSubtotalElement.textContent = money(subtotal);

  const checkoutSubtotalEl = document.getElementById("checkout-subtotal");
  const checkoutDeliveryEl = document.getElementById("checkout-delivery");
  const checkoutTotalEl = document.getElementById("checkout-total");

  if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = money(subtotal);
  if (checkoutDeliveryEl) checkoutDeliveryEl.textContent = money(delivery);
  if (checkoutTotalEl) checkoutTotalEl.textContent = money(finalTotal);

  renderCartItems();
  renderCheckoutItems();

  localStorage.setItem("trendynest_cart", JSON.stringify(cart));
}

function changeQuantity(key, action) {
  if (!cart[key]) return;
  const product = products.find(p => p.id === cart[key].productId);

  if (action === "increase") {
    if (cart[key].quantity + 1 > product.stock) {
      showToast(`Sorry! Limit reached. Only ${product.stock} in stock.`);
      return;
    }
    cart[key].quantity += 1;
  } else if (action === "decrease") {
    cart[key].quantity -= 1;
    if (cart[key].quantity <= 0) delete cart[key];
  } else if (action === "remove") {
    delete cart[key];
  }

  updateCart();
}

function openCart() { cartPanel.hidden = false; }
function closeCart() { cartPanel.hidden = true; }

function openCheckout() {
  if (getCartCount() === 0) {
    showToast("Your bag is empty. Add a product first.");
    return;
  }
  closeCart();
  checkoutSection.hidden = false;
  checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
  updateCart();
}

function closeCheckout() {
  checkoutSection.hidden = true;
  document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
}

let selectedProductIdForReview = null;

window.openReviewModal = function(productId) {
  selectedProductIdForReview = productId;
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  document.getElementById("review-product-name").textContent = prod.name;
  
  const reviewsListEl = document.getElementById("existing-reviews-list");
  if (!prod.reviews || prod.reviews.length === 0) {
    reviewsListEl.innerHTML = "<p style='color:var(--muted); font-size:13px;'>No reviews for this product yet. Be the first!</p>";
  } else {
    reviewsListEl.innerHTML = prod.reviews.map(r => `
      <div style="border-bottom: 1px dashed var(--border); padding: 8px 0; font-size: 13px;">
        <div style="display:flex; justify-content:space-between;">
          <strong>${r.name}</strong>
          <span style="color:#f39c12;">⭐ ${r.rating}/5</span>
        </div>
        <p style="margin:3px 0 0; color:var(--muted);">${r.comment}</p>
      </div>
    `).join("");
  }

  const reviewModal = document.getElementById("review-modal");
  reviewModal.hidden = false;
  reviewModal.style.display = "flex";
};

window.closeReviewModal = function() {
  const reviewModal = document.getElementById("review-modal");
  reviewModal.hidden = true;
  reviewModal.style.display = "none";
  selectedProductIdForReview = null;
};

const reviewForm = document.getElementById("add-review-form");
if (reviewForm) {
  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selectedProductIdForReview) return;

    const name = document.getElementById("review-user-name").value.trim();
    const rating = Number(document.getElementById("review-user-rating").value);
    const comment = document.getElementById("review-user-comment").value.trim();

    const prod = products.find(p => p.id === selectedProductIdForReview);
    if (prod) {
      if (!prod.reviews) prod.reviews = [];
      prod.reviews.unshift({ name, rating, comment });
      saveProductsToStorage();
      renderProducts();
      showToast("Thank you for your review!");
      closeReviewModal();
      reviewForm.reset();
    }
  });
}

function getStatusBadgeStyle(status) {
  if (status === "Delivered") return "background: #27ae60; color: white;";
  if (status === "Processing") return "background: #3498db; color: white;";
  return "background: #e67e22; color: white;";
}

function renderOrderHistory() {
  const historyListEl = document.getElementById("order-history-list");
  if (!historyListEl) return;

  if (orderHistory.length === 0) {
    historyListEl.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--muted);'>No past orders found.</p>";
    return;
  }

  historyListEl.innerHTML = orderHistory.map(order => `
    <div style="border: 1px solid var(--border); border-radius: 8px; padding: 15px; margin-bottom: 12px; background: var(--card-bg);">
      <div style="display:flex; justify-content:space-between; border-bottom: 1px dashed var(--border); padding-bottom: 8px; margin-bottom: 8px;">
        <strong>${order.id}</strong>
        <span style="color: var(--muted); font-size: 12px;">${order.date}</span>
      </div>
      <p style="margin: 0 0 5px; font-size: 13px;"><strong>Items:</strong> ${order.itemsSummary}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size: 13px;">
        <span>Total: <strong>${money(order.total)}</strong></span>
        <span style="${getStatusBadgeStyle(order.status)} padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight:bold;">${order.status}</span>
      </div>
    </div>
  `).join("");
}

function updateSalesAnalytics() {
  const totalSalesEl = document.getElementById("analytics-total-sales");
  const totalOrdersEl = document.getElementById("analytics-total-orders");
  const avgOrderEl = document.getElementById("analytics-avg-order");
  const breakdownEl = document.getElementById("analytics-status-breakdown");

  if (!totalSalesEl) return;

  const totalOrdersCount = orderHistory.length;
  const totalSalesSum = orderHistory.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSalesSum / totalOrdersCount) : 0;

  const pendingCount = orderHistory.filter(o => o.status === "Pending").length;
  const processingCount = orderHistory.filter(o => o.status === "Processing").length;
  const deliveredCount = orderHistory.filter(o => o.status === "Delivered").length;

  totalSalesEl.textContent = money(totalSalesSum);
  totalOrdersEl.textContent = totalOrdersCount;
  avgOrderEl.textContent = money(avgOrderValue);
  breakdownEl.textContent = `Pending: ${pendingCount} | Proc: ${processingCount} | Del: ${deliveredCount}`;
}

function renderAdminDashboard() {
  updateSalesAnalytics();

  const adminStockList = document.getElementById("admin-stock-list");
  const adminOrderList = document.getElementById("admin-order-list");

  if (adminStockList) {
    adminStockList.innerHTML = products.map(p => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px; border-bottom: 1px solid var(--border);">
        <div>
          <strong>${p.name}</strong> (${money(p.price)})
        </div>
        <div style="display:flex; gap: 8px; align-items:center;">
          <span>Stock:</span>
          <input type="number" value="${p.stock}" min="0" data-stock-id="${p.id}" style="width: 60px; padding: 4px; border-radius: 4px; border: 1px solid var(--border); background: var(--card-bg); color: var(--dark);">
          <button type="button" onclick="deleteProduct(${p.id})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Del</button>
        </div>
      </div>
    `).join("");

    adminStockList.querySelectorAll("[data-stock-id]").forEach(input => {
      input.addEventListener("change", (e) => {
        const pId = Number(e.target.dataset.stockId);
        const newStock = Number(e.target.value);
        const prod = products.find(item => item.id === pId);
        if (prod) {
          prod.stock = newStock;
          saveProductsToStorage();
          renderProducts();
          showToast(`Stock updated for ${prod.name}`);
        }
      });
    });
  }

  if (adminOrderList) {
    if (orderHistory.length === 0) {
      adminOrderList.innerHTML = "<p style='padding:10px;'>No customer orders placed yet.</p>";
    } else {
      adminOrderList.innerHTML = orderHistory.map(o => `
        <div style="border-bottom: 1px solid var(--border); padding: 12px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>${o.id} — ${o.customerName} (${o.phone})</strong>
            <div>
              <span style="font-size:12px; font-weight:bold; margin-right:5px;">Change Status:</span>
              <select onchange="changeOrderStatus('${o.id}', this.value)" style="padding: 4px; border-radius: 4px; border: 1px solid var(--border); background: var(--card-bg); color: var(--dark); font-size:12px;">
                <option value="Pending" ${o.status === "Pending" ? "selected" : ""}>Pending ⏳</option>
                <option value="Processing" ${o.status === "Processing" ? "selected" : ""}>Processing 📦</option>
                <option value="Delivered" ${o.status === "Delivered" ? "selected" : ""}>Delivered ✅</option>
              </select>
            </div>
          </div>
          <small style="color:var(--muted);">${o.address} | Date: ${o.date}</small>
          <p style="margin: 4px 0 0; font-size:13px;">Items: ${o.itemsSummary}</p>
          <p style="margin: 2px 0 0; font-size:13px;">Total: <strong>${money(o.total)}</strong></p>
        </div>
      `).join("");
    }
  }
}

window.changeOrderStatus = function(orderId, newStatus) {
  const order = orderHistory.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrdersToStorage();
    renderOrderHistory();
    renderAdminDashboard();
    showToast(`Order ${orderId} status changed to ${newStatus}`);
  }
};

window.deleteProduct = function(pId) {
  if (confirm("Are you sure you want to delete this product?")) {
    products = products.filter(p => p.id !== pId);
    saveProductsToStorage();
    renderProducts();
    renderAdminDashboard();
    showToast("Product deleted!");
  }
};

const categoryFiltersEl = document.querySelector(".category-filters");
if (categoryFiltersEl) {
  categoryFiltersEl.addEventListener("click", event => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    activeCategory = button.dataset.category;
    document.querySelectorAll(".filter-button").forEach(item => {
      item.classList.toggle("active", item === button);
    });
    renderProducts();
  });
}

cartItemsElement.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  changeQuantity(button.dataset.key, button.dataset.action);
});

const searchInputEl = document.getElementById("search-input");
if (searchInputEl) {
  searchInputEl.addEventListener("input", event => { searchQuery = event.target.value; renderProducts(); });
}

const sortSelectEl = document.getElementById("sort-select");
if (sortSelectEl) {
  sortSelectEl.addEventListener("change", event => { currentSort = event.target.value; renderProducts(); });
}

const priceRangeEl = document.getElementById("price-range");
const priceRangeLabel = document.getElementById("price-range-label");
if (priceRangeEl) {
  priceRangeEl.addEventListener("input", event => {
    maxPriceFilter = Number(event.target.value);
    if (priceRangeLabel) priceRangeLabel.textContent = money(maxPriceFilter);
    renderProducts();
  });
}

const applyCouponBtn = document.getElementById("apply-coupon");
if (applyCouponBtn) {
  applyCouponBtn.addEventListener("click", () => {
    const codeInput = document.getElementById("coupon-code").value.trim().toUpperCase();
    const messageElement = document.getElementById("coupon-message");

    if (codeInput === "SAVE10") {
      discountAmount = 100;
      appliedCouponCode = "SAVE10";
      messageElement.style.color = "green";
      messageElement.textContent = "Success! ৳100 discount applied.";
    } else if (codeInput === "TRENDY20") {
      discountAmount = 200;
      appliedCouponCode = "TRENDY20";
      messageElement.style.color = "green";
      messageElement.textContent = "Success! ৳200 discount applied.";
    } else {
      discountAmount = 0;
      appliedCouponCode = "";
      messageElement.style.color = "";
      messageElement.textContent = "Invalid coupon code.";
    }
    updateCart();
  });
}

document.getElementById("floating-cart-toggle").addEventListener("click", () => cartPanel.hidden = !cartPanel.hidden);
document.getElementById("close-cart").addEventListener("click", closeCart);
document.getElementById("header-cart").addEventListener("click", openCart);
document.getElementById("checkout-button").addEventListener("click", openCheckout);
document.getElementById("back-to-shop").addEventListener("click", closeCheckout);

if (deliveryArea) deliveryArea.addEventListener("change", updateCart);

let pendingOrderData = null;

window.closePaymentModal = function() {
  const modal = document.getElementById("payment-gateway-modal");
  modal.hidden = true;
  modal.style.display = "none";
};

checkoutForm.addEventListener("submit", event => {
  event.preventDefault();

  if (getCartCount() === 0) {
    showToast("Your bag is empty.");
    return;
  }

  if (!checkoutForm.reportValidity()) return;

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("delivery-address").value.trim();
  const area = deliveryArea.value;
  const paymentMethod = document.getElementById("payment-method").value;
  const delivery = getDeliveryFee();
  const subtotal = getSubtotal();
  const total = Math.max(0, subtotal - discountAmount) + delivery;

  const phonePattern = /^(?:(?:\+?88)?01[3-9]\d{8})$/;
  if (!phonePattern.test(phone)) {
    showToast("Please enter a valid Bangladesh mobile number.");
    document.getElementById("customer-phone").focus();
    return;
  }

  const areaLabel = area === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka";
  const randomId = "#TN-" + Math.floor(100000 + Math.random() * 900000);

  pendingOrderData = {
    id: randomId,
    name,
    phone,
    address: address + " (" + areaLabel + ")",
    area,
    delivery,
    subtotal,
    total,
    paymentMethod
  };

  if (paymentMethod === "cod") {
    finalizeOrder("Cash on Delivery (COD)");
  } else {
    fetch("https://trendynest-hfw9.onrender.com/api/create-bkash-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast("🔗 Redirecting to Secure Payment Gateway...");

        const modal = document.getElementById("payment-gateway-modal");
        const logoArea = document.getElementById("gateway-logo-area");
        const totalAmountEl = document.getElementById("gateway-total-amount");

        totalAmountEl.textContent = money(total);

        if (paymentMethod === "bkash") {
          logoArea.textContent = "bKash Secure Pay (Sandbox)";
          logoArea.style.color = "#e2136e";
        } else {
          logoArea.textContent = "Nagad Secure Pay (Sandbox)";
          logoArea.style.color = "#f7931e";
        }

        modal.hidden = false;
        modal.style.display = "flex";
        modal.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    })
    .catch(err => {
      console.error("Server error:", err);
      showToast("❌ Server connection failed!");
    });
  }
});

const gatewayForm = document.getElementById("gateway-form");
if (gatewayForm) {
  gatewayForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const trxId = document.getElementById("gateway-trx-id").value.trim();
    if (trxId.length < 3) {
      showToast("❌ Please enter a valid Transaction ID.");
      return;
    }

    if (!pendingOrderData) {
      showToast("❌ Order session expired. Please try again.");
      return;
    }

    const payLabel = pendingOrderData.paymentMethod === "bkash" ? "bKash Online Payment" : "Nagad Online Payment";
    closePaymentModal();
    finalizeOrder(payLabel);
    gatewayForm.reset();
    showToast("🎉 Payment Verified & Order Placed Successfully!");
  });
}

function finalizeOrder(paymentTypeLabel) {
  if (!pendingOrderData) return;

  Object.values(cart).forEach(item => {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  const itemsSummaryStr = Object.values(cart).map(item => {
    const prod = products.find(p => p.id === item.productId);
    return prod ? `${prod.name} (${item.size}/${item.color}) x${item.quantity}` : "";
  }).filter(Boolean).join(", ");

  const newOrderObj = {
    id: pendingOrderData.id,
    date: new Date().toLocaleDateString(),
    customerName: pendingOrderData.name,
    phone: pendingOrderData.phone,
    address: pendingOrderData.address,
    itemsSummary: itemsSummaryStr,
    total: pendingOrderData.total,
    status: "Pending"
  };

  orderHistory.unshift(newOrderObj);
  saveOrdersToStorage();

  document.getElementById("receipt-order-id").textContent = pendingOrderData.id;
  document.getElementById("receipt-date").textContent = new Date().toLocaleDateString();
  document.getElementById("receipt-payment-method").textContent = paymentTypeLabel;
  document.getElementById("receipt-name").textContent = pendingOrderData.name;
  document.getElementById("receipt-phone").textContent = pendingOrderData.phone;
  document.getElementById("receipt-address").textContent = pendingOrderData.address;

  const receiptItemsList = document.getElementById("receipt-items-list");
  receiptItemsList.innerHTML = Object.values(cart).map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? `
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
        <span>${product.name} (${item.size} / ${item.color}) × ${item.quantity}</span>
        <strong>${money(product.price * item.quantity)}</strong>
      </div>
    ` : "";
  }).join("");

  document.getElementById("receipt-subtotal").textContent = money(pendingOrderData.subtotal);
  document.getElementById("receipt-delivery").textContent = money(pendingOrderData.delivery);
  document.getElementById("receipt-total").textContent = money(pendingOrderData.total);

  const discountRow = document.getElementById("receipt-discount-row");
  if (discountAmount > 0) {
    discountRow.style.display = "flex";
    document.getElementById("receipt-discount").textContent = "-" + money(discountAmount) + " (" + appliedCouponCode + ")";
  } else {
    discountRow.style.display = "none";
  }

  checkoutSection.hidden = true;
  const receiptSection = document.getElementById("receipt-section");
  if (receiptSection) {
    receiptSection.hidden = false;
    receiptSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const orderLines = Object.values(cart).map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? `- ${product.name} (${item.size}/${item.color}) x ${item.quantity} = ${money(product.price * item.quantity)}` : "";
  }).filter(Boolean);

  const message = [
    `Hello TrendyNest! I want to place an order.`,
    `Order ID: ${pendingOrderData.id}`,
    "",
    "CUSTOMER DETAILS",
    `Name: ${pendingOrderData.name}`,
    `Phone: ${pendingOrderData.phone}`,
    `Address: ${pendingOrderData.address}`,
    "",
    "ORDER ITEMS",
    ...orderLines,
    "",
    `Subtotal: ${money(pendingOrderData.subtotal)}`,
    discountAmount > 0 ? `Discount (${appliedCouponCode}): -${money(discountAmount)}` : "",
    `Delivery: ${money(pendingOrderData.delivery)}`,
    `TOTAL: ${money(pendingOrderData.total)}`,
    `Payment: ${paymentTypeLabel}`,
    "",
    "Please confirm my order. Thank you!"
  ].filter(Boolean).join("\n");

  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");

  cart = {};
  discountAmount = 0;
  appliedCouponCode = "";
  pendingOrderData = null;
  updateCart();
  renderProducts();
  renderOrderHistory();
  renderAdminDashboard();
}

const addProductForm = document.getElementById("admin-add-product-form");
if (addProductForm) {
  addProductForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const mainImg = document.getElementById("admin-p-image").value.trim() || "images/oversized-shirt.jpg";
    const galleryStr = document.getElementById("admin-p-gallery").value.trim();
    const galleryArr = galleryStr ? galleryStr.split(",").map(s => s.trim()) : [mainImg];

    const newProd = {
      id: Date.now(),
      name: document.getElementById("admin-p-name").value.trim(),
      price: Number(document.getElementById("admin-p-price").value),
      category: document.getElementById("admin-p-category").value,
      tag: "NEW",
      emoji: "✨",
      color: "#f9dce9",
      image: mainImg,
      gallery: galleryArr,
      sizes: ["Standard"],
      colors: ["Default"],
      description: document.getElementById("admin-p-desc").value.trim(),
      stock: Number(document.getElementById("admin-p-stock").value),
      reviews: []
    };

    products.push(newProd);
    renderProducts();
    renderAdminDashboard();
    addProductForm.reset();
    showToast("New Product Added Successfully!");
  });
}

const newOrderBtn = document.getElementById("new-order-btn");
if (newOrderBtn) {
  newOrderBtn.addEventListener("click", () => {
    const receiptSection = document.getElementById("receipt-section");
    if (receiptSection) receiptSection.hidden = true;
    document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const ADMIN_PASSWORD = "admin123";
let isAdminLoggedIn = false;

const toggleAdminBtn = document.getElementById("toggle-admin-btn");
if (toggleAdminBtn) {
  toggleAdminBtn.addEventListener("click", () => {
    const adminSec = document.getElementById("admin-section");
    
    if (isAdminLoggedIn) {
      adminSec.hidden = !adminSec.hidden;
      if (!adminSec.hidden) {
        renderAdminDashboard();
        adminSec.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      const adminModal = document.getElementById("admin-login-modal");
      adminModal.hidden = false;
      adminModal.style.display = "flex";
      document.getElementById("admin-password-input").focus();
    }
  });
}

window.closeAdminLoginModal = function() {
  const adminModal = document.getElementById("admin-login-modal");
  adminModal.hidden = true;
  adminModal.style.display = "none";
  document.getElementById("admin-password-input").value = "";
};

const adminLoginFormElem = document.getElementById("admin-login-form");
if (adminLoginFormElem) {
  adminLoginFormElem.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputPass = document.getElementById("admin-password-input").value.trim();

    if (inputPass === ADMIN_PASSWORD) {
      isAdminLoggedIn = true;
      closeAdminLoginModal();
      
      const adminSec = document.getElementById("admin-section");
      adminSec.hidden = false;
      renderAdminDashboard();
      adminSec.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast("🔓 Admin Panel Unlocked!");
    } else {
      showToast("❌ Incorrect Password!");
      document.getElementById("admin-password-input").value = "";
    }
  });
}

const currentYearEl = document.getElementById("current-year");
if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

renderProducts();
updateCart();
renderOrderHistory();
updateWishlistCount();
updateHeaderUserUI();