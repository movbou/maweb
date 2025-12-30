/**
 * Helper functions for handling media URLs (local vs R2)
 */

// Get the base URL for media files
export function getMediaBaseUrl(): string {
  // In production, use R2
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
    return process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  }
  
  // In development, use local files
  return '';
}

// Get full URL for manga image
export function getMangaImageUrl(mangaId: string, chapterId: string, page: number | string): string {
  const baseUrl = getMediaBaseUrl();
  const pageName = typeof page === 'number' ? `${page}.jpg` : page;
  
  if (baseUrl) {
    return `${baseUrl}/manga/${mangaId}/${chapterId}/${pageName}`;
  }
  
  return `/manga/${mangaId}/${chapterId}/${pageName}`;
}

// Get full URL for anime thumbnail
export function getAnimeThumbnailUrl(animeId: string): string {
  const baseUrl = getMediaBaseUrl();
  
  if (baseUrl) {
    return `${baseUrl}/anime/thumbnails/${animeId}.jpg`;
  }
  
  return `/anime/thumbnails/${animeId}.jpg`;
}

// Get full URL for anime video
export function getAnimeVideoUrl(animeId: string, episode: number, quality: string = '720p'): string {
  const baseUrl = getMediaBaseUrl();
  
  if (baseUrl) {
    return `${baseUrl}/anime/${animeId}/episode-${episode}-${quality}.mp4`;
  }
  
  return `/anime/${animeId}/episode-${episode}-${quality}.mp4`;
}

// Preload image for better performance
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

// Batch preload images
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map(url => preloadImage(url)));
}
