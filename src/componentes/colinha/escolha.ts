import type { ColinhaDoPartido, Opcao as OpcaoDaClasse } from '../../lib/colinhas.ts'
import { FAIXAS, type Faixa } from '../../lib/faixas.ts'
import { PARTIDOS_DE_CLASSE, type SiglaDeClasse } from '../../lib/partidosDeClasse.ts'

// Os seis votos da colinha, na ordem em que a urna pede.
export const CARGOS = ['deputadoFederal', 'deputadoEstadual', 'senador1', 'senador2', 'governador', 'presidente'] as const

export type Cargo = (typeof CARGOS)[number]

// O cargo como o TSE registra: os dois votos para o Senado são do mesmo cargo.
export type CargoTse = 'deputadoFederal' | 'deputadoEstadual' | 'senador' | 'governador' | 'presidente'

export const cargoNoTse = (cargo: Cargo): CargoTse => (cargo === 'senador1' || cargo === 'senador2' ? 'senador' : cargo)

export type Vaga = { cargo: Cargo; rotulo: string; digitos: string }

export const vagasDaColinha = (ehDf: boolean): Vaga[] => [
  { cargo: 'deputadoFederal', rotulo: 'Deputado(a) federal', digitos: '4 dígitos, ou 2 para a legenda' },
  { cargo: 'deputadoEstadual', rotulo: ehDf ? 'Deputado(a) distrital' : 'Deputado(a) estadual', digitos: '5 dígitos, ou 2 para a legenda' },
  { cargo: 'senador1', rotulo: 'Senador(a) · 1º voto', digitos: '3 dígitos' },
  { cargo: 'senador2', rotulo: 'Senador(a) · 2º voto', digitos: '3 dígitos' },
  { cargo: 'governador', rotulo: 'Governador(a)', digitos: '2 dígitos' },
  { cargo: 'presidente', rotulo: 'Presidente', digitos: '2 dígitos' },
]

// Uma opção de voto: uma candidatura ou o voto na legenda de um partido.
export type Opcao = {
  tipo: 'candidatura' | 'legenda'
  numero: number
  nome: string
  partido: string
  faixa: Faixa
  // Vazia quando o registro está deferido.
  situacao: string
  foto: string | null
}

// Formato enxuto que o servidor manda ao navegador: São Paulo tem umas 2.400 candidaturas.
export type CandidataCompacta = [numero: number, nome: string, partido: string, faixa: number, situacao: string, foto: string | null]

export type CandidatasCompactas = Record<CargoTse, CandidataCompacta[]>

export type OpcoesDaUf = Record<CargoTse, Opcao[]>

export const compactar = (
  c: { numero: number; nomeUrna: string; partido: string; faixa: Faixa; situacao: string },
  foto: string | null,
): CandidataCompacta => [c.numero, c.nomeUrna, c.partido, FAIXAS.indexOf(c.faixa), c.situacao === 'deferido' ? '' : c.situacao, foto]

const abrir = ([numero, nome, partido, faixa, situacao, foto]: CandidataCompacta): Opcao => ({
  tipo: 'candidatura',
  numero,
  nome,
  partido,
  faixa: FAIXAS[faixa] ?? 'centrao',
  situacao,
  foto,
})

const DIGITOS_DO_PARTIDO = { deputadoFederal: 100, deputadoEstadual: 1000 } as const

const faixaMaisComum = (faixas: Faixa[]) => {
  const contagem = new Map<Faixa, number>()
  for (const f of faixas) contagem.set(f, (contagem.get(f) ?? 0) + 1)
  return [...contagem].sort((a, b) => b[1] - a[1])[0][0]
}

// Voto de legenda só vale para partido com candidatos ao cargo no estado.
const legendasDoCargo = (candidatas: Opcao[], cargo: keyof typeof DIGITOS_DO_PARTIDO): Opcao[] => {
  const porPartido = new Map<string, { numero: number; faixas: Faixa[] }>()
  for (const c of candidatas) {
    const atual = porPartido.get(c.partido) ?? { numero: Math.floor(c.numero / DIGITOS_DO_PARTIDO[cargo]), faixas: [] }
    atual.faixas.push(c.faixa)
    porPartido.set(c.partido, atual)
  }
  return [...porPartido].map(([partido, { numero, faixas }]) => ({
    tipo: 'legenda',
    numero,
    nome: `Legenda ${partido}`,
    partido,
    faixa: faixaMaisComum(faixas),
    situacao: '',
    foto: null,
  }))
}

