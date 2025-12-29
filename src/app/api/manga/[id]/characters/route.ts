import { NextRequest, NextResponse } from 'next/server'
import { JikanMangaAPI } from '@/lib/jikan-manga-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const characters = await JikanMangaAPI.getMangaCharacters(id)

    return NextResponse.json(characters)
  } catch (error) {
    console.error('Error fetching manga characters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch manga characters' },
      { status: 500 }
    )
  }
}
