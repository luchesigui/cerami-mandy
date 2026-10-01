import Link from "next/link"
import React from "react"

// Legacy name from the starter template, which prefixed every URL with a country code.
// The site is Brazil-only now, so this is a plain Next.js link.
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  [x: string]: unknown
}) => (
  <Link href={href} {...props}>
    {children}
  </Link>
)

export default LocalizedClientLink
