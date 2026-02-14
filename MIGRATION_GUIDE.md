# Rego Monorepo Migration Guide

## Overview

Migrating from two separate repos → one monorepo, and from Render → Vercel (frontend) + Railway (backend).

| What | Old | New |
|------|-----|-----|
| Frontend repo | `Rego-frontend` | `rego/client/` |
| Backend repo | `Rego-backend` | `rego/server/` |
| Frontend host | Render | Vercel → `rego.jakobg.tech` |
| Backend host | Render | Railway → `rego-api.jakobg.tech` |
| API URL | Hardcoded `rego-api.onrender.com` | Env var `REACT_APP_API_URL` |

---

## Step 1: Create the Monorepo Locally (5 min)

```bash
# Create new project directory
mkdir rego && cd rego
git init

# Clone both repos as temp folders
git clone https://github.com/JakobGokpinar/Rego-frontend.git _temp_frontend
git clone https://github.com/JakobGokpinar/Rego-backend.git _temp_backend

# Create monorepo structure
mkdir -p client server

# Copy frontend source
cp -r _temp_frontend/src client/
cp -r _temp_frontend/public client/
cp _temp_frontend/custom.sass client/ 2>/dev/null || true

# Copy backend source
cp _temp_backend/server.js server/
cp _temp_backend/auth.js server/
cp _temp_backend/chat.js server/
cp _temp_backend/createAnnonce.js server/
cp _temp_backend/search.js server/
cp _temp_backend/searchProduct.js server/
cp _temp_backend/findProduct.js server/
cp _temp_backend/fetchUser.js server/
cp _temp_backend/addfavorites.js server/
cp _temp_backend/profileSettings.js server/
cp _temp_backend/emailRoute.js server/
cp _temp_backend/sendEmail.js server/
cp -r _temp_backend/models server/
cp -r _temp_backend/config server/

# Clean up temp clones and dead code
rm -rf _temp_frontend _temp_backend
rm -f client/src/Pages/ProductPage/yedek.js
rm -f client/src/reportWebVitals.js
```

---

## Step 2: Apply Config Changes (10 min)

These are the files that **change**. Everything else stays identical.

### 2.1 Root `package.json` (NEW — create at `rego/package.json`)

```json
{
  "name": "rego",
  "version": "1.0.0",
  "private": true,
  "description": "Rego - A secondhand marketplace platform",
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "install:all": "npm install && cd client && npm install && cd ../server && npm install",
    "build:client": "cd client && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

### 2.2 Root `.gitignore` (NEW — create at `rego/.gitignore`)

```
node_modules/
.env
.env.local
.env.production
client/build/
dist/
.DS_Store
.vscode/
.idea/
*.log
```

### 2.3 `client/package.json` (MODIFIED)

Copy the existing `Rego-frontend/package.json`, then make these changes:

- **Add** `"proxy": "http://localhost:3080"` (for local dev)
- **Add** `"dev": "react-scripts start"` to scripts
- **Remove** `"homepage"` field if present

### 2.4 `client/src/config/api.js` (MODIFIED — replaces hardcoded URL)

```javascript
import axios from "axios";

const serverURL = process.env.REACT_APP_API_URL || "http://localhost:3080";

const instanceAxs = axios.create({
    baseURL: serverURL,
    withCredentials: true
});

export { instanceAxs };
```

### 2.5 `client/src/config/socket.js` (MODIFIED — replaces hardcoded URL)

```javascript
import { io } from "socket.io-client";

const serverURL = process.env.REACT_APP_API_URL || "http://localhost:3080";
const socket = io(serverURL);

export default socket;
```

### 2.6 `client/vercel.json` (NEW — SPA routing)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 2.7 `client/.env.example` (NEW — template)

```
REACT_APP_API_URL=https://rego-api.jakobg.tech
REACT_APP_SITE_URL=https://rego.jakobg.tech
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2.8 `client/src/Component/ProductCard/ProductCard.js` (MODIFIED)

Find the line with the hardcoded site link and replace:

```javascript
// OLD (find this):
const siteLink = "https://rego-marketplace.onrender.com";

// NEW (replace with):
const siteLink = process.env.REACT_APP_SITE_URL || window.location.origin;
```

### 2.9 `server/server.js` (MODIFIED — major changes)

Replace the entire `server.js` with the version provided in the `server/server.js` file in this package. Key changes:

- **CORS**: Dynamic `allowedOrigins` array instead of hardcoded single origin
- **Session secret**: Uses `process.env.SESSION_SECRET` instead of `"secret key"`
- **Cookie config**: `sameSite` and `secure` adapt to production vs dev
- **Client URL**: Uses env vars instead of hardcoded URLs

### 2.10 `server/package.json` (MODIFIED)

Copy the existing `Rego-backend/package.json`, then:

- **Add** to scripts: `"dev": "nodemon server.js dev"`
- **Change** start script to: `"start": "node server.js start"`

