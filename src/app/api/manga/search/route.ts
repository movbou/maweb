import { NextRequest, NextResponse } from 'next/server'
import { JikanMangaAPI } from '@/lib/jikan-manga-api'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const type = searchParams.get('type') || undefined
    const status = searchParams.get('status') || undefined
    const genres = searchParams.get('genres') || undefined
    const order_by = searchParams.get('order_by') || undefined
    const sort = searchParams.get('sort') as 'asc' | 'desc' | undefined

    let results
    if (query) {
      results = await JikanMangaAPI.searchManga(query, limit, page, {
        type,
        status,
        genres,
        order_by,
        sort,
      })
    } else {
      results = await JikanMangaAPI.getTopManga(limit, page)
    }

    return NextResponse.json({
      results,
      total: results.length,
      page,
      perPage: limit,
      hasNextPage: results.length === limit,
    })
  } catch (error) {
    console.error('Error in manga search API:', error)
    return NextResponse.json(
      { error: 'Failed to search manga' },
      { status: 500 }
    )
  }
}
