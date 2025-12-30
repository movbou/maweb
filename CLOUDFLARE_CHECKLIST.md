# Cloudflare Deployment Checklist

## Pre-Deployment Checklist

### 1. Cloudflare Setup
- [ ] Create Cloudflare account
- [ ] Install Wrangler CLI: `npm install -g wrangler`
- [ ] Login to Cloudflare: `wrangler login`
- [ ] Create R2 buckets:
  - [ ] `wrangler r2 bucket create manga-storage`
  - [ ] `wrangler r2 bucket create anime-storage`
- [ ] Enable R2 public access
- [ ] Get R2 API credentials (Account ID, Access Key, Secret Key)
- [ ] Save R2 public URL

### 2. Environment Variables
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in Supabase credentials:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `DATABASE_URL`
- [ ] Fill in R2 credentials:
  - [ ] `R2_ACCOUNT_ID`
  - [ ] `R2_ACCESS_KEY_ID`
  - [ ] `R2_SECRET_ACCESS_KEY`
  - [ ] `NEXT_PUBLIC_R2_PUBLIC_URL`

### 3. Code Updates
- [ ] Update media URLs to use helper functions from `src/lib/media-urls.ts`
- [ ] Test locally with R2 URLs
- [ ] Ensure no hardcoded localhost URLs
- [ ] Update API endpoints to use environment variables
- [ ] Remove or replace Socket.IO if not using Durable Objects

### 4. Media Upload
- [ ] Install AWS SDK: `npm install --save-dev @aws-sdk/client-s3`
- [ ] Organize media files in `public/manga/` and `public/anime/`
- [ ] Run upload script: `npm run upload:r2`
- [ ] Verify files in Cloudflare R2 dashboard
- [ ] Test media URLs: `https://pub-xxxxx.r2.dev/manga/test/chapter1/1.jpg`

### 5. Database Setup
- [ ] Ensure Supabase project is created
- [ ] Run migrations: `npm run db:push` or use Supabase SQL editor
- [ ] Test database connection
- [ ] Set up authentication policies
- [ ] Enable Row Level Security (RLS) if needed

### 6. Build & Test
- [ ] Install dependencies: `npm install`
- [ ] Run build locally: `npm run build`
- [ ] Fix any build errors
- [ ] Test production build: `npm start`
- [ ] Verify all pages load
- [ ] Test manga reader
- [ ] Test anime player

### 7. GitHub Setup (for auto-deploy)
- [ ] Push code to GitHub
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Create `.gitignore` entry for sensitive files
- [ ] Tag version: `git tag v1.0.0 && git push --tags`

### 8. Cloudflare Pages Deployment
- [ ] Go to Cloudflare Dashboard → Pages
- [ ] Click "Create a project"
- [ ] Connect to GitHub repository
- [ ] Configure build settings:
  - [ ] Framework: Next.js
  - [ ] Build command: `npm run build`
  - [ ] Build output: `out` or `.next`
  - [ ] Node version: 18 or higher
- [ ] Add environment variables in Pages settings
- [ ] Deploy!

### 9. Post-Deployment Verification
- [ ] Visit deployed URL: `https://your-project.pages.dev`
- [ ] Test all pages:
  - [ ] Home page
  - [ ] Manga browse
  - [ ] Manga reader
  - [ ] Anime pages
  - [ ] Search functionality
  - [ ] User authentication
- [ ] Check browser console for errors
- [ ] Verify images load from R2
- [ ] Test on mobile devices
- [ ] Check page load speed

### 10. Custom Domain (Optional)
- [ ] Add custom domain in Cloudflare Pages
- [ ] Wait for DNS propagation (~5 minutes)
- [ ] Verify SSL certificate
- [ ] Update `NEXT_PUBLIC_SITE_URL` to custom domain
- [ ] Test with custom domain

### 11. Monitoring & Analytics
- [ ] Enable Cloudflare Web Analytics
- [ ] Set up Cloudflare alerts for:
  - [ ] R2 usage (near 10 GB limit)
  - [ ] Build failures
  - [ ] 5xx errors
- [ ] Monitor Supabase usage
- [ ] Set up error tracking (Sentry, etc.)

### 12. Performance Optimization
- [ ] Enable Cloudflare caching
- [ ] Set cache TTL for static assets
- [ ] Compress images (WebP format)
- [ ] Implement lazy loading
- [ ] Add service worker for offline support
- [ ] Enable Cloudflare Auto Minify (HTML, CSS, JS)

### 13. SEO & Marketing
- [ ] Add meta tags for SEO
- [ ] Create `robots.txt`
- [ ] Generate `sitemap.xml`
- [ ] Submit to Google Search Console
- [ ] Add Open Graph tags for social sharing
- [ ] Set up Google Analytics

## Common Issues & Solutions

### Build Fails
```bash
# Issue: TypeScript errors
# Solution: Set ignoreBuildErrors: true in next.config.ts

# Issue: Missing dependencies
# Solution: npm install

# Issue: Environment variables not found
# Solution: Add to Cloudflare Pages settings
```

### Images Not Loading
```bash
# Issue: CORS error
# Solution: Enable R2 public access and add CORS rules

# Issue: Wrong URL
# Solution: Verify NEXT_PUBLIC_R2_PUBLIC_URL is correct

# Issue: Files not uploaded
# Solution: Run npm run upload:r2 again
```

### Database Connection Failed
```bash
# Issue: Wrong credentials
# Solution: Verify Supabase URL and keys

# Issue: Database not accessible
# Solution: Check Supabase project status

# Issue: RLS blocking access
# Solution: Review Supabase policies
```

## Deployment Commands Quick Reference

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Create buckets
wrangler r2 bucket create manga-storage

# Upload media
npm run upload:r2

# Build
npm run build

# Deploy to Cloudflare Pages
npm run deploy:cloudflare

# Or use wrangler directly
wrangler pages deploy out --project-name=maweb

# Check deployment status
wrangler pages deployment list --project-name=maweb
```

## Free Tier Limits

| Service | Limit | Notes |
|---------|-------|-------|
| Cloudflare Pages | Unlimited requests | ✅ Free forever |
| R2 Storage | 10 GB | ✅ $0.015/GB after |
| R2 Bandwidth | Unlimited | ✅ No egress fees! |
| R2 Read Operations | 10M/month | ✅ Very generous |
| R2 Write Operations | 1M/month | ✅ Enough for regular updates |
| Supabase DB | 500 MB | Upgrade to $25/mo if needed |
| Supabase Auth | Unlimited | ✅ Free forever |
| Pages Builds | 500/month | ✅ ~16 builds/day |

## Support Resources

- [Cloudflare Discord](https://discord.gg/cloudflaredev)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Supabase Discord](https://discord.supabase.com/)
- [Next.js Discord](https://discord.gg/nextjs)

## Estimated Timeline

- Initial setup: **30 minutes**
- Media upload: **10-30 minutes** (depending on file size)
- First deployment: **5 minutes**
- Testing & fixes: **30-60 minutes**
- Total: **~2 hours**

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0
