export interface Manga {
  id: string;
  title: {
    english: string;
    romaji?: string;
    native?: string;
  };
  image: string;
  banner?: string;
  type: "MANGA" | "NOVEL" | "ONE_SHOT" | "DOUJINSHI" | "MANHWA" | "MANHUA";
  status: "ONGOING" | "FINISHED" | "UPCOMING" | "HIATUS" | "DISCONTINUED";
  description: string;
  genres: string[];
  totalChapters: number;
  totalVolumes: number;
  currentChapter?: number;
  authors?: string[];
  serialization?: string[];
  publishedFrom?: string;
  publishedTo?: string;
  averageScore?: number;
  popularity?: number;
  favorites?: number;
  relations?: Manga[];
  characters?: MangaCharacter[];
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  volumeNumber?: number;
  pages: string[]; // Array of image URLs
  publishedDate?: string;
}

export interface MangaCharacter {
  id: string;
  name: {
    first: string;
    last?: string;
    full?: string;
    native?: string;
  };
  image: string;
  description?: string;
  role: string;
}

export interface SearchMangaFilters {
  type?: string;
  status?: string;
  genres?: string;
  order_by?: string;
  sort?: "asc" | "desc";
}

export interface MangaSearchResult {
  results: Manga[];
  total: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
}

export interface UserMangaListItem {
  id: string;
  userId: string;
  mangaId: string;
  mangaTitle: string;
  mangaImage?: string;
  mangaType?: string;
  status: "reading" | "completed" | "plan_to_read" | "dropped" | "on_hold";
  rating?: number;
  chaptersRead: number;
  volumesRead: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
