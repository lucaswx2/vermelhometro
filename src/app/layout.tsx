import type { Metadata } from 'next'
import { Anton, Oswald } from 'next/font/google'
import { BarraDoTopo, NavInferior } from '@/componentes/Navegacao'
import './globals.css'

const anton = Anton({ variable: '--font-anton', weight: '400', subsets: ['latin'] })
const oswald = Oswald({ variable: '--font-oswald', weight: ['500', '700'], subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://vermelhometro.vercel.app'),
  title: {
    default: 'Vermelhômetro — monte sua colinha de luta para as eleições 2026',
    template: '%s · Vermelhômetro',
  },
  description:
    'Monte sua colinha de luta com os números oficiais do TSE, estado por estado: vote com a classe e nenhum voto na extrema direita.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${oswald.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-[calc(68px+env(safe-area-inset-bottom))] font-sans">
        <BarraDoTopo />
        {children}
        <NavInferior />
      </body>
    </html>
  )
}
