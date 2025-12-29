import { NextRequest, NextResponse } from 'next/server'
import { JikanMangaAPI } from '@/lib/jikan-manga-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const manga = await JikanMangaAPI.getMangaById(id)

    if (!manga) {
      return NextResponse.json(
        { error: 'Manga not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(manga)
  } catch (error) {
    console.error('Error fetching manga details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manga details' },
      { status: 500 }
    )
  }
}
