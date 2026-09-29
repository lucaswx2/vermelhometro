'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import { CompartilharCard } from '@/componentes/card/CompartilharCard'
import type { LinhaDoCard } from '@/componentes/card/formato'
import { NOME_UF, UFS, ehUf, rotaDoEstado, type Uf } from '@/lib/estados'
import { PARTIDOS_DE_CLASSE } from '@/lib/partidosDeClasse'
import { lembrarColinha } from '../ultimaColinha'
import { BuscaCandidatura } from './BuscaCandidatura'
import {
  abrirCandidaturas,
  enderecoEmOutroEstado,
  ESCOLHA_VAZIA,
  escreverEscolha,
  lerEscolha,
  linkDaColinha,
  montarColinha,
  opcoesDoCargo,
  votar,
  votarComAClasse,
  type CandidaturasCompactas,
  type Cargo,
  type Escolha,
  type LinhaDaColinha,
  type ColinhasDeClasse,
  type Voto,
} from './escolha'
import { FotoCandidatura, FotoVazia } from './FotoCandidatura'
import { SeloDoPartido } from './SeloDoPartido'

const SITE = 'https://vermelhometro.vercel.app'

const assinarHash = (aviso: () => void) => {
  window.addEventListener('hashchange', aviso)
  return () => window.removeEventListener('hashchange', aviso)
}
const hashAtual = () => window.location.hash
const hashNoServidor = () => ''

const gravar = (escolha: Escolha) => {
  window.history.replaceState(null, '', escreverEscolha(escolha) || window.location.pathname)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}


const votoDaLinha = (linha: LinhaDaColinha): Voto | null => (linha.tipo === 'escolhida' ? linha.opcao.numero : linha.tipo === 'branco' ? 'branco' : null)

const paraOCard = (linha: LinhaDaColinha): LinhaDoCard => {
  if (linha.tipo !== 'escolhida') return { tipo: linha.tipo, rotulo: linha.rotulo }
  const { numero, nome, partido, faixa, foto } = linha.opcao
  return { tipo: 'escolhida', rotulo: linha.rotulo, numero, nome, partido, faixa, foto }
}

