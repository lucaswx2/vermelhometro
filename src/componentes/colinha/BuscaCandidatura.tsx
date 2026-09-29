'use client'

import { useDeferredValue, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import { flushSync } from 'react-dom'
import { faixaInfo } from '@/lib/faixas'
import { buscar, type Grupo } from './busca'
import type { Opcao, Vaga, Voto } from './escolha'
import { FotoCandidatura } from './FotoCandidatura'
import { SeloDoPartido } from './SeloDoPartido'

const TSE = 'https://divulgacandcontas.tse.jus.br'

// Quantas linhas cada grupo mostra antes do "mostrar mais": São Paulo tem mais de mil deputados.
const PAGINA = 40

// O <dialog> nativo prende o foco, fecha no Esc e no "voltar" do Android.
export const abrirComoModal = (dialogo: HTMLDialogElement | null) => {
  if (dialogo && !dialogo.open) dialogo.showModal()
}

// Esc e "voltar" fecham pelo React, que tira o diálogo da tela e devolve o foco.
// Os eventos de um diálogo de dentro também chegam aos de fora: só vale o do próprio.
// Fecha na tarefa seguinte: tirar o diálogo no meio do Esc faz o navegador fechar o de trás também.
const aoPedirFechar = (aoFechar: () => void) => ({
  onCancel: (e: SyntheticEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return
    e.preventDefault()
    setTimeout(aoFechar, 0)
  },
  onClose: (e: SyntheticEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) aoFechar()
  },
})

const TITULO_DO_GRUPO = {
  esquerda: { titulo: 'Esquerda socialista', cor: faixaInfo['esquerda-radical'].cor },
  ampla: { titulo: 'PT e aliados', cor: faixaInfo['frente-ampla'].cor },
  outros: { titulo: 'Outros partidos', cor: '#2A0A0A' },
} satisfies Record<Grupo, { titulo: string; cor: string }>

const ehSubJudice = (o: Opcao) => o.situacao.startsWith('sub judice')

const plural = (n: number, um: string, varios: string) => `${n.toLocaleString('pt-BR')} ${n === 1 ? um : varios}`

type Props = {
  vaga: Vaga
  opcoes: Opcao[]
  atual: Voto | null
  estado: string
  uf: string
  semente: number
  dataTse: string
  aoEscolher: (voto: Voto) => void
  aoFechar: () => void
}

