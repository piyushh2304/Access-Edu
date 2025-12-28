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

### Server
- **VPS (Ubuntu/DigitalOcean)**: Use PM2 to keep the server running (`pm2 start build/server.js`).
- **Render/Railway**: Connect repository, set build command to `npm install && npm run build`, start command to `npm start`.

### Client
- **Vercel**: Connect repository. It usually auto-detects Next.js. Add environment variables in Vercel dashboard.
