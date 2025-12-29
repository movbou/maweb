import { NextRequest, NextResponse } from 'next/server'
import { JikanMangaAPI } from '@/lib/jikan-manga-api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25')
    const page = parseInt(searchParams.get('page') || '1')
    
    const manga = await JikanMangaAPI.getTopManga(limit, page, 'bypopularity')

    return NextResponse.json(manga)
  } catch (error) {
    console.error('Error fetching popular manga:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular manga' },
      { status: 500 }
    )
  }
}
