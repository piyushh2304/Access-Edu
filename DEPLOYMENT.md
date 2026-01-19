# Deployment Guide

This project consists of a **Client** (Next.js) and a **Server** (Node.js/Express). Both need to be deployed and configured to communicate with each other.

## Prerequisites

- Node.js (v18+)
- MongoDB (Atlas or local)
- Redis (Upstash or local)
- Cloudinary Account
- Stripe Account (optional)

## 1. Server Deployment

### Environment Variables
Create a `.env` file in the `server/` directory with the following variables:

```env
PORT=8000
ORIGIN=["https://your-client-url.com"]
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/dbname
JWT_SECRET=your_jwt_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Redis
REDIS_URL=rediss://default:...@...upstash.io:6379

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=
SMTP_PASSWORD=

# Mux (Video)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# Stripe
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=

# Auth Tokens
ACCESS_TOKEN=
REFRESH_TOKEN=
ACCESS_TOKEN_EXPIRE=5
REFRESH_TOKEN_EXPIRE=3
```

### Build and Run
```bash
cd server
npm install
npm run build
npm start
```
The server will run on the specified `PORT`.

## 2. Client Deployment

### Environment Variables
Create a `.env` file in the `client/` directory:

```env
NEXT_PUBLIC_SERVER_URI=https://your-server-url.com/api/v1/
NEXT_PUBLIC_SOCKET_SERVER_URI=https://your-server-url.com/
NEXT_PUBLIC_MURF_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
SECRET=your_nextauth_secret
```

### Build and Run
```bash
cd client
npm install --legacy-peer-deps
npm run build
npm start
```
The client will normally run on port 3000.

## Deployment Platforms

### 1. Backend (Render)
1. **New Web Service**: Connect your GitHub repository.
2. **Root Directory**: `server`
3. **Environment**: `Node`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `ORIGIN`: `["https://your-app-name.vercel.app"]` (Replace with your actual Vercel URL)
   - `PORT`: `8000`
   - `MONGO_URI`: (Your MongoDB Connection String)
   - `REDIS_URL`: (Your Upstash Redis URL)
   - `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`: (Cloudinary Credentials)
   - `JWT_SECRET`, `ACCESS_TOKEN`, `REFRESH_TOKEN`: (Random strings for security)

### 2. Frontend (Vercel)
1. **New Project**: Connect your GitHub repository.
2. **Framework Preset**: `Next.js`
3. **Root Directory**: `client`
4. **Environment Variables**:
   - `NEXT_PUBLIC_SERVER_URI`: `https://your-render-name.onrender.com/api/v1/`
   - `NEXT_PUBLIC_SOCKET_SERVER_URI`: `https://your-render-name.onrender.com/`
   - `NEXTAUTH_URL`: `https://your-app-name.vercel.app`
   - `SECRET`: (Random long string for NextAuth)
   - `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, etc. (If using Social Auth)

## Avoiding CORS Errors
- Ensure the `ORIGIN` in the backend exactly matches your Vercel URL (without a trailing slash).
- Ensure the `NEXT_PUBLIC_SERVER_URI` in the frontend exactly matches your Render URL (must end with `/api/v1/` as per the current codebase).
- If you change the Vercel domain later, remember to update the `ORIGIN` in Render environment variables.
