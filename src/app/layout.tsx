import type { Metadata } from 'next'
import { Be_Vietnam_Pro } from 'next/font/google'
import './globals.css'

const font = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
})

export const metadata: Metadata = {
  title: 'Quản lý phòng trọ',
  description: 'Theo dõi phòng, người thuê và hóa đơn hằng tháng',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={font.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}