import type { Metadata, Viewport } from "next"
import { DM_Sans, DM_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/sonner"

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "Hemut Q&A Dashboard",
    template: "%s | Hemut Q&A",
  },
  description: "Real-time Q&A Dashboard for live audience interaction",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${dmMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
        style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
      >
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 md:px-6 lg:px-8">
              {children}
            </main>
          </div>
          <Toaster
            richColors
            position="top-right"
            closeButton
            toastOptions={{
              style: {
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                borderRadius: "12px",
                padding: "16px",
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
              },
              classNames: {
                toast: "border-0",
                title: "font-semibold text-sm",
                description: "text-sm opacity-90",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}