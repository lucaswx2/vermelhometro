import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { formatarAtualizacao } from '@/componentes/Cartaz'
import { compactar, colinhasDeClasse, type CandidaturasCompactas } from '@/componentes/colinha/escolha'
import { MontadorColinha } from '@/componentes/colinha/MontadorColinha'
import { Disputa } from '@/componentes/Disputa'
import { Rodape } from '@/componentes/Rodape'
import { candidaturasDaUf, fotoDaCandidatura } from '@/lib/candidaturas'
import { colinhaDaUf, colinhasGeradasEm } from '@/lib/colinhas'
import { ehUf, NOME_UF, noEstado, rotaDoEstado, UFS, type Uf } from '@/lib/estados'
import { governoDaUf, senadoDaUf } from '@/lib/placar'

export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/estado/[uf]'>): Promise<Metadata> {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) return {}
  return {
    title: `Colinha de luta ${NOME_UF[uf]} 2026: números dos candidatos`,
    description: `Monte sua colinha de luta ${noEstado(uf)}: vote com a classe (PSTU, PCB, UP ou PSOL) ou escolha cargo a cargo, com os números oficiais do TSE. Nenhum voto na extrema direita.`,
    alternates: { canonical: rotaDoEstado(uf) },
  }
}

// Só o que a colinha mostra de cada candidatura, agrupado por cargo.
const candidaturasCompactas = (uf: Uf) => {
  const porCargo: CandidaturasCompactas = { deputadoFederal: [], deputadoEstadual: [], senador: [], governador: [], presidente: [] }
  for (const c of candidaturasDaUf(uf)) porCargo[c.cargo].push(compactar(c, fotoDaCandidatura(c)))
  return porCargo
}

export default async function Estado({ params }: PageProps<'/estado/[uf]'>) {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) notFound()
  const governo = governoDaUf(uf)
  const senado = senadoDaUf(uf)

  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-col gap-[18px] px-4 pb-8 pt-5">
        <header className="flex flex-col gap-0.5 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-sangue">{NOME_UF[uf]} · Eleições 2026 · 1º turno · 4/10</p>
          <h1 className="font-display text-[42px] uppercase leading-[1.05] text-vermelho">Monte sua colinha de luta</h1>
          <p className="text-[15px] font-bold">Nenhum voto na extrema direita.</p>
        </header>

        <MontadorColinha
          uf={uf}
          estado={NOME_UF[uf]}
          candidaturas={candidaturasCompactas(uf)}
          colinhasDeClasse={colinhasDeClasse(colinhaDaUf(uf))}
          dataTse={formatarAtualizacao(colinhasGeradasEm)}
        />

        {governo.alertaExtrema && (
          <p className="nao-imprimir border-l-8 border-vermelho bg-tinta p-4 font-bold text-papel">
            Alerta: pela última pesquisa, {governo.alertaExtrema} (extrema direita) pode vencer para governador já no 1º turno.
          </p>
        )}

        <section id="disputa" aria-labelledby="titulo-disputa" className="nao-imprimir flex flex-col gap-4">
          <h2 id="titulo-disputa" className="font-display text-3xl uppercase text-vermelho">
            Como está a disputa {noEstado(uf)}
          </h2>
          <p className="text-sm">
            Cada candidato tem duas etiquetas: a do partido e, quando for diferente, a do palanque em que está de fato (coligação). Toque em “por quê?” para
            ver o motivo.
          </p>
          <Disputa titulo="Governo" pesquisa={governo.pesquisa} />
          <Disputa titulo="Senado" pesquisa={senado.pesquisa} nota="São duas vagas. Cada eleitor dá dois votos, para dois nomes diferentes." />
        </section>
      </main>
      <Rodape />
    </>
  )
}
