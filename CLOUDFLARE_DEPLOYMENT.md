# Cloudflare Deployment Guide

## Prerequisites
1. Cloudflare account (free tier)
2. GitHub account (for Pages deployment)
3. Supabase account (for database)

## Step-by-Step Deployment

### 1. Install Cloudflare CLI
```bash
npm install -g wrangler
wrangler login
```

### 2. Create Cloudflare R2 Bucket for Media Storage

```bash
# Create bucket for manga images
wrangler r2 bucket create manga-storage

# Create bucket for anime videos (if needed)
wrangler r2 bucket create anime-storage
```

### 3. Set Up R2 Public Access

In Cloudflare Dashboard:
- Go to R2 → Your Bucket → Settings
- Enable "Public Access" or set up custom domain
- Note your R2 public URL: `https://pub-xxxxx.r2.dev`

### 4. Update Environment Variables

Create `.env.production`:
```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Cloudflare R2
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key

# API endpoints
NEXT_PUBLIC_API_URL=https://your-site.pages.dev
```

### 5. Modify Next.js Config for Cloudflare

Update `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  output: 'export', // For static export to Cloudflare Pages
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      // ... existing patterns
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev', // R2 public access
      },
    ],
  },
  trailingSlash: true, // Better compatibility with Pages
}
```

### 6. Create Cloudflare Pages Adapter

Create `wrangler.toml`:
```toml
name = "maweb"
compatibility_date = "2024-01-01"

[[r2_buckets]]
binding = "MANGA_BUCKET"
bucket_name = "manga-storage"

[[r2_buckets]]
binding = "ANIME_BUCKET"
bucket_name = "anime-storage"
```

### 7. Upload Media to R2

Using Wrangler CLI:
```bash
# Upload manga chapters
wrangler r2 object put manga-storage/manga/series-name/chapter-1/page-1.jpg --file ./public/manga/test/chapter1/1.jpg

# Bulk upload with script (recommended)
```

Create upload script `scripts/upload-to-r2.js`:
```javascript
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadDirectory(localPath, bucketName, remotePath = "") {
  const files = fs.readdirSync(localPath, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(localPath, file);
    if (fs.statSync(filePath).isFile()) {
      const fileContent = fs.readFileSync(filePath);
      const key = path.join(remotePath, file).replace(/\\/g, '/');
      
      await client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
      }));
      
      console.log(`Uploaded: ${key}`);
    }
  }
}

// Upload manga
uploadDirectory("./public/manga", "manga-storage", "manga");
```

### 8. Deploy to Cloudflare Pages

#### Option A: Via GitHub (Recommended)
1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Click "Create a project" → "Connect to Git"
4. Select your repository
5. Configure build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `out` (for static export) or `.next` (for Pages Functions)
   - **Environment variables**: Add all from `.env.production`
6. Click "Save and Deploy"

#### Option B: Direct Upload
```bash
npm run build
npx wrangler pages deploy out --project-name=maweb
```

### 9. Handle Socket.IO (WebSocket Alternative)

Since Cloudflare Pages doesn't support custom servers, replace Socket.IO with:

**Option 1: Cloudflare Durable Objects** (for real-time features)
- Requires paid plan ($5/month)

**Option 2: Supabase Realtime** (free alternative)
- Already using Supabase, just enable realtime features

Update your socket implementation to use Supabase Realtime:
```typescript
// lib/realtime.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function subscribeToUpdates(callback: (payload: any) => void) {
  const channel = supabase
    .channel('public-updates')
    .on('broadcast', { event: 'update' }, callback)
    .subscribe()
    
  return () => supabase.removeChannel(channel)
}
```

### 10. Update Media URLs in Code

Update any hardcoded paths to use R2:
```typescript
// Before
const imageUrl = `/manga/series/chapter/page.jpg`

// After
const imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/manga/series/chapter/page.jpg`
```

### 11. Set Up Custom Domain (Optional)

In Cloudflare Pages:
1. Go to your project → Custom domains
2. Add your domain
3. Cloudflare will automatically configure DNS

### 12. Optimize for Free Tier

**Cloudflare Pages Free Limits:**
- Unlimited requests
- 500 builds/month
- 20,000 files per deployment

**R2 Free Tier:**
- 10 GB storage
- No egress fees (huge savings!)
- 10M read requests/month
- 1M write requests/month

**Optimization Tips:**
1. Compress images before upload (use WebP format)
2. Use proper caching headers
3. Implement lazy loading for images
4. Consider HLS/DASH for video streaming

### 13. Test Your Deployment

```bash
# Test locally with production build
npm run build
npx serve out

# Test R2 access
curl https://pub-xxxxx.r2.dev/manga/test/chapter1/1.jpg
```

## Alternative: Using Cloudflare Workers (Advanced)

For more control, deploy as Cloudflare Workers:

```bash
# Install adapter
npm install --save-dev @cloudflare/next-on-pages

# Build
npx @cloudflare/next-on-pages

# Deploy
npx wrangler pages deploy .vercel/output/static
```

## Cost Breakdown (Free Tier)

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Pages | Unlimited requests | 500 builds/month |
| R2 Storage | 10 GB | Enough for ~10,000 manga images |
| R2 Bandwidth | Unlimited | No egress fees! |
| Supabase | 500 MB DB | Upgrade to $25/mo if needed |

## Troubleshooting

### Issue: Images not loading from R2
- Check CORS settings in R2 bucket
- Verify public access is enabled
- Check browser console for errors

### Issue: Build fails on Cloudflare Pages
- Ensure `output: 'export'` in next.config.ts
- Remove server-side only code (getServerSideProps)
- Use static generation (getStaticProps)

### Issue: API routes not working
- Convert to Cloudflare Pages Functions
- Move from `pages/api/*` to `functions/*`
- Or use Supabase Edge Functions

## Next Steps

1. Set up CI/CD for automatic deployments
2. Add Cloudflare Analytics (free)
3. Enable Cloudflare CDN caching
4. Set up error monitoring (Sentry free tier)
5. Implement progressive web app (PWA) features

## Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Next.js on Cloudflare](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Supabase Docs](https://supabase.com/docs)
