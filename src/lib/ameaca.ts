// Placar da ameaça: o tamanho da extrema direita em cada frente, a partir das pesquisas e da faixa de cada candidatura.
// Sem import de JSON: os dados entram por parâmetro, para dar para testar.
import type { SenadorContinua } from './esquemas.ts'
import type { Uf } from './estados.ts'
import { faixaDoPartido, type Faixa } from './faixas.ts'

// ---------- Manchete ----------

// O arquivo do eleitorado traz as UFs, o exterior (ZZ) e o total do Brasil (BR).
export const eleitoradoSobAmeaca = (eleitorado: Record<string, number>, ufs: readonly Uf[]) => {
  const { BR, ...partes } = eleitorado
  const total = BR ?? Object.values(partes).reduce((soma, n) => soma + n, 0)
  const eleitores = ufs.reduce((soma, uf) => soma + (partes[uf] ?? 0), 0)
  return { eleitores, total, pct: total === 0 ? 0 : (100 * eleitores) / total, estados: ufs.length }
}

// ---------- Presidente ----------

export type Leitura = 'empate' | 'frente' | 'atras'

// Empate técnico é diferença de até duas margens de erro, como no resto do site.
export const leituraDoConfronto = (esquerdaPct: number, direitaPct: number, margemPp: number): Leitura => {
  const diferenca = esquerdaPct - direitaPct
  if (Math.abs(diferenca) <= 2 * margemPp) return 'empate'
  return diferenca > 0 ? 'frente' : 'atras'
}

// ---------- Governos ----------

export type GovernoNaAmeaca = {
  uf: Uf
  faixaLider: Faixa | null
  extremaFavorita: boolean
  extremaNoPrimeiroTurno: boolean
}

export const ameacaNosGovernos = (governos: readonly GovernoNaAmeaca[]) => {
  const lideradas = governos.filter((g) => g.faixaLider === 'extrema-direita')
  return {
    lidera: lideradas.map((g) => g.uf),
    favorita: lideradas.filter((g) => g.extremaFavorita).map((g) => g.uf),
    primeiroTurno: lideradas.filter((g) => g.extremaNoPrimeiroTurno).map((g) => g.uf),
    semPesquisa: governos.filter((g) => g.faixaLider === null).map((g) => g.uf),
  }
}

// ---------- Senado ----------

export const CADEIRAS_SENADO = 81
export const MAIORIA_SENADO = 41
// Dois terços do Senado: o quórum para afastar ministro do STF.
export const DOIS_TERCOS_SENADO = 54
const VAGAS_POR_UF = 2

// Na ordem das cadeiras: da extrema direita para a esquerda.
export const GRUPOS_DO_SENADO = ['extrema-direita', 'outra-oposicao', 'centrao-ou-indefinido', 'sem-pesquisa', 'esquerda-e-aliados'] as const

export type GrupoDoSenado = (typeof GRUPOS_DO_SENADO)[number]

const GRUPO_DA_FAIXA = {
  'esquerda-radical': 'esquerda-e-aliados',
  'frente-ampla': 'esquerda-e-aliados',
  centrao: 'centrao-ou-indefinido',
  'direita-liberal': 'outra-oposicao',
  'extrema-direita': 'extrema-direita',
} satisfies Record<Faixa, GrupoDoSenado>

const GRUPO_DO_ALINHAMENTO = {
  'pró-Lula': 'esquerda-e-aliados',
  oposição: 'outra-oposicao',
  '?': 'centrao-ou-indefinido',
} satisfies Record<SenadorContinua['alinhamento'], GrupoDoSenado>

const grupoDeQuemContinua = (senador: SenadorContinua): GrupoDoSenado =>
  faixaDoPartido(senador.partidoAtual) === 'extrema-direita' ? 'extrema-direita' : GRUPO_DO_ALINHAMENTO[senador.alinhamento]

// As faixas dos dois primeiros da última pesquisa; null quando o nome não tem partido.
export type DisputaDoSenado = { uf: Uf; status: 'sem-pesquisa' } | { uf: Uf; status: 'com-pesquisa'; faixas: (Faixa | null)[] }

const gruposDaDisputa = (disputa: DisputaDoSenado): GrupoDoSenado[] =>
  Array.from({ length: VAGAS_POR_UF }, (_, i) => {
    if (disputa.status === 'sem-pesquisa') return 'sem-pesquisa'
    const faixa = disputa.faixas[i]
    return faixa ? GRUPO_DA_FAIXA[faixa] : 'centrao-ou-indefinido'
  })

const posicao = (grupo: GrupoDoSenado) => GRUPOS_DO_SENADO.indexOf(grupo)

export const cadeirasDoSenado = (continuam: readonly SenadorContinua[], disputas: readonly DisputaDoSenado[]) => {
  const cadeiras = [...continuam.map(grupoDeQuemContinua), ...disputas.flatMap(gruposDaDisputa)].sort((a, b) => posicao(a) - posicao(b))
  const contagem: Record<GrupoDoSenado, number> = {
    'extrema-direita': 0,
    'outra-oposicao': 0,
    'centrao-ou-indefinido': 0,
    'sem-pesquisa': 0,
    'esquerda-e-aliados': 0,
  }
  for (const grupo of cadeiras) contagem[grupo] += 1
  return { cadeiras, contagem, faltamParaMaioria: Math.max(0, MAIORIA_SENADO - contagem['extrema-direita']) }
}

// ---------- Câmara ----------

type Camara = {
  atual: { porPartido: Record<string, number> }
  projecaoDiap: { porPartidoOuFederacao: { sigla: string; min: number | null; max: number | null; medio: number }[] } | null
}

const mesmaSigla = (a: string, b: string) => a.toUpperCase() === b.toUpperCase()

export const bancadaDoPartido = (camara: Camara, sigla: string) => {
  const hoje = Object.entries(camara.atual.porPartido).find(([s]) => mesmaSigla(s, sigla))?.[1] ?? 0
  const projetado = camara.projecaoDiap?.porPartidoOuFederacao.find((p) => mesmaSigla(p.sigla, sigla))
  return {
    hoje,
    maiorHoje: hoje > 0 && hoje === Math.max(...Object.values(camara.atual.porPartido)),
    projecao: projetado ? { min: projetado.min ?? projetado.medio, max: projetado.max ?? projetado.medio, medio: projetado.medio } : null,
  }
}
