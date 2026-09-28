import { cartazDoBrasil } from '@/componentes/cartazes'

export const alt = 'Vermelhômetro: a temperatura da esquerda nas eleições 2026'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Imagem() {
  return cartazDoBrasil('og')
}
