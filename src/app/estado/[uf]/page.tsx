import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Cartaz, formatarAtualizacao } from '@/componentes/Cartaz'
import { MontadorColinha } from '@/componentes/colinha/MontadorColinha'
import { Disputa } from '@/componentes/Disputa'
import { Rodape } from '@/componentes/Rodape'
import { colinhaDaUf, colinhasGeradasEm } from '@/lib/colinhas'
import { atualizadoEm } from '@/lib/dados'
import { ehUf, NOME_UF, noEstado, UFS } from '@/lib/estados'
import { governoDaUf, senadoDaUf } from '@/lib/placar'

export const generateStaticParams = () => UFS.map((uf) => ({ uf: uf.toLowerCase() }))
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/estado/[uf]'>): Promise<Metadata> {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) return {}
  return {
    title: `Colinha de esquerda ${NOME_UF[uf]} 2026: números dos candidatos`,
    description: `Monte sua colinha de voto de classe ${noEstado(uf)}: PSTU, PCB, UP e PSOL, com os números oficiais do TSE, e veja as pesquisas para governo e Senado.`,
    alternates: { canonical: `/estado/${uf.toLowerCase()}` },
  }
}

export default async function Estado({ params }: PageProps<'/estado/[uf]'>) {
  const uf = (await params).uf.toUpperCase()
  if (!ehUf(uf)) notFound()
  const governo = governoDaUf(uf)
  const senado = senadoDaUf(uf)
  const dataTse = formatarAtualizacao(colinhasGeradasEm)

  return (
    <>
      <Cartaz
        chamada="Domingo, 4 de outubro"
        titulo={
          <>
            Sua colinha <br /> {noEstado(uf)}
          </>
        }
        rodape="Voto de classe. Nenhum voto na extrema direita."
        atualizadoEm={atualizadoEm}
      />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
        <Link href="/" className="nao-imprimir text-sm font-bold uppercase text-vermelho underline">
          ← Trocar de estado
        </Link>

        {governo.alertaExtrema && (
          <p className="nao-imprimir border-l-8 border-vermelho bg-tinta p-4 font-bold text-papel">
            Alerta: pela última pesquisa, {governo.alertaExtrema} (extrema direita) pode vencer para governador já no 1º turno.
          </p>
        )}

        <MontadorColinha uf={uf} estado={NOME_UF[uf]} porPartido={colinhaDaUf(uf)} atualizadoEm={dataTse} />

        <section id="disputa" className="nao-imprimir flex flex-col gap-4">
          <h2 className="font-display text-3xl uppercase text-vermelho">Como está a disputa {noEstado(uf)}</h2>
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
