// Thin wrapper around fetch for the MarketZone API
const MZ = {
  token() { return localStorage.getItem('mz_token'); },
  user() { try { return JSON.parse(localStorage.getItem('mz_user')); } catch (e) { return null; } },
  setAuth(user, token) {
    localStorage.setItem('mz_user', JSON.stringify(user));
    localStorage.setItem('mz_token', token);
  },
  logout() {
    localStorage.removeItem('mz_user');
    localStorage.removeItem('mz_token');
    window.location.href = 'login.html';
  },
  isLoggedIn() { return !!this.token(); },

  async request(path, { method = 'GET', body, auth = true } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && this.token()) headers.Authorization = `Bearer ${this.token()}`;
    let res;
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new Error('Cannot reach the server. Please check your connection or try again later.');
    }
    let data;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) throw new Error(data.message || 'Something went wrong');
    return data;
  },

  fmtPrice(n) {
    return 'Rs. ' + Number(n || 0).toLocaleString('en-PK');
  },

  toast(message, type = 'success') {
    let wrap = document.getElementById('mzToastWrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'mzToastWrap';
      wrap.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      document.body.appendChild(wrap);
    }
    const id = 't' + Date.now();
    const bg = type === 'success' ? 'text-bg-success' : type === 'error' ? 'text-bg-danger' : 'text-bg-primary';
    wrap.insertAdjacentHTML('beforeend', `
      <div id="${id}" class="toast align-items-center ${bg} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">${message}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`);
    const el = document.getElementById(id);
    const t = new bootstrap.Toast(el, { delay: 3000 });
    t.show();
    el.addEventListener('hidden.bs.toast', () => el.remove());
  },

  starHtml(rating) {
    rating = rating || 0;
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="bi ${i <= Math.round(rating) ? 'bi-star-fill' : 'bi-star'}"></i>`;
    }
    return html;
  },
};
