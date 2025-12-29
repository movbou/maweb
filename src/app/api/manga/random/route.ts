import { NextRequest, NextResponse } from 'next/server'
import { JikanMangaAPI } from '@/lib/jikan-manga-api'

export async function GET(request: NextRequest) {
  try {
    const manga = await JikanMangaAPI.getRandomManga()

    if (!manga) {
      return NextResponse.json(
        { error: 'Failed to fetch random manga' },
        { status: 404 }
      )
    }

    return NextResponse.json(manga)
  } catch (error) {
    console.error('Error fetching random manga:', error)
    return NextResponse.json(
      { error: 'Failed to fetch random manga' },
      { status: 500 }
    )
  }
}
