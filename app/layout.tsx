import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from "@clerk/nextjs"
import Provider from "./provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TravelBuddy - Travel Together, Stay Connected",
  description: "Share live locations, discover amazing places, and coordinate seamlessly with your travel companions.",
  generator: 'v0.dev'   
};


// Component: Root layout content
function RootLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin=""
        ></script>
      </head>
      <body className={inter.className}>
        <Provider>
          {children}
          <Toaster />
        </Provider>
      </body>
    </html>
  )
}

// Component: Clerk wrapper
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </ClerkProvider>
  )
}
