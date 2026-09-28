import type { Metadata } from 'next'
import { Anton, Oswald } from 'next/font/google'
import './globals.css'

const anton = Anton({ variable: '--font-anton', weight: '400', subsets: ['latin'] })
const oswald = Oswald({ variable: '--font-oswald', weight: ['500', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://vermelhometro.vercel.app'),
  title: {
    default: 'Vermelhômetro — a temperatura da esquerda nas eleições 2026',
    template: '%s · Vermelhômetro',
  },
  description:
    'Termômetro da esquerda nas eleições 2026: presidente, governadores, Senado e Câmara, com pesquisas registradas no TSE, estado por estado.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${oswald.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
