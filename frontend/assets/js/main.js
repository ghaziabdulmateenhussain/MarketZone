// Shared logic: navbar auth state, theme toggle, cart/wishlist badges, guards

function initTheme() {
  const saved = localStorage.getItem('mz_theme') || 'light';
  document.documentElement.setAttribute('data-bs-theme', saved);
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.innerHTML = saved === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-bs-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-bs-theme', next);
      localStorage.setItem('mz_theme', next);
      btn.innerHTML = next === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon-stars"></i>';
    });
  }
}

function renderAuthArea() {
  const area = document.getElementById('authArea');
  if (!area) return;
  const user = MZ.user();
  if (!user) {
    area.innerHTML = `
      <a href="login.html" class="btn btn-outline-primary btn-sm">Login</a>
      <a href="register.html" class="btn btn-primary btn-sm">Sign Up</a>`;
    return;
  }
  let dashLink = 'dashboard-customer.html';
  if (user.role === 'seller') dashLink = 'dashboard-seller.html';
  if (user.role === 'admin') dashLink = 'dashboard-admin.html';

  area.innerHTML = `
    <div class="dropdown">
      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
        <i class="bi bi-person-circle"></i> ${user.name.split(' ')[0]}
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><a class="dropdown-item" href="${dashLink}">Dashboard</a></li>
        <li><a class="dropdown-item" href="profile.html">My Profile</a></li>
        ${user.role === 'customer' ? '<li><a class="dropdown-item" href="seller-register.html">Become a Seller</a></li>' : ''}
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Logout</a></li>
      </ul>
    </div>`;
  document.getElementById('logoutBtn').addEventListener('click', (e) => { e.preventDefault(); MZ.logout(); });
}

function highlightActiveNav() {
  const page = (document.body.dataset.page || '').toLowerCase();
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) link.classList.add('active', 'fw-semibold');
  });
}

async function refreshBadges() {
  if (!MZ.isLoggedIn()) return;
  try {
    const [cart, wishlist] = await Promise.all([
      MZ.request('/cart'), MZ.request('/wishlist'),
    ]);
    const cartCount = (cart.items || []).reduce((s, i) => s + i.quantity, 0);
    const wishCount = (wishlist.products || []).length;
    const cartEl = document.getElementById('cartCount');
    const wishEl = document.getElementById('wishlistCount');
    if (cartEl) { cartEl.textContent = cartCount; cartEl.classList.toggle('d-none', cartCount === 0); }
    if (wishEl) { wishEl.textContent = wishCount; wishEl.classList.toggle('d-none', wishCount === 0); }
  } catch (e) { /* silent */ }
}

function requireAuth() {
  if (!MZ.isLoggedIn()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
    return false;
  }
  return true;
}

function requireRole(...roles) {
  if (!requireAuth()) return false;
  const user = MZ.user();
  if (!roles.includes(user.role)) {
    MZ.toast('You do not have access to this page', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    return false;
  }
  return true;
}

function productCardHtml(p) {
  const img = (p.images && p.images[0]) || 'https://placehold.co/500x500?text=Product';
  const hasDiscount = p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price;
  const price = hasDiscount ? p.discountPrice : p.price;
  const pct = hasDiscount ? Math.round(100 - (p.discountPrice / p.price) * 100) : 0;
  return `
  <div class="col-6 col-md-4 col-lg-3">
    <div class="card product-card h-100 position-relative">
      ${hasDiscount ? `<span class="badge bg-danger badge-discount">-${pct}%</span>` : ''}
      <button class="wishlist-btn" onclick="handleWishlistToggle(event, '${p._id}')" title="Add to wishlist">
        <i class="bi bi-heart"></i>
      </button>
      <a href="product-details.html?id=${p._id}" class="text-decoration-none text-reset">
        <img src="${img}" alt="${p.name}">
        <div class="card-body p-2 p-md-3">
          <div class="small text-muted mb-1">${(p.category && p.category.name) || ''}</div>
          <h6 class="card-title mb-1 text-truncate">${p.name}</h6>
          <div class="rating-stars small mb-1">${MZ.starHtml(p.rating)} <span class="text-muted">(${p.numReviews || 0})</span></div>
          <div>
            <span class="fw-bold fs-6">${MZ.fmtPrice(price)}</span>
            ${hasDiscount ? `<span class="price-old ms-2">${MZ.fmtPrice(p.price)}</span>` : ''}
          </div>
        </div>
      </a>
      <div class="p-2 p-md-3 pt-0">
        <button class="btn btn-primary btn-sm w-100" onclick="handleAddToCart(event, '${p._id}')">
          <i class="bi bi-cart-plus"></i> Add to Cart
        </button>
      </div>
    </div>
  </div>`;
}

async function handleAddToCart(e, productId) {
  e.preventDefault(); e.stopPropagation();
  if (!MZ.isLoggedIn()) { MZ.toast('Please login to add items to cart', 'error'); setTimeout(() => window.location.href = 'login.html', 1000); return; }
  try {
    await MZ.request('/cart', { method: 'POST', body: { productId, quantity: 1 } });
    MZ.toast('Added to cart!');
    refreshBadges();
  } catch (err) { MZ.toast(err.message, 'error'); }
}

async function handleWishlistToggle(e, productId) {
  e.preventDefault(); e.stopPropagation();
  if (!MZ.isLoggedIn()) { MZ.toast('Please login to use wishlist', 'error'); setTimeout(() => window.location.href = 'login.html', 1000); return; }
  try {
    const res = await MZ.request('/wishlist/toggle', { method: 'POST', body: { productId } });
    e.currentTarget.classList.toggle('active', res.added);
    MZ.toast(res.message);
    refreshBadges();
  } catch (err) { MZ.toast(err.message, 'error'); }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderAuthArea();
  highlightActiveNav();
  refreshBadges();
});
