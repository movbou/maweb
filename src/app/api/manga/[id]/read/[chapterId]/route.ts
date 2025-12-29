import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Helper to check if local manga pages exist
function getLocalMangaPages(mangaId: string, chapterId: string): string[] | null {
  try {
    const mangaDir = path.join(process.cwd(), 'public', 'manga', 'test', `chapter${chapterId}`)
    if (fs.existsSync(mangaDir)) {
      const files = fs.readdirSync(mangaDir)
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.svg'))
        .sort()
      
      if (files.length > 0) {
        return files.map(file => `/manga/test/chapter${chapterId}/${file}`)
      }
    }
  } catch (error) {
    console.error('Error reading local manga pages:', error)
  }
  return null
}

// Mock chapter data with sample images
// In production, you would scrape or use a manga API that provides chapter images
const mockChapterDatabase: Record<string, { id: string; title: string; chapterNumber: number; pages: string[] }> = {
  "1-1": {
    id: "1-1",
    title: "Chapter 1",
    chapterNumber: 1,
    pages: [
      "https://via.placeholder.com/800x1200/0a0e27/ffffff?text=Chapter+1+Page+1",
      "https://via.placeholder.com/800x1200/0a0e27/ffffff?text=Chapter+1+Page+2",
      "https://via.placeholder.com/800x1200/0a0e27/ffffff?text=Chapter+1+Page+3",
      "https://via.placeholder.com/800x1200/0a0e27/ffffff?text=Chapter+1+Page+4",
      "https://via.placeholder.com/800x1200/0a0e27/ffffff?text=Chapter+1+Page+5",
    ]
  },
  "1-2": {
    id: "1-2",
    title: "Chapter 2",
    chapterNumber: 2,
    pages: [
      "https://via.placeholder.com/800x1200/16213e/ffffff?text=Chapter+2+Page+1",
      "https://via.placeholder.com/800x1200/16213e/ffffff?text=Chapter+2+Page+2",
      "https://via.placeholder.com/800x1200/16213e/ffffff?text=Chapter+2+Page+3",
      "https://via.placeholder.com/800x1200/16213e/ffffff?text=Chapter+2+Page+4",
      "https://via.placeholder.com/800x1200/16213e/ffffff?text=Chapter+2+Page+5",
    ]
  },
  "1-3": {
    id: "1-3",
    title: "Chapter 3",
    chapterNumber: 3,
    pages: [
      "https://via.placeholder.com/800x1200/1a2332/ffffff?text=Chapter+3+Page+1",
      "https://via.placeholder.com/800x1200/1a2332/ffffff?text=Chapter+3+Page+2",
      "https://via.placeholder.com/800x1200/1a2332/ffffff?text=Chapter+3+Page+3",
      "https://via.placeholder.com/800x1200/1a2332/ffffff?text=Chapter+3+Page+4",
      "https://via.placeholder.com/800x1200/1a2332/ffffff?text=Chapter+3+Page+5",
    ]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; chapterId: string } }
) {
  try {
    const { id, chapterId } = params
    
    // Create a unique key for the chapter
    const chapterKey = `${id}-${chapterId}`
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // First, try to get local manga pages
    const localPages = getLocalMangaPages(id, chapterId)
    
    // Get chapter data or return mock data
    let chapter = mockChapterDatabase[chapterKey]
    
    // If local pages exist, use them instead of placeholders
    if (localPages && localPages.length > 0) {
      chapter = {
        id: chapterKey,
        title: `Chapter ${chapterId}`,
        chapterNumber: parseInt(chapterId),
        pages: localPages
      }
    } else if (!chapter) {
      // Default mock data if nothing exists
      chapter = {
        id: chapterKey,
        title: `Chapter ${chapterId}`,
        chapterNumber: parseInt(chapterId),
        pages: Array.from({ length: 5 }, (_, i) => 
          `https://via.placeholder.com/800x1200/1a1a1a/ffffff?text=Chapter+${chapterId}+Page+${i + 1}`
        )
      }
    }

    return NextResponse.json(chapter)
  } catch (error) {
    console.error('Error fetching chapter:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    )
  }
}
