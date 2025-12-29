# 📚 Manga Testing Guide

This guide will help you test the new manga functionality.

## 🚀 Quick Start

### 1. Setup Test Manga Pages

```bash
npm run setup:manga
```

This will create test manga pages in `public/manga/test/` with 3 chapters of 5 pages each.

### 2. Start the Development Server (if not already running)

```bash
npm run dev
```

Wait for the server to start on `http://localhost:3000`

### 3. Test Manually

Visit these pages in your browser:

- **Browse Manga**: http://localhost:3000/manga/browse
- **Manga Detail**: http://localhost:3000/manga/1
- **Manga Reader**: http://localhost:3000/manga/1/read/1

#### Reader Controls:
- **Arrow Keys**: Navigate between pages
- **Settings Icon**: Switch reading modes (Horizontal/Vertical)
- **Fullscreen Icon**: Toggle fullscreen
- **Bottom Slider**: Jump to specific page
- **Previous/Next Chapter**: Navigate chapters

### 4. Run Automated Tests

```bash
# Run all manga tests
npm run test:manga

# Run with interactive UI
npm run test:manga:ui

# Run specific test file
npx playwright test tests/manga.spec.ts --project=chromium

# View test report
npx playwright show-report
```

## 🧪 Test Coverage

The test suite covers:

### UI Tests
- ✅ Navigation to manga browse page
- ✅ Display of type filter tabs (All/Manga/Manhwa/Manhua)
- ✅ Search functionality
- ✅ Type filtering
- ✅ Manga detail page loading
- ✅ Reader navigation
- ✅ Reader controls (play, settings, fullscreen)
- ✅ Page navigation with keyboard
- ✅ Chapter navigation
- ✅ Reading mode toggle

### API Tests
- ✅ `/api/manga/popular` - Popular manga endpoint
- ✅ `/api/manga/random` - Random manga discovery
- ✅ `/api/manga/search` - Search functionality
- ✅ `/api/manga/[id]` - Manga details
- ✅ `/api/manga/[id]/read/[chapterId]` - Chapter pages

## 📁 Test Files Structure

```
public/manga/test/
├── chapter1/
│   ├── page1.jpg
│   ├── page2.jpg
│   ├── page3.jpg
│   ├── page4.jpg
│   └── page5.jpg
├── chapter2/
│   └── (5 pages)
└── chapter3/
    └── (5 pages)
```

## 🐛 Troubleshooting

### Server Not Starting
```bash
# Kill any process on port 3000
npx kill-port 3000

# Restart server
npm run dev
```

### Test Manga Pages Not Loading
```bash
# Re-create test manga pages
rm -rf public/manga/test
npm run setup:manga
```

### Playwright Not Installed
```bash
npx playwright install chromium
```

### API Rate Limiting (429 errors)
The Jikan API has rate limits. If you see 429 errors:
- Wait 60 seconds before retrying
- The manga reader uses local test images, so it won't be affected

## 🎨 Features Implemented

### Pages
1. **Browse Page** (`/manga/browse`)
   - Search bar
   - Type filters (All/Manga/Manhwa/Manhua)
   - Grid of manga cards
   - Loading skeletons

2. **Detail Page** (`/manga/[id]`)
   - Hero banner
   - Synopsis
   - Characters grid
   - Chapters list
   - "Start Reading" button
   - Info sidebar with stats

3. **Reader Page** (`/manga/[id]/read/[chapterId]`)
   - Full-screen reader
   - Swiper.js integration
   - Horizontal & vertical reading modes
   - Keyboard navigation
   - Zoom support
   - Page slider
   - Chapter navigation

### API Endpoints
- `GET /api/manga/search` - Search and browse
- `GET /api/manga/[id]` - Get manga details
- `GET /api/manga/[id]/characters` - Get characters
- `GET /api/manga/[id]/read/[chapterId]` - Get chapter pages
- `GET /api/manga/popular` - Popular manga
- `GET /api/manga/random` - Random manga

### Database
- `user_manga_list` - User manga tracking
- `user_manga_reading_history` - Reading progress

## 📝 Notes

- Test manga uses placeholder images from `via.placeholder.com`
- In production, you would integrate with a manga scraper or API
- The reader supports both horizontal (traditional) and vertical (webtoon) reading modes
- All manga data comes from the Jikan API (MyAnimeList)

## 🎉 Success Criteria

The manga feature is working correctly if:
- ✅ You can browse manga
- ✅ Search works
- ✅ Filters work
- ✅ Detail page loads
- ✅ Reader loads with pages
- ✅ Keyboard navigation works
- ✅ Chapter navigation works
- ✅ All Playwright tests pass

Enjoy reading! 📖✨
