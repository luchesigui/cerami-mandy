"use client"

import Image from "next/image"
import { useRef } from "react"

export type GalleryImage = {
  src: string
  alt: string
}

type ProductGalleryProps = {
  images: GalleryImage[]
}

const ArrowIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    {direction === "left" ? (
      <path d="M19 12H5M12 19l-7-7 7-7" />
    ) : (
      <path d="M5 12h14M12 5l7 7-7 7" />
    )}
  </svg>
)

const ProductGallery = ({ images }: ProductGalleryProps) => {
  const trackRef = useRef<HTMLUListElement>(null)

  const scrollBySlide = (direction: 1 | -1) => {
    const track = trackRef.current
    const slide = track?.firstElementChild as HTMLElement | null

    if (!track || !slide) {
      return
    }

    track.scrollBy({ left: direction * slide.offsetWidth, behavior: "smooth" })
  }

  return (
    <div className="relative bg-[#D9D9D9]">
      <ul
        ref={trackRef}
        className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto lg:h-[calc(100svh-136px)] lg:max-h-[1000px] lg:min-h-[480px]"
        aria-label="Fotos do produto"
      >
        {!images.length ? (
          <>
            <li className="relative aspect-[4/5] shrink-0 basis-[85%] border-r border-[#13110C]/20 sm:basis-[45.6%] lg:h-full lg:basis-1/3 bg-[#D9D9D9]" />
            <li className="relative aspect-[4/5] shrink-0 basis-[85%] border-r border-[#13110C]/20 sm:basis-[45.6%] lg:h-full lg:basis-1/3 bg-[#D9D9D9]" />
            <li className="relative aspect-[4/5] shrink-0 basis-[85%] border-r border-[#13110C]/20 sm:basis-[45.6%] lg:h-full lg:basis-1/3 bg-[#D9D9D9]" />
          </>
        ) : (
          images.map(({ src, alt }, idx) => (
            <li
              key={`${src}-${idx}`}
              className="relative aspect-[4/5] shrink-0 basis-[85%] snap-start border-r border-[#13110C]/20 sm:basis-[45.6%] lg:h-full lg:basis-auto"
            >
              <Image
                src={src}
                alt={alt}
                fill
                priority={idx === 0}
                sizes="(min-width: 1024px) 80vh, (min-width: 640px) 46vw, 85vw"
                className="object-cover"
              />
            </li>
          ))
        )}
      </ul>

      <div className="absolute bottom-6 right-6 z-20 flex items-center overflow-hidden rounded-full bg-[#FCAB42] text-[#13110C] shadow-sm">
        <button
          type="button"
          onClick={() => scrollBySlide(-1)}
          aria-label="Foto anterior"
          className="flex h-10 w-12 items-center justify-center border-r border-[#13110C]/20 transition-opacity hover:opacity-70"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollBySlide(1)}
          aria-label="Próxima foto"
          className="flex h-10 w-12 items-center justify-center transition-opacity hover:opacity-70"
        >
          <ArrowIcon direction="right" />
        </button>
      </div>
    </div>
  )
}

export default ProductGallery
