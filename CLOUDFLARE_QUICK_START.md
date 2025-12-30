# 🚀 Quick Start: Deploy to Cloudflare (Free Tier)

This guide will get your anime/manga website live on Cloudflare in ~30 minutes.

## Prerequisites ✅

- [x] Cloudflare account (free) - [Sign up](https://dash.cloudflare.com/sign-up)
- [x] GitHub account - [Sign up](https://github.com/join)
- [x] Supabase account (free) - [Sign up](https://supabase.com)

## Step-by-Step Guide

### 1️⃣ Set Up Cloudflare R2 (5 minutes)

```bash
# Install Cloudflare CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create storage buckets (FREE: 10GB storage)
wrangler r2 bucket create manga-storage
wrangler r2 bucket create anime-storage
```

**Get R2 Credentials:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Click "Manage R2 API Tokens"
3. Create API Token with "Edit" permissions
4. Save the credentials:
   - `Account ID`
   - `Access Key ID`
   - `Secret Access Key`

**Enable Public Access:**
1. Go to R2 → `manga-storage` → Settings
2. Click "Allow Access" under Public Access
3. Copy your public URL: `https://pub-xxxxx.r2.dev`

### 2️⃣ Configure Environment (2 minutes)

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your credentials
nano .env.production
```

Fill in:
```env
# Supabase (you already have this)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### 3️⃣ Upload Media Files (10 minutes)

Install AWS SDK (needed for R2):
```bash
npm install --save-dev @aws-sdk/client-s3
```

Upload your manga/anime files:
```bash
# Upload all media to R2
npm run upload:r2
```

This will upload everything from:
- `public/manga/` → R2 bucket
- `public/anime/` → R2 bucket

### 4️⃣ Deploy to Cloudflare Pages (5 minutes)

**Option A: Via GitHub (Recommended)**

1. Push your code to GitHub:
```bash
git add .
git commit -m "feat: ready for Cloudflare deployment"
git push origin main
```

2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages
3. Click **"Create a project"** → **"Connect to Git"**
4. Select your repository
5. Configure build:
   - **Framework**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_R2_PUBLIC_URL`
   - `NEXT_PUBLIC_SITE_URL` (use `https://your-project.pages.dev`)
7. Click **"Save and Deploy"**

**Option B: Direct Deploy**

```bash
# One command deploy
npm run deploy:cloudflare
```

### 5️⃣ Verify Deployment (5 minutes)

1. **Check deployment status:**
   - Go to Cloudflare Pages → Your Project
   - Wait for build to complete (~3 minutes)

2. **Test your site:**
   - Visit: `https://your-project.pages.dev`
   - Test manga reader
   - Test anime pages
   - Check image loading from R2

3. **Check logs:**
   - Cloudflare Dashboard → Pages → Your Project → View build log

### 6️⃣ Add Custom Domain (Optional - 5 minutes)

1. Cloudflare Pages → Your Project → Custom domains
2. Click "Set up a custom domain"
3. Enter your domain (e.g., `myanimesite.com`)
4. Cloudflare auto-configures DNS
5. Wait for SSL certificate (~5 minutes)

## 🎯 You're Live!

Your site is now:
- ✅ Hosted on Cloudflare Pages (unlimited bandwidth)
- ✅ Media served from R2 (no egress fees!)
- ✅ Globally distributed via CDN
- ✅ Auto-deployed on git push
- ✅ HTTPS enabled

## 💰 Cost Breakdown (Monthly)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| Cloudflare Pages | Unlimited requests | ∞ | **$0** |
| Cloudflare R2 | 10 GB storage | Your media | **$0** |
| R2 Bandwidth | Unlimited | ∞ | **$0** |
| Supabase | 500 MB DB | Auth + data | **$0** |
| **Total** | | | **$0/month** 🎉 |

## 🔧 Maintenance

### Update Media Files
```bash
# Add new manga/anime to public/ folder
npm run upload:r2
```

### Redeploy Site
```bash
# Automatic via Git
git push origin main

# Or manual
npm run deploy:cloudflare
```

### Monitor Usage
- R2 Storage: Dashboard → R2 → Usage
- Pages Builds: Dashboard → Pages → Analytics
- Database: Supabase Dashboard → Database

## 🚨 Troubleshooting

### Images not loading
```bash
# Check R2 public access is enabled
# Verify NEXT_PUBLIC_R2_PUBLIC_URL is correct
# Check browser console for CORS errors
```

### Build fails
```bash
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors (set ignoreBuildErrors: true)
# 3. ESLint errors (set ignoreDuringBuilds: true)
```

### Out of storage
```bash
# Compress images before upload
npm install -g sharp-cli
sharp input.jpg -o output.webp --webp

# Or upgrade R2: $0.015/GB (still cheaper than alternatives)
```

## 📚 Next Steps

1. **Optimize Performance:**
   - Enable caching headers
   - Use WebP images
   - Implement lazy loading

2. **Add Analytics:**
   - Cloudflare Web Analytics (free)
   - Google Analytics

3. **SEO Optimization:**
   - Add meta tags
   - Generate sitemap
   - Submit to search engines

4. **Monitoring:**
   - Set up Cloudflare alerts
   - Monitor R2 usage
   - Track Supabase metrics

## 🆘 Need Help?

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Supabase Docs](https://supabase.com/docs)

---

**Estimated Time: 30 minutes**  
**Cost: $0/month** (within free tiers)  
**Difficulty: Beginner-friendly** ⭐⭐☆☆☆
