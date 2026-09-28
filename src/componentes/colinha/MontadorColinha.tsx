'use client'

import { useSyncExternalStore } from 'react'
import type { ColinhaDoPartido } from '@/lib/colinhas'
import { PARTIDOS_DE_CLASSE, type SiglaDeClasse } from '@/lib/partidosDeClasse'
import { desenharColinha } from './desenharColinha'
import { escreverEscolha, lerEscolha, montarLinhas, textoDaColinha, type Escolha, type Linha } from './escolha'

const SITE = 'https://vermelhometro.vercel.app'

const assinarHash = (aviso: () => void) => {
  window.addEventListener('hashchange', aviso)
  return () => window.removeEventListener('hashchange', aviso)
}
const hashAtual = () => window.location.hash
const hashNoServidor = () => ''

const gravar = (escolha: Escolha) => {
  window.history.replaceState(null, '', escreverEscolha(escolha))
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

type Props = {
  uf: string
  estado: string
  porPartido: Partial<Record<SiglaDeClasse, ColinhaDoPartido>>
  atualizadoEm: string
}

export function MontadorColinha({ uf, estado, porPartido, atualizadoEm }: Props) {
  const hash = useSyncExternalStore(assinarHash, hashAtual, hashNoServidor)
  const escolha = lerEscolha(hash)
  const { partido } = escolha
  const linhas = partido ? montarLinhas(porPartido, { ...escolha, partido }, uf === 'DF') : null
  const url = `${SITE}/estado/${uf.toLowerCase()}${escreverEscolha(escolha)}`

  return (
    <section aria-labelledby="titulo-colinha" className="flex flex-col gap-4">
      <div className="nao-imprimir flex flex-col gap-3">
        <h2 id="titulo-colinha" className="text-center font-display text-3xl uppercase text-vermelho">
          1. Escolha o partido
        </h2>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="Partido da colinha">
          {PARTIDOS_DE_CLASSE.map((p) => (
            <button
              key={p.sigla}
              type="button"
              aria-pressed={partido === p.sigla}
              onClick={() => gravar({ partido: p.sigla })}
              className={`flex h-16 items-center justify-center gap-2 border-[3px] border-vermelho font-display text-2xl ${
                partido === p.sigla ? 'bg-vermelho text-papel' : 'bg-papel text-vermelho hover:bg-vermelho/10'
              }`}
            >
              <span>{p.sigla}</span>
              <span className="text-lg opacity-80">{p.numero}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-sm">A ordem dos botões não é recomendação. Os quatro são partidos da esquerda socialista.</p>
      </div>

      {linhas && partido && (
        <>
          <div className="nao-imprimir flex flex-col gap-3">
            <h2 className="text-center font-display text-3xl uppercase text-vermelho">2. Confira sua colinha</h2>
            <p className="text-center text-sm">Na ordem em que a urna pede. Toque em “trocar” para escolher outro nome.</p>
          </div>
          <FolhaColinha linhas={linhas} estado={estado} partido={partido} atualizadoEm={atualizadoEm} editavel escolha={escolha} />

          <div className="nao-imprimir flex flex-col gap-2.5">
            <h2 className="text-center font-display text-3xl uppercase text-vermelho">3. Leve no papel</h2>
            <p className="bg-tinta p-3 text-center font-bold text-papel">Celular é proibido na cabine de votação. Imprima ou copie à mão.</p>
            <button type="button" onClick={() => window.print()} className="botao-primario">
              Imprimir (4 por folha)
            </button>
            <button type="button" onClick={() => salvarImagem(linhas, estado, partido, atualizadoEm)} className="botao-secundario">
              Salvar imagem
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(textoDaColinha(linhas, estado, url))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="botao-secundario"
            >
              Mandar no zap
            </a>
          </div>

          <div id="impressao" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <FolhaColinha key={i} linhas={linhas} estado={estado} partido={partido} atualizadoEm={atualizadoEm} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function FolhaColinha({
  linhas,
  estado,
  partido,
  atualizadoEm,
  editavel = false,
  escolha,
}: {
  linhas: Linha[]
  estado: string
  partido: SiglaDeClasse
  atualizadoEm: string
  editavel?: boolean
  escolha?: Escolha
}) {
  return (
    <article className="folha-colinha flex flex-col border-[3px] border-tinta bg-white text-black">
      <header className="flex items-baseline justify-between bg-tinta px-3 py-2 text-white">
        <span className="font-display text-xl uppercase">Colinha · {estado}</span>
        <span className="text-sm font-bold">1º turno · 4/10</span>
      </header>
      <ol className="flex flex-col">
        {linhas.map((l) => (
          <li key={l.cargo} className="flex flex-col gap-0.5 border-b border-black/30 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold uppercase">{l.rotulo}</span>
              {editavel && escolha && <Trocar linha={l} escolha={escolha} />}
            </div>
            <div className="flex items-baseline gap-3">
              <span className="min-w-[4ch] font-display text-5xl leading-none tracking-wider">{l.numero ?? '—'}</span>
              <span className="text-base font-medium">{l.nome ?? 'em branco'}</span>
            </div>
            {l.aviso && <p className="text-xs">{l.aviso}</p>}
          </li>
        ))}
      </ol>
      <footer className="px-3 py-2 text-[11px] leading-snug">
        Voto de classe · {partido}. Números oficiais do TSE de {atualizadoEm}. Confira em divulgacandcontas.tse.jus.br. Feito por Lucas Freitas
        (pessoa física) em vermelhometro.vercel.app. Não é material oficial de candidato, partido ou TSE.
      </footer>
    </article>
  )
}

function Trocar({ linha, escolha }: { linha: Linha; escolha: Escolha }) {
  const id = `trocar-${linha.cargo}`
  return (
    <>
      <label htmlFor={id} className="sr-only">
        Trocar {linha.rotulo}
      </label>
      <select
        id={id}
        value={linha.numero === null ? 'branco' : String(linha.numero)}
        onChange={(e) => gravar({ ...escolha, [linha.cargo]: e.target.value })}
        className="max-w-[55%] border-2 border-vermelho bg-papel px-2 py-1.5 text-sm font-bold text-vermelho"
      >
        {linha.escolhas.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.rotulo}
          </option>
        ))}
      </select>
    </>
  )
}

async function salvarImagem(linhas: Linha[], estado: string, partido: SiglaDeClasse, atualizadoEm: string) {
  try {
    const blob = await desenharColinha(linhas, estado, partido, atualizadoEm)
    const arquivo = new File([blob], `colinha-${partido.toLowerCase()}.png`, { type: 'image/png' })
    if (navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], title: `Colinha de classe · ${estado}` })
      return
    }
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = arquivo.name
    link.click()
    URL.revokeObjectURL(link.href)
  } catch (erro) {
    if (erro instanceof DOMException && erro.name === 'AbortError') return
    console.error('Falha ao gerar a imagem da colinha', erro)
    window.alert('Não deu para gerar a imagem. Use “Imprimir” ou tire um print da tela.')
  }
}
