import { imagemCartaz, TAMANHO_OG } from '@/componentes/imagemCartaz'
import { atualizadoEm } from '@/lib/dados'
import { ehUf, NOME_UF, UFS } from '@/lib/estados'

export const alt = 'Vermelhômetro: colinha de esquerda do estado'
export const size = TAMANHO_OG
export const contentType = 'image/png'
export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))

export default async function Imagem({ params }: { params: Promise<{ uf: string }> }) {
  const uf = (await params).uf.toUpperCase()
  const nome = ehUf(uf) ? NOME_UF[uf] : uf
  return imagemCartaz({ chamada: 'Domingo, 4 de outubro', titulo: `Colinha de luta · ${nome}`, atualizadoEm })
}
