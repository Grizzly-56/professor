import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Professor - BJJ Journal",
  description: "Track your BJJ journey",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
