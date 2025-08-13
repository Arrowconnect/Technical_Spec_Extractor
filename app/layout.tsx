import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'N8N File Processor',
  description: 'Upload and process files through N8N workflow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
