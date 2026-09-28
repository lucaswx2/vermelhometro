import type { Metadata } from 'next'
import { Anton, Oswald } from 'next/font/google'
import './globals.css'

const anton = Anton({ variable: '--font-anton', weight: '400', subsets: ['latin'] })
const oswald = Oswald({ variable: '--font-oswald', weight: ['500', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://vermelhometro.vercel.app'),
  title: {
    default: 'Vermelhômetro — colinha de esquerda para as eleições 2026',
    template: '%s · Vermelhômetro',
  },
  description:
    'Monte sua colinha de voto de classe com os números oficiais do TSE, estado por estado, e veja como a esquerda está em cada disputa.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${oswald.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  )
}
