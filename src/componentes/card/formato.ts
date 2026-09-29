// Regras puras do card: tamanhos, textos e nome do arquivo. Sem JSON, para rodar nos testes.

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

export const nomeDoArquivo = (uf: string, formato: Formato) => `colinha-${uf.toLowerCase()}-${formato}.png`

export const enderecoDoEstado = (uf: string) => `vermelhometro.vercel.app/estado/${uf.toLowerCase()}`

export const linhaLegal = (dataTse: string) =>
  `números do TSE de ${dataTse} · fotos: TSE (CC-BY) · Lucas Freitas, pessoa física · não é material oficial de candidato, partido ou TSE`

export const nomeDaLinha = ({ numero, nome }: { numero: number | null; nome: string | null }) =>
  numero === null ? 'em branco' : (nome ?? '')

export const numeroDaLinha = ({ numero }: { numero: number | null }) => (numero === null ? '—' : String(numero))

// Sem foto, o quadro mostra a sigla: do partido ou, no voto de legenda, do nome "Legenda X".
export const siglaDaLinha = ({ partido, nome }: { partido: string | null; nome: string | null }) =>
  partido ?? nome?.match(/^legenda\s+(\S+)/i)?.[1] ?? null

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