export const abrirCandidatas = (compactas: CandidatasCompactas): OpcoesDaUf => {
  const federal = compactas.deputadoFederal.map(abrir)
  const estadual = compactas.deputadoEstadual.map(abrir)
  return {
    deputadoFederal: [...legendasDoCargo(federal, 'deputadoFederal'), ...federal],
    deputadoEstadual: [...legendasDoCargo(estadual, 'deputadoEstadual'), ...estadual],
    senador: compactas.senador.map(abrir),
    governador: compactas.governador.map(abrir),
    presidente: compactas.presidente.map(abrir),
  }
}

// O que o atalho "vote com a classe" põe em cada cargo.
export type Padrao = { numero: number; apoio: boolean }

export type PadroesDaClasse = Partial<Record<SiglaDeClasse, Partial<Record<Cargo, Padrao>>>>

const padraoMajoritario = (opcao: OpcaoDaClasse | undefined) => (opcao ? { numero: opcao.numero, apoio: opcao.tipo === 'apoio' } : undefined)

const padraoProporcional = (legenda: number | null) => (legenda === null ? undefined : { numero: legenda, apoio: false })

const padroesDoPartido = (c: ColinhaDoPartido) => {
  const candidatos: [Cargo, Padrao | undefined][] = [
    ['deputadoFederal', padraoProporcional(c.deputadoFederal.legenda)],
    ['deputadoEstadual', padraoProporcional(c.deputadoEstadual.legenda)],
    ['senador1', padraoMajoritario(c.senador[0])],
    ['senador2', padraoMajoritario(c.senador[1])],
    ['governador', padraoMajoritario(c.governador[0])],
    ['presidente', padraoMajoritario(c.presidente[0])],
  ]
  const padroes: Partial<Record<Cargo, Padrao>> = {}
  for (const [cargo, padrao] of candidatos) if (padrao) padroes[cargo] = padrao
  return padroes
}

export const padroesDaClasse = (todas: Partial<Record<SiglaDeClasse, ColinhaDoPartido>>): PadroesDaClasse =>
  Object.fromEntries(
    PARTIDOS_DE_CLASSE.flatMap((p) => {
      const colinha = todas[p.sigla]
      return colinha ? [[p.sigla, padroesDoPartido(colinha)]] : []
    }),
  )

// A escolha vive no fragmento (#) da URL: nunca vai para um servidor.
export type Voto = number | 'branco'

export type Escolha = { partido: SiglaDeClasse | null; recebida: boolean; votos: Partial<Record<Cargo, Voto>> }

export const ESCOLHA_VAZIA: Escolha = { partido: null, recebida: false, votos: {} }

const CHAVES = {
  deputadoFederal: 'f',
  deputadoEstadual: 'e',
  senador1: 's1',
  senador2: 's2',
  governador: 'g',
  presidente: 'pr',
} satisfies Record<Cargo, string>

const ehSigla = (valor: string | null): valor is SiglaDeClasse => PARTIDOS_DE_CLASSE.some((p) => p.sigla === valor)

const lerVoto = (valor: string | null): Voto | null => {
  if (valor === 'branco') return 'branco'
  if (valor && /^\d{2,5}$/.test(valor)) return Number(valor)
  return null
}

export const lerEscolha = (hash: string): Escolha => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const partido = params.get('p')
  const votos: Escolha['votos'] = {}
  for (const cargo of CARGOS) {
    const voto = lerVoto(params.get(CHAVES[cargo]))
    if (voto !== null) votos[cargo] = voto
  }
  return { partido: ehSigla(partido) ? partido : null, recebida: params.get('recebida') === '1', votos }
}

export const escreverEscolha = (escolha: Escolha) => {
  const params = new URLSearchParams()
  if (escolha.partido) params.set('p', escolha.partido)
  for (const cargo of CARGOS) {
    const voto = escolha.votos[cargo]
    if (voto !== undefined) params.set(CHAVES[cargo], String(voto))
  }
  if (escolha.recebida) params.set('recebida', '1')
  const texto = params.toString()
  return texto ? `#${texto}` : ''
}

