import Link from 'next/link'
import { Cartaz } from '@/componentes/Cartaz'
import { GradeEstados } from '@/componentes/GradeEstados'
import { Rodape } from '@/componentes/Rodape'
import { atualizadoEm } from '@/lib/dados'
import { NOME_UF, UFS } from '@/lib/estados'

const SITE = 'https://vermelhometro.vercel.app'

const TEXTO_ZAP = `Domingo tem eleição e celular não entra na cabine. Monte sua colinha de luta com os números oficiais do TSE: ${SITE}`

export default function Inicio() {
  return (
    <>
      <Cartaz
        chamada="Domingo, 4 de outubro"
        titulo={
          <>
            Monte sua <br /> colinha de luta
          </>
        }
        rodape="Vote com a classe. Nenhum voto na extrema direita."
        atualizadoEm={atualizadoEm}
      />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
        <section aria-labelledby="escolha-estado" className="moldura flex flex-col gap-3 px-4 py-5">
          <h2 id="escolha-estado" className="text-center font-display text-3xl uppercase text-vermelho">
            Toque no seu estado
          </h2>
          <GradeEstados celulas={UFS.map((uf) => ({ uf, rotulo: `Colinha de ${NOME_UF[uf]}` }))} />
          <p className="text-center text-sm">
            Números oficiais do TSE para deputado, Senado, governo e presidente. Um toque preenche com a classe, e você troca quem quiser. Celular não entra
            na cabine: anote e leve.
          </p>
        </section>

        <Link
          href="/placar"
          className="flex min-h-[58px] items-center justify-between gap-3 bg-tinta px-4 py-3 text-papel hover:bg-sangue"
        >
          <span className="flex flex-col">
            <span className="font-display text-[23px] uppercase leading-tight text-ouro">Veja o placar da ameaça</span>
            <span className="text-sm">Como a esquerda está em cada frente, pelas pesquisas registradas.</span>
          </span>
          <span aria-hidden="true" className="font-display text-3xl">
            ›
          </span>
        </Link>

        <a href={`https://wa.me/?text=${encodeURIComponent(TEXTO_ZAP)}`} target="_blank" rel="noopener noreferrer" className="botao-secundario">
          Mande o site no zap
        </a>
      </main>
      <Rodape />
    </>
  )
}
