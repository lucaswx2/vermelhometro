import { imagemCartaz, TAMANHO_OG } from '@/componentes/imagemCartaz'
import { atualizadoEm } from '@/lib/dados'

export const alt = 'Vermelhômetro: monte sua colinha de esquerda para 4 de outubro'
export const size = TAMANHO_OG
export const contentType = 'image/png'

export default function Imagem() {
  return imagemCartaz({ chamada: 'Domingo, 4 de outubro', titulo: 'Monte sua colinha de esquerda', atualizadoEm })
}
