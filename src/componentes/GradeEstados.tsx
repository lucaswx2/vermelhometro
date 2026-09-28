import Link from 'next/link'
import { faixaInfo, FAIXAS, type Faixa } from '@/lib/faixas'
import type { Uf } from '@/lib/dados'

// Posição [coluna, linha] de cada UF na grade: todos os estados com o mesmo peso visual.
const POSICAO = {
  RR: [2, 1], AP: [4, 1],
  AM: [1, 2], PA: [3, 2], MA: [4, 2], CE: [5, 2], RN: [6, 2],
  AC: [1, 3], RO: [2, 3], TO: [3, 3], PI: [4, 3], PE: [5, 3], PB: [6, 3],
  MT: [2, 4], GO: [3, 4], BA: [4, 4], SE: [5, 4], AL: [6, 4],
  MS: [2, 5], DF: [3, 5], MG: [4, 5], ES: [5, 5],
  PR: [2, 6], SP: [3, 6], RJ: [4, 6],
  SC: [2, 7],
  RS: [2, 8],
} satisfies Record<Uf, [number, number]>

export function GradeEstados({ lideres }: { lideres: { uf: Uf; faixa: Faixa | null; nome: string | null }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid auto-rows-[46px] grid-cols-6 gap-1">
        {lideres.map(({ uf, faixa, nome }) => {
          const [coluna, linha] = POSICAO[uf]
          const info = faixa ? faixaInfo[faixa] : null
          return (
            <Link
              key={uf}
              href={`/estado/${uf.toLowerCase()}`}
              aria-label={`${uf}: lidera ${nome ?? 'sem pesquisa'}${info ? `, ${info.nome}` : ''}`}
              style={{ gridColumn: coluna, gridRow: linha, background: info?.cor ?? 'transparent', color: info?.texto ?? '#2A0A0A' }}
              className={`flex items-center justify-center font-display text-base transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-ouro ${info ? '' : 'border-2 border-dashed border-tinta/40'}`}
            >
              {uf}
            </Link>
          )
        })}
      </div>
      <Legenda />
    </div>
  )
}

export function Legenda() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3.5 gap-y-2 text-[13px] font-medium">
      {FAIXAS.map((faixa) => (
        <li key={faixa} className="flex items-center gap-1.5">
          <span className="size-3.5" style={{ background: faixaInfo[faixa].cor }} />
          {faixaInfo[faixa].nome}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3.5 border-2 border-dashed border-tinta/40" />
        Sem pesquisa válida
      </li>
    </ul>
  )
}
