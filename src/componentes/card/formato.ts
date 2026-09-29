// Regras puras do card: tamanhos, textos e nome do arquivo. Sem JSON, para rodar nos testes.

import { rotaDoEstado, type Uf } from '../../lib/estados.ts'
import type { Faixa } from '../../lib/faixas.ts'

export const FORMATOS = {
  feed: { largura: 1080, altura: 1350, rotulo: 'Feed 4:5' },
  stories: { largura: 1080, altura: 1920, rotulo: 'Stories 9:16' },
} satisfies Record<string, { largura: number; altura: number; rotulo: string }>

export type Formato = keyof typeof FORMATOS

const PREVIA_LARGURA_MAXIMA = 324
const PREVIA_ALTURA_MAXIMA = 480

// A prévia é o próprio card em tamanho real, reduzido com transform.
export const tamanhoDaPrevia = (formato: Formato) => {
  const { largura, altura } = FORMATOS[formato]
  const escala = Math.min(PREVIA_LARGURA_MAXIMA / largura, PREVIA_ALTURA_MAXIMA / altura)
  return { escala, largura: Math.round(largura * escala), altura: Math.round(altura * escala) }
}

export const nomeDoArquivo = (uf: Uf, formato: Formato) => `colinha-${uf.toLowerCase()}-${formato}.png`

export const enderecoDoEstado = (uf: Uf) => `vermelhometro.vercel.app${rotaDoEstado(uf)}`

export const linhaLegal = (dataTse: string) =>
  `números do TSE de ${dataTse} · fotos: TSE (CC-BY) · Lucas Freitas, pessoa física · não é material oficial de candidato, partido ou TSE`

// Uma linha do card: um cargo da colinha, já resolvido.
export type LinhaDoCard =
  | { tipo: 'vazia'; rotulo: string }
  | { tipo: 'branco'; rotulo: string }
  | { tipo: 'escolhida'; rotulo: string; numero: number; nome: string; partido: string; faixa: Faixa; foto: string | null }

const NOME_SEM_ESCOLHA = { vazia: 'a escolher', branco: 'em branco' } satisfies Record<Exclude<LinhaDoCard['tipo'], 'escolhida'>, string>

export const nomeDaLinha = (linha: LinhaDoCard) => (linha.tipo === 'escolhida' ? linha.nome : NOME_SEM_ESCOLHA[linha.tipo])

export const numeroParaExibir = (linha: LinhaDoCard) => (linha.tipo === 'escolhida' ? String(linha.numero) : '—')

// Sem foto, o quadro mostra a sigla do partido; o voto de legenda também traz o partido.
export const siglaDaLinha = (linha: LinhaDoCard) => (linha.tipo === 'escolhida' ? linha.partido : null)

const TAMANHO_DO_NUMERO = {
  feed: { normal: 112, longo: 92 },
  stories: { normal: 120, longo: 104 },
} satisfies Record<Formato, { normal: number; longo: number }>

// Deputado estadual tem cinco dígitos: o número encolhe um pouco para caber no quadro.
export const tamanhoDoNumero = (numero: string, formato: Formato) =>
  numero.length > 4 ? TAMANHO_DO_NUMERO[formato].longo : TAMANHO_DO_NUMERO[formato].normal

// Rede de segurança para nomes enormes; o CSS ainda corta com reticências pelo tamanho real.
export const truncar = (texto: string, maximo: number) =>
  texto.length <= maximo ? texto : `${texto.slice(0, maximo - 1).trimEnd()}…`
