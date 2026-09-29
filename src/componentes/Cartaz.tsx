import type { ReactNode } from 'react'
import { PONTOS_ESTRELA, raiosDoSol } from './sol'

const RAIOS = raiosDoSol(200, 600, 22, 900)

const formatador = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

export const formatarAtualizacao = (data: Date) => formatador.format(data).replace(',', ' às')

export function Cartaz({ titulo, chamada, rodape, atualizadoEm }: { titulo: ReactNode; chamada: string; rodape: ReactNode; atualizadoEm: Date }) {
  return (
    <section className="relative overflow-hidden bg-vermelho text-papel">
      <svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d={RAIOS} className="fill-raio" />
        <circle cx="200" cy="600" r="170" className="fill-ouro" />
      </svg>
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-5 pb-6 text-center">
        <p className="mt-4 flex w-full justify-between text-xs font-bold uppercase tracking-[0.15em]">
          <span>Vermelhômetro</span>
          <span>Atualizado {formatarAtualizacao(atualizadoEm)}</span>
        </p>
        <svg viewBox="-50 -50 100 100" className="mt-6 size-16" aria-hidden="true">
          <polygon points={PONTOS_ESTRELA} className="fill-ouro" />
        </svg>
        <p className="mt-4 text-base font-bold uppercase tracking-[0.12em] text-ouro">{chamada}</p>
        <h1 className="mt-1 font-display text-[52px] uppercase leading-[0.95]">{titulo}</h1>
        <div className="mt-10 max-w-[15ch] font-display text-xl uppercase leading-tight text-sangue">{rodape}</div>
      </div>
    </section>
  )
}
