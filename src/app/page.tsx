import { Cartaz } from '@/componentes/Cartaz'
import { FichaPesquisa } from '@/componentes/FichaPesquisa'
import { GradeEstados, Legenda } from '@/componentes/GradeEstados'
import { Rodape } from '@/componentes/Rodape'
import { atualizadoEm } from '@/lib/dados'
import { NOME_UF, UFS } from '@/lib/estados'
import { placarCamara, placarGovernos, placarPresidente, placarSenado } from '@/lib/placar'

const SITE = 'https://vermelhometro.vercel.app'

const pct = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })

const estados = (n: number) => `${n} ${n === 1 ? 'estado' : 'estados'}`

const FRASE_PRESIDENTE = {
  empate: 'Empate técnico',
  frente: 'Lula à frente',
  atras: 'Lula atrás',
} as const

export default function Inicio() {
  const presidente = placarPresidente()
  const governos = placarGovernos()
  const senado = placarSenado()
  const camara = placarCamara()
  const textoZap = `Domingo tem eleição e celular não entra na cabine. Monte sua colinha de esquerda com os números oficiais do TSE: ${SITE}`

  return (
    <>
      <Cartaz
        chamada="Domingo, 4 de outubro"
        titulo={
          <>
            Monte sua <br /> colinha de esquerda
          </>
        }
        rodape="Voto de classe. Nenhum voto na extrema direita."
        atualizadoEm={atualizadoEm}
      />

      <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-6">
        <section aria-labelledby="escolha-estado" className="moldura flex flex-col gap-3 px-4 py-5">
          <h2 id="escolha-estado" className="text-center font-display text-3xl uppercase text-vermelho">
            Toque no seu estado
          </h2>
          <GradeEstados celulas={UFS.map((uf) => ({ uf, rotulo: `Colinha de ${NOME_UF[uf]}` }))} />
          <p className="text-center text-sm">
            Números oficiais do TSE para presidente, governo, Senado e deputados. Você imprime, salva ou manda no zap. Celular é proibido na cabine.
          </p>
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="como-estamos">
          <h2 id="como-estamos" className="font-display text-3xl uppercase text-vermelho">
            Como estamos, frente por frente
          </h2>
          <p className="text-sm">
            “Esquerda” aqui é pelo partido do candidato: PT e aliados de esquerda, mais a esquerda socialista. Quem é de outro partido mas está no palanque
            de Lula aparece separado, como “aliado do Lula”.
          </p>

          {presidente.nomes && (
            <article className="flex flex-col gap-2 bg-tinta p-5 text-papel">
              <h3 className="text-sm font-bold uppercase tracking-widest text-ouro">Presidente · 2º turno</h3>
              <p className="font-display text-4xl uppercase leading-none">{FRASE_PRESIDENTE[presidente.situacao]}</p>
              <p className="text-lg">
                {presidente.nomes.esquerda} tem {pct(presidente.validosEsquerda)}% dos votos válidos contra {pct(100 - presidente.validosEsquerda)}% de{' '}
                {presidente.nomes.direita}, na média de {presidente.confrontos.length} institutos.
              </p>
              <details>
                <summary className="cursor-pointer font-bold underline">Ver as {presidente.confrontos.length} pesquisas</summary>
                <ul className="mt-2 flex flex-col gap-2">
                  {presidente.confrontos.map((c) => (
                    <li key={c.pesquisa.id}>
                      <p className="font-bold">
                        {c.esquerda.nomeUrna} {c.esquerda.pct}% × {c.direita.pct}% {c.direita.nomeUrna}
                      </p>
                      <FichaPesquisa pesquisa={c.pesquisa} />
                    </li>
                  ))}
                </ul>
              </details>
            </article>
          )}

          <article className="moldura flex flex-col gap-3 px-4 py-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-vermelho">Governos estaduais</h3>
            <p className="text-lg">
              A esquerda é favorita em <strong>{estados(governos.esquerda.favorita)}</strong> e está na disputa em{' '}
              <strong>{estados(governos.esquerda.disputa)}</strong>. Contando os aliados do Lula de outros partidos: favoritos em{' '}
              <strong>{estados(governos.aliados.favorita)}</strong>, na disputa em <strong>{estados(governos.aliados.disputa)}</strong>.
            </p>
            <p className="text-sm">Quem lidera em cada estado, pela etiqueta do partido:</p>
            <GradeEstados
              ancora="#disputa"
              celulas={governos.porUf.map((e) => ({
                uf: e.uf,
                rotulo: e.lider ? `${NOME_UF[e.uf]}: lidera ${e.lider.nomeUrna}` : `${NOME_UF[e.uf]}: sem pesquisa válida`,
                faixa: e.lider?.classe?.faixaPartido ?? null,
              }))}
            />
            <Legenda />
          </article>

          <article className="moldura flex flex-col gap-2 px-4 py-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-vermelho">Senado em 2027</h3>
            <p className="text-lg">
              Pelas pesquisas, a esquerda teria <strong>{senado.porPartido.esquerda}</strong> das 81 cadeiras. Com os aliados do Lula de outros partidos,{' '}
              <strong>{senado.comAliados.esquerda}</strong>. Maioria é 41.
            </p>
            <p className="text-sm">
              Estão em jogo {senado.cadeirasEmJogo} vagas, duas por estado: você vota em dois nomes.
              {senado.semPesquisa.length > 0 && ` Sem pesquisa válida: ${senado.semPesquisa.join(', ')}.`}
            </p>
          </article>

          <article className="moldura flex flex-col gap-2 px-4 py-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-vermelho">Câmara dos Deputados</h3>
            <p className="text-lg">
              Hoje a esquerda tem <strong>{camara.atual.esquerda}</strong> dos 513 deputados.
              {camara.projetada &&
                ` A projeção do DIAP dá ${camara.projetada.medio.esquerda} (entre ${camara.projetada.min.esquerda} e ${camara.projetada.max.esquerda}).`}{' '}
              Para barrar um impeachment são precisos {camara.impeachment}.
            </p>
            <p className="text-sm">Não existe pesquisa para deputado. Por isso o voto de legenda da sua colinha conta tanto.</p>
          </article>
        </section>

        <a href={`https://wa.me/?text=${encodeURIComponent(textoZap)}`} target="_blank" rel="noopener noreferrer" className="botao-primario">
          Mandar o site no zap
        </a>
      </main>
      <Rodape />
    </>
  )
}