### 2.11 `server/.env.example` (NEW — template)

```
MONGO_URL_PROD=mongodb+srv://your_production_connection_string
MONGO_URL_DEV=mongodb://localhost:27017/rego
AWS_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_REGION=your_region
GOOGLE_CLIENT_ID=your_google_client_id
EMAIL_HOST=smtp.your-provider.com
EMAIL_USER=your_email@example.com
EMAIL_APP_PASS=your_app_password
CLIENT_URL_PROD=https://rego.jakobg.tech
CLIENT_URL_DEV=http://localhost:3000
SESSION_SECRET=generate_a_real_secret_here
PORT=3080
```

### 2.12 `server/railway.toml` (NEW)

```toml
[build]
  builder = "nixpacks"

[deploy]
  startCommand = "node server.js start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 10
```

---

## Step 3: Verify Locally (5 min)

```bash
# Install all dependencies
npm run install:all

# Create server/.env from template
cp server/.env.example server/.env
# Edit server/.env with your actual values

# Run both client + server
npm run dev

# Test: http://localhost:3000 should load and talk to :3080
```

---

## Step 4: Push to GitHub (2 min)

```bash
git add .
git commit -m "Monorepo: merge frontend + backend, env-based config"
git remote add origin https://github.com/JakobGokpinar/rego.git
git push -u origin main
```

Create the new `rego` repo on GitHub first (public, no README).

---

## Step 5: Deploy Backend to Railway (5 min)

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Point it to your `rego` repo
3. Set **Root Directory** to `server`
4. Add environment variables (from your `server/.env`):
   - `MONGO_URL_PROD` — your MongoDB Atlas connection string
   - `AWS_BUCKET_NAME`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_REGION`
   - `GOOGLE_CLIENT_ID`
   - `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_APP_PASS`
   - `CLIENT_URL_PROD` = `https://rego.jakobg.tech`
   - `SESSION_SECRET` — generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `PORT` = `3080`
5. Railway will auto-detect Node.js and use `railway.toml`
6. In Settings → Networking → **Generate Domain** (use the Railway-provided domain temporarily)

### Custom Domain for Railway API

1. In Railway project → Settings → Networking → Custom Domain
2. Add `rego-api.jakobg.tech`
3. Railway will give you a CNAME target (something like `xxx.up.railway.app`)
4. In **Vercel** (since jakobg.tech DNS is there) → your jakobg.tech project → Settings → Domains
5. Actually — you need to add DNS records in your domain registrar OR Vercel:
   - Go to Vercel Dashboard → select `jakobg.tech` project → Settings → Domains
   - You might need to add the CNAME in your DNS provider. Since jakobg.tech is on Vercel, go to **Vercel → Domains** → manage `jakobg.tech` → add:
     - Type: `CNAME`
     - Name: `rego-api`
     - Value: `[Railway CNAME target]`

---

## Step 6: Deploy Frontend to Vercel (5 min)

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import `rego` repo
2. Set **Root Directory** to `client`
3. Framework Preset: Create React App
4. Add environment variables:
   - `REACT_APP_API_URL` = `https://rego-api.jakobg.tech`
   - `REACT_APP_SITE_URL` = `https://rego.jakobg.tech`
   - `REACT_APP_GOOGLE_CLIENT_ID` = your Google client ID
5. Deploy

### Custom Domain for Frontend

1. In the Vercel project → Settings → Domains → Add `rego.jakobg.tech`
2. Since `jakobg.tech` is already on Vercel, this should auto-configure
3. Vercel will add the CNAME record automatically

---

## Step 7: Verify Production (5 min)

1. Visit `https://rego.jakobg.tech` — should load the app
2. Open DevTools → Network tab → check API calls go to `rego-api.jakobg.tech`
3. Test: register, login, create annonce, send message
4. Check cookies: should have `sameSite: none`, `secure: true`

---

## DNS Summary

| Subdomain | Type | Target | Managed In |
|-----------|------|--------|------------|
| `rego.jakobg.tech` | CNAME | `cname.vercel-dns.com` | Vercel (auto) |
| `rego-api.jakobg.tech` | CNAME | `[your-app].up.railway.app` | Vercel DNS settings |

---

## Troubleshooting

**CORS errors?**
- Check Railway env vars: `CLIENT_URL_PROD` must be exactly `https://rego.jakobg.tech` (no trailing slash)
- Check `allowedOrigins` array in `server.js` includes your domain

**Cookies not persisting?**
- Both domains must be HTTPS
- `sameSite: 'none'` + `secure: true` is required for cross-domain cookies
- Check that `rego.jakobg.tech` and `rego-api.jakobg.tech` share the `.jakobg.tech` parent domain

**Railway cold starts?**
- Railway's paid plans keep services running. Free tier may have cold starts (still better than Render free tier)

**Build fails on Vercel?**
- CRA treats warnings as errors in CI. Add env var: `CI=false`