// Abre o menu de compartilhar do celular; sem ele, o zap.
const mandar = async (url: string) => {
  const texto = 'Minha colinha de luta pro dia 4/10. Monte a sua:'
  if (navigator.share) {
    try {
      await navigator.share({ url, text: texto })
      return
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return
      console.error('Falha ao abrir o compartilhamento', erro)
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank', 'noopener,noreferrer')
}

type Busca = { cargo: Cargo; semente: number }

type Props = {
  uf: Uf
  estado: string
  candidaturas: CandidaturasCompactas
  colinhasDeClasse: ColinhasDeClasse
  dataTse: string
}

export function MontadorColinha({ uf, estado, candidaturas, colinhasDeClasse, dataTse }: Props) {
  const hash = useSyncExternalStore(assinarHash, hashAtual, hashNoServidor)
  const escolha = lerEscolha(hash)
  const opcoes = useMemo(() => abrirCandidaturas(candidaturas), [candidaturas])
  const linhas = montarColinha(escolha, opcoes, colinhasDeClasse, uf === 'DF')
  const [busca, setBusca] = useState<Busca | null>(null)
  const temEscolha = linhas.some((l) => l.tipo !== 'vazia')
  const url = `${SITE}${rotaDoEstado(uf)}${linkDaColinha(escolha)}`

  // A aba "Colinha" do rodapé volta para esta colinha.
  useEffect(() => {
    lembrarColinha(`${rotaDoEstado(uf)}${hash}`)
  }, [uf, hash])

  const abrirBusca = (cargo: Cargo) => setBusca((atual) => ({ cargo, semente: atual?.semente ?? Math.floor(Math.random() * 1e6) }))
  const fecharBusca = () => {
    if (!busca) return
    // Tira a busca da tela já, para devolver o foco ao cartão que a abriu.
    flushSync(() => setBusca(null))
    document.getElementById(`vaga-${busca.cargo}`)?.focus()
  }
  const escolher = (voto: Voto) => {
    if (!busca) return
    gravar(votar(escolha, busca.cargo, voto))
    fecharBusca()
  }

  const linhaBuscada = busca ? linhas.find((l) => l.cargo === busca.cargo) : undefined

  return (
    <>
      {escolha.recebida && <AvisoDoLinkRecebido uf={uf} escolha={escolha} />}

      <section aria-labelledby="vote-com-a-classe" className="nao-imprimir flex flex-col gap-2.5 bg-vermelho p-3.5 text-papel">
        <div className="flex flex-col gap-0.5">
          <h2 id="vote-com-a-classe" className="font-display text-[22px] uppercase text-ouro">
            Vote com a classe
          </h2>
          <p className="text-sm leading-snug">Um toque e a colinha sai preenchida com a indicação do partido. Depois troque o que quiser.</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Preencher com a colinha de classe do partido">
          {PARTIDOS_DE_CLASSE.map((p) => {
            const ativo = escolha.partido === p.sigla
            return (
              <button
                key={p.sigla}
                type="button"
                aria-pressed={ativo}
                onClick={() => gravar(votarComAClasse(p.sigla))}
                className={`flex h-[52px] flex-col items-center justify-center border-2 border-papel font-display text-lg leading-none ${
                  ativo ? 'bg-ouro text-tinta' : 'bg-papel text-vermelho hover:bg-ouro/80'
                }`}
              >
                {p.sigla}
                <span className="font-sans text-xs font-bold">{p.numero}</span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] opacity-85">A ordem dos botões não é recomendação.</p>
      </section>

      <section aria-labelledby="titulo-colinha" className="nao-imprimir flex flex-col gap-2">
        <div className="flex items-end justify-between gap-2">
          <h2 id="titulo-colinha" className="text-[13px] font-bold uppercase tracking-[0.15em]">
            {escolha.recebida ? `A colinha que te mandaram · ${estado}` : temEscolha ? `Sua colinha · ${estado}` : `Ou monte cargo a cargo · ${estado}`}
          </h2>
          {temEscolha && (
            <button
              type="button"
              onClick={() => gravar(ESCOLHA_VAZIA)}
              className="h-11 shrink-0 border-2 border-vermelho px-2.5 text-[13px] font-bold uppercase text-vermelho hover:bg-vermelho hover:text-papel"
            >
              Limpar
            </button>
          )}
        </div>
        <ol className="flex flex-col gap-2">
          {linhas.map((linha) => (
            <CartaoDaVaga key={linha.cargo} linha={linha} aoAbrir={() => abrirBusca(linha.cargo)} />
          ))}
        </ol>
      </section>

      {temEscolha && (
        <div className="nao-imprimir flex flex-col gap-2.5">
          <section aria-labelledby="espalhe" className="flex flex-col gap-2.5">
            <h2 id="espalhe" className="text-center font-display text-[26px] uppercase text-vermelho">
              ★ Espalhe nas redes ★
            </h2>
            <CompartilharCard linhas={linhas.map(paraOCard)} estado={estado} uf={uf} dataTse={dataTse} />
          </section>
          <button
            type="button"
            onClick={() => mandar(url)}
            className="h-[54px] border-[3px] border-vermelho font-display text-[21px] uppercase text-vermelho hover:bg-vermelho hover:text-papel"
          >
            Mande pros companheiros
          </button>
          <p className="text-center text-xs text-tinta/70">O link não diz quem mandou.</p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-bold">Celular não entra na cabine. Anote e leve.</span>
            <button type="button" onClick={() => window.print()} className="min-h-11 shrink-0 text-sm font-bold text-vermelho underline">
              Imprimir a folha
            </button>
          </div>
        </div>
      )}

      {temEscolha && (
        <div id="impressao" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Folha key={i} linhas={linhas} estado={estado} partido={escolha.partido} dataTse={dataTse} />
          ))}
        </div>
      )}

      {busca && linhaBuscada && (
        <BuscaCandidatura
          vaga={linhaBuscada}
          opcoes={opcoesDoCargo(opcoes, busca.cargo, linhas)}
          atual={votoDaLinha(linhaBuscada)}
          estado={estado}
          uf={uf}
          semente={busca.semente}
          dataTse={dataTse}
          aoEscolher={escolher}
          aoFechar={fecharBusca}
        />
      )}
    </>
  )
}

function CartaoDaVaga({ linha, aoAbrir }: { linha: LinhaDaColinha; aoAbrir: () => void }) {
  const aviso = linha.tipo === 'branco' ? null : linha.aviso
  const acao = linha.tipo === 'vazia' ? 'Escolher ›' : 'Trocar'
  return (
    <li className="relative flex min-h-[84px] items-center gap-3 border-2 border-tinta bg-white px-3 py-2.5 focus-within:outline-4 focus-within:outline-ouro">
      {linha.tipo === 'escolhida' ? <FotoCandidatura opcao={linha.opcao} tamanho="p" /> : <FotoVazia />}
      <span className="flex min-w-0 grow flex-col gap-px">
        {linha.tipo === 'vazia' ? (
          <>
            <span className="font-display text-[21px] uppercase leading-tight">{linha.rotulo}</span>
            <span className="text-[13px] font-medium text-tinta/70">{linha.digitos}</span>
          </>
        ) : (
          <>
            <span className="text-[11px] font-bold uppercase tracking-wide text-tinta/70">{linha.rotulo}</span>
            {linha.tipo === 'escolhida' ? (
              <>
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-[32px] leading-none tracking-wide">{linha.opcao.numero}</span>
                  <span className="truncate text-[15px] font-bold uppercase">{linha.opcao.nome}</span>
                </span>
                <span className="mt-0.5 self-start">
                  <SeloDoPartido opcao={linha.opcao} />
                </span>
              </>
            ) : (
              <span className="font-display text-[32px] uppercase leading-none">Branco</span>
            )}
          </>
        )}
        {aviso && <span className="mt-1 text-xs font-medium text-sangue">{aviso}</span>}
      </span>
      <button
        id={`vaga-${linha.cargo}`}
        type="button"
        onClick={aoAbrir}
        aria-label={`${acao.replace(' ›', '')}: ${linha.rotulo}`}
        className="min-h-11 shrink-0 text-sm font-bold uppercase text-vermelho outline-none after:absolute after:inset-0"
      >
        {acao}
      </button>
    </li>
  )
}

function AvisoDoLinkRecebido({ uf, escolha }: { uf: string; escolha: Escolha }) {
  const router = useRouter()
  const [destino, setDestino] = useState(uf)
  const levados = [
    escolha.partido && `o partido (${escolha.partido})`,
    (escolha.partido || escolha.votos.presidente !== undefined) && 'o presidente',
  ].filter(Boolean)
  const levar = levados.length > 0 ? `Levamos ${levados.join(' e ')}. Os outros cargos passam` : 'Os cargos passam'

  const montar = () => {
    if (destino === uf) return gravar({ ...escolha, recebida: false })
    if (!ehUf(destino)) return
    router.push(enderecoEmOutroEstado(destino, escolha))
  }

  return (
    <section aria-labelledby="link-recebido" className="nao-imprimir flex flex-col gap-3 border-[3px] border-tinta bg-ouro px-4 py-4.5">
      <p className="text-[13px] font-bold uppercase tracking-[0.12em]">Te mandaram uma colinha</p>
      <h2 id="link-recebido" className="font-display text-3xl uppercase leading-none">
        Vota em outro estado? Monte a sua.
      </h2>
      <label className="flex flex-col gap-1 text-[13px] font-bold">
        Seu estado
        <select
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="h-12 border-[3px] border-tinta bg-papel px-2.5 text-[17px] font-bold text-tinta"
        >
          {UFS.map((u) => (
            <option key={u} value={u}>
              {NOME_UF[u]}
            </option>
          ))}
        </select>
      </label>
      <button type="button" onClick={montar} className="h-[54px] bg-tinta font-display text-[22px] uppercase text-ouro hover:bg-sangue">
        Montar minha colinha
      </button>
      <p className="text-[13px] leading-snug">
        {destino === uf
          ? 'Também vota aqui? Troque o que quiser e ela vira sua.'
          : `${levar} para os números do seu estado.`}
      </p>
    </section>
  )
}

function Folha({ linhas, estado, partido, dataTse }: { linhas: LinhaDaColinha[]; estado: string; partido: string | null; dataTse: string }) {
  return (
    <article className="folha-colinha flex flex-col border-[3px] border-tinta bg-white text-black">
      <header className="flex items-baseline justify-between bg-tinta px-3 py-2 text-white">
        <span className="font-display text-xl uppercase">Colinha · {estado}</span>
        <span className="text-sm font-bold">1º turno · 4/10</span>
      </header>
      <ol className="flex flex-col">
        {linhas.map((l) => (
          <li key={l.cargo} className="flex items-center gap-2 border-b border-black/30 px-3 py-1.5">
            {l.tipo === 'escolhida' ? <FotoCandidatura opcao={l.opcao} tamanho="p" /> : <FotoVazia />}
            <div className="flex min-w-0 flex-col">
              <span className="text-sm font-bold uppercase">{l.rotulo}</span>
              <div className="flex items-baseline gap-3">
                <span className="numero-folha min-w-[4ch] font-display text-5xl leading-none tracking-wider">
                  {l.tipo === 'escolhida' ? l.opcao.numero : l.tipo === 'branco' ? 'BRANCO' : '—'}
                </span>
                {l.tipo === 'escolhida' && (
                  <span className="truncate text-base font-medium">
                    {l.opcao.nome} · {l.opcao.partido}
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <footer className="px-3 py-2 text-[11px] leading-snug">
        {partido ? `Voto de classe · ${partido}. ` : ''}Números oficiais do TSE de {dataTse}. Confira em divulgacandcontas.tse.jus.br. Feito por Lucas
        Freitas (pessoa física) em vermelhometro.vercel.app. Não é material oficial de candidato, partido ou TSE.
      </footer>
    </article>
  )
}
