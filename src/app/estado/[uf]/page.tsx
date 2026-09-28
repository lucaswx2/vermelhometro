import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cartaz } from '@/componentes/Cartaz'
import { Compartilhar } from '@/componentes/Compartilhar'
import { FichaPesquisa } from '@/componentes/FichaPesquisa'
import { Rodape } from '@/componentes/Rodape'
import { atualizadoEm, ehUf, UFS } from '@/lib/dados'
import { NOME_UF } from '@/lib/estados'
import type { Pesquisa } from '@/lib/esquemas'
import { faixaInfo } from '@/lib/faixas'
import { faixaDoResultado, termometroDaUf } from '@/lib/temperatura'

export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/estado/[uf]'>): Promise<Metadata> {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) return {}
  return {
    title: `Pesquisa governador e Senado ${NOME_UF[uf]} 2026 — esquerda × direita`,
    description: `Quem lidera para governador e Senado em ${NOME_UF[uf]}: pesquisas registradas no TSE, com cada candidato classificado de esquerda radical a extrema direita.`,
  }
}

export default async function Estado({ params }: PageProps<'/estado/[uf]'>) {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) notFound()
  const { temperatura, governo, senado } = termometroDaUf(uf)
  const nome = NOME_UF[uf]

  return (
    <>
      <Cartaz temperatura={temperatura ?? 50} chamada={`Em ${nome} a esquerda está a`} atualizadoEm={atualizadoEm} />
      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        <Link href="/" className="text-sm font-bold uppercase text-vermelho underline">
          ← Brasil
        </Link>
        {temperatura === null && <p>Ainda sem pesquisa registrada com todos os dados legais para {nome}.</p>}
        <Disputa titulo="Governo" pesquisa={governo?.pesquisa ?? null} />
        <Disputa titulo="Senado" pesquisa={senado?.pesquisa ?? null} nota="Duas vagas. Os dois primeiros levam." />
        <Compartilhar
          texto={`Em ${nome} a esquerda tá a ${Math.round(temperatura ?? 50)}° no Vermelhômetro. Confere:`}
          caminho={`/estado/${uf.toLowerCase()}`}
          cartaz={`/estado/${uf.toLowerCase()}/cartaz`}
        />
      </main>
      <Rodape />
    </>
  )
}

function Disputa({ titulo, pesquisa, nota }: { titulo: string; pesquisa: Pesquisa | null; nota?: string }) {
  if (!pesquisa) return null
  const candidatos = pesquisa.resultados.filter((r) => r.partido).sort((a, b) => b.pct - a.pct)
  const maior = candidatos[0]?.pct ?? 1
  return (
    <section className="moldura flex flex-col gap-3 px-4 py-5">
      <h2 className="text-center font-display text-[28px] uppercase tracking-wide text-vermelho">★ {titulo} ★</h2>
      {nota && <p className="text-center text-xs">{nota}</p>}
      <ul className="flex flex-col gap-2">
        {candidatos.map((r) => {
          const faixa = faixaDoResultado(pesquisa, r) ?? 'centrao'
          const info = faixaInfo[faixa]
          return (
            <li key={r.nomeUrna} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold">
                  {r.nomeUrna} <span className="font-medium opacity-70">· {r.partido}</span>
                </span>
                <span className="font-display text-xl">{r.pct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 flex-1 bg-cinza/50">
                  <div className="h-3" style={{ width: `${(100 * r.pct) / maior}%`, background: info.cor }} />
                </div>
                <span
                  className="px-1.5 py-0.5 text-[11px] font-bold uppercase"
                  style={{ background: info.cor, color: info.texto }}
                >
                  {info.nome}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
      {pesquisa.notas && <p className="text-[11px] opacity-70">{pesquisa.notas}</p>}
      <FichaPesquisa pesquisa={pesquisa} />
    </section>
  )
}
