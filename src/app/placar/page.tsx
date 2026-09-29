import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { formatarAtualizacao } from '@/componentes/Cartaz'
import { FichaPesquisa } from '@/componentes/FichaPesquisa'
import { GradeEstados, Legenda } from '@/componentes/GradeEstados'
import { Rodape } from '@/componentes/Rodape'
import { raiosDoSol } from '@/componentes/sol'
import {
  bancadaDoPartido,
  cadeirasDoSenado,
  CADEIRAS_SENADO,
  DOIS_TERCOS_SENADO,
  GRUPOS_DO_SENADO,
  leituraDoConfronto,
  MAIORIA_SENADO,
  type GrupoDoSenado,
  type Leitura,
} from '@/lib/ameaca'
import { atualizadoEm, camara, senadoresContinuam } from '@/lib/dados'
import { COR_DO_TEMA } from '@/lib/cores'
import type { Pesquisa } from '@/lib/esquemas'
import { NOME_UF } from '@/lib/estados'
import { FICHA_DA_FAIXA } from '@/lib/faixas'
import { ameacaNosEstados, disputasDoSenado, placarCamara, placarPresidente, primeiroTurnoPresidente } from '@/lib/placar'

const RAIOS = raiosDoSol(200, 640, 24, 900)

const pct = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
const inteiro = (n: number) => Math.round(n).toLocaleString('pt-BR')
const milhoes = (n: number) => `${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} milhões`
const estados = (n: number) => `${n} ${n === 1 ? 'estado' : 'estados'}`
const diaMes = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// "SP, PR e SC"
const juntarComE = (nomes: readonly string[]) => (nomes.length < 2 ? nomes.join('') : `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`)

// O mesmo registro no TSE cobre o 1º e o 2º turno de uma pesquisa: a ficha aparece uma vez.
const umaPorRegistro = (pesquisas: Pesquisa[]) => pesquisas.filter((p, i) => pesquisas.findIndex((q) => q.registro === p.registro) === i)

const MANCHETE_PRESIDENTE = {
  empate: 'Empate técnico. O bolsonarismo está colado.',
  frente: 'Lula na frente. A extrema direita não morreu.',
  atras: 'Lula atrás. Hora de virar voto.',
} satisfies Record<Leitura, string>

const ROTULO_LEITURA = {
  empate: 'empate técnico',
  frente: 'Lula à frente',
  atras: 'Lula atrás',
} satisfies Record<Leitura, string>

const GRUPO = {
  'extrema-direita': { nome: 'Extrema direita', cor: FICHA_DA_FAIXA['extrema-direita'].cor, borda: 'border-tinta' },
  'outra-oposicao': { nome: 'Outra oposição', cor: FICHA_DA_FAIXA['direita-liberal'].cor, borda: 'border-tinta' },
  'centrao-ou-indefinido': { nome: 'Centrão ou indefinido', cor: FICHA_DA_FAIXA.centrao.cor, borda: 'border-tinta' },
  'sem-pesquisa': { nome: 'Sem pesquisa', cor: '#FFFFFF', borda: 'border-dashed border-tinta/60' },
  'esquerda-e-aliados': { nome: 'Esquerda e aliados', cor: COR_DO_TEMA.vermelho, borda: 'border-tinta' },
} satisfies Record<GrupoDoSenado, { nome: string; cor: string; borda: string }>

const MARCOS_DO_SENADO: Record<number, string> = { [MAIORIA_SENADO]: 'maioria', [DOIS_TERCOS_SENADO]: 'dois terços' }

export const generateMetadata = (): Metadata => {
  const { eleitorado, lidera } = ameacaNosEstados()
  return {
    title: 'Placar da ameaça: o tamanho da extrema direita em 2026',
    description: `${pct(Math.round(eleitorado.pct))}% do eleitorado vive nos ${lidera.length} estados onde a extrema direita lidera para governador. Veja presidente, Senado e Câmara, com as pesquisas registradas no TSE.`,
    alternates: { canonical: '/placar' },
  }
}

function Titulo({ id, chamada, children }: { id: string; chamada: string; children: ReactNode }) {
  return (
    <>
      <h2 id={id} className="text-sm font-bold uppercase tracking-widest text-vermelho">
        {chamada}
      </h2>
      <p className="font-display text-[34px] uppercase leading-[1.05]">{children}</p>
    </>
  )
}

