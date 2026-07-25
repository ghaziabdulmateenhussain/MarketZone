// MarketZone frontend config
// IMPORTANT: after deploying your backend (Render/Railway/etc), replace the URL below
// with your live backend URL, e.g. https://marketzone-backend.onrender.com/api
const API_BASE_URL = (function () {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return 'https://YOUR-BACKEND-URL.onrender.com/api';
})();
