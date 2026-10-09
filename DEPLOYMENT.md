# 🚀 Foodle — 100% Free Tier Deployment Guide

Follow this step-by-step guide to deploy **Foodle** completely for **FREE** on the cloud:
- **PostgreSQL Database**: [Neon.tech](https://neon.tech) (Free Tier Serverless Postgres)
- **Backend API & WebSockets**: [Render.com](https://render.com) (Free Tier Web Service)
- **Frontend SPA**: [Vercel.com](https://vercel.com) (Free Tier Global CDN)

---

## 📋 Step 1: Push Your Code to GitHub

1. Create a new public repository on [GitHub](https://github.com/new) named `foodle`.
2. Push your local codebase to your repository:
```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/foodle.git
git branch -M master
git push -u origin master
```

---

## 🐘 Step 2: Create Free PostgreSQL Database on Neon

1. Go to [Neon.tech](https://neon.tech) and sign up (or sign in with GitHub).
2. Click **Create Project**, name it `foodle-db`, and select your nearest region.
3. Once created, copy your **Postgres Connection String** from the dashboard.
   It looks like:
   `postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz-123.region.neon.tech/neondb?sslmode=require`

---

## ⚡ Step 3: Deploy Backend API on Render

1. Go to [Render.com](https://render.com) and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Select your `foodle` GitHub repository.
4. Fill in the following settings:
   - **Name**: `foodle-api`
   - **Region**: Choose the region closest to your Neon database (e.g. Frankfurt / Singapore / Oregon)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate --schema=prisma/schema.postgresql.prisma && npm run build && npx prisma db push --schema=prisma/schema.postgresql.prisma && npm run seed`
   - **Start Command**: `node dist/server.js`
   - **Plan Type**: `Free`

5. Add the following **Environment Variables** in Render:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `10000` | Render default port |
   | `DATABASE_URL` | `postgresql://...` | Paste your Neon PostgreSQL connection string |
   | `JWT_SECRET` | `generate-a-long-random-string-12345` | Secure secret for JWT cookies |
   | `JWT_REFRESH_SECRET` | `generate-another-random-string-67890` | Secure secret for token refreshes |
   | `CLIENT_URL` | `https://your-foodle.vercel.app` | (Update after creating Vercel app) |
   | `RAZORPAY_KEY_ID` | `rzp_test_placeholder` | Razorpay test key |
   | `RAZORPAY_KEY_SECRET` | `rzp_test_placeholder_secret` | Razorpay test secret |

6. Click **Create Web Service**. Render will build the TypeScript server, apply the database schema, seed demo data, and start your API!
7. Copy your Render service URL (e.g., `https://foodle-api.onrender.com`).

---

## 🌐 Step 4: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your `foodle` repository.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add **Environment Variables** in Vercel:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://foodle-api.onrender.com/api` (Use your Render API URL) |
   | `VITE_RAZORPAY_KEY_ID` | `rzp_test_placeholder` |

6. Click **Deploy**. In under a minute, Vercel will give you a live production URL (e.g., `https://foodle.vercel.app`)!

7. **Final Handshake**: Go back to Render $\rightarrow$ `foodle-api` $\rightarrow$ **Environment Variables**, and set `CLIENT_URL` to your live Vercel URL (`https://foodle.vercel.app`), then save.

---

## 🎯 Putting It on Your Resume

Add Foodle to your Resume / Portfolio with live links:

### **Foodle — Real-Time Multi-Role Food Delivery Platform**
- **Live Demo**: `https://your-foodle.vercel.app`
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/foodle`
- **Tech Stack**: React, TypeScript, Node.js, Express, PostgreSQL, Prisma ORM, Socket.io, Leaflet OSM, Tailwind CSS, Razorpay Test.
- **Key Highlights**:
  - Engineered a production-grade multi-tenant architecture supporting 4 distinct roles (Customer, Restaurant Kitchen, Delivery Rider, Super Admin) with role-based JWT cookie guards.
  - Implemented real-time order lifecycle state machine with Socket.io broadcasts and Haversine nearest-rider dispatch algorithm.
  - Built double-entry ledger settlement engine for automated restaurant commission deductions and rider delivery earnings on 4-digit Delivery OTP handshake.
  - Designed responsive mobile-first UI with dark/light themes, live GPS tracking map, and instant 1-click demo role switcher.
