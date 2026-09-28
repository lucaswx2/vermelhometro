import type { Pesquisa } from '@/lib/esquemas'
import { faixaInfo, rotuloDoPalanque } from '@/lib/faixas'
import { classificar } from '@/lib/placar'
import { FichaPesquisa } from './FichaPesquisa'

export function Disputa({ titulo, pesquisa, nota }: { titulo: string; pesquisa: Pesquisa | null; nota?: string }) {
  if (!pesquisa) {
    return (
      <section className="moldura px-4 py-5">
        <h3 className="font-display text-2xl uppercase text-vermelho">{titulo}</h3>
        <p className="mt-2">Ainda não há pesquisa registrada com todos os dados exigidos por lei para esta disputa.</p>
      </section>
    )
  }
  const resultados = pesquisa.resultados.filter((r) => r.partido).sort((a, b) => b.pct - a.pct)
  const maior = resultados[0]?.pct ?? 1
  return (
    <section className="moldura flex flex-col gap-3 px-4 py-5">
      <h3 className="font-display text-2xl uppercase text-vermelho">{titulo}</h3>
      {nota && <p className="text-sm">{nota}</p>}
      <ul className="flex flex-col gap-3">
        {resultados.map((r) => {
          const classe = classificar(pesquisa, r)
          if (!classe) return null
          const partido = faixaInfo[classe.faixaPartido]
          const palanque = rotuloDoPalanque(classe.faixaPartido, classe.faixa)
          return (
            <li key={r.nomeUrna} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold">
                  {r.nomeUrna} <span className="font-medium">· {r.partido}</span>
                </span>
                <span className="font-display text-xl">{r.pct}%</span>
              </div>
              <div className="h-3 bg-cinza/60">
                <div className="h-3" style={{ width: `${(100 * r.pct) / maior}%`, background: partido.cor }} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase">
                <span className="px-1.5 py-0.5" style={{ background: partido.cor, color: partido.texto }}>
                  {partido.nome}
                </span>
                {palanque && (
                  <details className="normal-case">
                    <summary className="cursor-pointer border border-tinta px-1.5 py-0.5 uppercase">{palanque} · por quê?</summary>
                    <p className="mt-1 font-medium">{classe.motivo}</p>
                  </details>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {pesquisa.notas && (
        <details className="text-xs">
          <summary className="cursor-pointer font-bold underline">Notas da coleta</summary>
          <p className="mt-1">{pesquisa.notas}</p>
        </details>
      )}
      <FichaPesquisa pesquisa={pesquisa} />
    </section>
  )
}
