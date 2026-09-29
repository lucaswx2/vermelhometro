'use client'

import type { Faixa } from '@/lib/faixas'

// Uma linha do card: um cargo da colinha, já resolvido.
export type LinhaDoCard = {
  rotulo: string
  numero: number | null
  nome: string | null
  partido: string | null
  faixa: Faixa | null
  foto: string | null
}

export type PropsDoCard = {
  linhas: LinhaDoCard[]
  estado: string
  uf: string
  dataTse: string
}

// Esqueleto: seletor de formato, prévia e botão "Compartilhar imagem". Implementação em andamento.
export function CompartilharCard(props: PropsDoCard) {
  void props
  return null
}