export function BuscaCandidatura({ vaga, opcoes, atual, estado, uf, semente, dataTse, aoEscolher, aoFechar }: Props) {
  const [termo, setTermo] = useState('')
  const termoAdiado = useDeferredValue(termo)
  const grupos = useMemo(() => buscar(opcoes, termoAdiado, semente), [opcoes, termoAdiado, semente])
  const [outrosAbertos, setOutrosAbertos] = useState(false)
  const [perfil, setPerfil] = useState<Opcao | null>(null)
  const gatilho = useRef<HTMLElement | null>(null)
  const buscando = termoAdiado.trim() !== ''
  const candidaturas = opcoes.filter((o) => o.tipo === 'candidatura').length
  const nada = grupos.esquerda.length + grupos.ampla.length + grupos.outros.length === 0

  const abrirPerfil = (opcao: Opcao, botao: HTMLElement) => {
    gatilho.current = botao
    setPerfil(opcao)
  }
  const fecharPerfil = () => {
    flushSync(() => setPerfil(null))
    gatilho.current?.focus()
  }

  const lista = (grupo: Grupo) => (
    <ListaDoGrupo key={`${grupo}-${termoAdiado}`} opcoes={grupos[grupo]} atual={atual} aoAbrir={abrirPerfil} />
  )

  return (
    <dialog
      ref={abrirComoModal}
      aria-labelledby="busca-titulo"
      {...aoPedirFechar(aoFechar)}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain bg-papel p-0 text-tinta backdrop:bg-tinta/60"
    >
      <div className="mx-auto flex min-h-full max-w-xl flex-col bg-papel">
        <header className="sticky top-0 z-10 flex flex-col gap-2.5 bg-vermelho px-3 pb-3.5 pt-2.5 text-papel">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={aoFechar} aria-label="Voltar para a colinha" className="flex size-11 shrink-0 items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M15 4 L7 12 L15 20" />
              </svg>
            </button>
            <div className="flex min-w-0 flex-col">
              <h2 id="busca-titulo" className="font-display text-2xl uppercase leading-tight">
                {vaga.rotulo}
              </h2>
              <p className="text-[13px] font-medium text-ouro">
                {estado} · {vaga.digitos} · {plural(candidaturas, 'candidatura', 'candidaturas')}
              </p>
            </div>
          </div>
          <label className="flex h-12 items-center gap-2 bg-papel px-3 text-tinta focus-within:outline-4 focus-within:outline-ouro">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="opacity-70">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M15.5 15.5 L21 21" />
            </svg>
            <span className="sr-only">Buscar por nome, número ou partido</span>
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Nome, número ou partido"
              autoComplete="off"
              enterKeyHint="search"
              className="min-w-0 grow bg-transparent text-[17px] outline-none placeholder:text-tinta/60"
            />
          </label>
        </header>

        <p className="bg-ouro px-4 py-2.5 text-[13px] leading-snug">
          Quem luta com a classe trabalhadora vem primeiro. Dentro de cada grupo, a ordem muda a cada visita. A escolha é sua: qualquer candidatura pode
          entrar.
        </p>

        <div className="flex justify-end px-4 pt-2">
          <button
            type="button"
            onClick={() => aoEscolher('branco')}
            aria-pressed={atual === 'branco'}
            className="min-h-11 px-2 text-sm font-bold uppercase text-vermelho underline underline-offset-4"
          >
            {atual === 'branco' ? '✓ Em branco' : 'Votar em branco'}
          </button>
        </div>

        <div aria-live="polite" className="sr-only">
          {buscando && (nada ? 'Nenhuma candidatura encontrada.' : plural(grupos.esquerda.length + grupos.ampla.length + grupos.outros.length, 'resultado', 'resultados'))}
        </div>

        {nada && <p className="px-4 py-6 text-center font-bold">Nenhuma candidatura com esse nome, número ou partido.</p>}

        {(['esquerda', 'ampla'] as const).map(
          (grupo) =>
            grupos[grupo].length > 0 && (
              <section key={grupo} aria-labelledby={`grupo-${grupo}`} className="flex flex-col">
                <h3
                  id={`grupo-${grupo}`}
                  className="flex justify-between px-4 pb-1.5 pt-3.5 text-[13px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: TITULO_DO_GRUPO[grupo].cor }}
                >
                  <span>{TITULO_DO_GRUPO[grupo].titulo}</span>
                  <span>{grupos[grupo].length}</span>
                </h3>
                {lista(grupo)}
              </section>
            ),
        )}

        {grupos.outros.length > 0 && (
          <section aria-labelledby="grupo-outros" className="flex flex-col">
            {buscando || outrosAbertos ? (
              <>
                <h3 id="grupo-outros" className="flex justify-between px-4 pb-1.5 pt-3.5 text-[13px] font-bold uppercase tracking-[0.12em]">
                  <span>Outros partidos</span>
                  <span>{grupos.outros.length}</span>
                </h3>
                {lista('outros')}
              </>
            ) : (
              <div className="p-4">
                <h3 id="grupo-outros" className="sr-only">
                  Outros partidos
                </h3>
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setOutrosAbertos(true)}
                  className="flex min-h-[60px] w-full items-center justify-between border-2 border-tinta px-3.5 text-left"
                >
                  <span className="flex flex-col">
                    <span className="text-[15px] font-bold uppercase tracking-wider">Outros partidos · {grupos.outros.length}</span>
                    <span className="text-xs font-medium text-tinta/70">Centrão, direita e extrema direita</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        )}

        <p className="mt-auto px-4 pb-4 pt-6 text-xs text-tinta/70">Fotos e situação: TSE (CC-BY), números de {dataTse}.</p>
      </div>

      {perfil && <Gaveta opcao={perfil} vaga={vaga} uf={uf} aoPor={() => aoEscolher(perfil.numero)} aoFechar={fecharPerfil} />}
    </dialog>
  )
}

function ListaDoGrupo({ opcoes, atual, aoAbrir }: { opcoes: Opcao[]; atual: Voto | null; aoAbrir: (opcao: Opcao, botao: HTMLElement) => void }) {
  const [limite, setLimite] = useState(PAGINA)
  const faltam = opcoes.length - limite
  return (
    <>
      <ul className="flex flex-col">
        {opcoes.slice(0, limite).map((o) => (
          <li key={`${o.tipo}-${o.numero}`}>
            <button
              type="button"
              onClick={(e) => aoAbrir(o, e.currentTarget)}
              className="flex min-h-[82px] w-full items-center gap-3 border-b border-tinta/20 bg-white px-4 py-2 text-left hover:bg-ouro/20"
            >
              <FotoCandidatura opcao={o} tamanho="p" />
              <span className="flex min-w-0 grow flex-col gap-0.5">
                <span className="text-base font-bold uppercase leading-tight">{o.nome}</span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                  <SeloDoPartido opcao={o} comFaixa={false} />
                  {ehSubJudice(o) && <span className="text-sangue">Sub judice</span>}
                  {atual === o.numero && <span className="text-vermelho">✓ Na sua colinha</span>}
                </span>
              </span>
              <span className="font-display text-3xl tracking-wide">{o.numero}</span>
            </button>
          </li>
        ))}
      </ul>
      {faltam > 0 && (
        <button
          type="button"
          onClick={() => setLimite((l) => l + PAGINA * 3)}
          className="mx-4 my-3 min-h-11 border-2 border-tinta text-sm font-bold uppercase"
        >
          Mostrar mais {Math.min(faltam, PAGINA * 3)} de {faltam}
        </button>
      )}
    </>
  )
}

const situacaoLegivel = (situacao: string) => (situacao === '' ? 'Deferida' : situacao.charAt(0).toUpperCase() + situacao.slice(1))

function Gaveta({ opcao, vaga, uf, aoPor, aoFechar }: { opcao: Opcao; vaga: Vaga; uf: string; aoPor: () => void; aoFechar: () => void }) {
  const legenda = opcao.tipo === 'legenda'
  return (
    <dialog
      ref={abrirComoModal}
      aria-labelledby="gaveta-nome"
      {...aoPedirFechar(aoFechar)}
      className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto mt-auto w-full max-w-xl border-t-4 border-vermelho bg-papel p-0 text-tinta backdrop:bg-tinta/60"
    >
      <div className="flex flex-col gap-4 px-5 pb-6 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-tinta/70">
            {vaga.rotulo} · {uf}
          </span>
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex size-11 items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M5 5 L19 19 M19 5 L5 19" />
            </svg>
          </button>
        </div>
        <div className="flex items-start gap-4">
          <FotoCandidatura opcao={opcao} tamanho="g" alt={`Foto de ${opcao.nome}`} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <h3 id="gaveta-nome" className="break-words font-display text-3xl uppercase leading-none">
              {opcao.nome}
            </h3>
            <span className="font-display text-6xl leading-none tracking-wider text-vermelho">{opcao.numero}</span>
            <span className="self-start">
              <SeloDoPartido opcao={opcao} />
            </span>
          </div>
        </div>
        <dl className="text-sm">
          {legenda ? (
            <div className="flex flex-col">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-tinta/70">Voto de legenda</dt>
              <dd className="font-bold">Digite só os 2 dígitos do partido. O voto conta para o {opcao.partido} (ou a federação dele).</dd>
            </div>
          ) : (
            <div className="flex flex-col">
              <dt className="text-[11px] font-bold uppercase tracking-wider text-tinta/70">Situação no TSE</dt>
              <dd className="font-bold">{situacaoLegivel(opcao.situacao)}</dd>
            </div>
          )}
        </dl>
        {ehSubJudice(opcao) && (
          <p className="border-l-4 border-sangue bg-white p-2.5 text-sm font-bold">
            Sub judice: o registro está em recurso. Se for negado, o voto é anulado.
          </p>
        )}
        <button type="button" onClick={aoPor} className="h-[58px] bg-vermelho font-display text-[23px] uppercase tracking-wide text-ouro hover:bg-sangue">
          Pôr na minha colinha
        </button>
        <a href={TSE} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center self-center text-sm font-bold text-vermelho underline">
          Ver a candidatura no TSE ↗
        </a>
      </div>
    </dialog>
  )
}
