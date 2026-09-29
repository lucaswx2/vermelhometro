'use client'

import { useRef, useState, useTransition } from 'react'
import { domToBlob } from 'modern-screenshot'
import type { Faixa } from '@/lib/faixas'
import { CardDaColinha } from './CardDaColinha'
import { FORMATOS, nomeDoArquivo, tamanhoDaPrevia, type Formato } from './formato'

// Uma linha do card: um cargo da colinha, já resolvido.
export type LinhaDoCard = {
  rotulo: string
  numero: number | null
  nome: string | null
  partido: string | null
  faixa: Faixa | null
  foto: string | null
}

export type PropsDoCard = {
  linhas: LinhaDoCard[]
  estado: string
  uf: string
  dataTse: string
}

type Situacao =
  | { tipo: 'ocioso' }
  | { tipo: 'pronta'; arquivo: File; chave: string }
  | { tipo: 'baixada' }
  | { tipo: 'erro' }

const ORDEM_DOS_FORMATOS = ['feed', 'stories'] as const satisfies readonly Formato[]

const chaveDoCard = (props: PropsDoCard, formato: Formato) => JSON.stringify([formato, props])

// Espera as fontes (Anton e Oswald) e as fotos antes de fotografar o nó em tamanho real.
const gerarArquivo = async (card: HTMLElement, formato: Formato, uf: string) => {
  await document.fonts.ready
  const { largura, altura } = FORMATOS[formato]
  // Largura e altura explícitas: sem elas a lib mede o nó já reduzido pela prévia.
  const blob = await domToBlob(card, { width: largura, height: altura, scale: 1, type: 'image/png', backgroundColor: '#C8171E' })
  return new File([blob], nomeDoArquivo(uf, formato), { type: 'image/png' })
}

const baixar = (arquivo: File) => {
  const url = URL.createObjectURL(arquivo)
  const link = document.createElement('a')
  link.href = url
  link.download = arquivo.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

const podeCompartilhar = (arquivo: File) => typeof navigator.canShare === 'function' && navigator.canShare({ files: [arquivo] })

const nomeDoErro = (erro: unknown) => (erro instanceof DOMException || erro instanceof Error ? erro.name : null)

// Compartilha pelo menu do celular ou, sem ele, baixa o PNG.
const entregar = async (arquivo: File, chave: string): Promise<Situacao> => {
  if (!podeCompartilhar(arquivo)) {
    baixar(arquivo)
    return { tipo: 'baixada' }
  }
  try {
    await navigator.share({ files: [arquivo] })
    return { tipo: 'ocioso' }
  } catch (erro) {
    if (nomeDoErro(erro) === 'AbortError') return { tipo: 'ocioso' }
    // Gerar a imagem pode demorar mais que o toque vale: guarda o arquivo e pede outro toque.
    if (nomeDoErro(erro) === 'NotAllowedError') return { tipo: 'pronta', arquivo, chave }
    throw erro
  }
}

const AVISO: Record<Situacao['tipo'], string | null> = {
  ocioso: null,
  pronta: 'A imagem está pronta. Toque de novo para compartilhar.',
  baixada: 'Imagem baixada. Agora é só postar.',
  erro: 'Não deu para gerar a imagem. Tente de novo; se continuar, tire um print da prévia.',
}

export function CompartilharCard(props: PropsDoCard) {
  const { linhas, estado, uf, dataTse } = props
  const [formato, setFormato] = useState<Formato>('feed')
  const [situacao, setSituacao] = useState<Situacao>({ tipo: 'ocioso' })
  const [fotosQuebradas, setFotosQuebradas] = useState<string[]>([])
  const [gerando, iniciar] = useTransition()
  const card = useRef<HTMLDivElement>(null)
  const previa = tamanhoDaPrevia(formato)
  const chave = chaveDoCard(props, formato)

  const trocarFormato = (novo: Formato) => {
    setFormato(novo)
    setSituacao({ tipo: 'ocioso' })
  }

  const aoFalharFoto = (foto: string) => setFotosQuebradas((atuais) => (atuais.includes(foto) ? atuais : [...atuais, foto]))

  const compartilhar = () =>
    iniciar(async () => {
      const no = card.current
      if (!no) return
      const pronta = situacao.tipo === 'pronta' && situacao.chave === chave ? situacao.arquivo : null
      try {
        const arquivo = pronta ?? (await gerarArquivo(no, formato, uf))
        const nova = await entregar(arquivo, chave)
        iniciar(() => setSituacao(nova))
      } catch (erro) {
        console.error('Falha ao gerar ou compartilhar o card da colinha', erro)
        iniciar(() => setSituacao({ tipo: 'erro' }))
      }
    })

  return (
    <section aria-label="Card para as redes" className="flex flex-col gap-4 bg-tinta px-4 py-5 text-papel">
      <div role="group" aria-label="Formato" className="grid grid-cols-2 border-2 border-ouro">
        {ORDEM_DOS_FORMATOS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={formato === f}
            onClick={() => trocarFormato(f)}
            className={`h-11 text-[15px] font-bold uppercase ${formato === f ? 'bg-ouro text-tinta' : 'text-ouro hover:bg-ouro/15'}`}
          >
            {FORMATOS[f].rotulo}
          </button>
        ))}
      </div>

      <div
        role="img"
        aria-label={`Prévia do card da colinha de ${estado}, formato ${FORMATOS[formato].rotulo}`}
        style={{ width: previa.largura, height: previa.altura }}
        className="mx-auto max-w-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
      >
        <div style={{ transform: `scale(${previa.escala})`, transformOrigin: '0 0' }}>
          <CardDaColinha
            ref={card}
            formato={formato}
            linhas={linhas}
            estado={estado}
            uf={uf}
            dataTse={dataTse}
            fotosQuebradas={fotosQuebradas}
            aoFalharFoto={aoFalharFoto}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={compartilhar}
          disabled={gerando}
          aria-busy={gerando}
          className="h-[58px] bg-vermelho font-display text-[23px] uppercase tracking-[1px] text-ouro hover:bg-sangue disabled:opacity-70"
        >
          {gerando ? 'Gerando imagem…' : '★ Compartilhar imagem ★'}
        </button>
        <p role={situacao.tipo === 'erro' ? 'alert' : 'status'} className="min-h-5 text-center text-sm font-bold text-ouro">
          {AVISO[situacao.tipo]}
        </p>
        <p className="text-center text-[13px] leading-[1.4] text-cinza">A imagem é gerada no seu celular. Sua escolha não sai do aparelho.</p>
      </div>
    </section>
  )
}
