"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Manga } from "@/types/manga"

export default function MangaBrowsePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [manga, setManga] = useState<Manga[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all')

  useEffect(() => {
    fetchManga()
  }, [searchParams])

  const fetchManga = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      const query = searchParams.get('q')
      const type = searchParams.get('type')
      
      if (query) params.append('q', query)
      if (type && type !== 'all') params.append('type', type)
      params.append('limit', '24')

      const response = await fetch(`/api/manga/search?${params.toString()}`)
      const data = await response.json()
      setManga(data.results || [])
    } catch (error) {
      console.error('Error fetching manga:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (selectedType !== 'all') params.append('type', selectedType)
    router.push(`/manga/browse?${params.toString()}`)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    if (type !== 'all') params.append('type', type)
    router.push(`/manga/browse?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Browse Manga</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>

        {/* Type Filters */}
        <Tabs value={selectedType} onValueChange={handleTypeChange}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="manga">Manga</TabsTrigger>
            <TabsTrigger value="manhwa">Manhwa</TabsTrigger>
            <TabsTrigger value="manhua">Manhua</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[2/3] w-full" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : manga.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No manga found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {manga.map((item) => (
            <Link key={item.id} href={`/manga/${item.id}`}>
              <Card className="overflow-hidden hover:scale-105 transition-transform duration-200">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={item.image || '/placeholder.png'}
                    alt={item.title.english}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.averageScore ? `${item.averageScore}/10` : 'N/A'}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {item.title.english}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                    <span>{item.status}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
