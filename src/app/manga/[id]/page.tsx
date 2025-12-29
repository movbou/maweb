"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, BookOpen, Star, Users, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Manga, MangaCharacter } from "@/types/manga"

export default function MangaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const mangaId = params?.id as string
  
  const [manga, setManga] = useState<Manga | null>(null)
  const [characters, setCharacters] = useState<MangaCharacter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mangaId) {
      fetchMangaDetails()
    }
  }, [mangaId])

  const fetchMangaDetails = async () => {
    setLoading(true)
    try {
      const [mangaRes, charactersRes] = await Promise.all([
        fetch(`/api/manga/${mangaId}`),
        fetch(`/api/manga/${mangaId}/characters`)
      ])

      const mangaData = await mangaRes.json()
      const charactersData = await charactersRes.json()

      setManga(mangaData)
      setCharacters(charactersData || [])
    } catch (error) {
      console.error('Error fetching manga details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!manga) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Manga not found</h2>
        <Button onClick={() => router.push('/manga/browse')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Browse
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-96 w-full">
        <Image
          src={manga.banner || manga.image}
          alt={manga.title.english}
          fill
          className="object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {manga.title.english}
            </h1>
            {manga.title.native && (
              <p className="text-lg text-gray-300">{manga.title.native}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chapters">Chapters</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Synopsis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {manga.description || 'No description available.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Characters */}
                {characters.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Characters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {characters.slice(0, 6).map((character) => (
                          <div key={character.id} className="text-center">
                            <div className="relative aspect-square mb-2 rounded-lg overflow-hidden">
                              <Image
                                src={character.image || '/placeholder.png'}
                                alt={character.name.full || ''}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="text-sm font-medium line-clamp-1">
                              {character.name.full}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {character.role}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chapters">
                <Card>
                  <CardHeader>
                    <CardTitle>Chapters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(manga.totalChapters || 10, 10) }).map((_, i) => (
                        <Link
                          key={i}
                          href={`/manga/${mangaId}/read/${i + 1}`}
                        >
                          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Chapter {i + 1}</span>
                            </div>
                            <Badge variant="outline">Read</Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden mb-4">
                  <Image
                    src={manga.image}
                    alt={manga.title.english}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button className="w-full" size="lg" asChild>
                  <Link href={`/manga/${mangaId}/read/1`}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Reading
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle>Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{manga.averageScore || 'N/A'}</span>
                  <span className="text-sm text-muted-foreground">/ 10</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant="outline">{manga.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline">{manga.status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chapters</span>
                    <span className="font-medium">{manga.totalChapters || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volumes</span>
                    <span className="font-medium">{manga.totalVolumes || 'Unknown'}</span>
                  </div>
                </div>

                {manga.authors && manga.authors.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Authors</p>
                    <div className="flex flex-wrap gap-1">
                      {manga.authors.map((author, i) => (
                        <Badge key={i} variant="secondary">{author}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {manga.genres && manga.genres.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1">
                      {manga.genres.map((genre, i) => (
                        <Badge key={i} variant="secondary">{genre}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
