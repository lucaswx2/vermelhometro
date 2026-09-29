import Image from 'next/image'
import { PONTOS_ESTRELA } from '../sol'
import type { Opcao } from './escolha'

// Proporção da foto do TSE: 161 × 225.
const MEDIDAS = {
  p: { largura: 48, altura: 67, estrela: 22 },
  g: { largura: 120, altura: 168, estrela: 52 },
} as const

type Tamanho = keyof typeof MEDIDAS

const tamanhoDaSigla = (sigla: string, tamanho: Tamanho) => {
  const base = tamanho === 'g' ? 22 : 12
  return sigla.length > 6 ? base * 0.62 : sigla.length > 4 ? base * 0.8 : base
}

// Sem foto, a estrela com a sigla: o espaço fica marcado, não vazio.
export function FotoCandidatura({ opcao, tamanho, alt = '' }: { opcao: Pick<Opcao, 'foto' | 'partido'>; tamanho: Tamanho; alt?: string }) {
  const { largura, altura, estrela } = MEDIDAS[tamanho]
  if (opcao.foto) {
    return (
      <Image
        src={opcao.foto}
        alt={alt}
        width={largura}
        height={altura}
        unoptimized
        className="foto-candidatura block shrink-0 border-2 border-tinta bg-cinza object-cover"
        style={{ width: largura, height: altura }}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className="foto-candidatura flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden bg-vermelho px-0.5"
      style={{ width: largura, height: altura }}
    >
      <svg viewBox="-50 -50 100 100" width={estrela} height={estrela}>
        <polygon points={PONTOS_ESTRELA} className="fill-ouro" />
      </svg>
      <span className="max-w-full truncate font-display leading-none text-papel" style={{ fontSize: tamanhoDaSigla(opcao.partido, tamanho) }}>
        {opcao.partido}
      </span>
    </span>
  )
}

export function FotoVazia() {
  return (
    <span aria-hidden="true" className="foto-candidatura flex h-[67px] w-12 shrink-0 items-center justify-center border-2 border-dashed border-vermelho">
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M9 2 V16 M2 9 H16" className="stroke-vermelho" strokeWidth="2.5" />
      </svg>
    </span>
  )
}
