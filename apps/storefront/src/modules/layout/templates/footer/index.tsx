import Image from "next/image"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7" aria-hidden="true">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
    <circle cx="12" cy="12" r="4.25" />
    <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden="true">
    <path d="M16.6 2h-3.4v13.3a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.4 6.3V8.6a7.8 7.8 0 0 0 4.4 1.4V6.6a4.4 4.4 0 0 1-4.4-4.6Z" />
  </svg>
)

export default function Footer() {
  return (
    <footer
      className="w-full bg-[#FCAB42] text-[#13110C]"
      data-store="footer"
    >
      <div className="flex items-center justify-between gap-6 px-6 py-6 sm:px-10">
        <LocalizedClientLink href="/" aria-label="Cerami Mandy - início">
          <Image
            src="/cerami/wordmark.png"
            alt="Cerami Mandy"
            width={495}
            height={242}
            className="h-auto w-[110px] sm:w-[126px]"
          />
        </LocalizedClientLink>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-xs font-bold uppercase tracking-wide sm:text-sm">
            Me siga no
          </span>
          <a
            href="https://www.instagram.com/cerami.mandy/"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="transition-opacity hover:opacity-70"
          >
            <InstagramIcon />
          </a>
          <a
            href="https://www.tiktok.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="transition-opacity hover:opacity-70"
          >
            <TikTokIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}
