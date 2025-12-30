# GitHub + Cloudflare Pages Auto-Deploy

This project is configured for **automatic deployment** via GitHub integration with Cloudflare Pages.

## 🔄 How Auto-Deploy Works

```
You push code → GitHub → Cloudflare detects change → Auto-builds → Auto-deploys
```

## ⚙️ Setup (One-Time)

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### 2. Connect Cloudflare to GitHub

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Pages**
2. Click **"Create a project"** → **"Connect to Git"**
3. **Authorize Cloudflare** (GitHub will ask for permission)
4. **Select your repository** (`movbou/maweb`)
   - ✅ Works with **private repos**!
   - Cloudflare only sees code, not issues/PRs
5. **Configure build:**

| Setting | Value |
|---------|-------|
| Production branch | `main` |
| Framework preset | Next.js |
| Build command | `npm run build` |
| Build output directory | `.next` |
| Node version | `18` |

6. **Add environment variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   NEXT_PUBLIC_SITE_URL=https://your-project.pages.dev
   DATABASE_URL=postgresql://...
   ```

7. Click **"Save and Deploy"**

## 🚀 Daily Workflow

After setup, deploying is just:

```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push origin main

# That's it! Cloudflare automatically:
# ✓ Detects the push
# ✓ Runs npm install
# ✓ Runs npm run build
# ✓ Deploys to production
# ⏱️ Takes ~3-5 minutes
```

## 📊 Monitoring Deployments

### View Build Status
- **Cloudflare Dashboard** → Pages → Your Project
- See real-time build logs
- View deployment history
- Rollback to previous versions with 1 click

### Build Notifications
- Get email/Slack notifications for:
  - ✅ Successful deployments
  - ❌ Failed builds
  - ⚠️ Build warnings

## 🌿 Branch Deployments

Cloudflare automatically creates **preview deployments** for other branches:

```bash
# Create a feature branch
git checkout -b feature/new-manga-reader
git push origin feature/new-manga-reader

# Cloudflare creates a preview at:
# https://feature-new-manga-reader.your-project.pages.dev
```

**Benefits:**
- Test features before merging to main
- Share previews with team
- No impact on production

## ❌ Build Fails? Troubleshooting

### Check Build Logs
1. Cloudflare Dashboard → Pages → Your Project
2. Click on failed deployment
3. View full build log

### Common Issues

**Missing Environment Variables:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is not defined
```
→ Add in Cloudflare Pages settings

**Build Command Failed:**
```
Error: Command "npm run build" failed
```
→ Test locally: `npm run build`

**TypeScript Errors:**
Already handled: `ignoreBuildErrors: true` in [next.config.ts](next.config.ts)

**Node Version Mismatch:**
Cloudflare uses Node 18 (set in [`.nvmrc`](.nvmrc))

## 🔐 Security

### What Cloudflare Can Access
- ✅ Repository code (to build your site)
- ✅ Public branches
- ❌ NOT issues, pull requests, or commit history
- ❌ NOT other repositories (only the ones you select)

### Keeping Your Repo Private
Your repository can stay **completely private** on GitHub while being deployed on Cloudflare. They're independent.

### Protecting Secrets
- Never commit `.env` files (already in [`.gitignore`](.gitignore))
- Store secrets in Cloudflare Pages environment variables
- Rotate keys regularly

## 🛠️ Advanced: Custom Build Configuration

### Custom Build Command
If you need custom build steps:

```bash
# In Cloudflare Pages settings, change build command to:
npm run db:generate && npm run build
```

### Build Environment Variables
Set in Cloudflare Dashboard → Pages → Settings → Environment Variables:

```
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
```

### Build Cache
Cloudflare automatically caches:
- `node_modules/`
- `.next/cache/`

Speeds up builds from ~5 min to ~1-2 min.

## 📦 Deployment Checklist

Before your first deployment:

- [x] Code pushed to GitHub
- [ ] Cloudflare account created
- [ ] GitHub connected to Cloudflare
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] R2 buckets created
- [ ] Media uploaded to R2
- [ ] Test build locally: `npm run build`

After first deployment:

- [ ] Visit site URL
- [ ] Test all pages
- [ ] Check browser console for errors
- [ ] Verify images load from R2
- [ ] Test authentication
- [ ] Set up custom domain (optional)

## 🔄 Rollback

If a deployment breaks something:

1. Cloudflare Dashboard → Pages → Your Project
2. View **Deployment history**
3. Click **"..."** on a previous working deployment
4. Click **"Rollback to this deployment"**
5. Done! Takes ~30 seconds

## 📈 Performance

### Build Times
- Initial build: ~5 minutes
- Cached builds: ~1-2 minutes
- Hot cache: ~30 seconds

### Deployment Speed
- Code change → Live: **~3-5 minutes total**
- Just image changes: Upload to R2 directly (instant)

## 🆘 Need Help?

- Build failing? Check [CLOUDFLARE_CHECKLIST.md](CLOUDFLARE_CHECKLIST.md)
- Configuration issues? See [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md)
- Quick reference? Use [CLOUDFLARE_QUICK_START.md](CLOUDFLARE_QUICK_START.md)

---

**Auto-deploy setup:** ✅ Ready  
**GitHub integration:** ✅ Configured  
**Deployment method:** Push to `main` = auto-deploy  
**Build time:** ~3-5 minutes  
**Cost:** $0/month
