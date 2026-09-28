import type { MetadataRoute } from 'next'
import { atualizadoEm } from '@/lib/dados'
import { UFS } from '@/lib/estados'

const SITE = 'https://vermelhometro.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, lastModified: atualizadoEm, priority: 1 },
    ...UFS.map((uf) => ({ url: `${SITE}/estado/${uf.toLowerCase()}`, lastModified: atualizadoEm, priority: 0.9 })),
    { url: `${SITE}/transparencia`, lastModified: atualizadoEm, priority: 0.5 },
  ]
}
