"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Maximize,
  Menu,
  Settings,
  Book
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Keyboard, Zoom } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/zoom'

interface Chapter {
  id: string
  title: string
  chapterNumber: number
  pages: string[]
}

export default function MangaReaderPage() {
  const params = useParams()
  const router = useRouter()
  const mangaId = params?.id as string
  const chapterId = params?.chapterId as string
  
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [readingMode, setReadingMode] = useState<'horizontal' | 'vertical'>('horizontal')
  const [showControls, setShowControls] = useState(true)
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    if (mangaId && chapterId) {
      fetchChapter()
    }
  }, [mangaId, chapterId])

  const fetchChapter = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/manga/${mangaId}/read/${chapterId}`)
      const data = await response.json()
      setChapter(data)
    } catch (error) {
      console.error('Error fetching chapter:', error)
    } finally {
      setLoading(false)
    }
  }

  const goToNextChapter = () => {
    const nextChapter = parseInt(chapterId) + 1
    router.push(`/manga/${mangaId}/read/${nextChapter}`)
  }

  const goToPrevChapter = () => {
    const prevChapter = parseInt(chapterId) - 1
    if (prevChapter > 0) {
      router.push(`/manga/${mangaId}/read/${prevChapter}`)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-[400px]" />
          <Skeleton className="h-10 w-[400px]" />
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chapter not found</h2>
          <Button onClick={() => router.push(`/manga/${mangaId}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manga
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/manga/${mangaId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold text-white">{chapter.title}</h2>
              <p className="text-sm text-gray-400">
                Page {currentPage} of {chapter.pages.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Reading Mode</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setReadingMode('horizontal')}>
                  Horizontal (Page by Page)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReadingMode('vertical')}>
                  Vertical (Webtoon Style)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reader */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        onClick={() => setShowControls(!showControls)}
      >
        <Swiper
          modules={[Navigation, Keyboard, Zoom]}
          direction={readingMode}
          slidesPerView={1}
          spaceBetween={0}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          keyboard={{
            enabled: true,
          }}
          zoom={true}
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          onSlideChange={(swiper) => {
            setCurrentPage(swiper.activeIndex + 1)
          }}
          className="w-full h-screen"
        >
          {chapter.pages.map((page, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container flex items-center justify-center h-full">
                <img
                  src={page}
                  alt={`Page ${index + 1}`}
                  className="max-h-screen w-auto object-contain"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <button
          className={`swiper-button-prev absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          className={`swiper-button-next absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={goToPrevChapter}
              disabled={parseInt(chapterId) <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Chapter
            </Button>

            <div className="flex-1 max-w-md">
              <Slider
                value={[currentPage]}
                min={1}
                max={chapter.pages.length}
                step={1}
                onValueChange={(value) => {
                  setCurrentPage(value[0])
                  swiperRef.current?.slideTo(value[0] - 1)
                }}
              />
            </div>

            <Button variant="outline" onClick={goToNextChapter}>
              Next Chapter
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
