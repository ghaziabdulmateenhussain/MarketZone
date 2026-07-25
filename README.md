# MarketZone — Multi-Vendor E-Commerce Marketplace

A full-stack multi-vendor marketplace: Node.js/Express/MongoDB backend + Bootstrap 5 frontend.
Roles: **Customer**, **Seller**, **Admin** — with product approval workflow, cart, wishlist,
checkout, order tracking, and email notifications.

```
marketzone/
├── backend/     → Node/Express/MongoDB API (deploy to Render)
├── frontend/    → Static Bootstrap 5 site (deploy to Netlify)
└── README.md    → this file
```

## 1. Demo accounts (created by the seeder)

| Role     | Email                            | Password     |
|----------|-----------------------------------|--------------|
| Admin    | ghaziabdulmateen786@gmail.com     | iloveAllah   |
| Seller   | seller@marketzone.com             | seller123    |
| Customer | customer@marketzone.com           | customer123  |

## 2. Deployment overview

You need **3 free services**:
1. **MongoDB Atlas** — the database
2. **Render** (or Railway/Cyclic) — hosts the backend API
3. **Netlify** — hosts the frontend (static HTML/CSS/JS)

---

## 3. Step-by-step: MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free **M0 cluster**.
3. Under **Database Access**, create a database user (username + password).
4. Under **Network Access**, click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`) — needed since Render's IP isn't static on the free tier.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add `/marketzone` before the `?` so it points at a database named `marketzone`:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/marketzone?retryWrites=true&w=majority
   ```
   Save this — you'll paste it into Render as `MONGO_URI`.

---

## 4. Step-by-step: GitHub

1. Create a new **public or private repo** on GitHub, e.g. `marketzone`.
2. From this folder, run:
   ```bash
   cd marketzone
   git init
   git add .
   git commit -m "Initial commit - MarketZone marketplace"
   git branch -M main
   git remote add origin https://github.com/<your-username>/marketzone.git
   git push -u origin main
   ```
   (The `.gitignore` in `backend/` already excludes `node_modules` and `.env`.)

---

## 5. Step-by-step: Backend on Render

1. Go to https://render.com and sign in with GitHub.
2. Click **New +** → **Web Service** → connect your `marketzone` repo.
3. Configure:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add these **Environment Variables** (Render dashboard → Environment):
   | Key | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string from step 3 |
   | `JWT_SECRET` | any long random string (e.g. generate one at randomkeygen.com) |
   | `JWT_EXPIRE` | `7d` |
   | `CLIENT_URL` | your Netlify URL (add after step 6, e.g. `https://marketzone.netlify.app`) |
   | `ADMIN_EMAIL` | `ghaziabdulmateen786@gmail.com` |
   | `ADMIN_PASSWORD` | `iloveAllah` |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | your Gmail address |
   | `SMTP_PASS` | a **Gmail App Password** (not your normal password — generate one at myaccount.google.com/apppasswords, requires 2FA enabled) |
5. Click **Create Web Service**. Wait for the build to finish — you'll get a URL like:
   ```
   https://marketzone-backend.onrender.com
   ```
6. **Seed the database** — once deployed, open the Render **Shell** tab for your service and run:
   ```bash
   npm run seed
   ```
   This creates the admin account, a demo seller, a demo customer, categories, and sample products.

   > Note: Render's free tier spins down after inactivity — the first request after idling takes ~30-60 seconds to wake up. This is normal on free hosting.

---

## 6. Step-by-step: Frontend on Netlify

1. Open `frontend/assets/js/config.js` and replace this line:
   ```js
   return 'https://YOUR-BACKEND-URL.onrender.com/api';
   ```
   with your actual Render URL + `/api`, e.g.:
   ```js
   return 'https://marketzone-backend.onrender.com/api';
   ```
   Commit and push this change to GitHub.
2. Go to https://netlify.com and sign in with GitHub.
3. Click **Add new site** → **Import an existing project** → choose your `marketzone` repo.
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** (leave empty — it's a static site)
   - **Publish directory:** `frontend`
5. Click **Deploy site**. Netlify gives you a URL like `https://random-name-123.netlify.app`.
6. (Optional) Go to **Site settings → Change site name** to get a nicer URL like `marketzone.netlify.app`.
7. Go back to **Render** and update the `CLIENT_URL` environment variable to this Netlify URL, then redeploy the backend so CORS allows requests from your live site.

---

## 7. Local development (optional, to test before deploying)

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your own MONGO_URI, JWT_SECRET, SMTP credentials
npm run seed     # first time only
npm run dev       # starts on http://localhost:5000
```

**Frontend:**
Just open `frontend/index.html` in your browser, or serve it with any static server:
```bash
cd frontend
npx serve .
```
`config.js` automatically points to `http://localhost:5000/api` when running on `localhost`.

---

## 8. Features included

- **Auth:** JWT-based register/login, role-based access (customer/seller/admin), profile editing, password change
- **Products:** browse, search, filter (category/price/rating), sort, pagination, reviews & ratings, related products
- **Cart & Wishlist:** persisted server-side per user
- **Checkout & Orders:** shipping address form, COD/card selection, order creation, stock deduction, order tracking with status timeline
- **Seller flow:** apply to become a seller → admin approves/rejects → seller manages products (CRUD, pending admin approval) and order statuses
- **Admin panel:** dashboard stats, approve/reject sellers, approve/reject products, manage/block users, manage categories, view all orders, view contact messages
- **Email notifications:** welcome email, seller application (to admin + applicant), order confirmation (to customer + admin), contact form replies — all via Nodemailer/Gmail SMTP
- **UI:** Bootstrap 5 only, mobile-first responsive, dark mode toggle, toast notifications

## 9. Known limitations (be upfront about these)

- Product/category images are **URLs you paste in**, not file uploads (keeps deployment simple and avoids needing a paid file-storage service). Use any image hosting link (e.g. from placehold.co, imgur, or your own CDN).
- Card payments are **UI-only placeholders** — no real payment gateway (Stripe/JazzCash/Easypaisa) is integrated. Wire one in if you need real payments.
- Render's free tier sleeps after inactivity, causing a slow first load.
