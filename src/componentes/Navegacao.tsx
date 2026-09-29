'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { ehUf, NOME_UF, UFS, type Uf } from '@/lib/estados'
import { escreverEscolha, lerEscolha, paraOutroEstado } from './colinha/escolha'
import { PONTOS_ESTRELA } from './sol'
import { useUltimaColinha } from './ultimaColinha'

const ufDaRota = (caminho: string): Uf | null => {
  const uf = /^\/estado\/([a-z]{2})/.exec(caminho)?.[1]?.toUpperCase()
  return uf && ehUf(uf) ? uf : null
}

export function BarraDoTopo() {
  const caminho = usePathname()
  const router = useRouter()
  const uf = ufDaRota(caminho)

  // Quem troca de estado leva o partido e o presidente; o resto muda com o estado.
  const trocarEstado = (novo: string) => {
    if (!ehUf(novo)) return
    const levar = uf ? escreverEscolha(paraOutroEstado(lerEscolha(window.location.hash))) : ''
    router.push(`/estado/${novo.toLowerCase()}${levar}`)
  }

  return (
    <header className="nao-imprimir sticky top-0 z-30 bg-vermelho text-papel">
      <div className="mx-auto flex h-[60px] max-w-xl items-center justify-between px-4">
        <Link href="/" className="flex min-h-11 items-center gap-2" aria-label="Vermelhômetro, início">
          <svg width="24" height="24" viewBox="-50 -50 100 100" aria-hidden="true">
            <polygon points={PONTOS_ESTRELA} fill="#F5C542" />
          </svg>
          <span className="font-display text-[22px] tracking-wide">VERMELHÔMETRO</span>
        </Link>
        <label className="relative flex h-11 min-w-16 items-center justify-center gap-1.5 border-2 border-papel px-3 text-[15px] font-bold focus-within:outline-4 focus-within:outline-ouro">
          <span aria-hidden="true">{uf ?? 'Estado'}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <select
            aria-label={uf ? `Trocar de estado. Agora: ${NOME_UF[uf]}` : 'Escolher o seu estado'}
            value={uf ?? ''}
            onChange={(e) => trocarEstado(e.target.value)}
            className="absolute inset-0 cursor-pointer text-tinta opacity-0"
          >
            <option value="" disabled>
              Seu estado
            </option>
            {UFS.map((u) => (
              <option key={u} value={u}>
                {NOME_UF[u]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </header>
  )
}

const ICONES = {
  colinha: (
    <>
      <rect x="5" y="3" width="14" height="18" />
      <path d="M8 8 H16 M8 12 H16 M8 16 H13" />
    </>
  ),
  placar: (
    <>
      <path d="M10 14 V4 a2 2 0 0 1 4 0 V14" />
      <circle cx="12" cy="17.5" r="3.5" />
    </>
  ),
  estados: (
    <>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </>
  ),
  sobre: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11 V17 M12 7 V8" />
    </>
  ),
} satisfies Record<string, ReactNode>

export function NavInferior() {
  const caminho = usePathname()
  const ultima = useUltimaColinha()
  const uf = ufDaRota(caminho)
  const colinha = uf ? (ultima?.startsWith(caminho) ? ultima : caminho) : (ultima ?? '/')

  const abas = [
    { rotulo: 'Colinha', href: colinha, icone: ICONES.colinha, ativa: uf !== null },
    { rotulo: 'Placar', href: '/placar', icone: ICONES.placar, ativa: caminho.startsWith('/placar') },
    { rotulo: 'Estados', href: '/', icone: ICONES.estados, ativa: caminho === '/' },
    { rotulo: 'Sobre', href: '/transparencia', icone: ICONES.sobre, ativa: caminho.startsWith('/transparencia') },
  ]

  return (
    <nav aria-label="Principal" className="nao-imprimir fixed inset-x-0 bottom-0 z-30 border-t-[3px] border-tinta bg-papel pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto grid h-[68px] max-w-xl grid-cols-4">
        {abas.map((aba) => (
          <li key={aba.rotulo} className="flex">
            <Link
              href={aba.href}
              aria-current={aba.ativa ? 'page' : undefined}
              className={`flex grow flex-col items-center justify-center gap-[3px] text-xs font-bold uppercase ${
                aba.ativa ? 'bg-ouro text-vermelho' : 'text-tinta hover:bg-ouro/30'
              }`}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                {aba.icone}
              </svg>
              {aba.rotulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