export default function Placar() {
  const ameaca = ameacaNosEstados()
  const presidente = placarPresidente()
  const primeiroTurno = primeiroTurnoPresidente()
  const fichasPresidente = umaPorRegistro([...(primeiroTurno ? [primeiroTurno.pesquisa] : []), ...presidente.confrontos.map((c) => c.pesquisa)])
  const disputas = disputasDoSenado()
  const senado = cadeirasDoSenado(senadoresContinuam, disputas)
  const semPesquisaSenado = disputas
    .filter((d) => d.status === 'sem-pesquisa')
    .map((d) => d.uf)
  const pl = bancadaDoPartido(camara, 'PL')
  const { impeachment } = placarCamara()
  const direitaNoSenado = senado.contagem['extrema-direita'] + senado.contagem['outra-oposicao']
  const descricaoDoSenado = `${CADEIRAS_SENADO} cadeiras: ${GRUPOS_DO_SENADO.map((g) => `${senado.contagem[g]} ${GRUPO[g].nome.toLowerCase()}`).join(', ')}.`

  return (
    <>
      <section aria-labelledby="manchete" className="relative overflow-hidden bg-tinta text-papel">
        <svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d={RAIOS} fill="#3A1212" />
          <circle cx="200" cy="640" r="170" className="fill-vermelho" />
        </svg>
        <div className="relative mx-auto flex max-w-xl flex-col items-center px-5 pb-8 text-center">
          <p className="mt-4 flex w-full justify-between text-xs font-bold uppercase tracking-[0.15em]">
            <span>Vermelhômetro</span>
            <span>Atualizado {formatarAtualizacao(atualizadoEm)}</span>
          </p>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-ouro">Placar da ameaça</p>
          <h1 id="manchete" className="font-display text-[150px] leading-none">
            {pct(Math.round(ameaca.eleitorado.pct))}%
          </h1>
          <p className="mt-1 text-xl font-bold leading-snug">do eleitorado vive num estado onde a extrema direita lidera a corrida pelo governo.</p>
          <p className="mt-3 leading-snug text-cinza">
            São {milhoes(ameaca.eleitorado.eleitores)} de eleitores em {estados(ameaca.eleitorado.estados)}: {juntarComE(ameaca.lidera)}.
          </p>
          <p className="mt-16 font-display text-[40px] uppercase leading-none text-ouro">Não passarão!</p>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-6">
        {presidente.nomes && (
          <article aria-labelledby="presidente" className="flex flex-col gap-3 border-[3px] border-tinta bg-white px-4 py-5">
            <Titulo id="presidente" chamada="Presidente · 2º turno">
              {MANCHETE_PRESIDENTE[presidente.situacao]}
            </Titulo>
            <ul className="flex flex-col gap-3">
              {presidente.confrontos.map(({ pesquisa, esquerda, direita }) => (
                <li key={pesquisa.id} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm font-bold uppercase">
                    <span>
                      {esquerda.nomeUrna} {pct(esquerda.pct)}%
                    </span>
                    <span className="text-right">
                      {pct(direita.pct)}% {direita.nomeUrna}
                    </span>
                  </div>
                  <div className="flex h-5 bg-cinza/60" aria-hidden="true">
                    <span className="bg-vermelho" style={{ width: `${esquerda.pct}%` }} />
                    <span className="grow" />
                    <span className="bg-tinta" style={{ width: `${direita.pct}%` }} />
                  </div>
                  <p className="text-xs text-tinta/70">
                    {pesquisa.instituto}, {diaMes(pesquisa.campoFim)} · {ROTULO_LEITURA[leituraDoConfronto(esquerda.pct, direita.pct, pesquisa.margemPp)]}
                  </p>
                </li>
              ))}
            </ul>
            <p>
              {primeiroTurno && primeiroTurno.lideres.length === 2 && (
                <>
                  No 1º turno, {primeiroTurno.lideres.map((r) => `${r.nomeUrna} ${pct(r.pct)}%`).join(', ')} ({primeiroTurno.pesquisa.instituto},{' '}
                  {diaMes(primeiroTurno.pesquisa.campoFim)}).{' '}
                </>
              )}
              Nos votos válidos do 2º turno, {presidente.nomes.esquerda} tem {pct(presidente.validosEsquerda)}% na média de{' '}
              {presidente.confrontos.length} institutos. O 1º turno é domingo, 4 de outubro. O 2º, 25 de outubro.
            </p>
            <details className="text-sm">
              <summary className="cursor-pointer font-bold underline">Ver os dados de cada pesquisa</summary>
              <ul className="mt-2 flex flex-col gap-2">
                {fichasPresidente.map((pesquisa) => (
                  <li key={pesquisa.registro}>
                    <FichaPesquisa pesquisa={pesquisa} />
                  </li>
                ))}
              </ul>
            </details>
          </article>
        )}

        <article aria-labelledby="governos" className="flex flex-col gap-3 border-[3px] border-tinta bg-white px-4 py-5">
          <Titulo id="governos" chamada="Governos estaduais">
            Extrema direita na frente em {estados(ameaca.lidera.length)}
          </Titulo>
          <p>
            É favorita, com vantagem maior que duas margens de erro, em <strong>{estados(ameaca.favorita.length)}</strong>.
            {ameaca.primeiroTurno.length > 0 && (
              <>
                {' '}
                Pode levar já no 1º turno em <strong>{estados(ameaca.primeiroTurno.length)}</strong>: {juntarComE(ameaca.primeiroTurno)}.
              </>
            )}
          </p>
          <p className="text-sm">Quem lidera em cada estado, pelo palanque de fato. Toque para ver a disputa.</p>
          <GradeEstados
            ancora="#disputa"
            celulas={ameaca.governos.map((g) => ({
              uf: g.uf,
              rotulo: g.nomeLider ? `${NOME_UF[g.uf]}: lidera ${g.nomeLider}` : `${NOME_UF[g.uf]}: sem pesquisa válida`,
              faixa: g.faixaLider,
            }))}
          />
          <Legenda />
        </article>

        <article aria-labelledby="senado" className="flex flex-col gap-3 border-[3px] border-tinta bg-white px-4 py-5">
          <Titulo id="senado" chamada="Senado em 2027">
            {senado.contagem['extrema-direita']} cadeiras da extrema direita
          </Titulo>
          <p>
            {senado.faltamParaMaioria > 0 ? (
              <>
                Faltam <strong>{senado.faltamParaMaioria}</strong> para a maioria ({MAIORIA_SENADO}).
              </>
            ) : (
              <>Já passa da maioria ({MAIORIA_SENADO}).</>
            )}{' '}
            Somada à outra oposição, chega a <strong>{direitaNoSenado}</strong>. Com {DOIS_TERCOS_SENADO}, dois terços, o Senado pode condenar ministro do
            STF por crime de responsabilidade.
          </p>
          <p className="sr-only">{descricaoDoSenado}</p>
          <ol className="grid grid-cols-9 gap-1" aria-hidden="true">
            {senado.cadeiras.map((grupo, i) => {
              const marco = MARCOS_DO_SENADO[i + 1]
              return (
                <li
                  key={i}
                  title={marco ? `${i + 1}ª cadeira: ${marco}` : undefined}
                  className={`relative h-7 border ${GRUPO[grupo].borda} ${marco ? 'outline-3 outline-offset-1 outline-ouro' : ''}`}
                  style={{ background: GRUPO[grupo].cor }}
                />
              )
            })}
          </ol>
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-bold" aria-hidden="true">
            {GRUPOS_DO_SENADO.map((g) => (
              <li key={g} className="flex items-center gap-1.5">
                <span className={`size-3.5 border ${GRUPO[g].borda}`} style={{ background: GRUPO[g].cor }} />
                {GRUPO[g].nome} {senado.contagem[g]}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className="size-3.5 outline-3 outline-ouro" />
              {MAIORIA_SENADO}ª e {DOIS_TERCOS_SENADO}ª cadeiras
            </li>
          </ul>
          <p className="text-sm text-tinta/70">
            Os 2 primeiros de cada estado na última pesquisa registrada, mais os {senadoresContinuam.length} senadores que ficam até 2031, pelo partido e
            pelo alinhamento com o governo.
            {semPesquisaSenado.length > 0 && ` Sem pesquisa válida: ${juntarComE(semPesquisaSenado)}.`}
          </p>
        </article>

        <article aria-labelledby="camara" className="flex flex-col gap-3 border-[3px] border-tinta bg-white px-4 py-5">
          <Titulo id="camara" chamada="Câmara dos Deputados">
            {pl.maiorHoje ? 'O PL tem a maior bancada' : `O PL tem ${pl.hoje} deputados`}
          </Titulo>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col bg-tinta p-3 text-papel">
              <span className="text-xs font-bold uppercase tracking-wider text-ouro">PL hoje</span>
              <span className="font-display text-5xl leading-tight">{pl.hoje}</span>
            </div>
            {pl.projecao && (
              <div className="flex flex-col bg-tinta p-3 text-papel">
                <span className="text-xs font-bold uppercase tracking-wider text-ouro">Projeção DIAP</span>
                <span className="font-display text-5xl leading-tight">
                  {pl.projecao.min}–{pl.projecao.max}
                </span>
              </div>
            )}
          </div>
          <p>
            Para barrar um impeachment são precisos {impeachment} deputados. Não existe pesquisa para deputado:{' '}
            <strong>o seu voto de legenda decide.</strong>
          </p>
          {camara.projecaoDiap && pl.projecao && (
            <p className="text-sm text-tinta/70">
              Projeção do{' '}
              <a href={camara.projecaoDiap.fonteUrl} className="underline" target="_blank" rel="noopener noreferrer">
                DIAP
              </a>
              {camara.projecaoDiap.data && ` de ${diaMes(camara.projecaoDiap.data)}`}, média de {inteiro(pl.projecao.medio)} para o PL.
            </p>
          )}
        </article>

        <Link href="/" className="botao-primario">
          ★ Monte sua colinha de luta ★
        </Link>
        <p className="text-sm text-tinta/70">
          Última pesquisa registrada no TSE em cada disputa. A faixa de cada candidatura segue critério público, que você pode contestar.{' '}
          <Link href="/transparencia" className="font-bold text-vermelho underline">
            Como calculamos
          </Link>
        </p>
      </main>
      <Rodape />
    </>
  )
}
