import type { MetadataRoute } from 'next'
import { atualizadoEm } from '@/lib/dados'
import { rotaDoEstado, UFS } from '@/lib/estados'

const SITE = 'https://vermelhometro.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: atualizadoEm, priority: 1 },
    ...UFS.map((uf) => ({ url: `${SITE}${rotaDoEstado(uf)}`, lastModified: atualizadoEm, priority: 0.9 })),
    { url: `${SITE}/placar`, lastModified: atualizadoEm, priority: 0.8 },
    { url: `${SITE}/transparencia`, lastModified: atualizadoEm, priority: 0.5 },
  ]
}
