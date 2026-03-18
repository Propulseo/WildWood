import type { Metadata } from "next"
import { Barlow_Condensed, DM_Sans, DM_Mono } from "next/font/google"
import { AuthProvider } from "@/lib/contexts/auth-context"
import "./globals.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  display: "swap",
  weight: ["600", "700", "800"],
  variable: "--font-barlow-condensed",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-dm-sans",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-dm-mono",
})

export const metadata: Metadata = {
  title: "WildWood ERP",
  description: "WildWood Beach Fitness & Resort - Systeme de gestion",
  robots: "noindex, nofollow",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${barlowCondensed.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
