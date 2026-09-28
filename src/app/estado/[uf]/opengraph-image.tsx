import { cartazDaUf } from '@/componentes/cartazes'
import { UFS } from '@/lib/dados'

export const alt = 'Vermelhômetro: a temperatura da esquerda no estado'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))

export default async function Imagem({ params }: { params: Promise<{ uf: string }> }) {
  return cartazDaUf((await params).uf, 'og')
}
