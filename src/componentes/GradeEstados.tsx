import Link from 'next/link'
import { COR_DO_TEMA } from '@/lib/cores'
import { FICHA_DA_FAIXA, FAIXAS, type Faixa } from '@/lib/faixas'
import { rotaDoEstado, type Uf } from '@/lib/estados'

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

type Celula = { uf: Uf; rotulo: string; faixa?: Faixa | null }

export function GradeEstados({ celulas, ancora = '' }: { celulas: Celula[]; ancora?: string }) {
  return (
    <div className="grid auto-rows-[48px] grid-cols-6 gap-1.5">
      {celulas.map(({ uf, rotulo, faixa }) => {
        const [coluna, linha] = POSICAO[uf]
        const ficha = faixa ? FICHA_DA_FAIXA[faixa] : null
        const semDado = faixa === null
        return (
          <Link
            key={uf}
            href={`${rotaDoEstado(uf)}${ancora}`}
            aria-label={rotulo}
            style={{
              gridColumn: coluna,
              gridRow: linha,
              background: ficha?.cor ?? (semDado ? 'transparent' : COR_DO_TEMA.papel),
              color: ficha?.texto ?? COR_DO_TEMA.tinta,
            }}
            className={`flex items-center justify-center font-display text-lg transition-transform hover:scale-105 focus-visible:outline-4 focus-visible:outline-ouro ${
              semDado ? 'border-2 border-dashed border-tinta/50' : ficha ? '' : 'border-2 border-tinta'
            }`}
          >
            {uf}
          </Link>
        )
      })}
    </div>
  )
}

export function Legenda() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-3.5 gap-y-2 text-sm font-medium">
      {FAIXAS.map((faixa) => (
        <li key={faixa} className="flex items-center gap-1.5">
          <span className="size-4 border border-tinta" style={{ background: FICHA_DA_FAIXA[faixa].cor }} />
          {FICHA_DA_FAIXA[faixa].nome}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-4 border-2 border-dashed border-tinta/50" />
        Sem pesquisa válida
      </li>
    </ul>
  )
}
