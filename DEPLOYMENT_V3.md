# Vercel Deployment Guide (Frontend & Backend)

This guide provides step-by-step instructions for deploying both the frontend (Next.js) and backend (Express) on Vercel.

## 1. Backend Deployment (Vercel)

### Preparation
- Ensure `server/vercel.json` exists (I have already created this).
- Your backend code should be in the `server` directory.

### Vercel Settings
- **Project Name**: `access-edu-api` (or similar)
- **Framework Preset**: `Other`
- **Root Directory**: `server`
- **Build Command**: `npm run build` (or leave empty if using `@vercel/node`)
- **Output Directory**: `.` (default)

### Environment Variables
| Variable | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `8000` |
| `DB_URL` | Your MongoDB URI |
| `REDIS_URL` | Your Redis URI |
| `CLOUD_NAME` | Your Cloudinary Name |
| `CLOUD_API_KEY` | Your Cloudinary API Key |
| `CLOUD_SECRET_KEY` | Your Cloudinary Secret |
| `ACTIVATION_SECRET` | Any random string |
| `ACCESS_TOKEN` | Any random string |
| `REFRESH_TOKEN` | Any random string |
| `ACCESS_TOKEN_EXPIRE` | `1` (hour) |
| `REFRESH_TOKEN_EXPIRE` | `3` (days) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SERVICE` | `gmail` |
| `SMTP_MAIL` | Your Email |
| `SMTP_PASSWORD` | Your App Password |
| `ORIGIN` | `https://your-frontend-domain.vercel.app` |

---

## 2. Frontend Deployment (Vercel)

### Vercel Settings
- **Project Name**: `access-edu-client`
- **Framework Preset**: `Next.js`
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Environment Variables
| Variable | Value |
| :--- | :--- |
| `NEXT_PUBLIC_SERVER_URI` | `https://your-backend-domain.vercel.app/api/v1` |
| `NEXT_PUBLIC_SOCKET_SERVER_URI` | `https://your-backend-domain.vercel.app` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `GITHUB_CLIENT_ID` | Your GitHub Client ID |
| `GITHUB_CLIENT_SECRET` | Your GitHub Client Secret |
| `NEXTAUTH_SECRET` | Any random string |
| `NEXTAUTH_URL` | `https://your-frontend-domain.vercel.app` |

---

## Important Checklist
1.  **CORS**: Ensure `ORIGIN` in backend matches your frontend URL.
2.  **Cookies**: Vercel handles HTTPS by default, so `sameSite: 'none'` and `secure: true` (already configured in code) will work.
3.  **URLs**: Do NOT add trailing slashes to `NEXT_PUBLIC_SERVER_URI` unless you handle it in code.
4.  **Google/GitHub Auth**: Update Authorized Redirect URIs in respective consoles to match your production domain.
5.  **Node.js Version**: Ensure both projects use Node.js `24.x` (already updated in `package.json`).