// Quem mexe na colinha recebida faz dela a sua.
export const votar = (escolha: Escolha, cargo: Cargo, voto: Voto): Escolha => ({
  ...escolha,
  recebida: false,
  votos: { ...escolha.votos, [cargo]: voto },
})

export const votarComAClasse = (partido: SiglaDeClasse): Escolha => ({ partido, recebida: false, votos: {} })

export const linkDaColinha = (escolha: Escolha) => escreverEscolha({ ...escolha, recebida: true })

// Em outro estado só valem o partido e o voto para presidente.
export const paraOutroEstado = (escolha: Escolha): Escolha => ({
  partido: escolha.partido,
  recebida: false,
  votos: escolha.votos.presidente === undefined ? {} : { presidente: escolha.votos.presidente },
})

export type LinhaDaColinha = Vaga &
  ({ tipo: 'vazia'; aviso: string | null } | { tipo: 'branco' } | { tipo: 'escolhida'; opcao: Opcao; aviso: string | null })

const avisoDaSituacao = (situacao: string) =>
  situacao.startsWith('sub judice') ? 'Sub judice: o voto pode ser anulado se o registro for negado.' : null

const semPadrao = (cargo: Cargo, partido: SiglaDeClasse) =>
  cargo === 'deputadoFederal' || cargo === 'deputadoEstadual'
    ? `O ${partido} não tem candidatos a este cargo aqui: o voto na legenda ${partido} seria nulo. Escolha outro nome.`
    : `O ${partido} não tem candidatura aqui. Escolha outro nome ou deixe em branco.`

const montarLinha = (vaga: Vaga, escolha: Escolha, opcoes: OpcoesDaUf, padroes: PadroesDaClasse): LinhaDaColinha => {
  const { partido } = escolha
  const padrao = partido ? padroes[partido]?.[vaga.cargo] : undefined
  const voto = escolha.votos[vaga.cargo] ?? padrao?.numero
  if (voto === 'branco') return { ...vaga, tipo: 'branco' }
  if (voto === undefined) return { ...vaga, tipo: 'vazia', aviso: partido ? semPadrao(vaga.cargo, partido) : null }
  const opcao = opcoes[cargoNoTse(vaga.cargo)].find((o) => o.numero === voto)
  if (!opcao) return { ...vaga, tipo: 'vazia', aviso: `O número ${voto} não está entre as candidaturas aptas deste cargo. Escolha de novo.` }
  const apoio = partido && padrao?.apoio && padrao.numero === voto ? `Apoio do ${partido} (coligação): o partido não tem candidatura própria.` : null
  return { ...vaga, tipo: 'escolhida', opcao, aviso: [apoio, avisoDaSituacao(opcao.situacao)].filter(Boolean).join(' ') || null }
}

const numeroDaLinha = (linha: LinhaDaColinha | undefined) => (linha?.tipo === 'escolhida' ? linha.opcao.numero : null)

export const montarColinha = (escolha: Escolha, opcoes: OpcoesDaUf, padroes: PadroesDaClasse, ehDf: boolean): LinhaDaColinha[] => {
  const linhas = vagasDaColinha(ehDf).map((vaga) => montarLinha(vaga, escolha, opcoes, padroes))
  // A urna não aceita o mesmo senador nos dois votos.
  const [, , senador1, senador2] = linhas
  if (numeroDaLinha(senador1) !== null && numeroDaLinha(senador1) === numeroDaLinha(senador2)) {
    linhas[3] = { ...senador2, tipo: 'vazia', aviso: 'Esse nome já está no 1º voto. Escolha outro nome para o 2º voto ou deixe em branco.' }
  }
  return linhas
}

const OUTRO_SENADOR: Partial<Record<Cargo, Cargo>> = { senador1: 'senador2', senador2: 'senador1' }

// As opções da busca de um cargo; no Senado, sem quem já está no outro voto.
export const opcoesDoCargo = (opcoes: OpcoesDaUf, cargo: Cargo, linhas: LinhaDaColinha[] = []) => {
  const outro = OUTRO_SENADOR[cargo]
  const ocupado = outro ? numeroDaLinha(linhas.find((l) => l.cargo === outro)) : null
  return opcoes[cargoNoTse(cargo)].filter((o) => o.numero !== ocupado)
}
