import { imagemCartaz, TAMANHO_OG } from '@/componentes/imagemCartaz'
import { atualizadoEm } from '@/lib/dados'
import { ameacaNosEstados } from '@/lib/placar'

export const alt = 'Placar da ameaça: quanto do eleitorado vive onde a extrema direita lidera para governador'
export const size = TAMANHO_OG
export const contentType = 'image/png'

export default function Imagem() {
  const { eleitorado } = ameacaNosEstados()
  return imagemCartaz({
    chamada: 'Placar da ameaça',
    titulo: `Extrema direita na frente onde vivem ${Math.round(eleitorado.pct)}% dos eleitores`,
    atualizadoEm,
  })
}
