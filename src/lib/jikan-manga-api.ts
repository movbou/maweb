/**
 * Jikan Manga API Client
 * Official MyAnimeList API wrapper for Manga
 * Documentation: https://docs.api.jikan.moe/
 */

import axios, { AxiosInstance } from 'axios'
import { Manga, MangaCharacter, Chapter } from '@/types/manga'

export class JikanMangaAPI {
  private static instance: AxiosInstance = axios.create({
    baseURL: 'https://api.jikan.moe/v4',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Rate limiting helper
  private static lastRequestTime = 0
  private static readonly MIN_REQUEST_INTERVAL = 350 // Jikan rate limit: ~3 requests per second

  private static async rateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      )
    }
    this.lastRequestTime = Date.now()
  }

  /**
   * Get the best available image URL
   */
  private static getImageUrl(images: any): string {
    return images?.webp?.large_image_url || 
           images?.webp?.image_url || 
           images?.jpg?.large_image_url || 
           images?.jpg?.image_url || 
           ''
  }

  /**
   * Transform Jikan manga data to our Manga type
   */
  private static transformManga(jikanManga: any): Manga {
    const imageUrl = JikanMangaAPI.getImageUrl(jikanManga.images)
    
    return {
      id: jikanManga.mal_id.toString(),
      title: {
        english: jikanManga.title_english || jikanManga.title || '',
        romaji: jikanManga.title || '',
        native: jikanManga.title_japanese || jikanManga.title || '',
      },
      image: imageUrl,
      banner: imageUrl,
      type: JikanMangaAPI.transformType(jikanManga.type),
      status: JikanMangaAPI.transformStatus(jikanManga.status),
      description: jikanManga.synopsis || '',
      genres: jikanManga.genres?.map((g: any) => g.name) || [],
      totalChapters: jikanManga.chapters || 0,
      totalVolumes: jikanManga.volumes || 0,
      authors: jikanManga.authors?.map((a: any) => a.name) || [],
      serialization: jikanManga.serializations?.map((s: any) => s.name) || [],
      publishedFrom: jikanManga.published?.from || '',
      publishedTo: jikanManga.published?.to || '',
      averageScore: jikanManga.score || 0,
      popularity: jikanManga.popularity || 0,
      favorites: jikanManga.favorites || 0,
    }
  }

  private static transformType(type: string): "MANGA" | "NOVEL" | "ONE_SHOT" | "DOUJINSHI" | "MANHWA" | "MANHUA" {
    const typeMap: { [key: string]: "MANGA" | "NOVEL" | "ONE_SHOT" | "DOUJINSHI" | "MANHWA" | "MANHUA" } = {
      'Manga': 'MANGA',
      'Novel': 'NOVEL',
      'Light Novel': 'NOVEL',
      'One-shot': 'ONE_SHOT',
      'Doujinshi': 'DOUJINSHI',
      'Manhwa': 'MANHWA',
      'Manhua': 'MANHUA',
    }
    return typeMap[type] || 'MANGA'
  }

  private static transformStatus(status: string): "ONGOING" | "FINISHED" | "UPCOMING" | "HIATUS" | "DISCONTINUED" {
    const statusMap: { [key: string]: "ONGOING" | "FINISHED" | "UPCOMING" | "HIATUS" | "DISCONTINUED" } = {
      'Publishing': 'ONGOING',
      'Finished': 'FINISHED',
      'Not yet published': 'UPCOMING',
      'On Hiatus': 'HIATUS',
      'Discontinued': 'DISCONTINUED',
    }
    return statusMap[status] || 'FINISHED'
  }

  /**
   * Get top/popular manga
   */
  static async getTopManga(
    limit: number = 25, 
    page: number = 1,
    filter?: 'publishing' | 'upcoming' | 'bypopularity' | 'favorite'
  ): Promise<Manga[]> {
    try {
      await this.rateLimit()
      const params: any = { limit, page }
      if (filter) {
        params.filter = filter
      }
      const response = await this.instance.get('/top/manga', { params })
      return response.data.data.map(this.transformManga)
    } catch (error) {
      console.error('Error fetching top manga:', error)
      return []
    }
  }

  /**
   * Search manga by query
   */
  static async searchManga(
    query: string,
    limit: number = 25,
    page: number = 1,
    filters?: {
      type?: string
      status?: string
      genres?: string
      order_by?: string
      sort?: 'asc' | 'desc'
    }
  ): Promise<Manga[]> {
    try {
      await this.rateLimit()
      const response = await this.instance.get('/manga', {
        params: {
          q: query,
          limit,
          page,
          ...filters,
        },
      })
      return response.data.data.map(this.transformManga)
    } catch (error) {
      console.error('Error searching manga:', error)
      return []
    }
  }

  /**
   * Get manga by ID with full details
   */
  static async getMangaById(id: string): Promise<Manga | null> {
    try {
      await this.rateLimit()
      const response = await this.instance.get(`/manga/${id}/full`)
      return this.transformManga(response.data.data)
    } catch (error) {
      console.error(`Error fetching manga ${id}:`, error)
      return null
    }
  }

  /**
   * Get manga characters
   */
  static async getMangaCharacters(mangaId: string): Promise<MangaCharacter[]> {
    try {
      await this.rateLimit()
      const response = await this.instance.get(`/manga/${mangaId}/characters`)
      
      return response.data.data.slice(0, 20).map((item: any) => ({
        id: item.character.mal_id.toString(),
        name: {
          first: item.character.name.split(',')[0]?.trim() || '',
          last: item.character.name.split(',')[1]?.trim() || '',
          full: item.character.name,
          native: item.character.name,
        },
        image: JikanMangaAPI.getImageUrl(item.character.images),
        description: '',
        role: item.role || 'Supporting',
      }))
    } catch (error) {
      console.error(`Error fetching characters for manga ${mangaId}:`, error)
      return []
    }
  }

  /**
   * Get manga recommendations
   */
  static async getMangaRecommendations(mangaId: string): Promise<Manga[]> {
    try {
      await this.rateLimit()
      const response = await this.instance.get(`/manga/${mangaId}/recommendations`)
      
      return response.data.data.slice(0, 10).map((item: any) => 
        this.transformManga(item.entry)
      )
    } catch (error) {
      console.error(`Error fetching recommendations for manga ${mangaId}:`, error)
      return []
    }
  }

  /**
   * Get manga by genre
   */
  static async getMangaByGenre(genreId: number, limit: number = 25, page: number = 1): Promise<Manga[]> {
    try {
      await this.rateLimit()
      const response = await this.instance.get('/manga', {
        params: {
          genres: genreId,
          limit,
          page,
        },
      })
      return response.data.data.map(this.transformManga)
    } catch (error) {
      console.error(`Error fetching manga by genre ${genreId}:`, error)
      return []
    }
  }

  /**
   * Get random manga
   */
  static async getRandomManga(): Promise<Manga | null> {
    try {
      await this.rateLimit()
      const response = await this.instance.get('/random/manga')
      return this.transformManga(response.data.data)
    } catch (error) {
      console.error('Error fetching random manga:', error)
      return null
    }
  }
}
